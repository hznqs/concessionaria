"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowRight, Trash2 } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { formatCurrency, formatMileage, FUEL_LABELS } from "@/lib/utils";
import FavoriteButton from "@/components/public/favorite-button";
import { motion, AnimatePresence } from "framer-motion";

interface VehicleSummary {
  id: string;
  title: string;
  slug: string;
  price: number;
  yearMfr: number;
  yearModel: number;
  mileage: number;
  fuel: string;
  brand: { name: string };
  images: { url: string; alt: string | null; isCover: boolean }[];
}

export default function FavoritosPage() {
  const { favorites, clear, count, toggle } = useFavorites();
  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length === 0) {
      setVehicles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/vehicles/favorites?ids=${favorites.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        const fetchedVehicles = data.vehicles ?? [];
        setVehicles(fetchedVehicles);
        
        // Auto-limpeza: se algum ID que pedimos não voltou (carro foi vendido/deletado),
        // removemos ele do localStorage do usuário para corrigir o número no badge do menu.
        if (fetchedVehicles.length < favorites.length) {
          const returnedIds = fetchedVehicles.map((v: VehicleSummary) => v.id);
          favorites.forEach(favId => {
            if (!returnedIds.includes(favId)) {
              // chama toggle internamente pra remover do zustand
              toggle(favId); 
            }
          });
        }
      })
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [favorites, toggle]);

  return (
    <div className="min-h-screen bg-ink-950 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-primary-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 flex items-center gap-4">
              <span className="w-12 h-px bg-primary-500" />
              Minha Lista
            </p>
            <h1 className="font-display text-4xl sm:text-6xl text-white">
              Favoritos{" "}
              {count > 0 && (
                <span className="text-primary-400 italic font-light">({count})</span>
              )}
            </h1>
          </div>
          {count > 0 && (
            <button
              onClick={clear}
              className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-500 hover:text-white transition-colors pb-2 border-b border-ink-700 hover:border-white"
            >
              <Trash2 size={13} />
              Limpar lista
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/3] skeleton" />
                <div className="h-4 w-2/3 skeleton" />
                <div className="h-4 w-1/2 skeleton" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && count === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center mb-8">
              <Heart size={32} className="text-ink-700" />
            </div>
            <h2 className="font-display text-2xl text-white mb-4">
              Sua lista está vazia
            </h2>
            <p className="text-ink-400 text-sm font-light mb-10 max-w-xs">
              Explore o catálogo e adicione veículos que despertem seu interesse.
            </p>
            <Link href="/veiculos" className="btn-prime px-8 py-4 inline-flex items-center gap-2">
              Ver Catálogo <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Grid */}
        {!loading && vehicles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            <AnimatePresence>
              {vehicles.map((vehicle, i) => {
                const cover = vehicle.images.find((im) => im.isCover) ?? vehicle.images[0];
                return (
                  <motion.div
                    key={vehicle.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <Link
                      href={`/veiculos/${vehicle.slug}`}
                      className="group flex flex-col relative transition-all duration-500 hover:-translate-y-1"
                    >
                      <div className="relative aspect-[4/3] bg-ink-900 overflow-hidden mb-4 border border-white/5 group-hover:border-primary-500/50 transition-colors duration-500">
                        {cover ? (
                          <Image
                            src={cover.url}
                            alt={cover.alt ?? vehicle.title}
                            fill
                            className="object-cover grayscale-0 group-hover:scale-105 transition-all duration-700"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-ink-600 text-xs tracking-widest uppercase">
                            Sem Imagem
                          </div>
                        )}
                        <div className="absolute top-4 right-4">
                          <FavoriteButton vehicleId={vehicle.id} />
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 px-1">
                        <p className="text-primary-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5">
                          {vehicle.brand.name}
                        </p>
                        <h3 className="font-display text-white text-xl leading-tight group-hover:text-primary-400 transition-colors mb-4">
                          {vehicle.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[11px] text-ink-400 tracking-wider font-light mb-6">
                          <span>{vehicle.yearMfr}/{vehicle.yearModel}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span>{formatMileage(vehicle.mileage)}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span>{FUEL_LABELS[vehicle.fuel as keyof typeof FUEL_LABELS] ?? vehicle.fuel}</span>
                        </div>
                        <div className="mt-auto flex items-end justify-between">
                          <p className="font-display text-2xl text-white">{formatCurrency(vehicle.price)}</p>
                          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary-500 group-hover:bg-primary-500 transition-all duration-300">
                            <ArrowRight size={12} className="text-white" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
