'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn, formatCurrency, formatMileage, FUEL_LABELS, TRANSMISSION_LABELS, BODY_TYPE_LABELS, STATUS_CONFIG } from '@/lib/utils';
import { Heart, MapPin, Calendar, Gauge, Fuel, Settings2, Star, Tag } from 'lucide-react';
import { Button } from '@/components/ui/base/button';
import { Badge } from '@/components/ui/base/badge';
import { TiltCard } from '@/components/public/ui/TiltCard';
import { format } from 'date-fns';
import { useFavorites } from '@/lib/favorites';
import type { VehicleWithRelations } from '@/lib/vehicles';
interface VehicleCardProps {
  vehicle: VehicleWithRelations;
  index: number;
  listMode?: boolean;
}

export function VehicleCard({ vehicle, index, listMode = false }: VehicleCardProps) {
  const rawCoverImage = vehicle.images?.[0]?.url;
  const coverImage = rawCoverImage && (rawCoverImage.startsWith('http') || rawCoverImage.startsWith('/')) ? rawCoverImage : null;
  const isFeatured = vehicle.featured;
  const year = `${vehicle.yearMfr}/${vehicle.yearModel}`;
  // Prioritiza primeiros 4 cards para reduzir LCP em listagens (home/catálogo).
  const priority = index < 4;
  const { favorites, toggle } = useFavorites();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  
  const isFavorite = isMounted ? favorites.includes(vehicle.id) : false;

  const statusInfo = STATUS_CONFIG[vehicle.status as keyof typeof STATUS_CONFIG] ?? { label: vehicle.status, bg: 'bg-ink-500/10', color: 'text-ink-600 dark:text-ink-400', border: 'border-ink-500/20' };

  if (listMode) {
    return (
      <div
        className="group relative flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-5 transition-all duration-300 rounded-2xl border border-transparent hover:border-white/5" style={{ background: 'rgba(17, 24, 39, 0.4)' }}
      >
        <div className="relative w-full sm:w-72 h-48 sm:h-44 flex-shrink-0 rounded-xl overflow-hidden shadow-lg" style={{ background: '#0a0f1a' }}>
          {coverImage ? (
            <Image
              src={coverImage}
              alt={vehicle.title}
              fill
              sizes="(max-width: 640px) 100vw, 288px"
              priority={priority}
            className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-ink-400">
              <svg className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {isFeatured && (
            <span className="absolute top-2 left-2 z-10">
              <Badge variant="premium" className="text-xs shadow-md"><Star className="h-2.5 w-2.5 mr-1" /> Destaque</Badge>
            </span>
          )}
          <Badge className={cn(
            'absolute top-2 right-2 shadow-md backdrop-blur-md border',
            vehicle.status === 'AVAILABLE' || statusInfo.label === 'Disponível'
              ? 'bg-emerald-600/90 text-white border-emerald-500/50'
              : vehicle.status === 'RESERVED' || statusInfo.label === 'Reservado'
              ? 'bg-amber-500/90 text-white border-amber-400/50'
              : vehicle.status === 'SOLD' || statusInfo.label === 'Vendido'
              ? 'bg-black/80 text-white border-white/20'
              : 'bg-black/60 text-white border-white/20'
          )}>
            {statusInfo.label}
          </Badge>
          <button
            className="absolute bottom-2 right-2 p-2 rounded-full bg-white/90 dark:bg-ink-900/90 backdrop-blur-sm shadow-lg text-ink-600 dark:text-ink-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all z-20"
            onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(vehicle.id); }}
            aria-label="Adicionar aos favoritos"
          >
            <Heart className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "")} />
          </button>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400 mb-2">
              <span className="font-semibold text-ink-900 dark:text-ink-100">{vehicle.brand.name}</span>
              <span>/</span>
              <span>{vehicle.model.name}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-ink-900 dark:text-ink-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              <Link href={`/veiculos/${vehicle.slug}`} className="before:absolute before:inset-0 z-0">{vehicle.title}</Link>
            </h3>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-ink-500 dark:text-ink-400">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 opacity-70" /> {year}</span>
              <span className="flex items-center gap-1.5"><Gauge className="h-4 w-4 opacity-70" /> {formatMileage(vehicle.mileage)}</span>
              <span className="flex items-center gap-1.5"><Fuel className="h-4 w-4 opacity-70" /> {FUEL_LABELS[vehicle.fuel] ?? vehicle.fuel}</span>
              <span className="flex items-center gap-1.5"><Settings2 className="h-4 w-4 opacity-70" /> {TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission}</span>
              <span className="flex items-center gap-1.5"><Tag className="h-4 w-4 opacity-70" /> {BODY_TYPE_LABELS[vehicle.bodyType] ?? vehicle.bodyType}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between pt-4 border-t border-ink-100 dark:border-ink-800/50 gap-4">
            <div className="text-left">
              <p className="text-2xl sm:text-3xl font-black text-ink-900 dark:text-ink-100 tracking-tight">{formatCurrency(vehicle.price)}</p>
              {vehicle.price && vehicle.price > 0 && (
                <p className="text-xs sm:text-sm font-medium text-ink-500 dark:text-ink-400 mt-1">
                  A partir de <strong className="text-ink-300">R$ {(Number(vehicle.price) * 0.015).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</strong>/mês
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto font-semibold">
              VER DETALHES
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), ease: [0.16, 1, 0.3, 1] }}
    >
    <TiltCard maxTilt={0} scale={1} className="h-full">
    <div
      className="group relative block h-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1" style={{ background: '#111827', border: '1px solid #1e2d42', boxShadow: '0 2px 16px rgba(0,0,0,0.4)' }}
    >
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: '#0a0f1a' }}>
        {coverImage ? (
          <Image
            src={coverImage}
            alt={vehicle.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-ink-400">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <div className="absolute top-3 left-3 right-3 flex justify-between">
          {isFeatured && (
            <Badge variant="premium" className="shadow-lg">
              <Star className="h-3 w-3 mr-1" /> Destaque
            </Badge>
          )}
          <Badge className={cn(
            'shadow-lg backdrop-blur-md border',
            vehicle.status === 'AVAILABLE' || statusInfo.label === 'Disponível'
              ? 'bg-emerald-600/90 text-white border-emerald-500/50'
              : vehicle.status === 'RESERVED' || statusInfo.label === 'Reservado'
              ? 'bg-amber-500/90 text-white border-amber-400/50'
              : vehicle.status === 'SOLD' || statusInfo.label === 'Vendido'
              ? 'bg-black/80 text-white border-white/20'
              : 'bg-black/60 text-white border-white/20'
          )}>
            {statusInfo.label}
          </Badge>
        </div>

        <button
          className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 dark:bg-ink-900/90 backdrop-blur-sm shadow-lg text-ink-600 dark:text-ink-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all z-20"
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(vehicle.id); }}
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart className={cn("h-5 w-5 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "")} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink-500 dark:text-ink-400">{vehicle.brand.name} / {vehicle.model.name}</p>
            <h3 className="font-semibold text-ink-900 dark:text-ink-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              <Link href={`/veiculos/${vehicle.slug}`} className="before:absolute before:inset-0 z-0">{vehicle.title}</Link>
            </h3>
          </div>
          {vehicle.createdAt && (
            <span className="text-xs text-ink-400 dark:text-ink-500 whitespace-nowrap">
              {format(new Date(vehicle.createdAt), 'dd/MM/yyyy')}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-ink-50 dark:bg-ink-800">
            <Calendar className="h-3 w-3" /> {year}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-ink-50 dark:bg-ink-800">
            <Gauge className="h-3 w-3" /> {formatMileage(vehicle.mileage)}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-ink-50 dark:bg-ink-800">
            <Fuel className="h-3 w-3" /> {FUEL_LABELS[vehicle.fuel] ?? vehicle.fuel}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-ink-50 dark:bg-ink-800">
            <Settings2 className="h-3 w-3" /> {TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-ink-50 dark:bg-ink-800">
            <Tag className="h-3 w-3" /> {BODY_TYPE_LABELS[vehicle.bodyType] ?? vehicle.bodyType}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-ink-100 dark:border-ink-800">
          <div>
            <p className="text-2xl font-bold text-ink-900 dark:text-ink-100">{formatCurrency(vehicle.price)}</p>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Entrada 20% + 48x de R$ {(Number(vehicle.price) * 0.8 / 48).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <Button variant="primary" size="sm" className="w-auto">
            Ver detalhes
          </Button>
        </div>
      </div>
    </div>
    </TiltCard>
    </motion.div>
  );
}