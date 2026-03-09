import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const type = searchParams.get("type");

  const where: Record<string, string> = {};
  if (category) where.category = category;
  if (type) where.type = type;

  const findings = await prisma.finding.findMany({
    where,
    orderBy: { scannedAt: "desc" },
  });

  return NextResponse.json(findings);
}
