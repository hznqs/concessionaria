'use client';

import { useState } from 'react';
import { cn, LEAD_STATUS_CONFIG } from '@/lib/utils';
import { apiFetch } from '@/lib/api-client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/base/select';

const STATUS_OPTIONS = Object.entries(LEAD_STATUS_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

interface LeadStatusSelectProps {
  leadId?: string;
  status: string;
  onStatusChange?: (next: string) => void;
}

export function LeadStatusSelect({ leadId, status, onStatusChange }: LeadStatusSelectProps) {
  const [current, setCurrent] = useState(status);
  const [saving, setSaving] = useState(false);
  const cfg = LEAD_STATUS_CONFIG[current as keyof typeof LEAD_STATUS_CONFIG] ?? LEAD_STATUS_CONFIG.NEW;

  async function onChange(value: string) {
    if (onStatusChange) {
      onStatusChange(value);
      setCurrent(value);
      return;
    }
    const prev = current;
    setCurrent(value);
    setSaving(true);
    try {
      const res = await apiFetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: value }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setCurrent(prev);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select value={current} onValueChange={onChange} disabled={saving}>
      <SelectTrigger
        className={cn(
          'h-auto min-h-[28px] w-auto min-w-[100px] rounded-full px-2.5 py-1 text-xs font-semibold border transition-colors',
          cfg.bg, cfg.color, cfg.border, 'disabled:opacity-60 disabled:cursor-wait'
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-ink-700 bg-ink-900 shadow-xl">
        {STATUS_OPTIONS.map(o => (
          <SelectItem key={o.value} value={o.value} className="text-xs rounded-lg cursor-pointer">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}