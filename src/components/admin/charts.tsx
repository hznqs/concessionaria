'use client';

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

const COLORS = {
  primary: '#DA251D',
  blue: '#3b82f6',
  green: '#10b981',
  amber: '#f59e0b',
  purple: '#8b5cf6',
  ink: '#64748b',
};

interface ChartData {
  label: string;
  vendas?: number;
  leads?: number;
  conversao?: number;
  estoque?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0b1120]/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <p className="text-white/60 text-[10px] font-bold mb-3 uppercase tracking-widest">{label}</p>
        <div className="flex flex-col gap-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }} />
              <span className="text-white font-medium text-sm">
                {entry.name}: <span className="font-bold text-white ml-1">{entry.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function MonthlyAreaChart({ data, height = 260 }: { data: ChartData[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.6} />
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#ffffff" vertical={false} opacity={0.04} />
        <XAxis dataKey="label" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
        <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeOpacity: 0.1, strokeDasharray: '4 4' }} />
        <Area type="monotone" dataKey="vendas" stroke={COLORS.primary} strokeWidth={4} fill="url(#colorVendas)" name="Vendas" activeDot={{ r: 6, strokeWidth: 3, stroke: '#080d16', fill: COLORS.primary }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LeadsBarChart({ data, height = 260 }: { data: ChartData[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.blue} stopOpacity={1} />
            <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#ffffff" vertical={false} opacity={0.04} />
        <XAxis dataKey="label" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
        <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff', opacity: 0.03 }} />
        <Bar dataKey="leads" fill="url(#colorLeads)" radius={[4, 4, 0, 0]} name="Leads" barSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ConversionLineChart({ data, height = 260 }: { data: ChartData[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.5} />
            <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#ffffff" vertical={false} opacity={0.04} />
        <XAxis dataKey="label" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
        <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dx={-10} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeOpacity: 0.1, strokeDasharray: '4 4' }} />
        <Area type="monotone" dataKey="conversao" stroke={COLORS.green} strokeWidth={4} fill="url(#colorConv)" name="Conversão (%)" activeDot={{ r: 6, strokeWidth: 3, stroke: '#080d16', fill: COLORS.green }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface StatusPieData {
  name: string;
  value: number;
  color: string;
}

export function StatusPieChart({ data, height = 240 }: { data: StatusPieData[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie 
          data={data} 
          dataKey="value" 
          nameKey="name" 
          cx="50%" 
          cy="50%" 
          innerRadius={65} 
          outerRadius={85} 
          paddingAngle={5}
        >
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.color} stroke="#080d16" strokeWidth={3} className="hover:opacity-80 transition-opacity outline-none" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: '20px' }} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}