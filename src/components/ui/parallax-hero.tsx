"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ParallaxHeroProps {
  className?: string;
  videoUrl?: string;
  imageUrl?: string;
  overlayOpacity?: number;
  fullScreen?: boolean;
}

export function ParallaxHero({
  className,
  videoUrl,
  imageUrl = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2000",
  overlayOpacity = 0.4,
  fullScreen = false,
}: ParallaxHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll(
    fullScreen
      ? { offset: ["start start", "end start"] }
      : { target: containerRef, offset: ["start start", "end start"] }
  );

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.7, 0.3]);

  return (
    <div
      ref={fullScreen ? undefined : containerRef}
      className={cn(
        fullScreen
          ? "fixed inset-0 w-full h-screen"
          : "relative min-h-screen",
        "overflow-hidden bg-ink-50 dark:bg-ink-950",
        className
      )}
    >
      <motion.div
        style={{ y, scale, width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
        className="will-change-transform"
      >
        <Image
          src={imageUrl}
          alt="AutoPrime - Veículos Premium"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>

      {videoUrl && (
        <div className="absolute inset-0 z-10">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-60"
            poster={imageUrl}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>
      )}

      <div className="absolute inset-0 z-20 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, rgb(15 23 42 / ${overlayOpacity}), transparent 60%)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, transparent 0%, rgb(15 23 42 / ${overlayOpacity * 0.5}) 100%)`,
          }}
        />
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 text-white/70"
        style={{ opacity }}
        aria-hidden="true"
      >
        <span className="text-xs font-medium uppercase tracking-widest">Role para explorar</span>
        <motion.div
          className="w-1.5 h-8 rounded-full border border-white/30 flex justify-center pt-2"
          animate={{ scaleY: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
        </motion.div>
      </motion.div>
    </div>
  );
}
