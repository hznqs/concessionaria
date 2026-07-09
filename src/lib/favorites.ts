"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";

interface FavoritesStore {
  favorites: string[];
  toggle: (id: string) => void;
  clear: () => void;
}

const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set) => ({
      favorites: [],
      toggle: (id) => set((state) => ({
        favorites: state.favorites.includes(id)
          ? state.favorites.filter((f) => f !== id)
          : [...state.favorites, id]
      })),
      clear: () => set({ favorites: [] }),
    }),
    {
      name: "autoprime_favorites",
    }
  )
);

// Wrapper hook to keep exactly the same return API as before and prevent SSR mismatch
export function useFavorites() {
  const store = useFavoritesStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration fallback prevents mismatch between server render (empty) and client render (localStorage data)
  const favorites = mounted ? store.favorites : [];

  return {
    favorites,
    toggle: store.toggle,
    clear: store.clear,
    isFavorite: (id: string) => favorites.includes(id),
    count: favorites.length,
  };
}
