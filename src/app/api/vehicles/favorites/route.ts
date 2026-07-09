import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids");

  if (!ids) {
    return NextResponse.json({ vehicles: [] });
  }

  const idList = ids
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 50); // safety cap

  const vehicles = await prisma.vehicle.findMany({
    where: { id: { in: idList }, status: "AVAILABLE" },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      yearMfr: true,
      yearModel: true,
      mileage: true,
      fuel: true,
      brand: { select: { name: true } },
      images: {
        where: { isCover: true },
        take: 1,
        select: { url: true, alt: true, isCover: true },
      },
    },
  });

  // Keep original favorites order and convert Decimal
  const ordered = idList
    .map((id) => vehicles.find((v) => v.id === id))
    .filter(Boolean)
    .map((v) => ({ ...v!, price: Number(v!.price) }));

  return NextResponse.json({ vehicles: ordered });
}
