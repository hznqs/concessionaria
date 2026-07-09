'use client';

import { useState, useEffect } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { useFavorites } from '@/lib/favorites';
import { Heart, MessageCircle, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/base/button';

interface StickyCTABarProps {
  vehicleId: string;
  vehicleTitle: string;
  price: number;
  whatsappUrl: string;
}

export function StickyCTABar({ vehicleId, vehicleTitle, price, whatsappUrl }: StickyCTABarProps) {
  const [visible, setVisible] = useState(false);
  const { toggle, isFavorite } = useFavorites();
  const [isMounted, setIsMounted] = useState(false);
  const favorite = isMounted ? isFavorite(vehicleId) : false;

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 lg:hidden',
        'bg-white dark:bg-ink-950 border-t border-ink-200 dark:border-ink-700',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.08)]',
        'transition-transform duration-300 will-change-transform',
        visible ? 'translate-y-0' : 'translate-y-full'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] sm:text-xs text-ink-500 dark:text-ink-400 truncate">{vehicleTitle}</p>
          <p className="text-base sm:text-lg font-bold text-ink-900 dark:text-ink-100">{formatCurrency(price)}</p>
        </div>

        <button
          onClick={() => toggle(vehicleId)}
          className={cn(
            'p-2 sm:p-3 rounded-xl border transition-all shrink-0',
            favorite
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500'
              : 'border-ink-300 dark:border-ink-600 text-ink-500 dark:text-ink-400'
          )}
          aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={favorite}
        >
          <Heart className={cn('h-5 w-5', favorite && 'fill-current')} />
        </button>

        <a href="#calculadora" className="shrink-0">
          <Button variant="outline" size="icon" className="h-[42px] w-[42px] sm:h-12 sm:w-12" aria-label="Simular financiamento">
            <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </a>

        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-[1.2] shrink-0 min-w-0">
          <Button variant="primary" className="w-full h-[42px] sm:h-12 px-2 sm:px-4">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 shrink-0" />
            <span className="truncate text-xs sm:text-sm font-semibold">WhatsApp</span>
          </Button>
        </a>
      </div>
    </div>
  );
}