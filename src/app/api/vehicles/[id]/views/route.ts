import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PersistentRateLimiter } from "@/lib/rate-limit-persistent";
export const runtime = "nodejs";

const viewLimiter = new PersistentRateLimiter({
  limit: 30,
  windowMs: 60_000,
  lockMs: 60_000,
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const ipKey = ip.split(",")[0]?.trim() ?? "unknown";

  const check = await viewLimiter.check(`view:${ipKey}:${params.id}`);
  if (!check.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    await prisma.vehicle.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    });
  } catch {
    return NextResponse.json({ error: "Failed to register view" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
