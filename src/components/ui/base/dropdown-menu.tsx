'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { forwardRef, ElementRef, ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

const DropdownMenuRoot = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuContent = forwardRef<ElementRef<typeof DropdownMenuPrimitive.Content>, ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[8rem] overflow-hidden rounded-xl border border-ink-200 bg-white p-1.5 shadow-lg',
          'dark:border-ink-700 dark:bg-ink-900',
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = forwardRef<ElementRef<typeof DropdownMenuPrimitive.Item>, ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors',
        'focus:bg-ink-100 focus:text-ink-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        'dark:focus:bg-ink-800 dark:focus:text-ink-100',
        className
      )}
      {...props}
    />
  )
);
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuLabel = forwardRef<ElementRef<typeof DropdownMenuPrimitive.Label>, ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn('px-3 py-1.5 text-xs font-semibold text-ink-500 dark:text-ink-400', className)}
      {...props}
    />
  )
);
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = forwardRef<ElementRef<typeof DropdownMenuPrimitive.Separator>, ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-ink-200 dark:bg-ink-700', className)}
      {...props}
    />
  )
);
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuCheckboxItem = forwardRef<ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>, ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>>(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm outline-none transition-colors',
        'focus:bg-ink-100 focus:text-ink-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        'dark:focus:bg-ink-800 dark:focus:text-ink-100',
        className
      )}
      {...props}
    >
      <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.6667 3.5L5.25 9.91667L2.33333 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
);
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = forwardRef<ElementRef<typeof DropdownMenuPrimitive.RadioItem>, ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>>(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm outline-none transition-colors',
        'focus:bg-ink-100 focus:text-ink-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        'dark:focus:bg-ink-800 dark:focus:text-ink-100',
        className
      )}
      {...props}
    >
      <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <span className="h-2 w-2 rounded-full bg-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
);
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuSubTrigger = forwardRef<ElementRef<typeof DropdownMenuPrimitive.SubTrigger>, ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>>(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        'flex cursor-default select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors',
        'focus:bg-ink-100 focus:text-ink-900 data-[state=open]:bg-ink-100 data-[state=open]:text-ink-900',
        'dark:focus:bg-ink-800 dark:focus:text-ink-100 dark:data-[state=open]:bg-ink-800 dark:data-[state=open]:text-ink-100',
        className
      )}
      {...props}
    >
      {children}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-auto" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </DropdownMenuPrimitive.SubTrigger>
  )
);
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = forwardRef<ElementRef<typeof DropdownMenuPrimitive.SubContent>, ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-xl border border-ink-200 bg-white p-1.5 shadow-lg',
        'dark:border-ink-700 dark:bg-ink-900',
        className
      )}
      {...props}
    />
  )
);
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

export {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup,
};