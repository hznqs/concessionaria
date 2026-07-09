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
        'transition-transform duration-300',
        visible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-ink-500 dark:text-ink-400 truncate">{vehicleTitle}</p>
          <p className="text-lg font-bold text-ink-900 dark:text-ink-100">{formatCurrency(price)}</p>
        </div>

        <button
          onClick={() => toggle(vehicleId)}
          className={cn(
            'p-3 rounded-xl border transition-all',
            favorite
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500'
              : 'border-ink-300 dark:border-ink-600 text-ink-500 dark:text-ink-400'
          )}
          aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={favorite}
        >
          <Heart className={cn('h-5 w-5', favorite && 'fill-current')} />
        </button>

        <a href="#calculadora">
          <Button variant="outline" size="icon" aria-label="Simular financiamento">
            <Calculator className="h-5 w-5" />
          </Button>
        </a>

        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-[1.5]">
          <Button variant="primary" className="w-full">
            <MessageCircle className="h-5 w-5 mr-1" />
            WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
}