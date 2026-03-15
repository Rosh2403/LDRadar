import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const source = await prisma.customSource.findUnique({ where: { id } });
  if (!source) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  // Delete findings from this custom source, then the source itself
  await prisma.finding.deleteMany({ where: { institution: source.name } });
  await prisma.customSource.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
