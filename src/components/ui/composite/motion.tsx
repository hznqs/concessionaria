'use client';

import { motion, Variants } from 'framer-motion';
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

const DIRECTIONS: Record<Direction, { x: number; y: number }> = {
  up: { y: 20, x: 0 },
  down: { y: -20, x: 0 },
  left: { x: 20, y: 0 },
  right: { x: -20, y: 0 },
  none: { x: 0, y: 0 },
};

const EASE = [0.16, 1, 0.3, 1] as const;

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  duration?: number;
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.5,
  className,
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, ...DIRECTIONS[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerChildren?: number;
  delayChildren?: number;
  direction?: Direction;
}

export function StaggerContainer({
  children,
  className,
  staggerChildren = 0.08,
  delayChildren = 0.1,
  direction = 'up',
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      variants={{
        visible: { transition: { staggerChildren, delayChildren } },
      }}
      className={className}
    >
      {React.Children.map(children, (child) =>
        child && typeof child === 'object' && 'props' in child
          ? React.cloneElement(child as React.ReactElement, {
              variants: {
                hidden: { opacity: 0, ...DIRECTIONS[direction] },
                visible: {
                  opacity: 1, x: 0, y: 0,
                  transition: { duration: 0.4, ease: EASE },
                },
              },
            })
          : child
      )}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
}

export function StaggerItem({
  children,
  className,
  direction = 'up',
  delay = 0,
}: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, ...DIRECTIONS[direction] },
        visible: {
          opacity: 1, x: 0, y: 0,
          transition: { duration: 0.4, delay, ease: EASE },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ScrollRevealProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  className?: string;
}

export function ScrollReveal({
  children,
  threshold = 0.1,
  rootMargin = '0px',
  once = true,
  className,
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: rootMargin, amount: threshold }}
      transition={{ duration: 0.7, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: EASE } },
};
