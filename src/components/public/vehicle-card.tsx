"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatMileage, FUEL_LABELS, STATUS_CONFIG } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { VehicleCard } from "@/types";
import FavoriteButton from "@/components/public/favorite-button";
import { Calendar, Gauge, Zap, Star } from "lucide-react";

interface VehicleCardProps {
  vehicle: VehicleCard;
}

export default function VehicleCardComponent({ vehicle }: VehicleCardProps) {
  const cover   = vehicle.images.find((i) => i.isCover) ?? vehicle.images[0];
  const status  = STATUS_CONFIG[vehicle.status];
  const isSold  = vehicle.status === "SOLD";
  const installmentPrice = (vehicle.price * 1.35) / 60;

  return (
    <div
      className={cn(
        "group flex flex-col relative overflow-hidden rounded-2xl",
        "transition-all duration-300",
        "bg-[#111827] border border-[#1e2d42]",
        "hover:border-[rgba(218,37,29,0.35)] hover:-translate-y-1",
        "hover:shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(218,37,29,0.12)]",
        isSold && "opacity-70"
      )}
    >
      {/* Image */}
      <Link
        href={`/veiculos/${vehicle.slug}`}
        className="block relative aspect-[4/3] overflow-hidden bg-[#0a0f1a]"
      >
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? vehicle.title}
            fill
            className={cn(
              "object-cover",
              isSold && "grayscale opacity-50"
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#4a5568] text-xs font-bold uppercase tracking-widest">
              Sem Imagem
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a]/60 via-transparent to-transparent pointer-events-none" />

        {/* Status + Featured badges */}
        {!isSold && (
          <div className="absolute top-3 left-3 flex gap-2">
            {vehicle.featured && (
              <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-[#DA251D] text-white rounded-md shadow-lg">
                <Star size={9} className="fill-white" />
                Destaque
              </span>
            )}
            <span className={cn(
              "px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-md shadow-sm border backdrop-blur-md",
              vehicle.status === 'AVAILABLE' || status.label === 'Disponível'
                ? 'bg-emerald-600/90 text-white border-emerald-500/50'
                : vehicle.status === 'RESERVED' || status.label === 'Reservado'
                ? 'bg-amber-500/90 text-white border-amber-400/50'
                : vehicle.status === 'SOLD' || status.label === 'Vendido'
                ? 'bg-black/80 text-white border-white/20'
                : 'bg-black/60 text-white border-white/20'
            )}>
              {status.label}
            </span>
          </div>
        )}

        {/* Favorite */}
        <div className="absolute top-3 right-3 bg-[#111827]/80 backdrop-blur-sm rounded-full p-1 border border-white/10">
          <FavoriteButton vehicleId={vehicle.id} />
        </div>

        {/* Sold overlay */}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <span className="font-display text-white font-black text-xl tracking-[0.3em] uppercase border-y-2 border-white/40 py-2 px-4">
              Vendido
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Brand + Title */}
        <Link href={`/veiculos/${vehicle.slug}`} className="mb-4 block">
          <p className="text-[#DA251D] text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
            {vehicle.brand.name}
          </p>
          <h3 className="font-display text-white font-bold text-[1.05rem] leading-snug group-hover:text-[#e47a88] transition-colors line-clamp-2">
            {vehicle.title}
          </h3>
        </Link>

        {/* Specs strip */}
        <div className="flex items-center gap-0 text-[11px] text-[#8899a6] font-medium mb-5 rounded-xl overflow-hidden border border-[#1e2d42] divide-x divide-[#1e2d42]">
          <span className="flex items-center gap-1.5 flex-1 justify-center px-2 py-2 bg-[#0f1928]">
            <Calendar size={11} className="text-[#DA251D] shrink-0" />
            {vehicle.yearMfr}/{vehicle.yearModel}
          </span>
          <span className="flex items-center gap-1.5 flex-1 justify-center px-2 py-2 bg-[#0f1928]">
            <Gauge size={11} className="text-[#DA251D] shrink-0" />
            {formatMileage(vehicle.mileage)}
          </span>
          <span className="flex items-center gap-1.5 flex-1 justify-center px-2 py-2 bg-[#0f1928]">
            <Zap size={11} className="text-[#DA251D] shrink-0" />
            {FUEL_LABELS[vehicle.fuel] ?? vehicle.fuel}
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-4 border-t border-[#1e2d42]">
          <div className="flex items-end justify-between mb-2">
            <p className="text-[10px] font-bold text-[#4a5568] uppercase tracking-wider">À vista</p>
            <p className="font-display font-black text-2xl text-white leading-none">
              {formatCurrency(vehicle.price)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#DA251D] text-[10px] font-bold bg-[#DA251D]/10 border border-[#DA251D]/20 px-2.5 py-1 rounded-lg uppercase tracking-wide">
              Entrada Facilitada
            </span>
            <p className="text-[#8899a6] text-[11px] font-medium">
              60× de{" "}
              <span className="font-bold text-[#e47a88]">
                {formatCurrency(installmentPrice)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA bar — visible on hover */}
      <Link
        href={`/veiculos/${vehicle.slug}`}
        className="block w-full text-center text-[11px] font-bold uppercase tracking-widest text-white py-3 bg-gradient-to-r from-[#f03738] to-[#c71b14] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mt-px"
      >
        Ver Detalhes →
      </Link>
    </div>
  );
}
