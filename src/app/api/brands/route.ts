import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

export async function GET() {
  const brands = await prisma.brand.findMany({
    where:   { active: true },
    orderBy: { name: "asc" },
    include: {
      models: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });
  return NextResponse.json(brands);
}
