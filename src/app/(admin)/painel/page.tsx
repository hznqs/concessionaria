export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import { formatCurrency, LEAD_STATUS_CONFIG, cn } from "@/lib/utils";
import { Car, DollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Package } from "lucide-react";
import Link from "next/link";
import { VehicleThumbnail } from "@/components/ui/vehicle-thumbnail";
import {
  MonthlyAreaChart, LeadsBarChart, ConversionLineChart, StatusPieChart,
} from "@/components/admin/charts";

// Sem cache — admin precisa ver métricas frescas.
async function getMetrics() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const last6Months = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalVehicles, available, soldVehiclesThisMonth, soldVehiclesLastMonth,
    soldLeadsThisMonth, soldLeadsLastMonth,
    stockValueAgg, totalLeads, newLeadsThisMonth, newLeadsLastMonth,
    reserved, soldVehicles,
    recentVehicles, recentLeads,
    vehiclesByMonth, leadsByMonth, leadsWonByMonth
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "AVAILABLE" } }),
    prisma.vehicle.count({ where: { status: "SOLD", soldAt: { gte: monthStart } } }),
    prisma.vehicle.count({ where: { status: "SOLD", soldAt: { gte: lastMonthStart, lt: monthStart } } }),
    prisma.lead.count({ where: { status: "WON", vehicleId: null, updatedAt: { gte: monthStart } } }),
    prisma.lead.count({ where: { status: "WON", vehicleId: null, updatedAt: { gte: lastMonthStart, lt: monthStart } } }),
    prisma.vehicle.aggregate({ where: { status: "AVAILABLE" }, _sum: { price: true } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.lead.count({ where: { createdAt: { gte: lastMonthStart, lt: monthStart } } }),
    prisma.vehicle.count({ where: { status: "RESERVED" } }),
    prisma.vehicle.count({ where: { status: "SOLD" } }),
    prisma.vehicle.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { brand: true, model: true, images: { where: { isCover: true }, take: 1 } } }),
    prisma.lead.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { vehicle: { select: { title: true } } } }),
    // Puxa veículos que foram criados OU vendidos nos últimos 6 meses
    prisma.vehicle.findMany({ 
      where: { OR: [ { createdAt: { gte: last6Months } }, { soldAt: { gte: last6Months } } ] }, 
      select: { createdAt: true, status: true, soldAt: true } 
    }),
    prisma.lead.findMany({ where: { createdAt: { gte: last6Months } }, select: { createdAt: true } }),
    prisma.lead.findMany({ where: { status: "WON", updatedAt: { gte: last6Months } }, select: { updatedAt: true, vehicleId: true } }),
  ]);

  const soldThisMonth = soldVehiclesThisMonth + soldLeadsThisMonth;
  const soldLastMonth = soldVehiclesLastMonth + soldLeadsLastMonth;

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Initialize last 6 months
  const byMonth: Record<string, { vendas: number; cadastros: number; leads: number }> = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    byMonth[monthNames[d.getMonth()]] = { vendas: 0, cadastros: 0, leads: 0 };
  }

  vehiclesByMonth.forEach(v => {
    // Conta entrada no estoque (cadastro)
    if (v.createdAt >= last6Months) {
      const key = monthNames[v.createdAt.getMonth()];
      if (byMonth[key]) byMonth[key].cadastros++;
    }
    // Conta vendas de veículos pela data de venda (soldAt)
    if (v.status === 'SOLD' && v.soldAt && v.soldAt >= last6Months) {
      const key = monthNames[v.soldAt.getMonth()];
      if (byMonth[key]) byMonth[key].vendas++;
    }
  });

  leadsByMonth.forEach(l => {
    const key = monthNames[l.createdAt.getMonth()];
    if (byMonth[key]) byMonth[key].leads++;
  });

  // Conta leads WON que não tem carro vinculado (se tivesse, o carro já contaria acima)
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
      { name: 'Vendidos', value: soldVehicles, color: '#64748b' },
    ];

    const salesGrowth = soldLastMonth > 0 ? ((soldThisMonth - soldLastMonth) / soldLastMonth) * 100 : (soldThisMonth > 0 ? 100 : 0);
    const leadsGrowth = newLeadsLastMonth > 0 ? ((newLeadsThisMonth - newLeadsLastMonth) / newLeadsLastMonth) * 100 : (newLeadsThisMonth > 0 ? 100 : 0);

    return {
      totalVehicles, available, soldThisMonth, stockValue: Number(stockValueAgg._sum.price ?? 0),
      totalLeads, newLeadsThisMonth,
      salesGrowth, leadsGrowth,
      recentVehicles, recentLeads,
      salesChart, leadsChart, conversionChart, statusPie,
    };
  };

export default async function DashboardPage() {
  const m = await getMetrics();

  const cards = [
    {
      icon: <Car size={22} />,
      label: "Total de Veículos",
      value: m.totalVehicles,
      sub: `${m.available} disponíveis`,
      trend: null,
      color: "text-primary-400",
      bgColor: "bg-primary-500/10",
    },
    {
      icon: <DollarSign size={22} />,
      label: "Valor do Estoque",
      value: formatCurrency(m.stockValue),
      sub: "em veículos disponíveis",
      trend: null,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: <TrendingUp size={22} />,
      label: "Vendas no Mês",
      value: m.soldThisMonth,
      sub: "veículos vendidos",
      trend: m.salesGrowth,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: <Users size={22} />,
      label: "Leads Recebidos",
      value: m.totalLeads,
      sub: `+${m.newLeadsThisMonth} este mês`,
      trend: m.leadsGrowth,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-ink-400 text-sm mt-1">Visão geral do estoque e leads</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="group relative bg-ink-900 hover:bg-ink-800 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg shadow-black/20 hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${c.bgColor} ${c.color} shadow-inner`}>
                  {c.icon}
                </div>
                {c.trend !== null && (
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-white/5 border border-white/5 ${c.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {c.trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(c.trend).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="text-ink-500 text-xs font-semibold uppercase tracking-wider mb-1.5">{c.label}</p>
              <p className={`text-2xl font-black ${c.color} leading-none tracking-tight`}>{c.value}</p>
              <p className="text-ink-500 text-xs mt-2">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-ink-900 rounded-2xl p-5 border border-white/5 shadow-lg shadow-black/20 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-sm tracking-wide">Vendas por Mês</h2>
            <Link href="/painel/relatorios" className="text-primary-400 text-xs font-medium hover:text-primary-300 transition-colors">Ver relatório &rarr;</Link>
          </div>
          <MonthlyAreaChart data={m.salesChart} />
        </div>

        <div className="bg-ink-900 rounded-2xl p-5 border border-white/5 shadow-lg shadow-black/20">
          <h2 className="font-semibold text-white text-sm tracking-wide mb-4">Status do Estoque</h2>
          <StatusPieChart data={m.statusPie} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-ink-900 rounded-2xl p-5 border border-white/5 shadow-lg shadow-black/20">
          <h2 className="font-semibold text-white text-sm tracking-wide mb-4">Leads por Mês</h2>
          <LeadsBarChart data={m.leadsChart} />
        </div>
        <div className="bg-ink-900 rounded-2xl p-5 border border-white/5 shadow-lg shadow-black/20">
          <h2 className="font-semibold text-white text-sm tracking-wide mb-4">Taxa de Conversão (%)</h2>
          <ConversionLineChart data={m.conversionChart} />
        </div>
      </div>

      {/* Recent lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-ink-900 rounded-2xl border border-white/5 shadow-lg shadow-black/20 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <h2 className="font-semibold text-white text-sm tracking-wide">Últimos Veículos</h2>
            <Link href="/painel/estoque" className="text-primary-400 text-xs font-medium hover:text-primary-300 transition-colors">Ver todos &rarr;</Link>
          </div>
          <div className="divide-y divide-white/5 flex-1">
            {m.recentVehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <Package className="w-5 h-5 text-ink-500" />
                </div>
                <p className="text-white font-medium text-sm">Nenhum veículo no estoque</p>
                <p className="text-ink-500 text-xs mt-1">Os veículos cadastrados aparecerão aqui</p>
              </div>
            ) : (
              m.recentVehicles.map((v) => {
              const cover = v.images[0];
              return (
                <Link key={v.id} href={`/painel/estoque`} className="group flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-14 h-10 rounded-lg bg-ink-900 overflow-hidden shrink-0 border border-white/5 group-hover:border-white/10 transition-colors relative">
                    <VehicleThumbnail src={cover?.url ?? ""} alt={v.title} fill sizes="56px" containerClassName="w-full h-full" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate group-hover:text-primary-400 transition-colors">{v.brand.name} {v.model.name}</p>
                    <p className="text-ink-500 text-xs mt-0.5">{v.yearMfr}/{v.yearModel}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className="text-primary-400 font-bold text-sm">{formatCurrency(Number(v.price))}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-ink-300 border border-white/5">{v.status}</span>
                  </div>
                </Link>
              );
            })
            )}
          </div>
        </div>

        <div className="bg-ink-900 rounded-2xl border border-white/5 shadow-lg shadow-black/20 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <h2 className="font-semibold text-white text-sm tracking-wide">Últimos Leads</h2>
            <Link href="/painel/leads" className="text-primary-400 text-xs font-medium hover:text-primary-300 transition-colors">Ver todos &rarr;</Link>
          </div>
          <div className="divide-y divide-white/5 flex-1">
            {m.recentLeads.map((l) => (
              <div key={l.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center text-primary-400 font-bold text-sm shrink-0 border border-primary-500/10 group-hover:border-primary-500/30 transition-colors">
                  {l.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{l.name}</p>
                  <p className="text-ink-500 text-xs truncate mt-0.5">{l.vehicle?.title ?? "Interesse geral"}</p>
                </div>
                <span className={cn(
                  'text-[10px] px-2.5 py-1 rounded-full border shrink-0 font-medium tracking-wide shadow-inner',
                  (() => {
                    const s = LEAD_STATUS_CONFIG[l.status as keyof typeof LEAD_STATUS_CONFIG] ?? LEAD_STATUS_CONFIG.NEW;
                    return `${s.bg} ${s.color} ${s.border}`;
                  })()
                )}>
                  {LEAD_STATUS_CONFIG[l.status as keyof typeof LEAD_STATUS_CONFIG]?.label ?? 'Novo'}
                </span>
              </div>
            ))}
            {m.recentLeads.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-ink-500" />
                </div>
                <p className="text-white font-medium text-sm">Nenhum lead ainda</p>
                <p className="text-ink-500 text-xs mt-1">Os novos contatos aparecerão aqui</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}