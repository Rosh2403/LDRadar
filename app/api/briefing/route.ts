import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const briefing = await prisma.briefing.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!briefing) return NextResponse.json(null);

  return NextResponse.json({
    ...briefing,
    patterns: JSON.parse(briefing.patterns),
    hotSectors: JSON.parse(briefing.hotSectors),
    activeLPs: JSON.parse(briefing.activeLPs),
    watchList: JSON.parse(briefing.watchList),
  });
}
