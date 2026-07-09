import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

const getActiveBanners = unstable_cache(
  async () => {
    return prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        linkUrl: true,
        linkText: true,
        order: true,
      },
    });
  },
  ["public-banners"],
  { revalidate: 60, tags: ["banners"] },
);

export async function GET() {
  const banners = await getActiveBanners();
  return NextResponse.json(banners);
}