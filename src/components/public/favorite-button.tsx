"use client";

import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  vehicleId: string;
  className?: string;
  size?: "sm" | "md";
}

export default function FavoriteButton({
  vehicleId,
  className,
  size = "md",
}: FavoriteButtonProps) {
  const { toggle, isFavorite } = useFavorites();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  const active = isMounted ? isFavorite(vehicleId) : false;

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // prevent link navigation when inside a card
        e.stopPropagation();
        toggle(vehicleId);
      }}
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={cn(
        "group relative flex items-center justify-center rounded-full transition-all duration-300",
        size === "md" && "w-11 h-11 bg-ink-900 border border-white/10 hover:border-primary-500",
        size === "sm" && "w-11 h-11 sm:w-8 sm:h-8 bg-ink-900 border border-white/10 hover:border-primary-500",
        active && "border-primary-500 bg-primary-500/10",
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={active ? "active" : "inactive"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Heart
            size={size === "md" ? 15 : 12}
            className={cn(
              "transition-colors",
              active ? "text-primary-400 fill-primary-400" : "text-ink-400 group-hover:text-white"
            )}
          />
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
