"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, Mail, ChevronDown } from "lucide-react";

// Captura UTM da URL (utm_source, utm_medium, utm_campaign) — persiste
// em sessionStorage para sobreviver a navegação entre páginas.
function captureUTM(): { utmSource?: string; utmMedium?: string; utmCampaign?: string } {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source") ?? undefined;
    const utmMedium = params.get("utm_medium") ?? undefined;
    const utmCampaign = params.get("utm_campaign") ?? undefined;

    const stored: Record<string, string> = {};
    const existing = sessionStorage.getItem("autoprime_utm");
    if (existing) Object.assign(stored, JSON.parse(existing));

    const merged = {
      utmSource: utmSource ?? stored.utm_source,
      utmMedium: utmMedium ?? stored.utm_medium,
      utmCampaign: utmCampaign ?? stored.utm_campaign,
    };

    if (utmSource || utmMedium || utmCampaign) {
      sessionStorage.setItem(
        "autoprime_utm",
        JSON.stringify({
          utm_source: merged.utmSource,
          utm_medium: merged.utmMedium,
          utm_campaign: merged.utmCampaign,
        })
      );
    }
    return merged;
  } catch {
    return {};
  }
}

const schema = z.object({
  name:     z.string().min(3, "Nome muito curto"),
  whatsapp: z.string().min(10, "WhatsApp inválido"),
  email:    z.string().email("E-mail inválido").optional().or(z.literal("")),
  message:  z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface LeadFormProps {
  vehicleId:    string;
  vehicleTitle: string;
}

type State = "idle" | "loading" | "success" | "error";

export default function LeadForm({ vehicleId, vehicleTitle }: LeadFormProps) {
  const [state, setState] = useState<State>("idle");
  const [open,  setOpen]  = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

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

  async function onSubmit(data: FormData) {
    setState("loading");
    try {
      const utm = captureUTM();
      const res = await fetch("/api/leads", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "x-requested-by": "autoprime" },
        body:    JSON.stringify({ ...data, vehicleId, ...utm }),
      });
      if (!res.ok) throw new Error();
      setState("success");
      reset();
      setTimeout(() => {
        setState("idle");
        setOpen(false);
      }, 5000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 4000);
    }
  }

  return (
    <div className="w-full relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-ink-800 rounded-2xl border border-white/10 shadow-sm flex items-center justify-between px-5 py-4 text-left hover:border-primary-500/50 hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary-500/15 p-2 rounded-lg">
            <Mail className="text-primary-400" size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-ink-100">Tenho Interesse</p>
            <p className="text-xs text-ink-400 font-medium">Deixe seu contato e entraremos em breve</p>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={cn("text-ink-500 transition-transform duration-300", open && "rotate-180")}
        />
      </button>

      {/* Dropdown Content */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-full z-50 bg-ink-800 border border-white/10 rounded-2xl shadow-xl animate-fade-down max-h-[80vh] overflow-y-auto">
          <div className="p-5">
            {state === "success" ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="text-emerald-500" size={48} />
                <p className="font-bold text-ink-100 text-lg">Recebemos seu interesse!</p>
                <p className="text-sm font-medium text-ink-400">
                  Nossa equipe entrará em contato em breve sobre o{" "}
                  <span className="font-bold text-primary-400">{vehicleTitle}</span>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs text-ink-400 font-bold uppercase tracking-wider block mb-1.5">
                    Nome Completo
                  </label>
                  <input
                    {...register("name")}
                    placeholder="Seu nome completo"
                    className={cn(
                      "w-full bg-ink-800 border rounded-xl px-4 py-3 text-ink-100 font-medium text-sm placeholder-ink-400",
                      "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all",
                      errors.name ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-white/10"
                    )}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs font-medium mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="text-xs text-ink-400 font-bold uppercase tracking-wider block mb-1.5">
                    WhatsApp
                  </label>
                  <input
                    {...register("whatsapp")}
                    placeholder="WhatsApp (com DDD)"
                    type="tel"
                    className={cn(
                      "w-full bg-ink-800 border rounded-xl px-4 py-3 text-ink-100 font-medium text-sm placeholder-ink-400",
                      "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all",
                      errors.whatsapp ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-white/10"
                    )}
                  />
                  {errors.whatsapp && (
                    <p className="text-red-500 text-xs font-medium mt-1">{errors.whatsapp.message}</p>
                  )}
                </div>

                {/* Email (optional) */}
                <div>
                  <label className="text-xs text-ink-400 font-bold uppercase tracking-wider block mb-1.5">
                    E-mail (opcional)
                  </label>
                  <input
                    {...register("email")}
                    placeholder="E-mail (opcional)"
                    type="email"
                    className="w-full bg-ink-800 border border-white/10 rounded-xl px-4 py-3 text-ink-100 font-medium text-sm
                               placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs text-ink-400 font-bold uppercase tracking-wider block mb-1.5">
                    Mensagem ou Proposta (opcional)
                  </label>
                  <textarea
                    {...register("message")}
                    placeholder="Mensagem ou proposta (opcional)"
                    rows={3}
                    className="w-full bg-ink-800 border border-white/10 rounded-xl px-4 py-3 text-ink-100 font-medium text-sm
                               placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                  />
                </div>

                {state === "error" && (
                  <p className="text-red-500 text-xs font-bold text-center">
                    Erro ao enviar. Tente novamente.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors shadow-prime"
                >
                  {state === "loading" ? (
                    <><Loader2 size={16} className="animate-spin" /> Enviando...</>
                  ) : (
                    "Enviar Interesse"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
