'use client';

import { useState, useCallback } from 'react';
import { useQueryStates, parseAsBoolean, parseAsInteger, parseAsString } from 'nuqs';
import { VehicleCard } from '@/components/public/catalog/VehicleCard';
import { ViewModeToggle } from '@/components/public/catalog/ViewModeToggle';
import { VehicleFilterSidebar } from '@/components/public/catalog/VehicleFilterSidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/base/select';
import { Button } from '@/components/ui/base/button';
import { cn } from '@/lib/utils';
import { SlidersHorizontal, SearchX, RotateCcw, Loader2 } from 'lucide-react';
import type { VehicleSort, VehicleWithRelations, FacetsData } from '@/lib/vehicles';

interface CatalogClientProps {
  initialData: {
    vehicles: VehicleWithRelations[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    facets: FacetsData;
  };
}

type SidebarFilters = {
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

const FILTER_INIT: SidebarFilters = {
  brandIds: [], modelIds: [], fuelTypes: [], transmissionTypes: [],
  bodyTypes: [], colors: [], statuses: [],
  priceMin: undefined, priceMax: undefined,
  mileageMin: undefined, mileageMax: undefined,
  yearMin: undefined, yearMax: undefined,
  search: '', featured: undefined,
};

const INITIAL_PAGE = 1;
const INITIAL_SORT: VehicleSort = 'created_desc';

function buildApiQuery(filters: SidebarFilters, page: number, sort: VehicleSort, pageSize = 12): string {
  const p = new URLSearchParams();
  p.set('page', String(page));
  p.set('pageSize', String(pageSize));
  p.set('sort', sort);
  if (filters.search) p.set('search', filters.search);
  if (filters.featured) p.set('featured', 'true');
  filters.brandIds.forEach((id) => p.append('brandIds', id));
  filters.modelIds.forEach((id) => p.append('modelIds', id));
  filters.fuelTypes.forEach((f) => p.append('fuelTypes', f));
  filters.transmissionTypes.forEach((t) => p.append('transmissionTypes', t));
  filters.bodyTypes.forEach((b) => p.append('bodyTypes', b));
  filters.colors.forEach((c) => p.append('colors', c));
  if (filters.priceMin !== undefined) p.set('priceMin', String(filters.priceMin));
  if (filters.priceMax !== undefined) p.set('priceMax', String(filters.priceMax));
  if (filters.mileageMin !== undefined) p.set('mileageMin', String(filters.mileageMin));
  if (filters.mileageMax !== undefined) p.set('mileageMax', String(filters.mileageMax));
  if (filters.yearMin !== undefined) p.set('yearMin', String(filters.yearMin));
  if (filters.yearMax !== undefined) p.set('yearMax', String(filters.yearMax));
  return `/api/catalog?${p.toString()}`;
}

export default function CatalogClient({ initialData }: CatalogClientProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // URL state — only sort/viewMode (filters are local to avoid full page reload)
  const [urlState, setUrlState] = useQueryStates({
    viewMode: { defaultValue: 'grid' as 'grid' | 'list', parse: (v) => (v === 'list' ? 'list' : 'grid'), serialize: (v) => v },
    sort: { defaultValue: INITIAL_SORT, parse: (v) => v as VehicleSort, serialize: (v) => v },
    page: { defaultValue: INITIAL_PAGE, parse: (v) => Number(v) || 1, serialize: (v) => String(v) },
  });

  const { viewMode, sort, page } = urlState;

  // Applied filters — updated only on "Aplicar" click
  const [applied, setApplied] = useState<SidebarFilters>(FILTER_INIT);

  // Data state
  const [vehicles, setVehicles] = useState(initialData.vehicles);
  const [total, setTotal] = useState(initialData.total);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [facets, setFacets] = useState<FacetsData>(initialData.facets);
  const [loading, setLoading] = useState(false);

  const fetchCatalog = useCallback(async (filters: SidebarFilters, p: number, s: VehicleSort, append = false) => {
    setLoading(true);
    try {
      const url = buildApiQuery(filters, p, s);
      const res = await fetch(url);
      const data = await res.json();
      setVehicles(prev => append ? [...prev, ...data.vehicles] : data.vehicles);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setFacets(data.facets);
    } catch {
      // Keep current data on error
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = (next: SidebarFilters) => {
    setApplied(next);
    void setUrlState({ page: INITIAL_PAGE });
    void fetchCatalog(next, INITIAL_PAGE, sort);
  };

  const handleFilterChange = (next: Partial<SidebarFilters>) => {
    const merged = { ...applied, ...next };
    applyFilters(merged);
  };

  const clearFilters = () => {
    const cleared = { ...FILTER_INIT };
    setApplied(cleared);
    void setUrlState({ page: INITIAL_PAGE });
    void fetchCatalog(cleared, INITIAL_PAGE, sort);
  };

  const loadMore = () => {
    const newPage = page + 1;
    void setUrlState({ page: newPage });
    void fetchCatalog(applied, newPage, sort, true);
  };

  const handleSortChange = (newSort: VehicleSort) => {
    void setUrlState({ sort: newSort });
    void fetchCatalog(applied, page, newSort);
  };

  const hasActiveFilters = Object.values(applied).some(v =>
    Array.isArray(v) ? v.length > 0 : v !== undefined && v !== ''
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen pt-20" style={{ background: '#080d16' }}>
      <VehicleFilterSidebar
        facets={facets}
        filters={applied}
        onChange={handleFilterChange}
        mobileOpen={mobileFiltersOpen}
        onMobileClose={() => setMobileFiltersOpen(false)}
      />

      <main className="flex-1 min-w-0 p-4 lg:p-6 relative">
        <div className="sticky top-16 z-10 pb-4 mb-6" style={{ background: '#080d16', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#f0f4f8' }}>Veículos</h1>
              <p className="text-sm" style={{ color: '#4a5568' }}>{total} veículos encontrados</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </Button>
              <ViewModeToggle viewMode={viewMode} onChange={v => void setUrlState({ viewMode: v })} />
              <Select
                value={sort}
                onValueChange={(value: VehicleSort) => handleSortChange(value)}
              >
                <SelectTrigger className="w-auto min-w-[140px] sm:w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_desc">Mais recentes</SelectItem>
                  <SelectItem value="created_asc">Mais antigos</SelectItem>
                  <SelectItem value="price_asc">Menor preço</SelectItem>
                  <SelectItem value="price_desc">Maior preço</SelectItem>
                  <SelectItem value="year_desc">Ano (recente)</SelectItem>
                  <SelectItem value="year_asc">Ano (antigo)</SelectItem>
                  <SelectItem value="mileage_asc">Menor km</SelectItem>
                  <SelectItem value="mileage_desc">Maior km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className={`
          ${viewMode === 'grid' ? 'grid gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col gap-4'}
          ${loading ? 'opacity-40 pointer-events-none transition-opacity' : ''}
        `}>
          {vehicles.length === 0 && !loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-ink-500">
              <div className="h-16 w-16 rounded-2xl bg-ink-800 flex items-center justify-center mb-4">
                <SearchX size={28} />
              </div>
              <p className="text-lg font-semibold text-ink-300">Nenhum veículo encontrado</p>
              <p className="text-sm mt-1">Tente ajustar os filtros ou buscar por outros termos.</p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            vehicles.map((vehicle, index) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} listMode={viewMode === 'list'} />
            ))
          )}
        </div>

        {loading && (
          <div className="absolute inset-0 z-10 flex items-start justify-center pt-32" style={{ top: '120px' }}>
            <div className="flex items-center gap-3 bg-ink-900/80 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-lg border border-white/5">
              <Loader2 size={16} className="text-primary-400 animate-spin" />
              <span className="text-sm text-ink-300 font-medium">Carregando...</span>
            </div>
          </div>
        )}

        {page < totalPages && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              size="lg"
              disabled={loading}
              onClick={loadMore}
              className="px-8 py-6 rounded-full font-semibold border-white/10 hover:bg-white/5 transition-all text-white hover:text-primary-400"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Carregando...
                </>
              ) : (
                'Ver mais veículos'
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
