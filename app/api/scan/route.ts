import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { SOURCES, GOAL_PROMPT } from "@/lib/sources";
import { runTinyFishScan } from "@/lib/tinyfish";

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

      // Emit "scanning" for all sources immediately so the UI shows all of them
      for (const source of SOURCES) {
        controller.enqueue(encode({ source: source.name, status: "scanning", findingsCount: 0 }));
      }

      // Scan all sources in parallel — each resolves independently and streams its result
      await Promise.allSettled(
        SOURCES.map(async (source) => {
          try {
            const result = await runTinyFishScan(source.url, GOAL_PROMPT);
            const findings = result.findings;

            let newCount = 0;
            for (const finding of findings) {
              const exists = await prisma.finding.findFirst({
                where: { institution: source.name, title: finding.title || "Untitled" },
                select: { id: true },
              });
              if (!exists) {
                await prisma.finding.create({
                  data: {
                    institution: source.name,
                    type: source.type,
                    title: finding.title || "Untitled",
                    summary: finding.summary || "",
                    category: finding.category || "Policy",
                    date: finding.date || new Date().toISOString().split("T")[0],
                    sourceUrl: finding.sourceUrl || source.url,
                  },
                });
                newCount++;
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
