'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function SkipLink() {
  const [visible, setVisible] = useState(false);

  return (
    <a
      href="#main-content"
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      className={cn(
        'fixed top-2 left-2 z-[100] px-4 py-2 rounded-lg',
        'bg-primary-600 text-white font-medium text-sm shadow-lg',
        'transition-all',
        visible ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0 pointer-events-none'
      )}
    >
      Pular para o conteúdo
    </a>
  );
}