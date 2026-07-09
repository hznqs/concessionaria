'use client';

import { forwardRef, LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const labelVariants = cn('text-sm font-semibold text-ink-900 dark:text-ink-100');

const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn(labelVariants, className)} {...props} />
  )
);
Label.displayName = 'Label';

export { Label };