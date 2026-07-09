'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  checked?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, onChange, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          ref={ref}
          id={checkboxId}
          checked={checked}
          onChange={onChange}
          className={cn(
            'h-4 w-4 rounded border-ink-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'dark:border-ink-600 dark:bg-ink-800 dark:focus:ring-offset-ink-900',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="text-sm text-ink-700 dark:text-ink-300 cursor-pointer select-none">
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';