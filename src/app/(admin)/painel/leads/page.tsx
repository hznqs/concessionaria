import { prisma } from "@/lib/prisma";
import { LeadsKanban } from "@/components/admin/leads-kanban";

async function getLeads() {
  const rows = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { vehicle: { select: { title: true, slug: true } } },
  });
  // Serializa os campos do Prisma (Decimal, Date) para o client component.
  return rows.map((l) => ({
    id: l.id,
    name: l.name,
    whatsapp: l.whatsapp,
    email: l.email,
    message: l.message,
    proposal: l.proposal != null ? Number(l.proposal) : null,
    origin: l.origin,
    status: l.status,
    vehicleId: l.vehicleId,
    vehicle: l.vehicle ? { title: l.vehicle.title, slug: l.vehicle.slug } : null,
    createdAt: l.createdAt.toISOString(),
  }));
}

export const revalidate = 0;

export default async function LeadsPage() {
  const leads = await getLeads();
  return <LeadsKanban initialLeads={leads} />;
}