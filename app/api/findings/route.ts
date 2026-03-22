import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const limit = Math.min(
    parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT,
    MAX_LIMIT
  );
  const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10) || 0, 0);

  const where: Record<string, string> = {};
  if (category) where.category = category;
  if (type) where.type = type;

  const [findings, total] = await Promise.all([
    prisma.finding.findMany({
      where,
      orderBy: { scannedAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.finding.count({ where }),
  ]);

  return NextResponse.json({ findings, total, limit, offset });
}
