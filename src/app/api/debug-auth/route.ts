import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const results: {
    timestamp: string;
    env: Record<string, unknown>;
    db?: Record<string, unknown>;
  } = {
    timestamp: new Date().toISOString(),
    env: {
      NEXTAUTH_URL_set: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET_set: !!process.env.NEXTAUTH_SECRET,
      VERCEL: process.env.VERCEL ?? null,
      VERCEL_URL: process.env.VERCEL_URL ?? null,
      DATABASE_URL_set: !!process.env.DATABASE_URL,
    },
  };

  try {
    await prisma.$connect();
    results.db = { connected: true };

    const userCount = await prisma.user.count();
    results.db.userCount = userCount;

    const admin = await prisma.user.findUnique({
      where: { email: "admin@autoprime.com.br" },
      select: { email: true, role: true, name: true },
    });
    results.db.adminUser = admin;

    const attempts = await prisma.loginAttempt.count();
    results.db.rateLimitEntries = attempts;
  } catch (err) {
    results.db = { connected: false, error: err instanceof Error ? err.message : String(err) };
  }

  try {
    await prisma.$disconnect();
  } catch {}

  return NextResponse.json(results, { status: 200 });
}