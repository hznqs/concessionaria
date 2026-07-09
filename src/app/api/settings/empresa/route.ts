import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unstable_cache, revalidateTag } from "next/cache";
import { requireAdmin, requireCsrf } from "@/lib/admin-auth";
import { z } from "zod";
import {
  getCompanySettings,
  type CompanySettings,
  COMPANY_KEYS,
} from "@/lib/settings";

export const runtime = "nodejs";

export async function GET() {
  const settings = await getCompanySettings();
  return NextResponse.json(settings);
}

const validKeys = new Set(COMPANY_KEYS.map((k) => `company_${k}`));

const upsertSchema = z.object({
  fields: z.record(z.string().max(200), z.string().max(10000)),
});

export async function PUT(req: NextRequest) {
  try {
    requireCsrf(req);
  } catch {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }

  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { fields } = upsertSchema.parse(body);

    const entries = Object.entries(fields).filter(
      ([key, value]) => validKeys.has(key) && typeof value === "string",
    );

    if (entries.length === 0) {
      return NextResponse.json({ error: "Nenhum campo válido" }, { status: 400 });
    }

    await Promise.all(
      entries.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    );

    revalidateTag("settings");
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation", details: err.errors }, { status: 400 });
    }
    console.error("[EMPRESA PUT]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}