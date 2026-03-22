import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SOURCES, DISCOVERY_PROMPT, GOAL_PROMPT } from "@/lib/sources";
import { runTinyFishScan } from "@/lib/tinyfish";
import { isUrlSafe, SCAN_CONFIG, SOURCE_TYPES } from "@/lib/constants";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 300;

const addSourceSchema = z.object({
  name: z.string().min(1).max(100).transform((s) => s.trim()),
  url: z.string().url().max(2048).transform((s) => s.trim()),
  type: z.enum(SOURCE_TYPES).default("Other"),
});

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
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = addSourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }
  const { name, url, type } = parsed.data;

  // SSRF protection — block internal/private URLs
  if (!isUrlSafe(url)) {
    return NextResponse.json({ error: "URL is not allowed (internal/private addresses are blocked)" }, { status: 400 });
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
    data: { name, url, type },
  });

  // Stream the scan progress back
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encode({ source: customSource.name, status: "discovering", findingsCount: 0 }));

      try {
        let result;
        try {
          result = await runTinyFishScan(customSource.url, DISCOVERY_PROMPT, { maxSteps: SCAN_CONFIG.discoveryMaxSteps });
          if (result.findings.length === 0) {
            result = await runTinyFishScan(customSource.url, GOAL_PROMPT, { maxSteps: SCAN_CONFIG.directMaxSteps });
          }
        } catch {
          result = await runTinyFishScan(customSource.url, GOAL_PROMPT, { maxSteps: SCAN_CONFIG.directMaxSteps });
        }

        let newCount = 0;
        for (const finding of result.findings) {
          const title = finding.title || "Untitled";
          try {
            await prisma.finding.create({
              data: {
                institution: customSource.name,
                type: customSource.type,
                title,
                summary: finding.summary || "",
                category: finding.category || "Policy",
                date: finding.date || new Date().toLocaleDateString("en-CA"),
                sourceUrl: finding.sourceUrl || customSource.url,
              },
            });
            newCount++;
          } catch (err) {
            if (err instanceof Error && err.message.includes("Unique constraint")) continue;
            throw err;
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
