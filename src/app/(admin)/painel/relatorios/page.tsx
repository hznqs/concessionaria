export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  MonthlyAreaChart, LeadsBarChart, ConversionLineChart, StatusPieChart,
} from "@/components/admin/charts";
import { Car, DollarSign, TrendingUp, Users, Eye, Heart } from "lucide-react";
import Image from "next/image";

async function getReportData() {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const now = new Date();
  const last6 = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalVehicles, available, soldVehicles, reserved, stockValue,
    viewsSum, leadsCount,
    topViewed, byBrand,
    vehiclesByMonth, leadsByMonth, leadsWonByMonth,
    soldLeads
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "AVAILABLE" } }),
    prisma.vehicle.count({ where: { status: "SOLD" } }),
    prisma.vehicle.count({ where: { status: "RESERVED" } }),
    prisma.vehicle.aggregate({ where: { status: "AVAILABLE" }, _sum: { price: true }, _avg: { price: true } }),
    prisma.vehicle.aggregate({ _sum: { views: true } }),
    prisma.lead.count(),
    prisma.vehicle.findMany({ take: 10, orderBy: { views: "desc" }, include: { brand: true, model: true, images: { where: { isCover: true }, take: 1 } } }),
    prisma.brand.findMany({ include: { _count: { select: { vehicles: true } } }, orderBy: { vehicles: { _count: 'desc' } } }),
    prisma.vehicle.findMany({ 
      where: { OR: [ { createdAt: { gte: last6 } }, { soldAt: { gte: last6 } } ] }, 
      select: { createdAt: true, status: true, soldAt: true } 
    }),
    prisma.lead.findMany({ where: { createdAt: { gte: last6 } }, select: { createdAt: true } }),
    prisma.lead.findMany({ where: { status: "WON", updatedAt: { gte: last6 } }, select: { updatedAt: true, vehicleId: true } }),
    prisma.lead.count({ where: { status: "WON", vehicleId: null } }),
  ]);

  const sold = soldVehicles + soldLeads;

  // Initialize last 6 months
  const byMonth: Record<string, { vendas: number; cadastros: number; leads: number }> = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    byMonth[monthNames[d.getMonth()]] = { vendas: 0, cadastros: 0, leads: 0 };
  }

  vehiclesByMonth.forEach(v => {
    // Cadastro
    if (v.createdAt >= last6) {
      const key = monthNames[v.createdAt.getMonth()];
      if (byMonth[key]) byMonth[key].cadastros++;
    }
    // Venda de Veículo
    if (v.status === 'SOLD' && v.soldAt && v.soldAt >= last6) {
      const key = monthNames[v.soldAt.getMonth()];
      if (byMonth[key]) byMonth[key].vendas++;
    }
  });

  leadsByMonth.forEach(l => {
    const key = monthNames[l.createdAt.getMonth()];
    if (byMonth[key]) byMonth[key].leads++;
  });

  // Venda de Leads (sem carro)
  leadsWonByMonth.forEach(l => {
    if (!l.vehicleId) {
      const key = monthNames[l.updatedAt.getMonth()];
      if (byMonth[key]) byMonth[key].vendas++;
    }
  });

  const salesChart = Object.entries(byMonth).map(([label, d]) => ({ label, vendas: d.vendas, estoque: d.cadastros }));
  const leadsChart = Object.entries(byMonth).map(([label, d]) => ({ label, leads: d.leads }));
  const conversionChart = Object.entries(byMonth).map(([label, d]) => ({ 
    label, 
    conversao: d.leads > 0 ? Math.round((d.vendas / d.leads) * 100) : 0 
  }));

  const statusPie = [
    { name: 'Disponíveis', value: available, color: '#16a34a' },
    { name: 'Reservados', value: reserved, color: '#d97706' },
    { name: 'Vendidos', value: sold, color: '#DA251D' },
  ];

  return {
    totalVehicles, available, sold, reserved, stockValue: Number(stockValue._sum.price ?? 0),
    avgPrice: Number(stockValue._avg.price ?? 0),
    totalViews: viewsSum._sum.views ?? 0,
    leadsCount,
    topViewed, byBrand,
    salesChart, leadsChart, conversionChart, statusPie,
  };
}

export default async function RelatoriosPage() {
  const r = await getReportData();

  const kpis = [
    { icon: Car, label: 'Veículos', value: r.totalVehicles, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { icon: DollarSign, label: 'Valor estoque', value: formatCurrency(r.stockValue), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: TrendingUp, label: 'Preço médio', value: formatCurrency(r.avgPrice), color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: Users, label: 'Leads', value: r.leadsCount, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Eye, label: 'Total views', value: r.totalViews, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Heart, label: 'Conversão', value: `${r.leadsCount && r.totalViews ? ((r.leadsCount / r.totalViews) * 100).toFixed(1) : 0}%`, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  ];

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        <p className="text-ink-400 text-sm mt-1">Análise de desempenho do estoque e leads</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="bg-ink-900 rounded-2xl p-4 border border-white/5">
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${k.bg} ${k.color} mb-2`}>
              <k.icon className="h-4 w-4" />
            </div>
            <p className="text-ink-500 text-[10px] uppercase tracking-wider">{k.label}</p>
            <p className={`text-lg font-bold ${k.color} truncate`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-ink-900 rounded-2xl p-5 border border-white/5 lg:col-span-2">
          <h2 className="font-semibold text-white text-sm mb-4">Vendas & Cadastros (6 meses)</h2>
          <MonthlyAreaChart data={r.salesChart} height={280} />
        </div>
        <div className="bg-ink-900 rounded-2xl p-5 border border-white/5">
          <h2 className="font-semibold text-white text-sm mb-4">Distribuição do estoque</h2>
          <StatusPieChart data={r.statusPie} height={280} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-ink-900 rounded-2xl p-5 border border-white/5">
          <h2 className="font-semibold text-white text-sm mb-4">Leads por mês</h2>
          <LeadsBarChart data={r.leadsChart} height={260} />
        </div>
        <div className="bg-ink-900 rounded-2xl p-5 border border-white/5">
          <h2 className="font-semibold text-white text-sm mb-4">Taxa de conversão</h2>
          <ConversionLineChart data={r.conversionChart} height={260} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-ink-900 rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5"><h2 className="font-semibold text-white text-sm">Top 10 veículos mais visualizados</h2></div>
          <div className="divide-y divide-white/5">
            {r.topViewed.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-ink-600 font-bold text-sm w-6">{i + 1}</span>
                <div className="w-10 h-8 rounded-lg bg-ink-800 overflow-hidden shrink-0 relative">
                  {v.images[0] && <Image src={v.images[0].url} alt={v.title} fill sizes="40px" className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{v.brand.name} {v.model.name}</p>
                  <p className="text-ink-500 text-xs">{formatCurrency(Number(v.price))}</p>
                </div>
                <div className="flex items-center gap-1 text-ink-400 text-sm">
                  <Eye className="h-3.5 w-3.5" /> {v.views}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-ink-900 rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5"><h2 className="font-semibold text-white text-sm">Veículos por marca</h2></div>
          <div className="divide-y divide-white/5">
            {r.byBrand.slice(0, 10).map(b => {
              const pct = r.totalVehicles > 0 ? (b._count.vehicles / r.totalVehicles) * 100 : 0;
              return (
                <div key={b.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-white text-sm font-medium">{b.name}</p>
                    <p className="text-ink-400 text-xs">{b._count.vehicles} veículos</p>
                  </div>
                  <div className="h-2 rounded-full bg-ink-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}