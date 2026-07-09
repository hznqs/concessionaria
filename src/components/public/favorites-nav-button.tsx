"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useFavorites } from "@/lib/favorites";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function FavoritesNavButton() {
  const { count } = useFavorites();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  const safeCount = isMounted ? count : 0;

  return (
    <Link
      href="/favoritos"
      aria-label={`Favoritos (${safeCount})`}
      className="relative flex items-center justify-center w-11 h-11 hover:text-primary-400 transition-colors text-ink-300"
    >
      <Heart size={17} />
      <AnimatePresence>
        {safeCount > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-500 text-ink-950 text-[9px] font-black flex items-center justify-center leading-none"
          >
            {safeCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
