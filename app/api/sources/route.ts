import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SOURCES } from "@/lib/sources";

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

  const sources = SOURCES.map((s) => {
    const group = groupMap.get(s.name);
    return {
      name: s.name,
      type: s.type,
      url: s.url,
      findingsCount: group?.count ?? 0,
      lastScanned: group?.lastScanned ?? null,
    };
  });

  return NextResponse.json({ sources, lastScan });
}
