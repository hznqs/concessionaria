---
name: nextjs-admin-panel
description: Build admin panels with Next.js App Router, Prisma, NextAuth, TanStack Table, and server-side data fetching. Use when creating admin CRUD interfaces, dashboards, or internal tools with this stack.
---

# Next.js Admin Panel

Production-ready admin panel pattern using Next.js 14 App Router, Prisma (Postgres), NextAuth JWT, TanStack Table, and Tailwind CSS.

## When to Use

- Building admin/panel routes for a Next.js app
- CRUD interfaces for database entities
- Dashboards with KPIs and charts
- Internal tools needing auth + role-based access

## Architecture

```
src/
├── app/(admin)/
│   ├── painel/
│   │   ├── layout.tsx          # Auth check + sidebar + topbar
│   │   ├── page.tsx            # Dashboard (server component)
│   │   └── estoque/
│   │       ├── page.tsx        # List (server component)
│   │       ├── novo/page.tsx   # Create form
│   │       └── [id]/page.tsx   # Edit form
├── components/admin/
│   ├── sidebar.tsx
│   ├── topbar.tsx
│   ├── stock-table.tsx         # TanStack Table (client)
│   └── command-palette.tsx
├── app/api/
│   ├── vehicles/route.ts       # GET list + POST create
│   └── vehicles/[id]/route.ts  # GET one + PUT update + DELETE
└── lib/
    ├── admin-auth.ts           # requireAdmin() + requireCsrf()
    └── auth.ts                 # NextAuth config
```

## Key Patterns

### 1. Layout with Auth Guard

```tsx
// src/app/(admin)/painel/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const session = await getServerSession();
  if (!session) redirect("/login");
  return (
    <SessionProvider>
      <NuqsAdapter>
        <AdminSidebar />
        <AdminTopbar />
        <main>{children}</main>
      </NuqsAdapter>
    </SessionProvider>
  );
}
```

### 2. Server Component Data Fetching

Admin pages are **server components** that fetch directly via Prisma (no API calls for initial render):

```tsx
// src/app/(admin)/painel/estoque/page.tsx
import { prisma } from "@/lib/prisma";

export default async function StockPage() {
  const vehicles = await prisma.vehicle.findMany({
    include: { brand: true, model: true, images: { where: { isCover: true }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });
  return <StockTable vehicles={vehicles} />;
}
```

### 3. Client-side Table (TanStack Table)

```tsx
"use client";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel } from "@tanstack/react-table";

export function StockTable({ vehicles }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const table = useReactTable({
    data: vehicles,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { globalFilter },
  });
  // Render table...
}
```

### 4. CRUD API Pattern

Every mutating endpoint follows this structure:

```ts
// src/app/api/vehicles/[id]/route.ts
import { requireCsrf, requireAdmin } from "@/lib/admin-auth";
import { revalidateTag } from "next/cache";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await requireCsrf(req);        // CSRF check (custom header)
  await requireAdmin();           // Auth + role check
  const body = await req.json();
  const data = updateVehicleSchema.parse(body);  // Zod validation

  const vehicle = await prisma.vehicle.update({
    where: { id: params.id },
    data: { /* scalar fields */ },
  });

  revalidateTag("vehicles");     // Invalidate catalog cache
  return Response.json(vehicle);
}

export const runtime = "nodejs";  // Required for Prisma
```

### 5. Multi-step Form (React Hook Form)

```tsx
const schema = z.object({ /* ALL fields across all steps */ });
const stepFields = {
  1: ["title", "brandId", "modelId", "price"],
  2: ["images"],      // useFieldArray
  3: ["featureIds"],
  4: ["chassisNumber", "plate"],
};

// On "Next": trigger(stepFields[step]) validates only current step
// Final submit validates entire schema
```

**Critical**: The final save button must be `type="button"` with explicit `handleExplicitSubmit()` to prevent Enter-key auto-submit.

### 6. Cache Invalidation

```ts
// On every create/update/delete:
revalidateTag("vehicles");   // Public catalog
revalidateTag("dashboard");  // Admin dashboard KPIs
```

## Gotchas

- **`export const runtime = "nodejs"`** required on any route using Prisma, Sharp, or Node.js APIs
- Route groups `(admin)` don't affect URL paths
- `notFound()` from `next/navigation`, not from React
- Stock table is fully client-side after initial server fetch (no re-fetching on status change)
- Images replaced via delete-all + re-create pattern, not individual upserts
- `NEXTAUTH_SECRET` must be set or JWT signing fails between API (Node.js) and middleware (Edge)
