'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const separatorVariants = cn('shrink-0 bg-ink-200 dark:bg-ink-700');

interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(separatorVariants, className, orientation === 'horizontal' ? 'h-[1px] w-full' : 'w-[1px] h-full')}
      {...props}
    />
  )
);
Separator.displayName = 'Separator';

export { Separator };