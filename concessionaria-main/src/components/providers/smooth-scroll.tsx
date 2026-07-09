"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.5,
        smoothWheel: true,
        ...(reduced && { lerp: 1, duration: 0, smoothWheel: false }),
      }}
    >
      {children}
    </ReactLenis>
  );
}