'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wider transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200',
        primary: 'bg-primary-500/10 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300 border border-primary-500/20',
        success: 'bg-success-500/10 text-success-700 dark:bg-success-500/20 dark:text-success-300 border border-success-500/20',
        warning: 'bg-warning-500/10 text-warning-700 dark:bg-warning-500/20 dark:text-warning-300 border border-warning-500/20',
        danger: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300 border border-red-500/20',
        info: 'bg-info-500/10 text-info-700 dark:bg-info-500/20 dark:text-info-300 border border-info-500/20',
        outline: 'border-2 border-ink-200 text-ink-700 dark:border-ink-700 dark:text-ink-200',
        premium: 'bg-prime-gradient text-white shadow-prime',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
      dot: {
        true: 'relative pl-6 before:content-[""] before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dotColor?: string;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, dotColor, children, ...props }, ref) => {
    const dotStyle = dot && dotColor ? { backgroundColor: dotColor } : undefined;

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, dot }), className)}
        style={dotStyle as React.CSSProperties}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };