import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidateTag, revalidatePath } from "next/cache";
import { requireAdmin, requireCsrf } from "@/lib/admin-auth";
export const runtime = "nodejs";

function isValidImageUrl(val: string): boolean {
  try { return val.startsWith("/") || new URL(val).protocol.startsWith("http"); }
  catch { return false; }
}

const updateBannerSchema = z.object({
  title:      z.string().min(1).max(200).optional(),
  subtitle:   z.string().max(200).optional(),
  imageUrl:   z.string().max(2000).refine(isValidImageUrl).optional(),
  linkUrl:    z.string().max(2000).optional(),
  linkText:   z.string().max(200).optional(),
  order:      z.coerce.number().optional(),
  active:     z.boolean().optional(),
}).strict();

type RouteParams = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    requireCsrf(req);
  } catch {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }

  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = updateBannerSchema.parse(body);

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data,
    });

    revalidateTag("banners");
    revalidatePath("/");
    return NextResponse.json(banner);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation", details: err.errors }, { status: 400 });
    }
    console.error("[BANNER PUT]", err);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    requireCsrf(req);
  } catch {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }

  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.banner.delete({ where: { id: params.id } });

    revalidateTag("banners");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[BANNER DELETE]", err);
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}

const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string(), order: z.number() })),
});

export async function PATCH(req: NextRequest) {
  try {
    requireCsrf(req);
  } catch {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }

  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { items } = reorderSchema.parse(body);

    await prisma.$transaction(
      items.map(({ id, order }) =>
        prisma.banner.update({ where: { id }, data: { order } })
      )
    );

    revalidateTag("banners");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation", details: err.errors }, { status: 400 });
    }
    console.error("[BANNER REORDER]", err);
    return NextResponse.json({ error: "Erro ao reordenar" }, { status: 500 });
  }
}