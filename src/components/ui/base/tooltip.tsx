'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { forwardRef, ElementRef, ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = forwardRef<ElementRef<typeof TooltipPrimitive.Content>, ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg',
        'animate-fade-in',
        'dark:bg-ink-100 dark:text-ink-900',
        className
      )}
      {...props}
    />
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent };