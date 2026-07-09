'use client';

import { forwardRef } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

const Slider = forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none', className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-ink-200 dark:bg-ink-700">
      <SliderPrimitive.Range className="absolute h-full bg-primary-600" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full bg-white border-2 border-primary-600 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-ink-900 hover:bg-primary-50 dark:hover:bg-primary-900/20 active:bg-primary-100" />
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full bg-white border-2 border-primary-600 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-ink-900 hover:bg-primary-50 dark:hover:bg-primary-900/20 active:bg-primary-100" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
