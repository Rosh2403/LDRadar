import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SOURCES, DISCOVERY_PROMPT, GOAL_PROMPT } from "@/lib/sources";
import { runTinyFishScan } from "@/lib/tinyfish";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET() {
  const findingGroups = await prisma.finding.groupBy({
    by: ["institution"],
    _count: { id: true },
    _max: { scannedAt: true },
  });

  const groupMap = new Map(
    findingGroups.map((g) => [
      g.institution,
      { count: g._count.id, lastScanned: g._max.scannedAt },
    ])
  );

  const lastScan = await prisma.scanRun.findFirst({
    where: { status: "completed" },
    orderBy: { completedAt: "desc" },
  });

  // Hardcoded sources
  const sources = SOURCES.map((s) => {
    const group = groupMap.get(s.name);
    return {
      id: null,
      name: s.name,
      type: s.type,
      url: s.url,
      findingsCount: group?.count ?? 0,
      lastScanned: group?.lastScanned ?? null,
      isCustom: false,
    };
  });

  // Custom sources from DB
  const customSources = await prisma.customSource.findMany({
    orderBy: { addedAt: "asc" },
  });

  const customRows = customSources.map((cs) => {
    const group = groupMap.get(cs.name);
    return {
      id: cs.id,
      name: cs.name,
      type: cs.type,
      url: cs.url,
      findingsCount: group?.count ?? 0,
      lastScanned: group?.lastScanned ?? null,
      isCustom: true,
    };
  });

  return NextResponse.json({ sources: [...sources, ...customRows], lastScan });
}

function encode(obj: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(obj) + "\n");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, url, type } = body as { name: string; url: string; type: string };

  // Basic validation
  if (!name?.trim() || !url?.trim()) {
    return NextResponse.json({ error: "Name and URL are required" }, { status: 400 });
  }
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Check for duplicate
  const existing = await prisma.customSource.findFirst({
    where: { OR: [{ url }, { name }] },
  });
  if (existing) {
    return NextResponse.json({ error: "A source with this name or URL already exists" }, { status: 409 });
  }

  // Save to DB
  const customSource = await prisma.customSource.create({
    data: { name: name.trim(), url: url.trim(), type: type || "Other" },
  });

  // Stream the scan progress back
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encode({ source: customSource.name, status: "discovering", findingsCount: 0 }));

      try {
        // Try discovery from the provided URL (treated as homepage)
        let result;
        try {
          result = await runTinyFishScan(customSource.url, DISCOVERY_PROMPT, { maxSteps: 20 });
          if (result.findings.length === 0) {
            result = await runTinyFishScan(customSource.url, GOAL_PROMPT, { maxSteps: 15 });
          }
        } catch {
          result = await runTinyFishScan(customSource.url, GOAL_PROMPT, { maxSteps: 15 });
        }

        let newCount = 0;
        for (const finding of result.findings) {
          const exists = await prisma.finding.findFirst({
            where: { institution: customSource.name, title: finding.title || "Untitled" },
            select: { id: true },
          });
          if (!exists) {
            await prisma.finding.create({
              data: {
                institution: customSource.name,
                type: customSource.type,
                title: finding.title || "Untitled",
                summary: finding.summary || "",
                category: finding.category || "Policy",
                date: finding.date || new Date().toISOString().split("T")[0],
                sourceUrl: finding.sourceUrl || customSource.url,
              },
            });
            newCount++;
          }
        }

        controller.enqueue(encode({ source: customSource.name, status: "done", findingsCount: newCount }));
      } catch (err) {
        controller.enqueue(encode({
          source: customSource.name,
          status: "error",
          findingsCount: 0,
          error: err instanceof Error ? err.message : String(err),
        }));
      }

      controller.enqueue(encode({ done: true }));
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
