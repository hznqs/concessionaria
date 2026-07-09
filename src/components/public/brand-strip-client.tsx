"use client";

import { useEffect, useRef, useState } from "react";

export function BrandStripClient({ brands }: { brands: { name: string }[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || brands.length === 0) return;

    const singleSetWidth = track.scrollWidth / 2;
    if (!singleSetWidth) return;

    let raf: number;
    let pos = 0;
    const speed = 0.5;

    function tick() {
      pos -= speed;
      if (Math.abs(pos) >= singleSetWidth) {
        pos += singleSetWidth;
      }
      if (track) track.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [brands.length]);

  // Duplicate enough to fill viewport (4x is safe for any screen width)
  const repeats = Math.max(4, Math.ceil(4000 / (brands.length * 200)));
  const items = Array(repeats).fill(brands).flat();

  return (
    <section className="bg-ink-950 border-t border-white/5 py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-8">
        <p className="text-ink-600 text-[10px] font-bold uppercase tracking-[0.35em] text-center">
          Marcas que trabalhamos
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-ink-950 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-ink-950 to-transparent pointer-events-none" />

        <div ref={trackRef} className="flex gap-16 items-center will-change-transform">
          {items.map((brand, idx) => (
            <div
              key={`${brand.name}-${idx}`}
              className="shrink-0 group flex items-center justify-center px-8"
            >
              <span
                className="font-display text-xl font-bold tracking-wider text-ink-700 group-hover:text-primary-400 transition-all duration-500 whitespace-nowrap select-none"
                style={{ letterSpacing: "0.08em" }}
              >
                {brand.name.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
