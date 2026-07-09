import { prisma } from "@/lib/prisma";
import { BrandStripClient } from "./brand-strip-client";

export default async function BrandStrip() {
  const brands = await prisma.brand.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  if (brands.length === 0) return null;

  return <BrandStripClient brands={brands.map(b => ({ name: b.name }))} />;
}
