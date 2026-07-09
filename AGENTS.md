# AutoPrime Platform - Development Guide

## Commands

- **Typecheck**: `npx tsc --noEmit`
- **Build**: `npm run build`
- **Dev**: `npm run dev`
- **Lint**: `npm run lint` (if configured)
- **Prisma Generate**: `npx prisma generate`
- **Prisma Migrate**: `npx prisma migrate dev`
- **Seed**: `npx prisma db seed`

## Project Structure

- **Framework**: Next.js 14 (App Router), Prisma (Neon Postgres), NextAuth
- **UI**: Tailwind CSS, Radix UI, Framer Motion, Lenis smooth scroll, Embla Carousel
- **State**: nuqs (URL state), localStorage (user prefs)
- **Tables/Lists**: TanStack Table + Virtual

## Production Deployment (Vercel)

### Environment Variables (must be set in Vercel Dashboard)
- `DATABASE_URL` — Neon Postgres connection string
- `NEXTAUTH_SECRET` — JWT signing secret (CRÍTICO: sem ele, JWT entre API Node.js e middleware Edge fica inconsistente)
- `NEXTAUTH_URL` — Opcional. Se não definido, o código usa `VERCEL_URL` como fallback automaticamente. NÃO definir como `http://localhost:3000` em produção.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — Usados apenas no seed local

### Troubleshooting Login (Vercel)
1. Acesse `/api/debug-auth` para verificar DB + env health
2. Verifique os Vercel Function Logs pelos prefixos `[AUTH]`, `[LOGIN]`, `[AUTH:middleware]`
3. Se o login retorna 200 mas não redireciona → provavelmente `NEXTAUTH_SECRET` não está definido
4. Abra o DevTools > Network e confira se o cookie `__Secure-next-auth.session-token` está sendo setado
5. Se o middleware redireciona de volta ao `/login?callbackUrl=...`, o token JWT não foi verificado

## Key Conventions

- Use `primary-` color tokens (not `prime-`) for new components
- Route group `(public)` for public site, `(admin)` for dashboard
- Vehicle catálogo: `/veiculos`, detail: `/veiculos/[slug]`
- Client components must have `'use client'` directive
- Server components fetch data via `@/lib/vehicles` queries
- `@/lib/utils` exports: `cn`, `formatCurrency`, `formatMileage`, `FUEL_LABELS`, `TRANSMISSION_LABELS`, `BODY_TYPE_LABELS`, `STATUS_CONFIG`, `calculatePMT`