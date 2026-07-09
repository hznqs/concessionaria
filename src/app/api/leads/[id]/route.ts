import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { LeadStatus, LeadOrigin } from "@prisma/client";
import { revalidateTag, revalidatePath } from "next/cache";
import { requireAdmin, requireCsrf } from "@/lib/admin-auth";
export const runtime = "nodejs";

const updateLeadSchema = z.object({
  status:     z.nativeEnum(LeadStatus).optional(),
  origin:     z.nativeEnum(LeadOrigin).optional(),
  proposal:   z.coerce.number().min(0).optional(),
  message:    z.string().max(5000).optional(),
  name:       z.string().min(3).max(200).optional(),
  whatsapp:   z.string().min(10).max(20).optional(),
  email:      z.string().email().max(254).optional().or(z.literal("")),
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

  const body = await req.json();
  try {
    const data = updateLeadSchema.parse(body);
    
    // Busca o lead atual para compararmos as mudanças de status (Regras 1 e 3)
    const currentLead = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!currentLead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data,
    });

    let vehicleStatusUpdated = false;

    // Regra 1 e 3: Tratativas de bloqueio/desbloqueio do veículo
    if (lead.vehicleId && data.status && data.status !== currentLead.status) {
      if ((data.status as string) === "WON") {
        // Regra 1: Move to WON -> Vehicle becomes SOLD
        await prisma.vehicle.update({
          where: { id: lead.vehicleId },
          data: { status: "SOLD", soldAt: new Date() }
        });
        vehicleStatusUpdated = true;
      } else if ((currentLead.status as string) === "WON" && (data.status as string) !== "WON") {
        // Regra 3: Muda de WON para outra coisa (ex: LOST) -> Vehicle becomes AVAILABLE
        await prisma.vehicle.update({
          where: { id: lead.vehicleId },
          data: { status: "AVAILABLE", soldAt: null }
        });
        vehicleStatusUpdated = true;
      } else if (data.status === "LOST" && currentLead.status === "NEGOTIATING") {
        // Bônus: se perdeu a negociação, libera a reserva (se houver)
        const vehicle = await prisma.vehicle.findUnique({ where: { id: lead.vehicleId } });
        if (vehicle?.status === "RESERVED") {
          await prisma.vehicle.update({
            where: { id: lead.vehicleId },
            data: { status: "AVAILABLE", soldAt: null }
          });
          vehicleStatusUpdated = true;
        }
      }
    }

    if (vehicleStatusUpdated) {
      revalidateTag("vehicles");
      revalidatePath("/painel/estoque");
      revalidatePath("/veiculos");
    }

    revalidateTag("leads");
    revalidateTag("dashboard");
    revalidatePath("/painel/leads");
    revalidatePath("/painel");
    revalidatePath("/painel/relatorios");
    return NextResponse.json(lead);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation", details: err.errors }, { status: 400 });
    }
    console.error("[LEAD PUT]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
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
    // Busca o lead antes de excluir para pegar o veículo vinculado
    const currentLead = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!currentLead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    await prisma.lead.delete({ where: { id: params.id } });

    // Regra 4: Se o Lead for deletado e estava bloqueando o carro, volta para AVAILABLE
    if (currentLead.vehicleId && ((currentLead.status as string) === "WON" || (currentLead.status as string) === "NEGOTIATING")) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: currentLead.vehicleId } });
      if (vehicle && (vehicle.status === "SOLD" || vehicle.status === "RESERVED")) {
        await prisma.vehicle.update({
          where: { id: currentLead.vehicleId },
          data: { status: "AVAILABLE", soldAt: null }
        });
        revalidateTag("vehicles");
        revalidatePath("/painel/estoque");
        revalidatePath("/veiculos");
      }
    }

    revalidateTag("leads");
    revalidateTag("dashboard");
    revalidatePath("/painel/leads");
    revalidatePath("/painel");
    revalidatePath("/painel/relatorios");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[LEAD DELETE]", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}