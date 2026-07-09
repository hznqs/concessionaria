'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ShimmerButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function ShimmerButton({ children, href, onClick, className }: ShimmerButtonProps) {
  const baseClass = cn(
    'group relative inline-flex items-center justify-center overflow-hidden',
    'rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg',
    'transition-all hover:shadow-xl hover:-translate-y-0.5',
    className
  );

  const inner = (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <span
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        aria-hidden="true"
      />
    </>
  );

  if (href) {
    return (
      <a href={href} className={baseClass} onClick={onClick}>
        {inner}
      </a>
    );
  }

  return (
    <button className={baseClass} onClick={onClick}>
      {inner}
    </button>
  );
}