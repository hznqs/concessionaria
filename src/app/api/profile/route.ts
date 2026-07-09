import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import { PersistentRateLimiter } from "@/lib/rate-limit-persistent";
import { requireCsrf } from "@/lib/admin-auth";
export const runtime = "nodejs";

const passwordChangeLimiter = new PersistentRateLimiter({
  limit: 3,
  windowMs: 15 * 60_000,
  lockMs: 15 * 60_000,
});

const profileSchema = z.object({
  name: z.string().min(2).max(200).optional(),
}).strict();

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8).max(200),
}).strict();

export async function PUT(req: NextRequest) {
  try {
    requireCsrf(req);
  } catch {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!session || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const action = req.nextUrl.searchParams.get("action");

  try {
    if (action === "password") {
      const pwLimitCheck = await passwordChangeLimiter.check(`pwd:${userId}`);
      if (!pwLimitCheck.ok) {
        return NextResponse.json(
          { error: "Muitas tentativas. Tente novamente mais tarde." },
          { status: 429 }
        );
      }

      const { currentPassword, newPassword } = passwordSchema.parse(body);
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      const { compare } = await import("bcryptjs");
      const isValid = await compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
      }
      const hashed = await hash(newPassword, 12);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
      });
      return NextResponse.json({ success: true });
    }

    const parsed = profileSchema.parse(body);
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name: parsed.name },
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation", details: err.errors }, { status: 400 });
    }
    console.error("[PROFILE PUT]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
