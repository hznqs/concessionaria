"use client";

import { useFormContext } from "react-hook-form";
import type { VehicleFormData } from "./multi-step-form";
import { cn } from "@/lib/utils";
import { Check, Plus, X } from "lucide-react";
import { useState } from "react";

type Feature = { id: string; name: string; category: string; icon: string | null };

const CATEGORY_LABELS: Record<string, string> = {
  COMFORT:     "Conforto",
  SAFETY:      "Segurança",
  TECHNOLOGY:  "Tecnologia",
  PERFORMANCE: "Performance",
  EXTERIOR:    "Exterior",
  INTERIOR:    "Interior",
  CONVENIENCE: "Conveniência",
};

export default function Step3Features({ features }: { features: Feature[] }) {
  const { watch, setValue } = useFormContext<VehicleFormData>();
  const selected = watch("featureIds") ?? [];
  const highlights = watch("highlights") ?? [];
  
  const [customInput, setCustomInput] = useState("");

  function toggle(id: string) {
    if (selected.includes(id)) {
      setValue("featureIds", selected.filter((x) => x !== id));
    } else {
      setValue("featureIds", [...selected, id]);
    }
  }

  function addCustom(e?: React.FormEvent) {
    e?.preventDefault();
    const val = customInput.trim();
    if (!val) return;
    if (!highlights.includes(val)) {
      setValue("highlights", [...highlights, val]);
    }
    setCustomInput("");
  }

  function removeCustom(val: string) {
    setValue("highlights", highlights.filter((h) => h !== val));
  }

  // Group by category
  const grouped: Record<string, Feature[]> = {};
  for (const f of features) {
    if (!grouped[f.category]) grouped[f.category] = [];
    grouped[f.category].push(f);
  }

  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-white mb-2">Opcionais e Equipamentos</h2>
      <p className="text-ink-400 text-sm mb-6">
        Selecione todos os itens que o veículo possui ou adicione itens manuais abaixo.
        <span className="text-primary-400 ml-1">{selected.length + highlights.length} selecionado{(selected.length + highlights.length) !== 1 ? "s" : ""}</span>
      </p>

      <div className="space-y-6">
        {/* Custom text options (Highlights) */}
        <div>
          <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest mb-3">
            Outros Opcionais (Adicionar Manualmente)
          </p>
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder="Ex: Teto Solar Duplo, Bancos de Couro Branco..."
              className="flex-1 bg-ink-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-ink-600 focus:outline-none focus:border-primary-500 transition-colors"
            />
            <button 
              type="button" 
              onClick={addCustom}
              disabled={!customInput.trim()}
              className="btn-prime px-4 py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={16} /> Adicionar
            </button>
          </div>
          
          {highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-ink-900 border border-white/5">
              {highlights.map((h) => (
                <div key={h} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-500/15 text-primary-300 border border-primary-500/40">
                  {h}
                  <button type="button" onClick={() => removeCustom(h)} className="hover:text-white transition-colors ml-1">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-white/5 w-full my-6"></div>

        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest mb-3">
              {CATEGORY_LABELS[cat] ?? cat}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((f) => {
                const active = selected.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggle(f.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all",
                      active
                        ? "bg-primary-500/15 text-primary-300 border-primary-500/40"
                        : "glass text-ink-400 border-white/8 hover:border-white/20 hover:text-ink-200"
                    )}
                  >
                    {f.name}
                    {active && <Check size={14} className="text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
