"use client";

import React, { useState, useRef, useEffect } from "react";
import { calculatePMT, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Calculator, Star, ChevronDown } from "lucide-react";

const PLANS = [
  { months: 24, label: "24×", highlighted: false },
  { months: 36, label: "36×", highlighted: true },
  { months: 48, label: "48×", highlighted: false },
  { months: 60, label: "60×", highlighted: false },
] as const;

const MONTHLY_RATE = 0.0149; // 1.49% a.m.

interface FinancingWidgetProps {
  vehiclePrice: number;
  vehicleTitle: string;
}

export default function FinancingWidget({ vehiclePrice, vehicleTitle }: FinancingWidgetProps) {
  const [downPayment, setDownPayment] = useState<number>(
    Math.round(vehiclePrice * 0.2) // default 20% entry
  );
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Constrain down payment
  const clampedDown = Math.max(0, Math.min(downPayment, vehiclePrice - 1));
  const downPercent = Math.round((clampedDown / vehiclePrice) * 100);

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const pct = Number(e.target.value);
    setDownPayment(Math.round((pct / 100) * vehiclePrice));
  }

  return (
    <div className="w-full relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-white rounded-2xl border border-ink-200 shadow-sm flex items-center justify-between px-5 py-4 text-left hover:border-primary-500/50 hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary-50 p-2 rounded-lg">
            <Calculator className="text-primary-600" size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-ink-900">Simular Financiamento</p>
            <p className="text-xs text-ink-500 font-medium">Calcule suas parcelas estimadas</p>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={cn("text-ink-400 transition-transform duration-300", open && "rotate-180")}
        />
      </button>

      {/* Dropdown Content */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-full z-50 bg-white border border-ink-200 rounded-2xl shadow-xl animate-fade-down max-h-[80vh] overflow-y-auto">
          <div className="p-5">
            {/* Slider */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-ink-600 font-bold uppercase tracking-wider">Valor de Entrada</label>
                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                  {downPercent}% — {formatCurrency(clampedDown)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                step={1}
                value={downPercent}
                onChange={handleSlider}
                className="w-full h-2 rounded-full appearance-none bg-ink-100
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600
                           [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                style={{
                  background: `linear-gradient(to right, #da251d ${downPercent}%, #f1f5f9 ${downPercent}%)`,
                }}
              />
              <div className="flex items-center justify-between mt-2 text-[10px] font-medium text-ink-400">
                <span>0%</span>
                <span>80%</span>
              </div>
            </div>

            {/* Or: direct input */}
            <div className="mb-5">
              <label className="text-xs text-ink-600 font-bold uppercase tracking-wider block mb-2">
                Ou digite a entrada (R$)
              </label>
              <input
                type="number"
                value={downPayment || ""}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                placeholder="Ex: 30000"
                className="w-full bg-ink-50 border border-ink-200 rounded-xl px-4 py-3 text-ink-900 font-medium text-sm
                           placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>

            {/* Parcelas grid */}
            <div className="grid grid-cols-2 gap-3">
              {PLANS.map((plan) => {
                const pmt = calculatePMT(vehiclePrice, clampedDown, plan.months, MONTHLY_RATE);
                return (
                  <div
                    key={plan.months}
                    className={cn(
                      "rounded-xl p-4 text-center transition-all border",
                      plan.highlighted
                        ? "border-primary-500 bg-primary-50 shadow-sm"
                        : "border-ink-200 bg-white hover:border-primary-300"
                    )}
                  >
                    <p className={cn(
                      "text-xs font-bold mb-1 flex justify-center items-center gap-1",
                      plan.highlighted ? "text-primary-600" : "text-ink-500"
                    )}>
                      {plan.label}
                      {plan.highlighted && <Star size={12} className="fill-current" />}
                    </p>
                    <p className={cn(
                      "font-black text-lg leading-tight",
                      plan.highlighted ? "text-primary-600" : "text-ink-900"
                    )}>
                      {clampedDown >= vehiclePrice ? "Quitado" : formatCurrency(pmt)}
                    </p>
                    {clampedDown < vehiclePrice && (
                      <p className="text-[10px] font-medium text-ink-500 mt-1">
                        Total: {formatCurrency(pmt * plan.months)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-ink-400 font-medium mt-4 text-center leading-relaxed">
              * Simulação com taxa de 1,49% a.m. Sujeito a análise de crédito.
              Valores meramente estimados.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
