'use client';

import { PageTransition } from '@/components/public/ui/PageTransition';
import { type ReactNode } from 'react';

interface AdminPageTransitionProps {
  children: ReactNode;
}

export function AdminPageTransition({ children }: AdminPageTransitionProps) {
  return <PageTransition>{children}</PageTransition>;
}