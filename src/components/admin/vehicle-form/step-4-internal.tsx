"use client";

import { useCallback, useState, useEffect } from "react";
import { useFormContext, useController } from "react-hook-form";
import type { VehicleFormData } from "./multi-step-form";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type PlateType = "old" | "mercosul";

function formatPlateDisplay(value: string, type: PlateType): string {
  const raw = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 7);
  if (raw.length <= 3) return raw;
  if (type === "mercosul") return `${raw.slice(0, 3)}-${raw.slice(3)}`;
  return `${raw.slice(0, 3)}-${raw.slice(3)}`;
}

function stripPlate(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

const PLATE_MASKS: Record<PlateType, string> = {
  old: "AAA-1234",
  mercosul: "AAA-1A23",
};

function PlateMaskHint({ value, type }: { value: string; type: PlateType }) {
  const raw = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const mask = PLATE_MASKS[type];
  let charIndex = 0;
  return (
    <div className="flex items-center gap-0.5 mt-1.5 text-[11px] tracking-[0.15em] font-mono">
      {mask.split("").map((ch, i) => {
        if (ch === "-") {
          return <span key={i} className="text-ink-700 mx-0.5">-</span>;
        }
        const filled = raw[charIndex];
        const isFilled = filled !== undefined;
        charIndex++;
        return (
          <span
            key={i}
            className={isFilled ? "text-primary-400" : "text-ink-700"}
          >
            {isFilled ? filled : "_"}
          </span>
        );
      })}
      <span className="text-ink-700 ml-2">
        {raw.length === 7 ? "✓" : `(${raw.length}/7)`}
      </span>
    </div>
  );
}

export default function Step4Internal() {
  const { register, control } = useFormContext<VehicleFormData>();
  const { field } = useController({ control, name: "plate" });
  const [plateType, setPlateType] = useState<PlateType>("old");

  const [displayValue, setDisplayValue] = useState("");

  const handlePlateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPlateDisplay(e.target.value, plateType);
      setDisplayValue(formatted);
      field.onChange(stripPlate(e.target.value));
    },
    [field, plateType],
  );

  const handleTypeChange = useCallback(
    (newType: PlateType) => {
      setPlateType(newType);
      const formatted = formatPlateDisplay(field.value ?? "", newType);
      setDisplayValue(formatted);
    },
    [field],
  );

  // Sync display when form value changes externally (e.g. load from DB)
  useEffect(() => {
    if (field.value && !displayValue) {
      setDisplayValue(formatPlateDisplay(field.value, plateType));
    }
  }, [field.value, plateType, displayValue]);

  const inputClass = "w-full bg-ink-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-ink-600 focus:outline-none focus:border-primary-500 transition-colors";

  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-white mb-2">Dados Internos</h2>
      <p className="text-ink-400 text-sm mb-6">
        Informações confidenciais — não aparecem na vitrine pública.
      </p>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-3 mb-6">
        <AlertTriangle className="text-amber-400 shrink-0" size={20} />
        <p className="text-amber-300/80 text-xs leading-relaxed">
          Chassi e placa são armazenados com segurança e não são exibidos na vitrine pública.
          Estes dados são visíveis apenas para administradores.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-ink-400 block mb-1.5">Número do Chassi (VIN)</label>
          <input
            {...register("chassis")}
            placeholder="Ex: 9BWZZZ377VT004251"
            maxLength={17}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-ink-400 block mb-1.5">Placa do Veículo</label>
          <div className="flex items-center gap-1 bg-ink-800 rounded-lg p-0.5 border border-white/5 mb-2">
            <button
              type="button"
              onClick={() => handleTypeChange("old")}
              className={cn(
                "flex-1 text-[11px] font-bold tracking-wide px-3 py-1.5 rounded-md transition-all",
                plateType === "old"
                  ? "bg-primary-500 text-white shadow-sm"
                  : "text-ink-500 hover:text-ink-300",
              )}
            >
              Antiga ABC-1234
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("mercosul")}
              className={cn(
                "flex-1 text-[11px] font-bold tracking-wide px-3 py-1.5 rounded-md transition-all",
                plateType === "mercosul"
                  ? "bg-primary-500 text-white shadow-sm"
                  : "text-ink-500 hover:text-ink-300",
              )}
            >
              Mercosul ABC-1D23
            </button>
          </div>
          <input
            value={displayValue}
            onChange={handlePlateChange}
            placeholder={plateType === "old" ? "ABC-1234" : "ABC-1D23"}
            maxLength={8}
            className={inputClass}
          />
          <PlateMaskHint value={displayValue} type={plateType} />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-ink-400 block mb-1.5">Notas Internas</label>
          <textarea
            {...register("internalNotes")}
            rows={4}
            placeholder="Observações internas, histórico de revisões, notas de negociação..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>
    </div>
  );
}
