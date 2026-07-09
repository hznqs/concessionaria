import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'xl', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  )
);
Container.displayName = 'Container';

interface SectionProps {
  variant?: 'default' | 'muted' | 'dark' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: React.ReactNode;
}

const sizePadding = {
  sm: 'py-12 sm:py-16',
  md: 'py-16 sm:py-20 lg:py-24',
  lg: 'py-20 sm:py-24 lg:py-32',
  xl: 'py-24 sm:py-32 lg:py-40',
};

const variantClasses = {
  default: 'bg-white dark:bg-ink-950',
  muted: 'bg-ink-50 dark:bg-ink-900',
  dark: 'bg-ink-900 dark:bg-ink-950 text-white',
  gradient: 'bg-gradient-to-b from-ink-50 to-white dark:from-ink-900 dark:to-ink-950',
};

export function Section({
  className,
  variant = 'default',
  size = 'lg',
  children,
}: SectionProps) {
  return (
    <section
      className={cn(variantClasses[variant], sizePadding[size], className)}
    >
      {children}
    </section>
  );
}

export const SectionHeader = ({ 
  children, 
  className, 
  title, 
  subtitle, 
  action,
  align = 'center'
}: { 
  children?: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}) => {
  const alignClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };

  return (
    <div className={cn('flex flex-col gap-4 max-w-3xl mx-auto', alignClasses[align], className)}>
      {children || (
        <>
          {title && (
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 dark:text-white tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-ink-600 dark:text-ink-400 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};