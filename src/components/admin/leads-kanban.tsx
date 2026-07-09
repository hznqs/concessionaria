'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Phone, Mail, Car, GripVertical, Plus, MoreVertical, Loader2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { cn, LEAD_STATUS_CONFIG } from '@/lib/utils';
import { apiFetch } from '@/lib/api-client';
import { LeadFormModal } from '@/components/admin/lead-form-modal';
import { LeadStatusSelect } from '@/components/admin/lead-status-select';

type LeadStatus = keyof typeof LEAD_STATUS_CONFIG;

type Lead = {
  id: string;
  name: string;
  whatsapp: string;
  email: string | null;
  message: string | null;
  proposal: number | null;
  origin: string;
  status: string;
  vehicleId: string | null;
  vehicle: { title: string; slug: string } | null;
  createdAt: string;
};

const COLUMNS: LeadStatus[] = ['NEW', 'CONTACTED', 'NEGOTIATING', 'WON', 'LOST'];

function toWaLink(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.replace(/^0+/, '');
  return `https://wa.me/55${digits}`;
}

function formatPhoneDisplay(raw: string): string {
  const d = raw.replace(/\D/g, '').replace(/^55/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw;
}

export function LeadsKanban({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<LeadStatus | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [mobileCol, setMobileCol] = useState(0);

  // Sincroniza o estado local quando os dados do servidor mudam (ex: ao criar, editar ou excluir um lead)
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const filtered = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter((l) =>
      l.name.toLowerCase().includes(q) ||
      l.whatsapp.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
      l.email?.toLowerCase().includes(q) ||
      l.vehicle?.title.toLowerCase().includes(q)
    );
  }, [leads, search]);

  const grouped = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = { NEW: [], CONTACTED: [], NEGOTIATING: [], WON: [], LOST: [] };
    for (const l of filtered) {
      const col = (COLUMNS.includes(l.status as LeadStatus) ? l.status : 'NEW') as LeadStatus;
      map[col].push(l);
    }
    return map;
  }, [filtered]);

  const updateStatus = useCallback(async (leadId: string, next: LeadStatus) => {
    let prevStatus: string | undefined;
    setLeads((prev) => {
      const cur = prev.find((l) => l.id === leadId);
      prevStatus = cur?.status;
      return prev.map((l) => (l.id === leadId ? { ...l, status: next } : l));
    });
    setSavingId(leadId);
    try {
      const res = await apiFetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      // Sincroniza o Server Component em background sem travar o UI
      router.refresh();
    } catch {
      if (prevStatus) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: prevStatus! } : l)));
      }
      alert('Erro ao mover o lead. Tente novamente.');
    } finally {
      setSavingId(null);
    }
  }, []);

  const deleteLead = useCallback(async (leadId: string) => {
    if (!confirm("Tem certeza que deseja excluir este lead? Essa ação não pode ser desfeita.")) return;
    
    const previousLeads = [...leads];
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    
    try {
      const res = await apiFetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      // Sincroniza o Server Component após exclusão
      router.refresh();
    } catch {
      setLeads(previousLeads);
      alert('Erro ao excluir o lead. Tente novamente.');
    }
  }, [leads]);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggingId(leadId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, col: LeadStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(col);
  };

  const handleDrop = (e: React.DragEvent, col: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    const lead = leads.find((l) => l.id === leadId);
    if (lead && lead.status !== col) updateStatus(leadId, col);
    setDragOverCol(null);
    setDraggingId(null);
  };

  function renderColumn(col: LeadStatus, isMobile = false) {
    const cfg = LEAD_STATUS_CONFIG[col];
    const items = grouped[col];
    const isOver = dragOverCol === col;
    const isWon = col === 'WON';
    const isLost = col === 'LOST';

    return (
      <div
        key={col}
        onDragOver={(e) => handleDragOver(e, col)}
        onDragLeave={() => setDragOverCol((c) => (c === col ? null : c))}
        onDrop={(e) => handleDrop(e, col)}
        className={cn(
          'flex flex-col rounded-2xl border transition-colors',
          isOver ? 'border-primary-500/40 bg-primary-500/5' : 'border-white/5 bg-ink-900/60',
          isWon && !isMobile && 'bg-success-500/[0.03]',
          isLost && !isMobile && 'bg-ink-950/40',
          isMobile && 'flex-1'
        )}
      >
        <div className="flex items-center justify-between px-3 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 rounded-full', cfg.color.replace('text-', 'bg-'))} />
            <h3 className="text-sm font-semibold text-white">{cfg.label}</h3>
          </div>
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>
            {items.length}
          </span>
        </div>

        <div className={cn('flex-1 overflow-y-auto px-2 py-2 space-y-2 apple-no-scrollbar', isMobile ? 'max-h-[65vh] min-h-[200px]' : 'max-h-[70vh] min-h-[100px]')}>
          {items.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              cfg={cfg}
              dragging={draggingId === lead.id}
              saving={savingId === lead.id}
              isMobile={isMobile}
              onDragStart={(e) => handleDragStart(e, lead.id)}
              onDragEnd={handleDragEnd}
              onMove={(next) => updateStatus(lead.id, next)}
              onDelete={() => deleteLead(lead.id)}
            />
          ))}

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-ink-600">
              {isOver && <Plus size={20} strokeWidth={1.5} className="mb-1 opacity-50" />}
              <p className="text-[11px]">{isOver ? 'Solte aqui' : 'Vazio'}</p>
            </div>
        )}
      </div>
    </div>
  );
}

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">Pipeline de Leads</h1>
          <p className="text-ink-400 text-xs sm:text-sm mt-0.5">
            {filtered.length} contato{filtered.length !== 1 ? 's' : ''}
            {search && ` · filtrando por "${search}"`}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="bg-ink-800 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-ink-600 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 flex-1 sm:flex-none sm:w-56"
          />
          <LeadFormModal />
        </div>
      </div>

      {/* Mobile: segmented column switcher */}
      <div className="lg:hidden flex gap-1.5 apple-no-scrollbar overflow-x-auto pb-1">
        {COLUMNS.map((col, i) => {
          const cfg = LEAD_STATUS_CONFIG[col];
          const active = mobileCol === i;
          return (
            <button
              key={col}
              onClick={() => setMobileCol(i)}
              className={cn(
                'apple-pill flex items-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap border transition-all',
                active ? cn(cfg.bg, cfg.color, cfg.border) : 'text-ink-400 border-white/5 bg-ink-800/50'
              )}
            >
              {cfg.label}
              <span className={cn('rounded-full px-1.5 text-[10px]', active ? 'bg-white/10' : 'bg-white/5')}>
                {grouped[col].length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop: 5-column grid with drag-and-drop */}
      <div className="hidden lg:grid grid-cols-5 gap-3 min-h-[60vh]" style={{ gridTemplateColumns: 'repeat(5, minmax(240px, 1fr))' }}>
        {COLUMNS.map((col) => renderColumn(col))}
      </div>

      {/* Mobile: single active column with swipe arrows */}
      <div className="lg:hidden flex items-center gap-2">
        <button
          onClick={() => setMobileCol((c) => Math.max(0, c - 1))}
          disabled={mobileCol === 0}
          className="p-3 rounded-full bg-ink-800 text-ink-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">{renderColumn(COLUMNS[mobileCol], true)}</div>
        <button
          onClick={() => setMobileCol((c) => Math.min(COLUMNS.length - 1, c + 1))}
          disabled={mobileCol === COLUMNS.length - 1}
          className="p-3 rounded-full bg-ink-800 text-ink-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <p className="hidden lg:flex text-[11px] text-ink-600 items-center gap-1.5">
        <GripVertical size={11} /> Arraste os cards entre as colunas para mudar o status.
      </p>
      <p className="lg:hidden text-[11px] text-ink-600">
        Use as setas ou as abas acima para navegar entre colunas. Toque em &ldquo;⋮&rdquo; no card para mudar o status.
      </p>

    </div>
  );
}

function LeadCard({
  lead,
  cfg,
  dragging,
  saving,
  isMobile,
  onDragStart,
  onDragEnd,
  onMove,
  onDelete,
}: {
  lead: Lead;
  cfg: (typeof LEAD_STATUS_CONFIG)[LeadStatus];
  dragging: boolean;
  saving: boolean;
  isMobile: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onMove: (next: LeadStatus) => void;
  onDelete: () => void;
}) {
  const [showQuickMove, setShowQuickMove] = useState(false);
  const waLink = toWaLink(lead.whatsapp);
  const waText = encodeURIComponent(
    lead.vehicle
      ? `Olá ${lead.name}! Vi seu interesse no ${lead.vehicle.title}. Ainda está disponível?`
      : `Olá ${lead.name}! Sou da AutoPrime, atendendo seu contato no site.`
  );
  const fullWaLink = `${waLink}?text=${waText}`;

  useEffect(() => {
    if (showQuickMove) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showQuickMove]);

  return (
    <div
      draggable={!isMobile}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'group bg-ink-800 rounded-xl border border-white/5 p-3 transition-all hover:border-white/10 hover:bg-ink-800/80',
        !isMobile && 'cursor-grab active:cursor-grabbing',
        dragging && 'opacity-40 rotate-2 scale-[0.98]',
        saving && 'opacity-70'
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400/20 to-primary-600/20 flex items-center justify-center text-primary-300 font-bold text-sm shrink-0 ring-1 ring-primary-500/10">
          {lead.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{lead.name}</p>
          <p className="text-ink-500 text-[11px]">
            {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true, locale: ptBR })}
            {lead.origin === 'WHATSAPP' && ' · via WA'}
            {lead.origin === 'PHONE' && ' · Ligação'}
            {lead.origin === 'IN_PERSON' && ' · Presencial'}
            {lead.origin === 'SOCIAL_MEDIA' && ' · Social'}
            {lead.origin === 'LOCAL' && ' · Loja'}
          </p>
        </div>
        {saving && <Loader2 size={13} className="text-primary-400 animate-spin mt-1 shrink-0" />}
        {isMobile && (
          <>
            <button
              onClick={() => setShowQuickMove(true)}
              className="p-1.5 rounded-lg text-primary-300 bg-primary-500/10"
              title="Mover para..."
            >
              <MoreVertical size={15} />
            </button>
            {showQuickMove && (
              <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={() => setShowQuickMove(false)}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-apple-sheet" style={{ animationDirection: 'reverse', animationDuration: '0.2s' }} />
                <div className="relative w-full max-w-md p-3 pb-6 animate-apple-sheet">
                  <div className="apple-card rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 text-center border-b border-white/[0.05]">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">Mover {lead.name} para</p>
                    </div>
                    {COLUMNS.filter((c) => c !== (lead.status as LeadStatus)).map((c) => {
                      const cfg2 = LEAD_STATUS_CONFIG[c];
                      return (
                        <button
                          key={c}
                          onClick={() => { onMove(c); setShowQuickMove(false); }}
                          className={cn('w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium hover:bg-white/[0.04] transition-colors border-b border-white/[0.03]', cfg2.color)}
                        >
                          <span className={cn('h-2.5 w-2.5 rounded-full', cfg2.color.replace('text-', 'bg-'))} />
                          {cfg2.label}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setShowQuickMove(false)}
                    className="w-full mt-2 apple-card rounded-2xl py-3.5 text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {!isMobile && (
          <div className="shrink-0">
            <LeadStatusSelect status={lead.status} onStatusChange={(next) => onMove(next as LeadStatus)} />
          </div>
        )}
      </div>

      {lead.vehicle && (
        <Link
          href={`/veiculos/${lead.vehicle.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-[11px] text-primary-400 hover:text-primary-300 mb-2"
        >
          <Car size={11} />
          <span className="truncate max-w-[200px]">{lead.vehicle.title}</span>
        </Link>
      )}

      {lead.message && (
        <div className="relative ml-auto max-w-[88%] mb-2.5 bg-[#1e2d42] rounded-2xl rounded-tl-sm px-3 py-2">
          <p className="text-ink-200 text-[11px] leading-relaxed line-clamp-3">{lead.message}</p>
          <div className="absolute -left-1 top-2 w-2 h-2 bg-[#1e2d42] rotate-45" />
        </div>
      )}

      {lead.proposal != null && lead.proposal > 0 && (
        <div className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md mb-2.5', cfg.bg, cfg.color)}>
          Proposta: <span className="tabular-nums">R$ {lead.proposal.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
        <a
          href={fullWaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-white bg-[#25d366] hover:bg-[#20bd5a] rounded-lg py-1.5 transition-colors active:scale-95"
          title="Abrir conversa no WhatsApp"
        >
          <Phone size={12} />
          {formatPhoneDisplay(lead.whatsapp)}
        </a>
        {lead.email ? (
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center justify-center w-9 h-9 text-ink-400 hover:text-primary-400 hover:bg-white/5 rounded-lg transition-colors"
            title={lead.email}
          >
            <Mail size={13} />
          </a>
        ) : (
          <span className="w-9 h-9 flex items-center justify-center text-ink-700">
            <Mail size={13} />
          </span>
        )}
        <button
          onClick={onDelete}
          className="flex items-center justify-center w-9 h-9 text-ink-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Excluir Lead"
        >
          <Trash2 size={13} />
        </button>
      </div>

    </div>
  );
}


