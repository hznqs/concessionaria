"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        wheelMultiplier: 1.2,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}