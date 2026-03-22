import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SOURCES } from "@/lib/sources";

export async function GET() {
  const [totalFindings, customSourceCount, lastScan, newToday] = await Promise.all([
    prisma.finding.count(),
    prisma.customSource.count(),
    prisma.scanRun.findFirst({
      where: { status: "completed" },
      orderBy: { completedAt: "desc" },
      select: { completedAt: true },
    }),
    (async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return prisma.finding.count({
        where: { scannedAt: { gte: today } },
      });
    })(),
  ]);

  return NextResponse.json({
    totalFindings,
    sourcesMonitored: SOURCES.length + customSourceCount,
    lastScan: lastScan?.completedAt ?? null,
    newToday,
  });
}
