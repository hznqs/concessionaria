"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import { ChevronRight, ChevronLeft, Loader2, Check, Trash2, AlertTriangle } from "lucide-react";

// Step components
import Step1Basics    from "./step-1-basics";
import Step2Photos    from "./step-2-photos";
import Step3Features  from "./step-3-features";
import Step4Internal  from "./step-4-internal";

// ─── Zod schema ───────────────────────────────────────────────────────────────
const schema = z.object({
  // Step 1
  brandName:      z.string().min(1, "Informe a marca"),
  modelName:      z.string().min(1, "Informe o modelo"),
  title:        z.string().min(3, "Título obrigatório"),
  price:        z.coerce.number().positive("Preço inválido"),
  yearMfr:      z.coerce.number().min(1990).max(new Date().getFullYear() + 1),
  yearModel:    z.coerce.number().min(1990).max(new Date().getFullYear() + 2),
  mileage:      z.coerce.number().min(0),
  color:        z.string().min(1, "Cor obrigatória"),
  fuel:         z.string().min(1),
  transmission: z.string().min(1),
  bodyType:     z.string().min(1),
  doors:        z.coerce.number().default(4),
  description:  z.string().optional(),
  status:       z.string().default("AVAILABLE"),
  featured:     z.boolean().default(false),
  // Step 2
  images:       z.array(z.object({ url: z.string().min(1), isCover: z.boolean() })).min(1, "Adicione pelo menos 1 foto"),
  // Step 3
  featureIds:   z.array(z.string()).default([]),
  highlights:   z.array(z.string()).default([]),
  // Step 4 (internal)
   chassis:      z.string().refine((v) => !v || /^[A-Za-z0-9]{17}$/.test(v), { message: "Chassi deve ter 17 caracteres alfanuméricos" }).optional().or(z.literal("")),
  plate:        z.string().refine((v) => !v || /^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/.test(v), { message: "Placa inválida (formato XXX-XXXX ou Mercosul)" }).optional().or(z.literal("")),
  internalNotes: z.string().optional(),
});

export type VehicleFormData = z.infer<typeof schema>;

const STEPS = [
  { id: 1, label: "Dados Básicos"  },
  { id: 2, label: "Fotos"          },
  { id: 3, label: "Opcionais"      },
  { id: 4, label: "Dados Internos" },
];

interface MultiStepFormProps {
  brands: { id: string; name: string; slug: string; models: { id: string; name: string; slug: string }[] }[];
  features: { id: string; name: string; category: string; icon: string | null }[];
  vehicle?: {
    id: string;
    title: string;
    slug: string;
    price: number;
    yearMfr: number;
    yearModel: number;
    mileage: number;
    color: string;
    fuel: string;
    transmission: string;
    bodyType: string;
    doors: number;
    description: string | null;
    status: string;
    featured: boolean;
    chassis: string | null;
    plate: string | null;
    internalNotes: string | null;
    brand: { name: string };
    model: { name: string };
    images: { url: string; isCover: boolean; alt: string | null }[];
    features: { featureId: string }[];
    highlights: string[];
  };
}

export default function MultiStepForm({ brands, features, vehicle }: MultiStepFormProps) {
  const router  = useRouter();
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [deleting, setDeleting] = useState(false);
  const isEditing = !!vehicle;

  const methods = useForm<VehicleFormData>({
    resolver: zodResolver(schema),
    defaultValues: vehicle ? {
      brandName:      vehicle.brand.name,
      modelName:      vehicle.model.name,
      title:          vehicle.title,
      price:          vehicle.price,
      yearMfr:        vehicle.yearMfr,
      yearModel:      vehicle.yearModel,
      mileage:        vehicle.mileage,
      color:          vehicle.color,
      fuel:           vehicle.fuel,
      transmission:   vehicle.transmission,
      bodyType:       vehicle.bodyType,
      doors:          vehicle.doors,
      description:    vehicle.description ?? "",
      status:         vehicle.status,
      featured:       vehicle.featured,
      images:         vehicle.images.map(i => ({ url: i.url, isCover: i.isCover })),
      featureIds:     vehicle.features.map(f => f.featureId),
      highlights:     vehicle.highlights,
      chassis:        vehicle.chassis ?? "",
      plate:          vehicle.plate ?? "",
      internalNotes:  vehicle.internalNotes ?? "",
    } : {
      fuel:         "FLEX",
      transmission: "AUTOMATIC",
      bodyType:     "SEDAN",
      doors:        4,
      status:       "AVAILABLE",
      featured:     false,
      images:       [],
      featureIds:   [],
      highlights:   [],
    },
  });

  const { handleSubmit, trigger, getValues } = methods;

  // Wrapper explícito: só submete quando clicado, nunca via Enter implicitamente.
  // Antes o botão da última etapa era type="submit", o que fazia o form
  // disparar onSubmit quando o usuário pressionava Enter em qualquer campo
  // da última etapa (input text dispara submit implícito do navegador).
  const handleExplicitSubmit = () => {
    handleSubmit(onSubmit)();
  };

  // Fields per step for validation
  const stepFields: Record<number, (keyof VehicleFormData)[]> = {
    1: ["brandName", "modelName", "title", "price", "yearMfr", "yearModel", "mileage", "color", "fuel", "transmission", "bodyType"],
    2: ["images"],
    3: ["featureIds", "highlights"],
     4: ["chassis", "plate"],
  };

  async function nextStep() {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, 4));
  }

  async function onSubmit(data: VehicleFormData) {
    setLoading(true);
    setError("");
    try {
      if (isEditing && vehicle) {
        // Envia todo o payload — o PUT do backend trata atualização
        // de highlights (scalar), images (relação) e featureIds (M:N).
        const { brandName, modelName, ...rest } = data;
        const res = await apiFetch(`/api/vehicles/${vehicle.id}`, {
          method:  "PUT",
          body:    JSON.stringify({
            ...rest,
            // marca/modelo não mudam no edit (depende das upserts do POST);
            // mantemos ignores para não confundir o schema strict().
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        router.push("/painel/estoque");
        router.refresh();
      } else {
        const slug = slugify(`${data.title}-${data.yearModel}-${Date.now()}`);
        const res = await apiFetch("/api/vehicles", {
          method:  "POST",
          body:    JSON.stringify({ ...data, slug }),
        });
        if (!res.ok) throw new Error(await res.text());
        router.push("/painel/estoque");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar. Verifique os dados e tente novamente.");
      setLoading(false);
    }
  }

  async function deleteVehicle() {
    if (!confirm("Excluir este veículo? Esta ação não pode ser desfeita.")) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/vehicles/${vehicle!.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir");
      router.push("/painel/estoque");
      router.refresh();
    } catch {
      alert("Erro ao excluir veículo. Tente novamente.");
      setDeleting(false);
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-2xl font-bold text-white">{isEditing ? "Editar Veículo" : "Cadastrar Novo Veículo"}</h1>
              <p className="text-ink-400 text-sm mt-1">{isEditing ? "Altere os dados do veículo" : "Preencha os dados em 4 etapas"}</p>
            </div>
            {isEditing && (
              <button
                onClick={deleteVehicle}
                disabled={deleting}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                title="Excluir veículo permanentemente"
              >
                <AlertTriangle size={14} />
                {deleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Excluir</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2 shrink-0">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  step > s.id
                    ? "bg-emerald-500 text-white"
                    : step === s.id
                    ? "bg-prime-gradient text-white shadow-prime"
                    : "glass text-ink-500 border border-white/10"
                )}>
                  {step > s.id ? <Check size={14} /> : s.id}
                </div>
                <span className={cn(
                  "text-xs font-medium hidden sm:block",
                  step === s.id ? "text-white" : "text-ink-500"
                )}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-px mx-3 transition-colors",
                  step > s.id ? "bg-emerald-500/40" : "bg-white/10"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/5 mb-6">
            {step === 1 && <Step1Basics brands={brands} />}
            {step === 2 && <Step2Photos />}
            {step === 3 && <Step3Features features={features} />}
            {step === 4 && <Step4Internal />}
          </div>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(s - 1, 1))}
              disabled={step === 1}
              className="glass flex items-center gap-2 px-5 py-3 rounded-xl text-sm text-ink-300 hover:text-white transition-all disabled:opacity-30"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-prime flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
              >
                Próximo
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExplicitSubmit}
                disabled={loading}
                className="btn-prime flex items-center gap-2 px-8 py-3 rounded-xl text-sm disabled:opacity-60"
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Salvando...</> : <><Check size={16} /> {isEditing ? "Atualizar Veículo" : "Salvar Veículo"}</>}
              </button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
