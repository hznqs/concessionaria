'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'avatar';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'text',
  animation = 'pulse',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: { height: '1rem', width: width || '100%', borderRadius: '0.375rem' },
    circular: { borderRadius: '50%', width: '100%', paddingTop: '100%' },
    rectangular: { borderRadius: 'var(--radius)', width: '100%', height: height || '100%', minHeight: '1.5rem' },
    card: { borderRadius: '0.5rem', width: '100%', height: height || '200px' },
    avatar: { borderRadius: '50%', width: width || '3rem', height: height || '3rem', flexShrink: 0 },
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-[shimmer_2s_infinite]',
    none: '',
  };

  return (
    <div
      className={cn('overflow-hidden bg-ink-100 dark:bg-ink-800', animationClasses[animation], className)}
      style={{ ...variantStyles[variant], ...style } as React.CSSProperties}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className, ...props }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className, ...props }: { className?: string }) {
  return (
    <div className={cn('space-y-4 p-6 rounded-2xl border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900', className)} {...props}>
      <div className="flex items-center gap-4">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
      <Skeleton variant="card" height="200px" />
      <div className="flex items-center gap-4">
        <Skeleton variant="text" width="80px" />
        <Skeleton variant="text" width="100px" />
        <Skeleton variant="text" width="80px" />
      </div>
    </div>
  );
}

export function SkeletonVehicleCard({ className, ...props }: { className?: string }) {
  return (
    <div className={cn('group flex flex-col bg-white rounded-2xl shadow-card border border-ink-100 overflow-hidden dark:border-ink-700 dark:bg-ink-900', className)} {...props}>
      <Skeleton variant="card" height="240px" style={{ borderRadius: 0 }} />
      <div className="flex flex-col flex-1 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton variant="text" width="80px" />
          <Skeleton variant="text" width="60px" />
        </div>
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="50%" />
        <div className="flex items-center gap-3">
          <Skeleton variant="text" width="50px" />
          <Skeleton variant="text" width="50px" />
          <Skeleton variant="text" width="50px" />
        </div>
        <div className="border-t border-ink-100 pt-4 space-y-2 dark:border-ink-700">
          <div className="flex justify-between">
            <Skeleton variant="text" width="60px" />
            <Skeleton variant="text" width="100px" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, className, ...props }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width="80%" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width="90%" />
          ))}
        </div>
      ))}
    </div>
  );
}