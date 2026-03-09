import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SOURCES } from "@/lib/sources";

export async function GET() {
  const totalFindings = await prisma.finding.count();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newToday = await prisma.finding.count({
    where: { scannedAt: { gte: today } },
  });

  const lastScan = await prisma.scanRun.findFirst({
    where: { status: "completed" },
    orderBy: { completedAt: "desc" },
    select: { completedAt: true },
  });

  return NextResponse.json({
    totalFindings,
    sourcesMonitored: SOURCES.length,
    lastScan: lastScan?.completedAt ?? null,
    newToday,
  });
}
