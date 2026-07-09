"use client";

import { useFormContext, useWatch, useController } from "react-hook-form";
import type { VehicleFormData } from "./multi-step-form";
import { cn, FUEL_LABELS, TRANSMISSION_LABELS, BODY_TYPE_LABELS, STATUS_CONFIG } from "@/lib/utils";
import { Star } from "lucide-react";
import {
  Select as RadixSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/base/select";

const FUEL_OPTIONS = Object.entries(FUEL_LABELS).map(([value, label]) => ({ value, label }));
const TRANS_OPTIONS = Object.entries(TRANSMISSION_LABELS).map(([value, label]) => ({ value, label }));
const BODY_OPTIONS = Object.entries(BODY_TYPE_LABELS).map(([value, label]) => ({ value, label }));

type Brand = {
  id:     string;
  name:   string;
  slug:   string;
  models: { id: string; name: string; slug: string }[];
};

function Field({ label, error, children }: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-400 block mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function StatusField() {
  const { field } = useController<VehicleFormData, "status">({ name: "status" });
  const cfg = STATUS_CONFIG[field.value as keyof typeof STATUS_CONFIG];

  return (
    <div>
      <label className="text-xs font-medium text-ink-400 block mb-1.5">Status</label>
      <RadixSelect value={field.value} onValueChange={field.onChange}>
        <SelectTrigger
          className={cn(
            'w-full rounded-xl px-4 py-3 h-auto text-sm border border-white/10 transition-colors gap-0',
            'focus:ring-0 focus:ring-offset-0',
            cfg?.bg, cfg?.color
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="min-w-[160px] bg-ink-800 border-ink-700 text-ink-100">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <SelectItem
              key={key}
              value={key}
              className={cn('text-sm rounded-md focus:bg-ink-700 focus:text-ink-100', cfg.color)}
            >
              {cfg.label}
            </SelectItem>
          ))}
        </SelectContent>
      </RadixSelect>
    </div>
  );
}

function FormSelectField({ name, label, options }: { name: "fuel" | "transmission" | "bodyType" | "doors"; label: string; options: { value: string | number; label: string }[] }) {
  const { field } = useController<VehicleFormData, typeof name>({ name });
  return (
    <div>
      <label className="text-xs font-medium text-ink-400 block mb-1.5">{label}</label>
      <RadixSelect value={String(field.value)} onValueChange={(v) => field.onChange(name === "doors" ? Number(v) : v)}>
        <SelectTrigger className="w-full rounded-xl px-4 py-3 h-auto text-sm border border-white/10 bg-ink-800 text-white focus:ring-0 focus:ring-offset-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-ink-800 border-ink-700 text-ink-100">
          {options.map((o) => (
            <SelectItem key={String(o.value)} value={String(o.value)} className="text-sm rounded-md focus:bg-ink-700 focus:text-ink-100">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </RadixSelect>
    </div>
  );
}

export default function Step1Basics({ brands }: { brands: Brand[] }) {
  const { register, formState: { errors }, setValue, watch } = useFormContext<VehicleFormData>();
  const brandName = watch("brandName");
  const selectedBrand = brands.find((b) => b.name.toLowerCase() === brandName?.toLowerCase());

  const inputClass = "w-full bg-ink-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-ink-600 focus:outline-none focus:border-primary-500 transition-colors";

  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-white mb-6">Dados Básicos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Marca */}
        <Field label="Marca *" error={errors.brandName?.message}>
          <input
            {...register("brandName")}
            list="brand-list"
            placeholder="Ex: Porsche"
            className={inputClass}
            onChange={(e) => {
              setValue("brandName", e.target.value);
              setValue("modelName", "");
            }}
          />
          <datalist id="brand-list">
            {brands.map((b) => (
              <option key={b.id} value={b.name} />
            ))}
          </datalist>
        </Field>

        {/* Modelo */}
        <Field label="Modelo *" error={errors.modelName?.message}>
          <input
            {...register("modelName")}
            list="model-list"
            placeholder="Ex: 911 Carrera"
            className={inputClass}
          />
          <datalist id="model-list">
            {(selectedBrand?.models ?? []).map((m) => (
              <option key={m.id} value={m.name} />
            ))}
          </datalist>
        </Field>

        {/* Título */}
        <Field label="Título do Anúncio *" error={errors.title?.message}>
          <input {...register("title")} placeholder="Ex: Honda Civic EXL 2022" className={inputClass} />
        </Field>

        {/* Preço */}
        <Field label="Preço (R$) *" error={errors.price?.message}>
          <input {...register("price")} type="number" placeholder="Ex: 119900" className={inputClass} />
        </Field>

        {/* Ano fabricação */}
        <Field label="Ano de Fabricação *" error={errors.yearMfr?.message}>
          <input {...register("yearMfr")} type="number" placeholder="2022" className={inputClass} />
        </Field>

        {/* Ano modelo */}
        <Field label="Ano do Modelo *" error={errors.yearModel?.message}>
          <input {...register("yearModel")} type="number" placeholder="2023" className={inputClass} />
        </Field>

        {/* Quilometragem */}
        <Field label="Quilometragem" error={errors.mileage?.message}>
          <input {...register("mileage")} type="number" placeholder="Ex: 30000" className={inputClass} />
        </Field>

        {/* Cor */}
        <Field label="Cor *" error={errors.color?.message}>
          <input {...register("color")} placeholder="Ex: Branco Pérola" className={inputClass} />
        </Field>

        {/* Combustível */}
        <FormSelectField name="fuel" label="Combustível" options={FUEL_OPTIONS} />

        {/* Câmbio */}
        <FormSelectField name="transmission" label="Câmbio" options={TRANS_OPTIONS} />

        {/* Carroceria */}
        <FormSelectField name="bodyType" label="Carroceria" options={BODY_OPTIONS} />

        {/* Portas */}
        <FormSelectField name="doors" label="Portas" options={[{ value: 4, label: "4 portas" }, { value: 2, label: "2 portas" }]} />

        {/* Status */}
        <StatusField />

        {/* Destaque */}
        <div className="flex items-center gap-3 pt-4">
          <input type="checkbox" id="featured" {...register("featured")} className="w-4 h-4 accent-primary-500" />
          <label htmlFor="featured" className="text-sm text-ink-300 cursor-pointer flex items-center gap-1">
            Marcar como <span className="text-amber-400 flex items-center gap-1"><Star size={14} className="fill-current" /> Destaque</span> na vitrine
          </label>
        </div>

        {/* Descrição */}
        <div className="sm:col-span-2">
          <Field label="Descrição do veículo">
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Descreva o veículo, histórico de manutenção, diferenciais..."
              className={`${inputClass} resize-none`}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
