"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Search, TrendingUp, ChevronDown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/base/select";

type Brand = {
  id:   string;
  name: string;
  slug: string;
  models: { id: string; name: string; slug: string }[];
};

const PRICE_RANGES = [
  { label: "Qualquer valor",   value: "any" },
  { label: "Até R$ 40.000",   value: "40000" },
  { label: "Até R$ 60.000",   value: "60000" },
  { label: "Até R$ 80.000",   value: "80000" },
  { label: "Até R$ 100.000",  value: "100000" },
  { label: "Até R$ 150.000",  value: "150000" },
  { label: "Até R$ 200.000",  value: "200000" },
  { label: "Até R$ 300.000",  value: "300000" },
];

export default function HeroSearch({ brands = [] }: { brands?: Brand[] }) {
  const router = useRouter();
  const [brandId,  setBrandId]  = useState("");
  const [modelId,  setModelId]  = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    if (brandId)  params.set("brandIds", brandId);
    if (modelId)  params.set("modelIds", modelId);
    if (maxPrice && maxPrice !== "any") params.set("priceMax", maxPrice);
    router.push(`/veiculos?${params.toString()}`);
  }

  const handlePillClick = useCallback(
    (id: string) => {
      router.push(`/veiculos?brandIds=${id}`);
    },
    [router]
  );

  const selectedBrand = brandId ? brands.find((b) => b.id === brandId) : null;
  const filteredModels = selectedBrand?.models ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: "rgba(8,13,22,0.82)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Red glow accent top-right */}
      <div
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(218,37,29,0.12) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 p-6 sm:p-8">
        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {/* Marca */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#4a5568] mb-2 ml-1">
              Marca
            </label>
            <Select
              value={brandId}
              onValueChange={(v) => { setBrandId(v); setModelId(""); }}
            >
              <SelectTrigger className="h-12 rounded-xl border-[#1e2d42] bg-[#0f1928] text-sm text-[#f0f4f8] focus:ring-[#DA251D]/30 focus:border-[#DA251D]/50 [&>span]:text-left">
                <SelectValue placeholder="Todas as Marcas" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[#1e2d42] bg-[#0f1928] shadow-2xl">
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-sm text-[#f0f4f8] focus:bg-[#DA251D]/15 focus:text-white rounded-lg cursor-pointer">
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#4a5568] mb-2 ml-1">
              Modelo
            </label>
            <Select
              value={modelId}
              onValueChange={setModelId}
              disabled={!brandId}
            >
              <SelectTrigger
                className={cn(
                  "h-12 rounded-xl border-[#1e2d42] bg-[#0f1928] text-sm text-[#f0f4f8] focus:ring-[#DA251D]/30 focus:border-[#DA251D]/50 [&>span]:text-left",
                  !brandId && "opacity-40 cursor-not-allowed"
                )}
              >
                <SelectValue placeholder={brandId ? "Todos os Modelos" : "Selecione uma Marca"} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[#1e2d42] bg-[#0f1928] shadow-2xl">
                {filteredModels.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-sm text-[#f0f4f8] focus:bg-[#DA251D]/15 focus:text-white rounded-lg cursor-pointer">
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preço máximo */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#4a5568] mb-2 ml-1">
              Preço Máximo
            </label>
            <Select
              value={maxPrice}
              onValueChange={setMaxPrice}
            >
              <SelectTrigger className="h-12 rounded-xl border-[#1e2d42] bg-[#0f1928] text-sm text-[#f0f4f8] focus:ring-[#DA251D]/30 focus:border-[#DA251D]/50 [&>span]:text-left">
                <SelectValue placeholder="Qualquer valor" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[#1e2d42] bg-[#0f1928] shadow-2xl">
                {PRICE_RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value} className="text-sm text-[#f0f4f8] focus:bg-[#DA251D]/15 focus:text-white rounded-lg cursor-pointer">
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <button
            onClick={handleSearch}
            className="btn-prime w-full sm:flex-1 h-12 gap-2.5 text-[12px] px-6"
          >
            <Search size={16} />
            Buscar Veículos
          </button>
          <button
            onClick={() => router.push("/veiculos?sort=price_asc")}
            className="btn-ghost-dark w-full sm:flex-1 h-12 gap-2.5 text-[12px] px-6"
          >
            <TrendingUp size={16} />
            Melhores Preços
          </button>
        </div>

        {/* Quick brand pills */}
        {brands.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#4a5568] flex items-center gap-1.5">
              <Sparkles size={11} className="text-[#DA251D]" />
              Busca rápida:
            </span>
            {brands.slice(0, 6).map((b) => (
              <motion.button
                key={b.id}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePillClick(b.id)}
                className="px-3 py-1.5 rounded-lg bg-[#0f1928] border border-[#1e2d42] text-[11px] font-semibold text-[#8899a6] hover:bg-[#DA251D]/10 hover:border-[#DA251D]/30 hover:text-white transition-all duration-200"
              >
                {b.name}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}