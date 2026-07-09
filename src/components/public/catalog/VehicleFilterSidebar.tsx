'use client';

import { useState, useEffect } from 'react';
import { cn, formatCurrency, formatMileage, FUEL_LABELS, TRANSMISSION_LABELS, BODY_TYPE_LABELS } from '@/lib/utils';
import type { FacetsData } from '@/lib/vehicles';
import { X, ChevronRight, SlidersHorizontal, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/base/button';

interface VehicleFilterSidebarProps {
  facets: FacetsData;
  filters: {
    brandIds: string[];
    modelIds: string[];
    fuelTypes: string[];
    transmissionTypes: string[];
    bodyTypes: string[];
    colors: string[];
    statuses: string[];
    priceMin: number | undefined;
    priceMax: number | undefined;
    mileageMin: number | undefined;
    mileageMax: number | undefined;
    yearMin: number | undefined;
    yearMax: number | undefined;
    search: string;
    featured: boolean | undefined;
  };
  onChange: (filters: Partial<VehicleFilterSidebarProps['filters']>) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const FILTER_DEFAULTS: VehicleFilterSidebarProps['filters'] = {
  brandIds: [], modelIds: [], fuelTypes: [], transmissionTypes: [],
  bodyTypes: [], colors: [], statuses: [],
  priceMin: undefined, priceMax: undefined,
  mileageMin: undefined, mileageMax: undefined,
  yearMin: undefined, yearMax: undefined,
  search: '', featured: undefined,
};

function equalArrays(a: readonly string[], b: readonly string[]) {
  if (a.length !== b.length) return false;
  return a.every((v) => b.includes(v));
}

function CollapsibleSection({
  id, label, count, open, onToggle, children,
}: {
  id: string; label: string; count: number;
  open: boolean; onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/5 pb-4 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2.5 group"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink-200 group-hover:text-white transition-colors">{label}</span>
          {count > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
              {count}
            </span>
          )}
        </div>
        <ChevronRight size={14} className={cn(
          'text-ink-500 transition-transform duration-200 flex-shrink-0',
          open && 'rotate-90'
        )} />
      </button>
      {open && <div className="space-y-1 pt-1">{children}</div>}
    </div>
  );
}

function FilterCheckbox({
  checked, label, count, onChange,
}: {
  checked: boolean; label: string; count?: number; onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-left',
        checked
          ? 'bg-primary-500/10 text-primary-300'
          : 'text-ink-400 hover:bg-white/5 hover:text-ink-200'
      )}
    >
      <div className={cn(
        'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all',
        checked ? 'bg-primary-500 border-primary-500' : 'border-white/20 bg-transparent'
      )}>
        {checked && <Check size={10} className="text-white" />}
      </div>
      <span className="flex-1 truncate text-sm">{label}</span>
      {count !== undefined && (
        <span className="text-[10px] font-medium text-ink-500 bg-white/5 px-1.5 py-0.5 rounded">{count}</span>
      )}
    </button>
  );
}

export function VehicleFilterSidebar({ facets, filters, onChange, mobileOpen = false, onMobileClose }: VehicleFilterSidebarProps) {
  const [pending, setPending] = useState(filters);
  const [openSections, setOpenSections] = useState(() => new Set(['brands']));

  useEffect(() => {
    setPending(filters);
  }, [filters]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const hasChanges = !equalArrays(pending.brandIds, filters.brandIds)
    || !equalArrays(pending.modelIds, filters.modelIds)
    || !equalArrays(pending.fuelTypes, filters.fuelTypes)
    || !equalArrays(pending.transmissionTypes, filters.transmissionTypes)
    || !equalArrays(pending.bodyTypes, filters.bodyTypes)
    || !equalArrays(pending.colors, filters.colors)
    || pending.priceMin !== filters.priceMin
    || pending.priceMax !== filters.priceMax
    || pending.mileageMin !== filters.mileageMin
    || pending.mileageMax !== filters.mileageMax
    || pending.yearMin !== filters.yearMin
    || pending.yearMax !== filters.yearMax
    || pending.search !== filters.search
    || pending.featured !== filters.featured;

  const hasActiveFilters = Object.values(pending).some(v =>
    Array.isArray(v) ? v.length > 0 : v !== undefined && v !== ''
  );

  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const updatePending = <K extends keyof typeof pending>(key: K, value: (typeof pending)[K]) => {
    setPending((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onChange(pending);
  };

  const handleClear = () => {
    const cleared = { ...FILTER_DEFAULTS };
    setPending(cleared);
    onChange(cleared);
  };

  const checkboxHandler = (key: 'brandIds' | 'modelIds' | 'fuelTypes' | 'transmissionTypes' | 'bodyTypes' | 'colors', value: string) => () => {
    const current = pending[key];
    if (current.includes(value)) {
      updatePending(key, current.filter((v: string) => v !== value));
    } else {
      updatePending(key, [...current, value]);
    }
  };

  const rangeHandler = (key: 'priceMin' | 'priceMax' | 'mileageMin' | 'mileageMax' | 'yearMin' | 'yearMax') => (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePending(key, e.target.value ? Number(e.target.value) : undefined);
  };

  const filterContent = (
    <div className="mb-4 space-y-4">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar modelo, marca..."
          value={pending.search}
          onChange={(e) => updatePending('search', e.target.value)}
          className={cn(
            'w-full h-9 rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-ink-200 placeholder:text-ink-500',
            'transition-all duration-200',
            'focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20',
          )}
        />
      </div>

      <div className="space-y-1 max-h-[calc(100vh-24rem)] overflow-y-auto pr-1">
        <CollapsibleSection
          id="brands" label="Marca" count={pending.brandIds.length}
          open={openSections.has('brands')} onToggle={() => toggleSection('brands')}
        >
          {facets.brands.map((brand) => (
            <FilterCheckbox
              key={brand.id}
              checked={pending.brandIds.includes(brand.id)}
              label={brand.name}
              count={brand.count}
              onChange={checkboxHandler('brandIds', brand.id)}
            />
          ))}
        </CollapsibleSection>

        {pending.brandIds.length > 0 && (
          <CollapsibleSection
            id="models" label="Modelo" count={pending.modelIds.length}
            open={openSections.has('models')} onToggle={() => toggleSection('models')}
          >
            {facets.models
              .filter((m) => pending.brandIds.includes(m.brandId))
              .map((model) => (
                <FilterCheckbox
                  key={model.id}
                  checked={pending.modelIds.includes(model.id)}
                  label={model.name}
                  count={model.count}
                  onChange={checkboxHandler('modelIds', model.id)}
                />
              ))}
          </CollapsibleSection>
        )}

        <CollapsibleSection
          id="specs" label="Especificações"
          count={pending.fuelTypes.length + pending.transmissionTypes.length + pending.bodyTypes.length}
          open={openSections.has('specs')} onToggle={() => toggleSection('specs')}
        >
          <div className="space-y-3 pt-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mb-2 pl-3">Combustível</p>
              {facets.fuels.map((fuel) => (
                <FilterCheckbox
                  key={fuel.value}
                  checked={pending.fuelTypes.includes(fuel.value)}
                  label={FUEL_LABELS[fuel.value] ?? fuel.value}
                  count={fuel.count}
                  onChange={checkboxHandler('fuelTypes', fuel.value)}
                />
              ))}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mb-2 pl-3">Câmbio</p>
              {facets.transmissions.map((trans) => (
                <FilterCheckbox
                  key={trans.value}
                  checked={pending.transmissionTypes.includes(trans.value)}
                  label={TRANSMISSION_LABELS[trans.value] ?? trans.value}
                  count={trans.count}
                  onChange={checkboxHandler('transmissionTypes', trans.value)}
                />
              ))}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mb-2 pl-3">Carroceria</p>
              {facets.bodyTypes.map((body) => (
                <FilterCheckbox
                  key={body.value}
                  checked={pending.bodyTypes.includes(body.value)}
                  label={BODY_TYPE_LABELS[body.value] ?? body.value}
                  count={body.count}
                  onChange={checkboxHandler('bodyTypes', body.value)}
                />
              ))}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="price" label="Preço"
          count={pending.priceMin !== undefined || pending.priceMax !== undefined ? 1 : 0}
          open={openSections.has('price')} onToggle={() => toggleSection('price')}
        >
          <div className="grid grid-cols-2 gap-2 pt-2 px-3">
            <div>
              <label className="text-[10px] text-ink-500 mb-1 block">Mínimo</label>
              <input
                type="number"
                placeholder={formatCurrency(facets.priceRange.min)}
                value={pending.priceMin ?? ''}
                onChange={rangeHandler('priceMin')}
                min={facets.priceRange.min}
                max={facets.priceRange.max}
                className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-ink-200 placeholder:text-ink-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="text-[10px] text-ink-500 mb-1 block">Máximo</label>
              <input
                type="number"
                placeholder={formatCurrency(facets.priceRange.max)}
                value={pending.priceMax ?? ''}
                onChange={rangeHandler('priceMax')}
                min={facets.priceRange.min}
                max={facets.priceRange.max}
                className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-ink-200 placeholder:text-ink-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="colors" label="Cor" count={pending.colors.length}
          open={openSections.has('colors')} onToggle={() => toggleSection('colors')}
        >
          {facets.colors.map((color) => (
            <FilterCheckbox
              key={color.value}
              checked={pending.colors.includes(color.value)}
              label={color.value}
              count={color.count}
              onChange={checkboxHandler('colors', color.value)}
            />
          ))}
        </CollapsibleSection>

        <CollapsibleSection
          id="mileage" label="Quilometragem"
          count={pending.mileageMin !== undefined || pending.mileageMax !== undefined ? 1 : 0}
          open={openSections.has('mileage')} onToggle={() => toggleSection('mileage')}
        >
          <div className="grid grid-cols-2 gap-2 pt-2 px-3">
            <div>
              <label className="text-[10px] text-ink-500 mb-1 block">Mínimo</label>
              <input
                type="number"
                placeholder={formatMileage(facets.mileageRange.min)}
                value={pending.mileageMin ?? ''}
                onChange={rangeHandler('mileageMin')}
                min={facets.mileageRange.min}
                max={facets.mileageRange.max}
                className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-ink-200 placeholder:text-ink-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="text-[10px] text-ink-500 mb-1 block">Máximo</label>
              <input
                type="number"
                placeholder={formatMileage(facets.mileageRange.max)}
                value={pending.mileageMax ?? ''}
                onChange={rangeHandler('mileageMax')}
                min={facets.mileageRange.min}
                max={facets.mileageRange.max}
                className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-ink-200 placeholder:text-ink-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="year" label="Ano"
          count={pending.yearMin !== undefined || pending.yearMax !== undefined ? 1 : 0}
          open={openSections.has('year')} onToggle={() => toggleSection('year')}
        >
          <div className="grid grid-cols-2 gap-2 pt-2 px-3">
            <div>
              <label className="text-[10px] text-ink-500 mb-1 block">Mínimo</label>
              <input
                type="number"
                placeholder={String(facets.yearRange.min)}
                value={pending.yearMin ?? ''}
                onChange={rangeHandler('yearMin')}
                min={facets.yearRange.min}
                max={facets.yearRange.max}
                className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-ink-200 placeholder:text-ink-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="text-[10px] text-ink-500 mb-1 block">Máximo</label>
              <input
                type="number"
                placeholder={String(facets.yearRange.max)}
                value={pending.yearMax ?? ''}
                onChange={rangeHandler('yearMax')}
                min={facets.yearRange.min}
                max={facets.yearRange.max}
                className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-ink-200 placeholder:text-ink-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );

  const filterCount = pending.brandIds.length + pending.modelIds.length + pending.fuelTypes.length
    + pending.transmissionTypes.length + pending.bodyTypes.length + pending.colors.length
    + pending.statuses.length + (pending.priceMin !== undefined ? 1 : 0)
    + (pending.priceMax !== undefined ? 1 : 0) + (pending.mileageMin !== undefined ? 1 : 0)
    + (pending.mileageMax !== undefined ? 1 : 0) + (pending.yearMin !== undefined ? 1 : 0)
    + (pending.yearMax !== undefined ? 1 : 0) + (pending.featured !== undefined ? 1 : 0);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="absolute inset-y-0 left-0 w-full max-w-sm shadow-2xl overflow-y-auto" style={{ background: '#0e1623', borderRight: '1px solid #1e2d42' }}>
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #1e2d42' }}>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-ink-500" />
                <h2 className="text-lg font-semibold text-ink-100">Filtros</h2>
                {filterCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                    {filterCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-[11px] font-semibold text-red-400 hover:text-red-300 transition-colors px-2 py-1"
                  >
                    Limpar
                  </button>
                )}
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="p-1.5 rounded-lg text-ink-500 hover:text-ink-300 hover:bg-white/5 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 pb-0">
              {filterContent}
            </div>

            <div className="sticky bottom-0 p-4" style={{ background: 'linear-gradient(to top, #0e1623 60%, transparent)' }}>
              <Button
                variant={hasChanges ? 'primary' : 'secondary'}
                fullWidth
                onClick={handleApply}
                className="h-11"
                disabled={!hasChanges}
              >
                {hasChanges ? 'Aplicar filtros' : 'Nenhuma alteração'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-72 flex-shrink-0 border-r sticky top-16 max-h-[calc(100vh-4rem)]" style={{ background: '#0e1623', borderColor: '#1e2d42' }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-ink-500" />
            <h2 className="text-base font-semibold text-ink-100">Filtros</h2>
            {filterCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                {filterCount}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              Limpar
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {filterContent}
        </div>

        <div className="p-4 border-t border-white/5">
          <Button
            variant={hasChanges ? 'primary' : 'secondary'}
            fullWidth
            onClick={handleApply}
            className="h-11"
            disabled={!hasChanges}
          >
            {hasChanges ? 'Aplicar filtros' : 'Nenhuma alteração'}
          </Button>
        </div>
      </aside>
    </>
  );
}
