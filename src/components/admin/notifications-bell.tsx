'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X, Phone, Car, MessageSquare, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn, LEAD_STATUS_CONFIG } from '@/lib/utils';

type LeadNotification = {
  id: string;
  name: string;
  whatsapp: string;
  message: string | null;
  status: string;
  vehicle: { title: string } | null;
  createdAt: string;
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<LeadNotification[]>([]);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('admin:notifications:lastSeen');
    if (stored) setLastSeenAt(stored);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('/api/leads')
      .then((r) => r.json())
      .then((data: LeadNotification[]) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setLeads(sorted.slice(0, 15));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markAllSeen = () => {
    const now = new Date().toISOString();
    setLastSeenAt(now);
    localStorage.setItem('admin:notifications:lastSeen', now);
  };

  const isNew = (createdAt: string) => {
    if (!lastSeenAt) return true;
    return new Date(createdAt).getTime() > new Date(lastSeenAt).getTime();
  };

  const newCount = leads.filter((l) => isNew(l.createdAt)).length;

  const handleOpen = () => {
    if (!open) setOpen(true);
    markAllSeen();
  };

  const goToLeads = () => {
    setOpen(false);
    router.push('/painel/leads');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-full text-ink-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        aria-label="Notificações"
      >
        <Bell className="h-[18px] w-[18px]" />
        {newCount > 0 && (
          <span className="absolute top-1.5 right-2 min-w-[16px] h-4 px-1 rounded-full bg-primary-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-ink-900">
            {newCount > 9 ? '9+' : newCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0 top-11 z-50 w-[340px] max-w-[calc(100vw-1rem)] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "rgba(12, 18, 30, 0.92)", backdropFilter: "blur(24px) saturate(150%)", WebkitBackdropFilter: "blur(24px) saturate(150%)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">Notificações</h3>
              {newCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary-500/15 text-primary-400">
                  {newCount} nova{newCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full text-ink-500 hover:text-white hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto apple-no-scrollbar">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full apple-shimmer shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-24 rounded apple-shimmer" />
                      <div className="h-2.5 w-40 rounded apple-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-ink-500">
                <Bell size={28} strokeWidth={1.5} className="mb-2 opacity-40" />
                <p className="text-sm font-medium">Tudo em dia!</p>
                <p className="text-xs mt-0.5">Nenhum lead novo por enquanto.</p>
              </div>
            ) : (
              <>
                {leads.map((lead) => {
                  const recent = isNew(lead.createdAt);
                  const cfg = LEAD_STATUS_CONFIG[lead.status as keyof typeof LEAD_STATUS_CONFIG];
                  return (
                    <button
                      key={lead.id}
                      onClick={goToLeads}
                      className={cn(
                        'w-full flex items-start gap-3 px-4 py-3 text-left border-b border-white/[0.03] transition-colors hover:bg-white/[0.03]',
                        recent && 'bg-primary-500/[0.04]'
                      )}
                    >
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400/20 to-primary-600/20 flex items-center justify-center text-primary-300 font-bold text-sm ring-1 ring-primary-500/10">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        {recent && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary-500 ring-2 ring-ink-900" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-[13px] font-semibold truncate">{lead.name}</p>
                          <span className="text-[10px] text-ink-600 shrink-0">
                            {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        {lead.message ? (
                          <p className="text-ink-400 text-[11px] leading-relaxed mt-0.5 line-clamp-2 flex items-start gap-1">
                            <MessageSquare size={10} className="shrink-0 mt-0.5 opacity-50" />
                            <span className="truncate">{lead.message}</span>
                          </p>
                        ) : lead.vehicle ? (
                          <p className="text-ink-400 text-[11px] mt-0.5 flex items-center gap-1">
                            <Car size={10} className="opacity-50" />
                            <span className="truncate">{lead.vehicle.title}</span>
                          </p>
                        ) : (
                          <p className="text-ink-500 text-[11px] mt-0.5 flex items-center gap-1">
                            <Phone size={10} className="opacity-50" />
                            {lead.whatsapp}
                          </p>
                        )}
                        {cfg && (
                          <span className={cn('inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full', cfg.bg, cfg.color)}>
                            {cfg.label}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-ink-600 shrink-0 self-center" />
                    </button>
                  );
                })}
                <button
                  onClick={goToLeads}
                  className="w-full py-3 text-center text-[13px] font-semibold text-primary-400 hover:text-primary-300 hover:bg-white/[0.03] transition-colors"
                >
                  Ver todos os leads
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}