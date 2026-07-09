'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface HoverLiftProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  lift?: number;
  className?: string;
}

export function HoverLift({ children, lift = -6, className, ...props }: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y: lift }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn('will-change-transform', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}