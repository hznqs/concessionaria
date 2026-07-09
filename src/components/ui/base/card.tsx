'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const cardVariants = cn(
  'rounded-2xl border border-ink-200 bg-white shadow-card transition-all duration-300',
  'dark:border-ink-700 dark:bg-ink-900 dark:shadow-card-lg'
);

const cardHeaderVariants = cn('flex flex-col space-y-1.5 p-6');
const cardTitleVariants = cn('font-display text-2xl font-bold text-ink-900 dark:text-white');
const cardDescriptionVariants = cn('text-sm text-ink-600 dark:text-ink-400');
const cardContentVariants = cn('p-6 pt-0');
const cardFooterVariants = cn('flex items-center p-6 pt-0');

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const variantClasses = {
      default: cardVariants,
      elevated: cn(cardVariants, 'shadow-card-lg hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]'),
      outlined: cn(cardVariants, 'border-2 border-ink-200 dark:border-ink-700'),
      interactive: cn(
        cardVariants,
        'cursor-pointer hover:-translate-y-1 hover:shadow-card-lg',
        'active:scale-[0.99] active:shadow-card'
      ),
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], paddingClasses[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(cardHeaderVariants, className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn(cardTitleVariants, className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn(cardDescriptionVariants, className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(cardContentVariants, className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(cardFooterVariants, className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };