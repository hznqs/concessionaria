import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { requireAdmin, requireCsrf } from "@/lib/admin-auth";
export const runtime = "nodejs";

// Chaves de configuração sensíveis que nunca devem ser expostas via API.
const SENSITIVE_PREFIXES = ['secret_', 'key_', 'token_', 'password_'];

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) {
    // Filtra settings sensíveis — não as expõe no GET.
    if (SENSITIVE_PREFIXES.some((prefix) => s.key.startsWith(prefix))) continue;
    map[s.key] = s.value;
  }
  return NextResponse.json(map);
}

const upsertSchema = z.object({
  key:   z.string().min(1).max(200),
  value: z.string().max(10000),
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
    const { key, value } = upsertSchema.parse(body);

    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    revalidateTag("settings");
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation", details: err.errors }, { status: 400 });
    }
    console.error("[SETTINGS PUT]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
