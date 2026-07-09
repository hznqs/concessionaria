import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { StockTable } from "@/components/admin/stock-table";

interface VehicleRow {
  id: string; slug: string; title: string; price: number;
  mileage: number; yearMfr: number; yearModel: number;
  status: string; featured: boolean;
  brand: { name: string }; model: { name: string };
  images: { url: string }[];
}

// Sem cache — admin precisa ver alterações (status/preço) imediatamente.
async function getVehicles(): Promise<VehicleRow[]> {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      brand: { select: { name: true } },
      model: { select: { name: true } },
      images: { where: { isCover: true }, take: 1 },
    },
  });
  return vehicles.map(v => ({
    id: v.id, slug: v.slug, title: v.title,
    price: Number(v.price), mileage: v.mileage,
    yearMfr: v.yearMfr, yearModel: v.yearModel,
    status: v.status, featured: v.featured,
    brand: v.brand, model: v.model,
    images: v.images.map(i => ({ url: i.url })),
  }));
}

export default async function EstoquePage() {
  const vehicles = await getVehicles();

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Estoque</h1>
          <p className="text-ink-400 text-sm mt-0.5">{vehicles.length} veículo{vehicles.length !== 1 ? "s" : ""} cadastrado{vehicles.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/painel/estoque/novo"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/20 hover:shadow-xl transition-all"
        >
          <PlusCircle size={16} />
          Novo Veículo
        </Link>
      </div>

      <StockTable data={vehicles} />
    </div>
  );
}