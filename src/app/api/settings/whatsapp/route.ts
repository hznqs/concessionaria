import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { normalizeWhatsappNumber } from "@/lib/settings";
export const runtime = "nodejs";

const getWhatsapp = unstable_cache(
  async () => {
    const company = await prisma.setting.findUnique({ where: { key: "company_phone" } });
    if (company?.value) {
      const normalized = normalizeWhatsappNumber(company.value);
      if (normalized) return normalized;
    }
    const legacy = await prisma.setting.findUnique({ where: { key: "whatsapp" } });
    if (legacy?.value) {
      const normalized = normalizeWhatsappNumber(legacy.value);
      if (normalized) return normalized;
    }
    return normalizeWhatsappNumber(process.env.NEXT_PUBLIC_WHATSAPP ?? "") || "";
  },
  ["whatsapp-setting"],
  { revalidate: 60, tags: ["settings"] },
);

export async function GET() {
  const number = await getWhatsapp();
  return NextResponse.json({ number });
}