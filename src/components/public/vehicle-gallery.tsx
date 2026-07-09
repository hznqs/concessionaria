"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";

type GalleryImage = {
  id:      string;
  url:     string;
  alt:     string | null;
  order:   number;
  isCover: boolean;
};

interface VehicleGalleryProps {
  images: GalleryImage[];
  title:  string;
}

export default function VehicleGallery({ images, title }: VehicleGalleryProps) {
  const [active, setActive]       = useState(0);
  const [lightbox, setLightbox]   = useState(false);
  const [zoomed, setZoomed]       = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const goTo = useCallback((idx: number) => {
    setActive((idx + images.length) % images.length);
  }, [images.length]);

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    setLightbox(true);
  };

  const closeLightbox = () => { setLightbox(false); setZoomed(false); };

  if (!images.length) {
    return (
      <div className="aspect-[16/9] bg-ink-100 dark:bg-ink-800 rounded-2xl flex items-center justify-center">
        <span className="text-ink-500 dark:text-ink-500 text-sm">Sem fotos disponíveis</span>
      </div>
    );
  }

  const mainImage = images[active];

  return (
    <>
      {/* ── Main image ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div
          className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-ink-100 dark:bg-ink-900 group cursor-zoom-in"
          onClick={() => openLightbox(active)}
        >
          <Image
            src={mainImage.url}
            alt={mainImage.alt ?? title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
          />

          {/* Zoom hint */}
          <div className="absolute top-3 right-3 glass p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn size={16} className="text-ink-900 dark:text-white" />
          </div>

          {/* Navigation arrows (only if > 1 image) */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(active - 1); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 glass w-10 h-10 rounded-full flex items-center justify-center
                           text-ink-900 dark:text-white opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-ink-100/80 dark:hover:bg-white/10"
                aria-label="Foto anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(active + 1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 glass w-10 h-10 rounded-full flex items-center justify-center
                           text-ink-900 dark:text-white opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-ink-100/80 dark:hover:bg-white/10"
                aria-label="Próxima foto"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 glass px-3 py-1 rounded-full text-xs text-ink-900 dark:text-white font-medium">
              {active + 1}/{images.length}
            </div>
          )}
        </div>

        {/* ── Thumbnail strip ──────────────────────────────────────── */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActive(idx)}
                className={cn(
                  "relative shrink-0 w-20 h-14 rounded-xl overflow-hidden transition-all duration-200 border-2",
                  idx === active
                    ? "border-primary-500 shadow-[0_4px_20px_rgba(218,37,29,0.15)]"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image
                  src={img.url}
                  alt={img.alt ?? `Foto ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[900] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 glass w-10 h-10 rounded-full flex items-center justify-center text-ink-900 dark:text-white hover:text-primary-400 transition-colors z-10"
          >
            <X size={18} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 glass px-4 py-1.5 rounded-full text-xs text-ink-900 dark:text-white">
            {lightboxIdx + 1} / {images.length}
          </div>

          {/* Image */}
          <div
            className={cn(
              "relative max-w-5xl w-full max-h-[85vh] transition-transform duration-200",
              zoomed ? "cursor-zoom-out scale-150" : "cursor-zoom-in"
            )}
            onClick={(e) => { e.stopPropagation(); setZoomed((z) => !z); }}
          >
            <Image
              src={images[lightboxIdx].url}
              alt={images[lightboxIdx].alt ?? title}
              width={1280}
              height={720}
              className="object-contain w-full h-full rounded-xl"
              style={{ maxHeight: "85vh" }}
            />
          </div>

          {/* Lightbox nav */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i - 1 + images.length) % images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 glass w-12 h-12 rounded-full flex items-center justify-center text-ink-900 dark:text-white hover:text-primary-400 transition-colors"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 glass w-12 h-12 rounded-full flex items-center justify-center text-ink-900 dark:text-white hover:text-primary-400 transition-colors"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}