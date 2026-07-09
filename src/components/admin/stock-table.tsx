'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, getPaginationRowModel,
  flexRender, ColumnDef, SortingState,
} from '@tanstack/react-table';
import { cn, formatCurrency, formatMileage, STATUS_CONFIG } from '@/lib/utils';
import { apiFetch } from '@/lib/api-client';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, Trash2, Loader2, X, Check } from 'lucide-react';
import Image from 'next/image';
import {
  Select as RadixSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/base/select';

interface VehicleRow {
  id: string;
  slug: string;
  title: string;
  price: number;
  mileage: number;
  yearMfr: number;
  yearModel: number;
  status: string;
  featured: boolean;
  brand: { name: string };
  model: { name: string };
  images: { url: string }[];
}

interface StockTableProps {
  data: VehicleRow[];
}

export function StockTable({ data }: StockTableProps) {
  const router = useRouter();
  const [rows, setRows] = useState<VehicleRow[]>(data);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    let result = rows;
    if (statusFilter !== 'all') {
      result = result.filter(v => v.status === statusFilter);
    }
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      result = result.filter(v =>
        v.title.toLowerCase().includes(q) ||
        v.brand.name.toLowerCase().includes(q) ||
        v.model.name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [rows, globalFilter, statusFilter]);

  async function changeStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await apiFetch(`/api/vehicles/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        console.error('[StockTable] PUT failed:', res.status, data);
        throw new Error(data?.error || 'Falha ao atualizar status');
      }
      setRows(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      console.error('[StockTable] changeStatus error:', err);
      setToast({ message: 'Erro ao alterar status. Tente novamente.', type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteVehicle(id: string) {
    setConfirmDelete(id);
  }

  async function confirmDeleteVehicle() {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete);
    try {
      const res = await apiFetch(`/api/vehicles/${confirmDelete}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir');
      setRows(prev => prev.filter(r => r.id !== confirmDelete));
      setToast({ message: 'Veículo excluído com sucesso.', type: 'success' });
    } catch {
      setToast({ message: 'Erro ao excluir veículo. Tente novamente.', type: 'error' });
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  }

  const columns = useMemo<ColumnDef<VehicleRow>[]>(() => [
    {
      id: 'vehicle',
      header: 'Veículo',
      cell: ({ row }) => {
        const v = row.original;
        const cover = v.images[0];
        return (
          <div className="flex items-center gap-3">
            <div className="w-14 h-10 rounded-lg bg-ink-800 overflow-hidden shrink-0 relative">
              {cover && <Image src={cover.url} alt={v.title} fill sizes="56px" className="object-cover" />}
            </div>
            <div>
              <p className="text-white font-medium leading-tight">{v.brand.name} {v.model.name}</p>
              <p className="text-ink-500 text-xs">{v.yearMfr}/{v.yearModel}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Preço',
      cell: ({ row }) => <p className="text-primary-400 font-semibold">{formatCurrency(Number(row.original.price))}</p>,
    },
    {
      accessorKey: 'mileage',
      header: 'KM',
      cell: ({ row }) => <p className="text-ink-300">{formatMileage(row.original.mileage)}</p>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const v = row.original;
        const s = STATUS_CONFIG[v.status as keyof typeof STATUS_CONFIG];
        const isUpdating = updatingId === v.id;
        return (
          <div className="relative inline-block">
            <RadixSelect
              value={v.status}
              disabled={isUpdating}
              onValueChange={(val) => {
                console.log('[StockTable] onValueChange:', v.id, v.status, '->', val);
                changeStatus(v.id, val);
              }}
            >
              <SelectTrigger
                className={cn(
                  'rounded-full pl-2.5 pr-7 py-1 h-auto text-xs font-semibold border transition-colors gap-0',
                  'focus:ring-0 focus:ring-offset-0',
                  s?.bg, s?.color, 'disabled:opacity-60 disabled:cursor-wait'
                )}
                title="Alterar status"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className="min-w-[140px] bg-ink-800 border-ink-700 text-ink-100"
              >
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className={cn(
                      'text-xs font-semibold rounded-md focus:bg-ink-700 focus:text-ink-100',
                      cfg.color
                    )}
                  >
                    <span className={cn('w-2 h-2 rounded-full inline-block mr-2', cfg.bg?.replace('/10', '/50'))} />
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </RadixSelect>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const v = row.original;
        const isDeleting = deletingId === v.id;
        return (
          <div className="flex items-center gap-1.5">
            <a
              href={`/veiculos/${v.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-400 hover:text-primary-400 text-xs px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              Ver
            </a>
            <button
              onClick={() => router.push(`/painel/estoque/${v.id}`)}
              className="text-ink-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => deleteVehicle(v.id)}
              disabled={isDeleting}
              className="text-ink-400 hover:text-red-400 text-xs px-3 py-1.5 rounded-lg hover:bg-red-500/5 transition-colors disabled:opacity-50 flex items-center gap-1"
              title="Excluir"
            >
              {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              <span className="hidden sm:inline">Excluir</span>
            </button>
          </div>
        );
      },
    },
  ], [deletingId, updatingId, router]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'AVAILABLE', label: 'Disponível' },
    { value: 'RESERVED', label: 'Reservado' },
    { value: 'SOLD', label: 'Vendido' },
  ];

  return (
    <div className="bg-ink-900 rounded-2xl border border-white/5 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
          <input
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Buscar por marca, modelo..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ink-800 border border-white/5 text-white text-sm placeholder:text-ink-600 outline-none focus:border-primary-500/50"
          />
        </div>
        <div className="flex gap-1.5">
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'px-3 py-2.5 rounded-xl text-xs font-medium transition-all',
                statusFilter === opt.value
                  ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                  : 'text-ink-400 hover:text-white hover:bg-white/5 border border-transparent'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="border-b border-white/5">
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3.5 text-left text-xs font-semibold text-ink-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1 hover:text-ink-200"
                        disabled={!header.column.getCanSort()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' ? <ArrowUp className="h-3 w-3" />
                          : header.column.getIsSorted() === 'desc' ? <ArrowDown className="h-3 w-3" />
                          : header.column.getCanSort() ? <ArrowUpDown className="h-3 w-3 opacity-40" /> : null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b border-white/5 last:border-none hover:bg-white/[0.02] transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-16 text-ink-600">
                  Nenhum veículo encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-white/5">
        <p className="text-xs text-ink-500">
          {table.getState().pagination.pageIndex * 10 + 1}–{Math.min((table.getState().pagination.pageIndex + 1) * 10, filteredData.length)} de {filteredData.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-3 rounded-lg text-ink-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-ink-500">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-3 rounded-lg text-ink-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Excluir veículo"
        message="Excluir este veículo? Esta ação não pode ser desfeita."
        onConfirm={confirmDeleteVehicle}
        onCancel={() => setConfirmDelete(null)}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-ink-800 rounded-2xl border border-white/10 p-6 max-w-sm w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-semibold mb-2">{title}</h3>
        <p className="text-ink-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-ink-300 hover:text-white hover:bg-white/5 transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors">Excluir</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }: { message: string; type: 'error' | 'success'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={cn("fixed bottom-6 right-6 z-[70] px-4 py-3 rounded-xl text-sm font-medium shadow-xl border", type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400')}>
      {message}
    </div>
  );
}