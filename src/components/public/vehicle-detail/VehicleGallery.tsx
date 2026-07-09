'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Expand, X, Download } from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  isCover: boolean;
  order: number;
}

interface VehicleGalleryProps {
  images: GalleryImage[];
  title: string;
}

export function VehicleGallery({ images, title }: VehicleGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(false);

  const n = images.length;

  const go = useCallback((index: number) => {
    setSelectedIndex(((index % n) + n) % n);
  }, [n]);

  const next = useCallback(() => go(selectedIndex + 1), [go, selectedIndex]);
  const prev = useCallback(() => go(selectedIndex - 1), [go, selectedIndex]);

  // Resetar índice caso images mude (ex: navegação entre veículos sem desmontar)
  useEffect(() => {
    if (selectedIndex >= n && n > 0) setSelectedIndex(0);
  }, [n, selectedIndex]);

  // Lightbox: bloquear scroll e teclado
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setZoom(false);
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, prev, next]);

  if (!n) {
    return (
      <div className="aspect-[4/3] bg-ink-100 dark:bg-ink-800 rounded-2xl flex items-center justify-center">
        <p className="text-ink-400">Sem imagens disponíveis</p>
      </div>
    );
  }

  const current = images[selectedIndex];

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div className="overflow-hidden rounded-2xl relative group">
          <div
            className="relative aspect-[4/3] bg-ink-100 dark:bg-ink-800"
            onClick={() => setLightboxOpen(true)}
            role="button"
            tabIndex={0}
            aria-label="Abrir galeria em tela cheia"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setLightboxOpen(true); }}
          >
            <Image
              src={current.url}
              alt={current.alt ?? `${title} - foto ${selectedIndex + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
              priority
              quality={85}
            />
          </div>

          {/* Navigation arrows */}
          {n > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 z-10',
                  'p-2.5 rounded-full bg-white/80 dark:bg-ink-900/80 backdrop-blur-sm shadow-lg',
                  'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity',
                  'hover:bg-white dark:hover:bg-ink-900'
                )}
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-6 w-6 text-ink-800 dark:text-ink-100" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 z-10',
                  'p-2.5 rounded-full bg-white/80 dark:bg-ink-900/80 backdrop-blur-sm shadow-lg',
                  'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity',
                  'hover:bg-white dark:hover:bg-ink-900'
                )}
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-6 w-6 text-ink-800 dark:text-ink-100" />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
              {selectedIndex + 1} / {n}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
            className={cn(
              'absolute bottom-3 right-3 z-10',
              'p-2.5 rounded-full bg-black/60 text-white backdrop-blur-sm shadow-lg',
              'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/80'
            )}
            aria-label="Ver em tela cheia"
          >
            <Expand className="h-5 w-5" />
          </button>
        </div>

        {/* Thumbnails */}
        {n > 1 && (
          <div className="overflow-x-auto -mx-1 px-1">
            <div className="flex gap-2 pb-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    'relative shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all',
                    selectedIndex === index
                      ? 'border-primary-600 ring-2 ring-primary-500/30 opacity-100 scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                  aria-label={`Ver foto ${index + 1}`}
                  aria-current={selectedIndex === index}
                >
                  <Image
                    src={image.url}
                    alt={image.alt ?? `${title} ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Galeria em tela cheia"
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-20"
            aria-label="Fechar"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative w-full h-full flex items-center justify-center p-4 lg:p-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                'relative transition-transform duration-300 ease-out',
                zoom ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
              )}
              onClick={() => setZoom((z) => !z)}
            >
              <Image
                src={images[selectedIndex].url}
                alt={images[selectedIndex].alt ?? title}
                fill
                sizes="100vw"
                className="object-contain"
                quality={100}
              />
            </div>
          </div>

          {n > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-20"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-20"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setSelectedIndex(idx); }}
                className={cn(
                  'h-2 rounded-full transition-all',
                  idx === selectedIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                )}
                aria-label={`Ir para foto ${idx + 1}`}
                aria-current={idx === selectedIndex}
              />
            ))}
          </div>

          <a
            href={images[selectedIndex].url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-20"
            aria-label="Baixar imagem"
          >
            <Download className="h-5 w-5" />
          </a>
        </div>
      )}
    </>
  );
}