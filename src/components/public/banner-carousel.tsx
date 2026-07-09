'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BannerData = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkText: string | null;
  order: number;
};

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="600" viewBox="0 0 1920 600">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080d16"/>
      <stop offset="50%" stop-color="#0e1623"/>
      <stop offset="100%" stop-color="#140808"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="600" fill="url(#g)"/>
  <circle cx="1480" cy="300" r="340" fill="rgba(218,37,29,0.04)"/>
  <circle cx="1480" cy="300" r="220" fill="rgba(218,37,29,0.025)"/>
  <circle cx="1480" cy="300" r="120" fill="rgba(218,37,29,0.015)"/>
</svg>`;

const DEFAULT_BANNER: BannerData = {
  id: 'default',
  title: 'AutoPrime',
  subtitle: 'Seminovos premium com garantia de procedência e o melhor custo-benefício.',
  imageUrl: `data:image/svg+xml,${encodeURIComponent(DEFAULT_SVG)}`,
  linkUrl: '/veiculos',
  linkText: 'Ver Veículos',
  order: 0,
};

export function BannerCarousel({ banners }: { banners: BannerData[] }) {
  const items = banners.length > 0 ? banners : [DEFAULT_BANNER];
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => setCurrent(c => (c + 1) % items.length), [items.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [items.length, isPaused, next]);

  return (
    <div
      className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={cn(
            'absolute inset-0 transition-all duration-700 ease-in-out',
            idx === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          )}
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 lg:p-16 max-w-7xl mx-auto">
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-5 w-fit',
              item.id === 'default'
                ? 'bg-white/10 border border-white/20 text-white/80'
                : 'bg-primary-500/10 border border-primary-500/20 text-primary-400'
            )}>
              <Sparkles className="h-3 w-3" />
              {item.id === 'default' ? 'AutoPrime' : 'Destaque'}
            </div>
            <div className={cn('transition-all duration-500 delay-100', idx === current ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0')}>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-3 font-display tracking-tight">
                {item.title}
              </h2>
              {item.subtitle && (
                <p className="text-base sm:text-lg text-white/80 max-w-xl mb-6">{item.subtitle}</p>
              )}
              {item.linkUrl && (
                <Link
                  href={item.linkUrl}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors"
                >
                  {item.linkText || 'Saiba mais'}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
            aria-label="Próximo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  idx === current ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                )}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
