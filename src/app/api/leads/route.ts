import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidateTag, revalidatePath } from "next/cache";
import { LeadOrigin, LeadStatus } from "@prisma/client";
import { requireAdmin, requireCsrf } from "@/lib/admin-auth";
import { PersistentRateLimiter } from "@/lib/rate-limit-persistent";
export const runtime = "nodejs";

// Schema público do lead (site): vehicleId opcional (contato geral não tem veículo).
const publicLeadSchema = z.object({
  name:        z.string().min(3).max(200),
  whatsapp:    z.string().min(10).max(20),
  email:       z.string().email().max(254).optional().or(z.literal("")),
  message:     z.string().max(5000).optional(),
  vehicleId:   z.string().cuid().optional(),
  utmSource:   z.string().max(200).optional(),
  utmMedium:   z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
}).strict();

// Schema admin (criação manual): vehicleId opcional, permite definir
// origem, status, proposta — útil para leads de WhatsApp/telefone/pessoalmente.
const adminLeadSchema = z.object({
  name:       z.string().min(3).max(200),
  whatsapp:   z.string().min(10).max(20),
  email:      z.string().email().max(254).optional().or(z.literal("")),
  message:    z.string().max(5000).optional(),
  vehicleId:  z.string().cuid().optional(),
  origin:     z.nativeEnum(LeadOrigin).optional(),
  status:     z.nativeEnum(LeadStatus).optional(),
  proposal:   z.coerce.number().min(0).optional(),
  utmSource:  z.string().max(200).optional(),
  utmMedium:  z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
}).strict();

const limiter = new PersistentRateLimiter({ limit: 5, windowMs: 60000, lockMs: 60000 }); // 5 per minute

export async function POST(req: NextRequest) {
  try {
    requireCsrf(req);

    const session = await requireAdmin();

    // Admin auth permite pular rate limit e usar schema expandido.
    if (session) {
      const body = await req.json();
      const data = adminLeadSchema.parse(body);

      // Validação de referência: se vehicleId veio, veículo precisa existir.
      if (data.vehicleId) {
        const exists = await prisma.vehicle.findUnique({
          where: { id: data.vehicleId },
          select: { id: true },
        });
        if (!exists) {
          return NextResponse.json({ error: "Veículo informado não encontrado" }, { status: 400 });
        }
      }

      const lead = await prisma.lead.create({
        data: {
          name:        data.name,
          whatsapp:    data.whatsapp,
          email:       data.email || null,
          message:     data.message || null,
          vehicleId:   data.vehicleId ?? null,
          origin:      data.origin ?? "WEBSITE",
          status:      data.status ?? "NEW",
          proposal:    data.proposal ?? null,
          utmSource:   data.utmSource ?? req.headers.get("referer") ?? undefined,
          utmMedium:   data.utmMedium,
          utmCampaign: data.utmCampaign,
        },
      });

      revalidateTag('leads');
      revalidateTag('dashboard');
      revalidatePath('/painel');
      revalidatePath('/painel/relatorios');
      revalidatePath('/painel/leads');
      return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
    }

    // Path público: rate limit + schema.
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const ipKey = ip.split(",")[0]?.trim() ?? "unknown";
    const limitCheck = await limiter.check(`lead:${ipKey}`);
    if (!limitCheck.ok) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente mais tarde." }, { status: 429 });
    }

    const body = await req.json();
    const data = publicLeadSchema.parse(body);

    const lead = await prisma.lead.create({
      data: {
        name:        data.name,
        whatsapp:    data.whatsapp,
        email:       data.email || null,
        message:     data.message || null,
        vehicleId:   data.vehicleId ?? null,
        utmSource:   data.utmSource ?? req.headers.get("referer") ?? undefined,
        utmMedium:   data.utmMedium,
        utmCampaign: data.utmCampaign,
      },
    });

    revalidateTag('leads');
    revalidateTag('dashboard');
    revalidatePath('/painel');
    revalidatePath('/painel/relatorios');
    revalidatePath('/painel/leads');
    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: err.errors }, { status: 400 });
    }
    console.error("[LEADS POST]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { vehicle: { select: { title: true, slug: true } } },
  });
  return NextResponse.json(leads);
}
