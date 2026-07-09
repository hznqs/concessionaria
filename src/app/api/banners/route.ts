import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { requireAdmin, requireCsrf } from "@/lib/admin-auth";
export const runtime = "nodejs";

function isValidImageUrl(val: string): boolean {
  try { return val.startsWith("/") || new URL(val).protocol.startsWith("http"); }
  catch { return false; }
}

const bannerSchema = z.object({
  title:      z.string().min(1, "Título obrigatório").max(200),
  subtitle:   z.string().max(200).optional(),
  imageUrl:   z.string().max(2000).refine(isValidImageUrl, "URL da imagem inválida"),
  linkUrl:    z.string().max(2000).optional(),
  linkText:   z.string().max(200).default("Saiba mais"),
  order:      z.coerce.number().default(0),
  active:     z.boolean().default(true),
}).strict();

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(banners);
  } catch (err) {
    console.error("[BANNER GET]", err);
    return NextResponse.json({ error: "Erro ao buscar banners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    requireCsrf(req);
  } catch {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }

  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = bannerSchema.parse(body);

    const maxOrder = await prisma.banner.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const banner = await prisma.banner.create({
      data: { ...data, order: data.order ?? nextOrder },
    });

    revalidateTag("banners");
    return NextResponse.json(banner, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation", details: err.errors }, { status: 400 });
    }
    console.error("[BANNER POST]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}