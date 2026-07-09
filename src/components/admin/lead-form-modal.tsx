'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api-client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/base/select';

type VehicleOption = {
  id: string;
  title: string;
  brand?: { name: string };
  model?: { name: string };
};

const ORIGIN_OPTIONS = [
  { value: 'WEBSITE',      label: 'Website' },
  { value: 'WHATSAPP',     label: 'WhatsApp' },
  { value: 'PHONE',        label: 'Telefone' },
  { value: 'SOCIAL_MEDIA', label: 'Redes Sociais' },
  { value: 'LOCAL',        label: 'Presencial (Loja)' },
];

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
}

export function LeadFormModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehicleQuery, setVehicleQuery] = useState('');
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption | null>(null);

  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    email: '',
    message: '',
    origin: 'WEBSITE' as string,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Bloqueia scroll quando aberto; limpa clicando fora.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Fecha com ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Busca lista de veículos disponíveis quando dropdown abre (lazy)
  useEffect(() => {
    if (!vehicleDropdownOpen || vehicles.length > 0) return;
    setVehiclesLoading(true);
    fetch('/api/vehicles?limit=50&status=AVAILABLE')
      .then(r => r.ok ? r.json() : [])
      .then((data: VehicleOption[]) => setVehicles(data))
      .catch(() => setVehicles([]))
      .finally(() => setVehiclesLoading(false));
  }, [vehicleDropdownOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredVehicles = vehicles.filter(v => {
    if (!vehicleQuery) return true;
    const q = vehicleQuery.toLowerCase();
    return (
      v.title.toLowerCase().includes(q) ||
      v.brand?.name?.toLowerCase().includes(q) ||
      v.model?.name?.toLowerCase().includes(q)
    );
  });

  function reset() {
    setForm({ name: '', whatsapp: '', email: '', message: '', origin: 'WEBSITE' });
    setSelectedVehicle(null);
    setVehicleQuery('');
    setErrors({});
    setSubmitError('');
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitError('');

    const newErrors: Record<string, string> = {};
    if (form.name.trim().length < 3) newErrors.name = 'Nome muito curto';
    if (form.whatsapp.replace(/\D/g, '').length < 10) newErrors.whatsapp = 'WhatsApp inválido';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'E-mail inválido';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch('/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          whatsapp: form.whatsapp.trim(),
          email: form.email.trim() || undefined,
          message: form.message.trim() || undefined,
          vehicleId: selectedVehicle?.id ?? undefined,
          origin: form.origin,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Falha ao salvar lead');
      }
      close();
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar lead');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/20 hover:shadow-xl transition-all"
      >
        <PlusCircle size={16} />
        Novo Lead
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-8 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className="relative w-full max-w-lg bg-ink-900 rounded-2xl border border-white/10 shadow-2xl my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 id="lead-modal-title" className="font-semibold text-white text-lg">Novo Lead</h2>
          <button
            onClick={close}
            className="text-ink-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-400 block mb-1.5">Nome *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nome completo do cliente"
              autoFocus
              className={cn(
                'w-full bg-ink-800 border rounded-xl px-4 py-3 text-white text-sm placeholder-ink-600 outline-none focus:border-primary-500 transition-colors',
                errors.name ? 'border-red-500/50' : 'border-white/10'
              )}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-ink-400 block mb-1.5">WhatsApp *</label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => setForm(f => ({ ...f, whatsapp: formatPhone(e.target.value) }))}
                placeholder="(11) 99999-0000"
                maxLength={15}
                className={cn(
                  'w-full bg-ink-800 border rounded-xl px-4 py-3 text-white text-sm placeholder-ink-600 outline-none focus:border-primary-500 transition-colors',
                  errors.whatsapp ? 'border-red-500/50' : 'border-white/10'
                )}
              />
              {errors.whatsapp && <p className="text-red-400 text-xs mt-1">{errors.whatsapp}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-ink-400 block mb-1.5">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="cliente@email.com (opcional)"
                className={cn(
                  'w-full bg-ink-800 border rounded-xl px-4 py-3 text-white text-sm placeholder-ink-600 outline-none focus:border-primary-500 transition-colors',
                  errors.email ? 'border-red-500/50' : 'border-white/10'
                )}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-ink-400 block mb-1.5">Origem</label>
              <Select
                value={form.origin}
                onValueChange={(v) => setForm(f => ({ ...f, origin: v }))}
              >
                <SelectTrigger className="h-12 rounded-xl border-white/10 bg-ink-800 text-white text-sm focus:ring-primary-500/30 focus:border-primary-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999] rounded-xl border-ink-700 bg-ink-900 shadow-xl">
                  {ORIGIN_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value} className="text-sm text-ink-200 rounded-lg cursor-pointer">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <label className="text-xs font-medium text-ink-400 block mb-1.5">Veículo interessado</label>
              <button
                type="button"
                onClick={() => setVehicleDropdownOpen(o => !o)}
                className="w-full bg-ink-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm text-left outline-none focus:border-primary-500 transition-colors flex items-center justify-between gap-2"
              >
                <span className={selectedVehicle ? 'truncate' : 'text-ink-600'}>
                  {selectedVehicle ? `${selectedVehicle.brand?.name ?? ''} ${selectedVehicle.title}` : 'Nenhum veículo (opcional)'}
                </span>
                <span className="text-ink-500 text-xs shrink-0">{vehicleDropdownOpen ? '▲' : '▼'}</span>
              </button>
              {vehicleDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto bg-ink-800 border border-white/10 rounded-xl shadow-xl">
                  <input
                    type="text"
                    value={vehicleQuery}
                    onChange={(e) => setVehicleQuery(e.target.value)}
                    placeholder="Buscar veículo..."
                    autoFocus
                    className="w-full bg-ink-900 border-b border-white/10 px-3 py-2 text-white text-sm outline-none placeholder-ink-600"
                  />
                  {vehiclesLoading && (
                    <div className="px-3 py-3 text-ink-500 text-xs flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" /> Carregando...
                    </div>
                  )}
                  {!vehiclesLoading && filteredVehicles.length === 0 && (
                    <div className="px-3 py-3 text-ink-500 text-xs">Nenhum veículo encontrado</div>
                  )}
                  <button
                    type="button"
                    onClick={() => { setSelectedVehicle(null); setVehicleDropdownOpen(false); setVehicleQuery(''); }}
                    className="w-full text-left px-3 py-2 text-ink-400 text-sm hover:bg-white/5 transition-colors"
                  >
                    — Nenhum (interesse geral) —
                  </button>
                  {!vehiclesLoading && filteredVehicles.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => { setSelectedVehicle(v); setVehicleDropdownOpen(false); setVehicleQuery(''); }}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors truncate',
                        selectedVehicle?.id === v.id ? 'text-primary-400' : 'text-white'
                      )}
                    >
                      {v.brand?.name ?? ''} {v.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-400 block mb-1.5">Mensagem / observação</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Detalhes do interesse, propostas, horário para retorno..."
              rows={3}
              className="w-full bg-ink-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-ink-600 outline-none focus:border-primary-500 transition-colors resize-none"
            />
          </div>

          {submitError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={close}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl text-sm text-ink-300 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-prime inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm disabled:opacity-60"
            >
              {saving ? <><Loader2 size={15} className="animate-spin" /> Salvando...</> : 'Salvar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}