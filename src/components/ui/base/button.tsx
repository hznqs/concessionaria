'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-bold tracking-wide uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: [
          'bg-primary-500 text-white shadow-prime',
          'hover:bg-primary-600 hover:shadow-prime-lg',
          'active:bg-primary-700',
        ],
        secondary: [
          'bg-ink-100 text-ink-900 shadow-sm',
          'hover:bg-ink-200 hover:shadow-md',
          'dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-ink-700',
        ],
        outline: [
          'border-2 border-primary-500 text-primary-500 bg-transparent',
          'hover:bg-primary-50 hover:text-primary-600',
          'dark:hover:bg-primary-500/10 dark:hover:text-primary-400',
        ],
        ghost: [
          'text-ink-600 bg-transparent',
          'hover:bg-ink-100 hover:text-ink-900',
          'dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white',
        ],
        danger: [
          'bg-red-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.15)]',
          'hover:bg-red-600 hover:shadow-[0_8px_32px_rgba(239,68,68,0.25)]',
          'active:bg-red-700',
        ],
        premium: [
          'bg-prime-gradient text-white shadow-prime',
          'hover:shadow-prime-lg',
          'before:content-[""] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-500 hover:before:translate-x-[100%]',
          'relative overflow-hidden',
        ],
      },
      size: {
        xs: 'px-3 py-1.5 text-[10px] gap-1',
        sm: 'px-4 py-2 text-xs gap-1.5',
        md: 'px-5 py-2.5 text-xs gap-2',
        lg: 'px-7 py-3.5 text-sm gap-2',
        xl: 'px-10 py-4 text-base gap-2.5',
        icon: 'size-10',
        'icon-sm': 'size-8',
        'icon-lg': 'size-12',
      },
      fullWidth: {
        true: 'w-full',
      },
      loading: {
        true: 'relative text-transparent',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, asChild, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, loading }), className)}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="absolute animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">Carregando...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };