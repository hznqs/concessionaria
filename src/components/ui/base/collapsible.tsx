'use client';

import { forwardRef } from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    className={cn(
      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium',
      'hover:bg-ink-100 dark:hover:bg-ink-800',
      'focus:outline-none focus:ring-2 focus:ring-primary-500',
      'disabled:opacity-50 disabled:pointer-events-none',
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 text-ink-500 transition-transform duration-200 data-[state=open]:rotate-180" />
  </CollapsiblePrimitive.Trigger>
));
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName;

const CollapsibleContent = forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up',
      className
    )}
    {...props}
  >
    <div className="pb-2">{children}</div>
  </CollapsiblePrimitive.Content>
));
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
