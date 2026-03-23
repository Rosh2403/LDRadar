import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT,
      MAX_LIMIT
    );
    const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10) || 0, 0);
    const search = searchParams.get("search");

    const conditions: Prisma.FindingWhereInput[] = [];
    if (category) conditions.push({ category });
    if (type) conditions.push({ type });
    if (search) {
      conditions.push({
        OR: [
          { institution: { contains: search, mode: "insensitive" } },
          { title: { contains: search, mode: "insensitive" } },
          { summary: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const where: Prisma.FindingWhereInput =
      conditions.length > 0 ? { AND: conditions } : {};

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
  } catch (err) {
    console.error("[findings] Error:", err);
    return NextResponse.json({ error: "Failed to fetch findings" }, { status: 500 });
  }
}
