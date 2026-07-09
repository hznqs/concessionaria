'use client';

import React, { forwardRef, HTMLAttributes, useEffect, useState, ReactNode } from 'react';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-24 w-24 text-xl',
};

const shapeClasses = {
  circle: 'rounded-full',
  square: 'rounded-xl',
};

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', shape = 'circle', ...props }, ref) => {
    const [showFallback, setShowFallback] = useState(false);
    const [isLoading, setIsLoading] = useState(!!src);

    useEffect(() => {
      if (src) {
        setIsLoading(true);
        setShowFallback(false);
      }
    }, [src]);

    const handleError = () => {
      setShowFallback(true);
      setIsLoading(false);
    };

    const handleLoad = () => {
      setIsLoading(false);
      setShowFallback(false);
    };

    const initials = fallback ? getInitials(fallback) : '?';

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center justify-center overflow-hidden bg-ink-100 dark:bg-ink-800', sizeClasses[size], shapeClasses[shape], className)}
        {...props}
      >
        {src && !showFallback && (
          <img
            src={src}
            alt={alt || fallback || 'Avatar'}
            className={cn('h-full w-full object-cover transition-opacity duration-200', isLoading ? 'opacity-0' : 'opacity-100')}
            onError={handleError}
            onLoad={handleLoad}
          />
        )}
        {(showFallback || !src) && (
          <span className="font-bold text-ink-600 dark:text-ink-300" aria-hidden="true">
            {initials}
          </span>
        )}
      </div>
    )
  }
);
Avatar.displayName = 'Avatar';

interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: ReactNode;
}

export function AvatarGroup({ className, max = 5, size = 'md', children, ...props }: AvatarGroupProps) {
  const childArray = React.Children.toArray(children);
  const visibleChildren = childArray.slice(0, max);
  const remaining = childArray.length - max;

  return (
    <div className={cn('flex -space-x-2', className)} {...props}>
      {visibleChildren.map((child, index) =>
        React.cloneElement(child as React.ReactElement, {
          key: index,
          size,
          className: cn(
            (child as React.ReactElement).props.className,
            'ring-2 ring-white dark:ring-ink-950 transition-transform hover:z-10 hover:scale-105',
            index === visibleChildren.length - 1 && remaining > 0 && 'cursor-pointer'
          ),
        })
      )}
      {remaining > 0 && (
        <div className={cn('flex items-center justify-center bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 ring-2 ring-white dark:ring-ink-950', sizeClasses[size || 'md'], shapeClasses.circle)}>
          +{remaining}
        </div>
      )}
    </div>
  );
}

export { Avatar };