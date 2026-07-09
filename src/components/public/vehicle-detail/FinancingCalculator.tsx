'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn, formatCurrency, calculatePMT } from '@/lib/utils';
import { Button } from '@/components/ui/base/button';
import { Slider } from '@/components/ui/base/slider';
import { TrendingUp, Calculator, ChevronDown, ChevronUp } from 'lucide-react';

interface FinancingCalculatorProps {
  vehiclePrice: number;
  vehicleTitle: string;
}

type AmortizationType = 'SAC' | 'PRICE';

interface Parcela {
  numero: number;
  valor: number;
  juros: number;
  amortizacao: number;
  saldo: number;
}

export function FinancingCalculator({ vehiclePrice, vehicleTitle }: FinancingCalculatorProps) {
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [months, setMonths] = useState(48);
  const [rate, setRate] = useState(1.49);
  const [amortization, setAmortization] = useState<AmortizationType>('PRICE');
  const [showTable, setShowTable] = useState(false);

  const downPayment = (vehiclePrice * downPaymentPct) / 100;
  const financed = vehiclePrice - downPayment;
  const monthlyRate = rate / 100;

  const calcSimulacao = useCallback((): Parcela[] => {
    const parcels: Parcela[] = [];
    let saldo = financed;

    if (amortization === 'PRICE') {
      const pmt = calculatePMT(vehiclePrice, downPayment, months, monthlyRate);
      for (let i = 1; i <= months; i++) {
        const juros = saldo * monthlyRate;
        const amort = pmt - juros;
        saldo -= amort;
        parcels.push({ numero: i, valor: pmt, juros, amortizacao: amort, saldo: Math.max(saldo, 0) });
      }
    } else {
      const amortFixa = financed / months;
      let totalJuros = 0;
      for (let i = 1; i <= months; i++) {
        const juros = saldo * monthlyRate;
        const parcela = amortFixa + juros;
        saldo -= amortFixa;
        totalJuros += juros;
        parcels.push({ numero: i, valor: parcela, juros, amortizacao: amortFixa, saldo: Math.max(saldo, 0) });
      }
    }

    return parcels;
  }, [vehiclePrice, downPayment, months, monthlyRate, amortization, financed]);

  const simulacao = calcSimulacao();
  const totalPagar = simulacao.reduce((sum, p) => sum + p.valor, 0);
  const totalJuros = simulacao.reduce((sum, p) => sum + p.juros, 0);
  const primeiraParcela = simulacao[0]?.valor ?? 0;
  const ultimaParcela = simulacao[simulacao.length - 1]?.valor ?? 0;
  const cet = financed > 0 ? ((totalJuros / financed) * 100).toFixed(2) : '0';

  useEffect(() => {
    const saved = localStorage.getItem('financing-prefs');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        if (prefs.downPaymentPct) setDownPaymentPct(prefs.downPaymentPct);
        if (prefs.months) setMonths(prefs.months);
        if (prefs.rate) setRate(prefs.rate);
        if (prefs.amortization) setAmortization(prefs.amortization);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('financing-prefs', JSON.stringify({ downPaymentPct, months, rate, amortization }));
  }, [downPaymentPct, months, rate, amortization]);

  return (
    <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-700 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Calculator className="h-5 w-5 text-primary-600" />
        <h3 className="font-bold text-ink-900 dark:text-ink-100">Simule seu Financiamento</h3>
      </div>

      {/* Tipo de amortização */}
      <div className="flex gap-2 mb-5">
        {(['PRICE', 'SAC'] as AmortizationType[]).map(type => (
          <button
            key={type}
            onClick={() => setAmortization(type)}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all',
              amortization === type
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700'
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Entrada */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-ink-700 dark:text-ink-300">
            Entrada ({downPaymentPct}%)
          </label>
          <span className="font-bold text-primary-600">{formatCurrency(downPayment)}</span>
        </div>
        <Slider
          value={[downPaymentPct]}
          onValueChange={([v]) => setDownPaymentPct(v)}
          min={0}
          max={90}
          step={5}
        />
        <div className="flex justify-between text-xs text-ink-400">
          <span>0%</span>
          <span>90%</span>
        </div>
      </div>

      {/* Prazo */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-ink-700 dark:text-ink-300">Prazo</label>
          <span className="font-bold text-ink-900 dark:text-ink-100">{months}x</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[12, 24, 36, 48, 60].map(m => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                months === m
                  ? 'bg-primary-600 text-white'
                  : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-200'
              )}
            >
              {m}x
            </button>
          ))}
        </div>
      </div>

      {/* Taxa */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-ink-700 dark:text-ink-300">
            Taxa (a.m.)
          </label>
          <span className="font-bold text-ink-900 dark:text-ink-100">{rate.toFixed(2)}%</span>
        </div>
        <Slider
          value={[rate]}
          onValueChange={([v]) => setRate(v)}
          min={0.5}
          max={3}
          step={0.01}
        />
        <div className="flex justify-between text-xs text-ink-400">
          <span>0,50%</span>
          <span>3,00%</span>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-primary-50 dark:bg-primary-900/10 rounded-xl p-4 space-y-3 border border-primary-100 dark:border-primary-900/20">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-ink-500 dark:text-ink-400">Valor financiado</p>
            <p className="text-lg font-bold text-ink-900 dark:text-ink-100">{formatCurrency(financed)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              {amortization === 'PRICE' ? 'Parcela fixa' : '1ª parcela'}
            </p>
            <p className="text-lg font-bold text-primary-600">{formatCurrency(primeiraParcela)}</p>
          </div>
        </div>

        {amortization === 'SAC' && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-primary-100 dark:border-primary-900/20">
            <div>
              <p className="text-xs text-ink-500">Última parcela</p>
              <p className="text-sm font-semibold text-ink-700 dark:text-ink-300">{formatCurrency(ultimaParcela)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-500">Parcelas decrescentes</p>
              <p className="text-sm font-semibold text-ink-700 dark:text-ink-300">{formatCurrency(primeiraParcela - ultimaParcela)}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-primary-100 dark:border-primary-900/20">
          <div>
            <p className="text-xs text-ink-500">Total a pagar</p>
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{formatCurrency(totalPagar + downPayment)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500">Juros totais</p>
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{formatCurrency(totalJuros)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <TrendingUp className="h-3.5 w-3.5 text-ink-400" />
          <p className="text-xs text-ink-500">CET aproximado: {cet}%</p>
        </div>
      </div>

      {/* Tabela */}
      <button
        onClick={() => setShowTable(!showTable)}
        className="w-full mt-4 flex items-center justify-between text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        Ver tabela detalhada
        {showTable ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {showTable && (
        <div className="mt-3 max-h-64 overflow-y-auto border border-ink-200 dark:border-ink-700 rounded-lg">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-ink-50 dark:bg-ink-800 text-ink-600 dark:text-ink-400">
              <tr>
                <th className="px-2 py-2 text-left">#</th>
                <th className="px-2 py-2 text-right">Parcela</th>
                <th className="px-2 py-2 text-right">Juros</th>
                <th className="px-2 py-2 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {simulacao
                .map((p, i) => ({ p, i, isLast: i === simulacao.length - 1 }))
                .filter(({ i, isLast }) => i < 12 || isLast)
                .flatMap(({ p, isLast }, idx, arr): React.ReactNode[] => {
                  const showEllipsis = arr.length > 12 && isLast;
                  const rows: React.ReactNode[] = [];
                  if (showEllipsis) {
                    rows.push(
                      <tr key="ellipsis">
                        <td colSpan={4} className="px-2 py-1 text-center text-ink-400">...</td>
                      </tr>
                    );
                  }
                  rows.push(
                    <tr key={p.numero} className={cn(showEllipsis && 'border-t-2 border-ink-200 dark:border-ink-700')}>
                      <td className="px-2 py-1.5 text-ink-700 dark:text-ink-300">{p.numero}</td>
                      <td className="px-2 py-1.5 text-right text-ink-700 dark:text-ink-300">{formatCurrency(p.valor)}</td>
                      <td className="px-2 py-1.5 text-right text-ink-500">{formatCurrency(p.juros)}</td>
                      <td className="px-2 py-1.5 text-right text-ink-500">{formatCurrency(p.saldo)}</td>
                    </tr>
                  );
                  return rows;
                })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-ink-400 leading-relaxed">
        * Valores aproximados. A taxa pode variar conforme análise de crédito. Consulte nosso parceiro financeiro para condições exatas.
      </p>
    </div>
  );
}