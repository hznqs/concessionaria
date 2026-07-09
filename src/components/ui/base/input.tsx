'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const inputVariants = cn(
  'flex h-11 w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400',
  'transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-ink-50',
  'hover:border-ink-300',
  'dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:border-primary-400 dark:hover:border-ink-600'
);

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-ink-900 dark:text-ink-100">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            className={cn(inputVariants, className, leftIcon && 'pl-11', rightIcon && 'pr-11', error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20')}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-2 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-2 text-sm text-ink-500 dark:text-ink-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

const textareaVariants = cn(
  'flex min-h-[100px] w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400',
  'transition-all duration-200 resize-y',
  'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-ink-50',
  'hover:border-ink-300',
  'dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:border-primary-400 dark:hover:border-ink-600'
);

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-ink-900 dark:text-ink-100">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          className={cn(textareaVariants, className, error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20')}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-2 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-2 text-sm text-ink-500 dark:text-ink-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };