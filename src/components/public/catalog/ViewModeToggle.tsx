'use client';

import { cn } from '@/lib/utils';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/base/button';

interface ViewModeToggleProps {
  viewMode: 'grid' | 'list';
  onChange: (mode: 'grid' | 'list') => void;
}

export function ViewModeToggle({ viewMode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-ink-100 dark:bg-ink-800 rounded-lg p-1" role="group" aria-label="Modo de visualização">
      <Button
        variant={viewMode === 'grid' ? 'primary' : 'ghost'}
        size="icon"
        onClick={() => onChange('grid')}
        aria-label="Visualização em grade"
        aria-pressed={viewMode === 'grid'}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'primary' : 'ghost'}
        size="icon"
        onClick={() => onChange('list')}
        aria-label="Visualização em lista"
        aria-pressed={viewMode === 'list'}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}