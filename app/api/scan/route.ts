import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { SOURCES, GOAL_PROMPT, DISCOVERY_PROMPT } from "@/lib/sources";
import { runTinyFishScan } from "@/lib/tinyfish";
import { SCAN_CONFIG } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 300;

function encode(obj: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(obj) + "\n");
}

export async function POST(_req: NextRequest) {
  const scanRun = await prisma.scanRun.create({
    data: { status: "running" },
  });

  const stream = new ReadableStream({
    async start(controller) {
      let sourcesScanned = 0;
      let totalFindings = 0;

      // Load custom sources from DB alongside hardcoded SOURCES
      const customSources = await prisma.customSource.findMany();

      // Unified source list for scanning
      const allSources = [
        ...SOURCES.map((s) => ({ name: s.name, url: s.url, homepageUrl: s.homepageUrl as string, type: s.type })),
        ...customSources.map((cs) => ({ name: cs.name, url: cs.url, homepageUrl: cs.url, type: cs.type })),
      ];

      // Batch-load all existing findings for dedup (fix N+1 query)
      const existingFindings = await prisma.finding.findMany({
        select: { institution: true, title: true },
      });
      const existingSet = new Set(
        existingFindings.map((f) => `${f.institution}::${f.title}`)
      );

      // Emit "discovering" for all sources immediately so the UI shows all of them
      for (const source of allSources) {
        controller.enqueue(encode({ source: source.name, status: "discovering", findingsCount: 0 }));
      }

      // Scan all sources in parallel — each resolves independently and streams its result
      await Promise.allSettled(
        allSources.map(async (source) => {
          try {
            // Single-phase scan: discovery from homepage (no fallback to save steps)
            const result = await runTinyFishScan(source.homepageUrl, DISCOVERY_PROMPT, { maxSteps: SCAN_CONFIG.discoveryMaxSteps });

            const findings = result.findings;

            let newCount = 0;
            for (const finding of findings) {
              const title = finding.title || "Untitled";
              const key = `${source.name}::${title}`;

              // Skip if already exists (in-memory check)
              if (existingSet.has(key)) continue;

              // Use create with catch for unique constraint (race-safe)
              try {
                await prisma.finding.create({
                  data: {
                    institution: source.name,
                    type: source.type,
                    title,
                    summary: finding.summary || "",
                    category: finding.category || "Policy",
                    date: finding.date || new Date().toLocaleDateString("en-CA"),
                    sourceUrl: finding.sourceUrl || source.url,
                  },
                });
                existingSet.add(key);
                newCount++;
              } catch (err) {
                // Unique constraint violation — another parallel scan inserted it first
                if (err instanceof Error && err.message.includes("Unique constraint")) {
                  existingSet.add(key);
                  continue;
                }
                throw err;
              }
            }

            sourcesScanned += 1;
            totalFindings += newCount;

            await prisma.scanRun.update({
              where: { id: scanRun.id },
              data: { sourcesScanned, findingsCount: totalFindings },
            });

            controller.enqueue(
              encode({ source: source.name, status: "done", findingsCount: newCount })
            );
          } catch (err) {
            console.error(`Error scanning ${source.name}:`, err);
            sourcesScanned += 1;
            controller.enqueue(
              encode({
                source: source.name,
                status: "error",
                findingsCount: 0,
                error: err instanceof Error ? err.message : String(err),
              })
            );
          }
        })
      );

      await prisma.scanRun.update({
        where: { id: scanRun.id },
        data: { status: "completed", completedAt: new Date(), sourcesScanned, findingsCount: totalFindings },
      });

      controller.enqueue(encode({ done: true, totalFindings }));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
