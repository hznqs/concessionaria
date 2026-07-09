# AutoPrime Platform - Project Review Report

**Date:** 2026-07-06  
**Version:** 0.1.0  
**Stack:** Next.js 14 (App Router), Prisma/Neon Postgres, NextAuth, Tailwind CSS, Radix UI, Framer Motion

---

## 1. SECURITY REVIEW

### ✅ Strengths

| Area | Implementation |
|------|----------------|
| **Authentication** | NextAuth v4 with CredentialsProvider + bcryptjs. JWT strategy, 24h session maxAge. Role-based (ADMIN/SUPER_ADMIN). |
| **Rate Limiting** | `PersistentRateLimiter` using PostgreSQL (`login_attempts` table). Atomic UPSERT with window/lock logic. Fail-open on DB errors. Applied to login (10/15min per IP+email) and IP-only (20/min). |
| **CSRF Protection** | Custom header `x-requested-by: autoprime` required on all non-GET admin API routes. `requireCsrf()` throws on mismatch. |
| **Admin Authorization** | Middleware protects `/painel/*` — verifies JWT + role via `getToken()`. `requireAdmin()` / `requireCsrf()` used in all admin API routes. |
| **Input Validation** | Zod schemas on all public/admin endpoints. Strict schemas (`.strict()`) reject unknown fields. |
| **File Upload** | Magic-byte detection (JPEG/PNG/WebP/AVIF), 10MB limit, sharp resize (1600×900, q75 WebP), R2 storage. Rejects non-images. |
| **Security Headers** | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy via `next.config.mjs headers()`. |
| **Sensitive Data** | `Vehicle` GET excludes `chassis`, `plate`, `internalNotes`, `views`, `soldAt` from public responses. Admin-only fields. |
| **Password Handling** | `bcryptjs` with dummy-hash fallback to prevent timing attacks. |

### ⚠️ Issues & Recommendations

| Severity | Issue | Recommendation |
|----------|-------|----------------|
| **Medium** | `loginLimiter` key uses `ip:email` — IP from headers can be spoofed behind proxies. | Use `x-forwarded-for` first proxy IP consistently; consider adding `cf-connecting-ip` for Cloudflare. |
| **Medium** | `NEXTAUTH_SECRET` check logs critical error but doesn't throw — app starts without it. | Add `if (!process.env.NEXTAUTH_SECRET) throw new Error(...)` in `auth.ts` to fail fast. |
| **Low** | `requireCsrf` only checks header — no token validation (stateless). | For higher assurance, implement double-submit cookie pattern or use `next-auth` CSRF token. |
| **Low** | `R2` upload lacks server-side MIME verification after sharp processing (already WebP). | Current sharp pipeline is sufficient; add explicit `webp` output format check if needed. |
| **Low** | `deleteFromR2` extracts filename from URL — could be manipulated if URL malformed. | Use stored `publicId` from DB instead of parsing URL; already tracked in `VehicleImage.publicId`. |
| **Info** | `favorites` uses `localStorage` — no server sync. Acceptable for ephemeral feature. | Consider server-backed favorites for logged-in favorites if auth expands to customers. |

---

## 2. RESPONSIVENESS & UX REVIEW

### ✅ Strengths

| Area | Implementation |
|------|----------------|
| **Breakpoints** | Tailwind `xs: 480px`, default `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`. Custom `xs` for tight mobile. |
| **Mobile-First** | Components use `grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` pattern. Sidebar collapses to mobile drawer. |
| **Scrollable Filters** | `VehicleFilterSidebar` uses sticky header + scrollable content with gradient fade. Mobile drawer with backdrop blur. |
| **Touch Targets** | Buttons/inputs ≥ 44px (`.h-11`, `.h-9`, `.py-2.5`). Checkbox hit areas use full `<button>` wrapper. |
| **Image Optimization** | `next/image` with `fill`, `sizes` per breakpoint, `priority` for first 4 cards (LCP). WebP via sharp + R2. |
| **Loading States** | Skeleton (pulse), spinners, opacity overlay during fetch. `isPending` from `useTransition` for sort/page. |
| **Animations** | Framer Motion `fade-up`, `stagger`, `hover:-translate-y-1`, `TiltCard` (disabled). Respects `prefers-reduced-motion` via hook. |
| **Accessibility** | Semantic HTML, `aria-label` on icon buttons, `role="alert"` for toasts, `SkipLink` component, focus-visible rings. |
| **Whitespace** | Consistent spacing scale (4px base). `gap-4/5/6`, `p-4/5/6`, `space-y-4`. Dark theme with proper contrast ratios. |

### ⚠️ Issues & Recommendations

| Severity | Issue | Recommendation |
|----------|-------|----------------|
| **Medium** | Mobile filter drawer `max-h-[calc(100vh-24rem)]` assumes fixed header height; may overflow on small screens. | Use `dvh` unit or `calc(100dvh - ...)` with CSS custom property for header height. |
| **Medium** | `VehicleCard` image `group-hover:scale-105` on desktop — no touch equivalent on mobile. | Add `active:scale-[1.02]` or tap-to-zoom modal for mobile. |
| **Low** | `scrollbar-hide` utility not in Tailwind config — relies on custom CSS. | Add `@tailwindcss/utilities` or define `.scrollbar-hide` in global CSS. |
| **Low** | `BrandStrip` (home) only shows 8 brands — no "show more" or scroll on mobile. | Add horizontal scroll with gradient fade or pagination. |
| **Low** | `Select` dropdown (sort) on mobile — Radix `SelectContent` may overflow viewport. | Add `sideOffset: 5` and `collisionPadding: 10` via Radix props. |

---

## 3. BUSINESS RULES & FUNCTIONALITY REVIEW

### ✅ Implemented Business Logic

| Domain | Rules |
|--------|-------|
| **Vehicle Status** | `AVAILABLE` (public), `RESERVED`, `SOLD`. Public catalog only shows `AVAILABLE`. Admin can set any. `soldAt` auto-set on status→SOLD, cleared on status change away from SOLD. |
| **Featured Vehicles** | Boolean flag. Home shows max 6 featured. Catalog has `?featured=true`. |
| **Brand/Model Hierarchy** | `Brand (active)` → `CarModel (active, brandId)` → `Vehicle`. Upsert on create prevents duplicates. |
| **Pricing** | `price` (Decimal 12,2), `oldPrice` optional for strikethrough. Installment calc: `(price * 0.8 / 48)` or `(price * 1.35 / 60)` on home card. |
| **Images** | Multiple per vehicle, one `isCover`. Order via `order` field. Cover used in lists. R2 storage with public URL. |
| **Features (M:N)** | `Feature` with categories (COMFORT, SAFETY, etc.). `VehicleFeature` join table. Admin manages via checkbox grid. |
| **Leads/CRM** | `Lead` with `origin` (WEBSITE, WHATSAPP, PHONE, IN_PERSON, SOCIAL_MEDIA), `status` (NEW→CONTACTED→NEGOTIATING→WON/LOST), optional `proposal`, `vehicleId` link. Admin Kanban board. |
| **Favorites** | Client-side `localStorage` (`autoprime_favorites`). Heart button on cards. `/favoritos` page. |
| **Views Counter** | `/api/vehicles/[id]/views` POST increments `views` (atomic). |
| **WhatsApp Integration** | Normalized to `55xxxxxxxxxx`. Used in hero CTA, contact pages, vehicle detail. Configurable via `Setting` table. |
| **Dynamic Settings** | Key-value `Setting` table. Company info, hours, socials, about text. Cached 60s. |

### ⚠️ Gaps & Recommendations

| Area | Gap | Recommendation |
|------|-----|----------------|
| **Lead Notification** | No email/SMS/webhook on new lead. | Add `revalidateTag('leads')` + background job (e.g., `pg_cron` or Vercel Cron) to notify sales team. |
| **Vehicle History** | No audit log for price/status changes. | Add `VehicleHistory` table or use Prisma middleware to log mutations. |
| **Reservation Expiry** | `RESERVED` status has no auto-expiry. | Add `reservedUntil` field + nightly cron to revert to `AVAILABLE`. |
| **Financing Calculator** | Hardcoded formulas (20% down, 48/60 months, fixed rates). | Move rates/terms to `Setting` table; create reusable `FinancingCalculator` component (already exists for detail page). |
| **SEO/Schema** | Home has `AutoDealer` JSON-LD. Vehicle detail missing `Vehicle` schema. | Add `Product`/`Vehicle` structured data on `/veiculos/[slug]`. |
| **Image SEO** | `alt` from `VehicleImage.alt` or title. No filename optimization. | Auto-generate `alt` from brand/model/year if empty. |
| **Test Drive Booking** | Not implemented. | Add `TestDrive` model + slot selection + calendar integration. |

---

## 4. PERFORMANCE & ARCHITECTURE REVIEW

### ✅ Strengths

| Area | Implementation |
|------|----------------|
| **Caching Strategy** | `unstable_cache` (60s revalidate, tags: `vehicles`, `leads`, `dashboard`, `settings`). `revalidateTag` on mutations. |
| **Database** | Neon Postgres + Prisma with `@prisma/adapter-neon` (WebSocket pool). Global `prisma` singleton for dev hot-reload. |
| **Data Fetching** | Server components fetch initial data (`getVehicles`, `getFacets`). Client `CatalogClient` fetches filtered data via `/api/catalog` (client-side, no full reload). |
| **Pagination** | Server-side pagination (`skip`/`take`). Page size default 12, max 50. |
| **Facets** | Aggregated counts per filter dimension (brands, models, fuel, transmission, body, color, price/mileage/year ranges). Cached 60s. |
| **Image Pipeline** | Sharp resize (1600×900, q75 WebP). R2 with `Cache-Control: public, max-age=31536000, immutable`. |
| **Code Splitting** | Dynamic imports for heavy components (admin charts, lead forms). `use client` only where needed. |
| **Bundle** | First Load JS ~154kB (home), ~200kB (catalog). `lucide-react` tree-shaken. Radix UI primitives. |

### ⚠️ Issues & Recommendations

| Severity | Issue | Recommendation |
|----------|-------|----------------|
| **High** | `/api/catalog` is fully dynamic (uses `searchParams`) — cannot be statically generated. | Acceptable for catalog; ensure edge caching via `export const dynamic = 'force-dynamic'`. |
| **Medium** | `getFacets` runs 9 parallel queries — could be heavy under load. | Consider materialized view or pre-aggregated table refreshed via cron. |
| **Medium** | `VehicleCard` includes full `brand`/`model` objects — over-fetching for lists. | Use `select` with only needed fields (`id`, `name`, `slug`). |
| **Medium** | No `sitemap.xml` dynamic generation for vehicle pages. | `src/app/sitemap.ts` exists — verify it includes all vehicle slugs. |
| **Low** | `unstable_cache` tags (`vehicles`, `leads`) — manual `revalidateTag` on every mutation. | Add Prisma middleware to auto-revalidate tags on `vehicle`/`lead` changes. |
| **Low** | `next/image` `sizes` attribute uses viewport-based values — may not match actual layout on all breakpoints. | Use `sizes` matching exact grid columns per breakpoint (already close). |

---

## 5. CODE QUALITY & MAINTAINABILITY

### ✅ Patterns Used

- **Type Safety**: Zod schemas → `z.infer` types. Prisma enums → TS enums. `VehicleWithRelations` / `FacetsData` explicit types.
- **Component Composition**: `FormProvider` + `react-hook-form` + per-step components. Radix UI primitives wrapped in `ui/base`.
- **State Management**: `nuqs` for URL state (sort, viewMode, page). `useState`/`useReducer` for local UI state. `localStorage` for favorites.
- **API Layer**: `apiFetch` wrapper adds CSRF header. Consistent error handling (`z.ZodError` → 400, Prisma P2025 → 404).
- **Utils**: `cn` (clsx + tailwind-merge), `formatCurrency`, `formatMileage`, label maps for enums.
- **Design System**: Tailwind config with `primary`, `ink`, `success`, `warning` palettes. CSS variables for fonts. `STATUS_CONFIG` for badge styling.

### ⚠️ Technical Debt

| File | Issue |
|------|-------|
| `stock-table.tsx` | `useMemo` missing `router` dependency (ESLint warning). |
| `ConfiguracoesClient.tsx` | Multiple `<img>` instead of `next/image` (LCP warnings). |
| `BannerCarousel` | `<img>` instead of `next/image`. |
| `avatar.tsx` | `<img>` instead of `next/image`. |
| `vehicle-form/step-4-internal` | `chassis`/`plate` validation duplicates logic from schema. |

---

## 6. DEPLOYMENT & OPERATIONS

### Vercel Configuration (per AGENTS.md)
- **Required Env Vars**: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (or rely on `VERCEL_URL`), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (seed only).
- **Troubleshooting Login**: `/api/debug-auth`, Vercel Function Logs (`[AUTH]`, `[LOGIN]`, `[AUTH:middleware]`), check `__Secure-next-auth.session-token` cookie.

### Database
- **Migrations**: `prisma migrate dev` (local), `prisma migrate deploy` (prod).
- **Seed**: `npx prisma db seed` → creates admin user from `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

---

## SUMMARY SCORECARD

| Category | Score | Notes |
|----------|-------|-------|
| **Security** | 8.5/10 | Strong auth, rate limiting, CSRF, validation. Minor: fail-fast on missing secret. |
| **Responsiveness/UX** | 8/10 | Mobile-first, good touch targets, animations respect reduced motion. Mobile drawer height edge case. |
| **Business Logic** | 8/10 | Complete vehicle/lead/CRM flow. Missing: notifications, reservation expiry, audit log. |
| **Performance** | 8/10 | Good caching, image optimization, client-side filter fetch. Facet queries could be optimized. |
| **Code Quality** | 8/10 | Type-safe, consistent patterns. Minor ESLint warnings, some `<img>` → `next/image` migrations needed. |
| **Operations** | 9/10 | Clear env requirements, debug endpoint, seed script, migration strategy. |

**Overall: 8.2/10** — Production-ready with minor hardening opportunities.

---

## PRIORITY FIXES (Next Sprint)

1. **Fail-fast on missing `NEXTAUTH_SECRET`** — throw in `auth.ts` startup.
2. **Add `Vehicle` JSON-LD structured data** on detail page for SEO.
3. **Lead notification webhook** — Vercel Cron + email/Slack.
4. **Reservation auto-expiry** — `reservedUntil` + nightly cron.
5. **Fix `scrollbar-hide` utility** — add to global CSS or Tailwind config.
6. **Audit log** — Prisma middleware for `vehicle`/`lead` mutations.
7. **Replace remaining `<img>` with `next/image`** in admin components.