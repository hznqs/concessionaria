---
name: catalog-filtering
description: Build catalog/product listing pages with server-side filtering, faceted search, and client-side filter UI with deferred apply. Use when building e-commerce catalogs, product listings, or any filtered data view.
---

# Catalog Filtering

Dual-layer filtering: server-side API with Zod validation + client-side pending/applied pattern with deferred apply.

## When to Use

- Product/vehicle/catalog listing pages
- Faceted search (checkboxes with counts)
- Filter + sort + pagination combos
- Any listing that needs URL-shareable sort but local filter state

## Architecture

```
page.tsx (Server Component)
  ↓ parse searchParams, fetch initial data via Prisma
  ↓ pass initialData to CatalogClient
CatalogClient.tsx (Client Component)
  ↓ manages: applied filters (useState), sort/page/viewMode (nuqs → URL)
  ↓ on filter/sort/page change → fetch /api/catalog
  ↓ renders VehicleGrid + VehicleFilterSidebar
VehicleFilterSidebar.tsx
  ↓ pending state (local edits) vs filters (applied from parent)
  ↓ "Aplicar filtros" button (disabled when no changes)
/api/catalog/route.ts
  ↓ Zod validate → getVehicles() + getFacets() → JSON response
```

## Key Files

| File | Purpose |
|------|---------|
| `src/app/(public)/veiculos/page.tsx` | Server component, initial fetch |
| `src/app/(public)/veiculos/CatalogClient.tsx` | Client filter state + data fetching |
| `src/components/public/catalog/VehicleFilterSidebar.tsx` | Filter sidebar UI |
| `src/app/api/catalog/route.ts` | Public catalog API |
| `src/lib/vehicles.ts` | Query logic, schemas, caching |

## Server Component (Initial Fetch)

```tsx
// page.tsx
import { getVehicles, getFacets } from "@/lib/vehicles";

export default async function CatalogPage({ searchParams }) {
  const filters = VehicleFiltersSchema.parse(searchParams);
  const pagination = PaginationSchema.parse(searchParams);
  const sort = VehicleSortSchema.parse(searchParams.sort);

  const [vehicles, facets, total] = await Promise.all([
    getVehicles(filters, pagination, sort),
    getFacets(filters),
    getVehicleCount(filters),
  ]);

  return (
    <CatalogClient
      initialData={{ vehicles, facets, total, totalPages: Math.ceil(total / pagination.pageSize) }}
      initialFilters={filters}
    />
  );
}
```

## Client-side Filter State

```tsx
// CatalogClient.tsx
"use client";

export function CatalogClient({ initialData, initialFilters }) {
  // URL state: only sort, viewMode, page (shareable)
  const [{ sort, viewMode, page }, setQuery] = useQueryStates({
    sort: parseAsString.withDefault("newest"),
    viewMode: parseAsString.withDefault("grid"),
    page: parseAsInteger.withDefault(1),
  });

  // Filter state: local (not in URL)
  const [applied, setApplied] = useState(initialFilters);
  const [data, setData] = useState(initialData);

  // Fetch on any change
  useEffect(() => {
    fetchCatalog({ ...applied, sort, page });
  }, [applied, sort, page]);

  return (
    <>
      <VehicleFilterSidebar
        filters={applied}
        onApply={setApplied}
        facets={data.facets}
      />
      <VehicleGrid vehicles={data.vehicles} viewMode={viewMode} />
    </>
  );
}
```

## Pending / Applied Pattern

The sidebar maintains separate pending (edits) vs applied (committed) state:

```tsx
// VehicleFilterSidebar.tsx
export function VehicleFilterSidebar({ filters, onApply, facets }) {
  const [pending, setPending] = useState(filters);
  const [openSections, setOpenSections] = useState(new Set(["brands", "price"]));

  // Sync when parent clears filters
  useEffect(() => { setPending(filters); }, [filters]);

  const hasChanges = JSON.stringify(pending) !== JSON.stringify(filters);

  function toggleArrayFilter(field: string, value: string) {
    setPending(prev => {
      const current = prev[field] || [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  }

  return (
    <aside>
      <CollapsibleSection title="Marcas" open={openSections.has("brands")}>
        {facets.brands.map(brand => (
          <FilterCheckbox
            key={brand.id}
            label={brand.name}
            count={brand.count}
            checked={pending.brandIds?.includes(brand.id)}
            onChange={() => toggleArrayFilter("brandIds", brand.id)}
          />
        ))}
      </CollapsibleSection>

      <button
        onClick={() => onApply(pending)}
        disabled={!hasChanges}
        className="disabled:opacity-40"
      >
        Aplicar filtros
      </button>
    </aside>
  );
}
```

**Critical**: `CollapsibleSection` and `FilterCheckbox` must be defined **outside** the parent component to avoid React hydration mismatches.

## Server-side Filter Building

```ts
// src/lib/vehicles.ts
function buildVehicleWhere(filters: VehicleFilters): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = { status: "AVAILABLE" };

  if (filters.brandIds?.length) where.brandId = { in: filters.brandIds };
  if (filters.fuelTypes?.length) where.fuelType = { in: filters.fuelTypes };
  if (filters.priceMin || filters.priceMax) {
    where.price = {
      ...(filters.priceMin && { gte: filters.priceMin }),
      ...(filters.priceMax && { lte: filters.priceMax }),
    };
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { brand: { name: { contains: filters.search, mode: "insensitive" } } },
      { model: { name: { contains: filters.search, mode: "insensitive" } } },
    ];
  }
  return where;
}
```

## Faceted Search (Parallel Queries)

```ts
export async function getFacets(filters: VehicleFilters) {
  const where = { ...buildVehicleWhere(filters), status: "AVAILABLE" as const };

  const [brands, models, fuelTypes, transmissionTypes, bodyTypes, colors, priceRange, mileageRange, yearRange] =
    await Promise.all([
      prisma.brand.findMany({ where: { vehicles: { some: where } }, include: { _count: { select: { vehicles: true } } } }),
      prisma.carModel.findMany({ where: { vehicles: { some: where } }, include: { _count: { select: { vehicles: true } } } }),
      prisma.vehicle.groupBy({ by: ["fuelType"], where, _count: true }),
      // ... 6 more parallel queries
    ]);

  return { brands, models, fuelTypes, /* ... */ };
}
```

## API Route

```ts
// src/app/api/catalog/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filters = VehicleFiltersSchema.parse(Object.fromEntries(searchParams));
  const pagination = PaginationSchema.parse(Object.fromEntries(searchParams));
  const sort = VehicleSortSchema.parse(searchParams.get("sort"));

  const [vehicles, facets, total] = await Promise.all([
    getVehicles(filters, pagination, sort),
    getFacets(filters),
    getVehicleCount(filters),
  ]);

  return Response.json({
    vehicles,
    total,
    totalPages: Math.ceil(total / pagination.pageSize),
    facets,
  });
}

export const runtime = "nodejs";
```

## Gotchas

- **Filter state NOT in URL**: Deliberate tradeoff — avoids full page reload on filter change. Only sort/page/viewMode are in URL.
- **Models depend on brands**: Show models section only when `brandIds.length > 0`; filter model list to selected brands' models only.
- **Facets always AVAILABLE**: Even if main query includes other statuses, facets always count only `AVAILABLE` vehicles.
- **Zod validation on both sides**: Client sends parsed values, server re-validates with same schema.
- **`unstable_cache` with 60s revalidation**: Both `getVehicles` and `getFacets` are cached. Invalidated via `revalidateTag("vehicles")`.
- **Mobile sidebar**: Full-screen overlay with `document.body.style.overflow` lock. Restore on unmount.
