# AutoPrime Platform - Arquitetura do Sistema

## Visão Geral

Plataforma completa de concessionária de veículos premium/seminovos construída com **Next.js 14 (App Router)**, **Prisma ORM** + **PostgreSQL (Neon)** e **NextAuth.js** para autenticação.

---

## Stack Tecnológico

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 14.2.4 (App Router, RSC, Server Actions) |
| Linguagem | TypeScript 5 (strict mode) |
| Banco de Dados | PostgreSQL (Neon serverless) + Prisma ORM 5.14 |
| Autenticação | NextAuth.js v4 (Credentials + JWT) |
| Styling | Tailwind CSS 3.4 + Radix UI + class-variance-authority |
| Animações | Framer Motion 11 + Framer Motion Scroll |
| Carrossel | Embla Carousel React 8.6 |
| Tabelas/Virtualização | TanStack Table 8 + TanStack Virtual 3 |
| Forms | React Hook Form 7 + Zod + ZSA (Server Actions) |
| Validação | Zod 3.23 |
| Upload/Imagens | Sharp + Upload customizado (Cloudinary/S3 ready) |
| Charts | Recharts 3.9 |
| SEO/Schema | JSON-LD estruturado (AutoDealer schema.org) |

---

## Arquitetura de Pastas

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Route Group - Páginas Públicas
│   │   ├── page.tsx              # Home (Server Component com RSC)
│   │   ├── layout.tsx            # Layout público (Header/Footer/Providers)
│   │   ├── catalogo/             # Catálogo de veículos (Server + Client)
│   │   ├── veiculos/[slug]/      # PDP - Página de detalhes do veículo
│   │   ├── favoritos/            # Favoritos do usuário (Client)
│   │   ├── venda/                # Formulário "Venda seu carro"
│   │   ├── contato/              # Contato
│   │   ├── sobre/                # Sobre nós
│   │   └── unidades/             # Lojas/Unidades
│   │
│   ├── (admin)/                  # Route Group - Área Administrativa
│   │   ├── layout.tsx            # Layout admin (Sidebar + Auth guard)
│   │   ├── login/                # Login admin
│   │   ├── painel/               # Dashboard
│   │   │   ├── page.tsx          # Dashboard overview (Server)
│   │   │   ├── estoque/          # Gestão de estoque (Server + Client)
│   │   │   │   ├── page.tsx      # Listagem com TanStack Table + Virtual
│   │   │   │   └── novo/         # Cadastro multi-step (Client)
│   │   │   └── leads/            # Gestão de leads (Server)
│   │
│   ├── api/                      # API Routes (REST + Server Actions via ZSA)
│   │   ├── auth/[...nextauth]/   # NextAuth.js
│   │   ├── vehicles/             # CRUD veículos
│   │   │   ├── route.ts          # GET (list/filter) + POST (create)
│   │   │   ├── [id]/route.ts     # GET/PUT/DELETE single
│   │   │   └── favorites/route.ts # Favoritos (GET/POST/DELETE)
│   │   ├── brands/route.ts       # Marcas (catálogo público)
│   │   ├── leads/route.ts        # Leads (POST create)
│   │   └── upload/route.ts       # Upload imagens (Sharp + Cloudinary/S3)
│   │
│   ├── globals.css               # Tailwind + CSS Variables (Design System)
│   └── layout.tsx                # Root layout (Providers + Fonts)
│
├── components/
│   ├── ui/
│   │   ├── base/                 # Primitivos (Button, Card, Input, etc.) - shadcn/ui style
│   │   ├── composite/            # Compostos (Layout, Motion, DataDisplay)
│   │   ├── parallax-hero.tsx     # Hero paralaxe (Framer Motion + Lenis)
│   │   └── fade-in.tsx           # Animação entrada (IntersectionObserver)
│   │
│   ├── public/                   # Componentes área pública
│   │   ├── hero-search.tsx       # Busca hero com filtros
│   │   ├── vehicle-card.tsx      # Card veículo (Server/Client)
│   │   ├── vehicle-gallery.tsx   # Galeria + Lightbox
│   │   ├── vehicle-specs.tsx     # Fichas técnicas
│   │   ├── vehicle-features.tsx  # Features/opcionais
│   │   ├── catalog-filters.tsx   # Filtros catálogo (URL state via nuqs)
│   │   ├── VehicleGridVirtual.tsx # Grid virtualizado (TanStack Virtual)
│   │   ├── VehicleFilterSidebar.tsx
│   │   ├── lead-form.tsx         # Form lead (ZSA Server Action)
│   │   ├── contato-form.tsx
│   │   ├── venda-form.tsx
│   │   ├── whatsapp-fab.tsx      # FAB WhatsApp flutuante
│   │   ├── header.tsx / footer.tsx
│   │   └── ... componentes de UI pública
│   │
│   ├── admin/                    # Componentes área admin
│   │   ├── vehicle-form/         # Multi-step form (4 steps)
│   │   │   ├── multi-step-form.tsx
│   │   │   ├── step-1-basics.tsx
│   │   │   ├── step-2-photos.tsx
│   │   │   ├── step-3-features.tsx
│   │   │   └── step-4-internal.tsx
│   │   ├── stock-actions.tsx     # Actions toolbar (status, delete, feature)
│   │   └── sidebar.tsx           # Navegação admin
│   │
│   └── providers/                # Providers React Context
│       ├── theme-provider.tsx    # next-themes
│       └── smooth-scroll.tsx     # Lenis smooth scroll
│
├── lib/
│   ├── prisma.ts                 # Prisma Client singleton (Neon adapter)
│   ├── auth.ts                   # NextAuth config (Credentials + JWT)
│   ├── utils.ts                  # cn(), formatters, helpers
│   ├── vehicles.ts               # Helpers veículos (formatPrice, slugify, etc)
│   ├── favorites.ts              # Server Actions favoritos (ZSA)
│   ├── design-system/
│   │   └── tokens.ts             # Design tokens (cores, spacing, typography)
│   └── actions/                  # Server Actions (ZSA)
│       └── vehicles.ts           # CRUD veículos server-side
│
├── types/
│   └── index.ts                  # Types compartilhados (VehicleCard, CatalogFilters)
│
├── actions/                      # Server Actions (ZSA) - alternativas a API routes
│   └── vehicles.ts
│
├── middleware.ts                 # Next.js Middleware (auth guard admin, locale)
│
└── middleware.ts                 # Auth guard para rotas /admin/*
```

---

## Padrões Arquiteturais

### 1. **Server Components First (RSC)**
- Páginas públicas (`(public)/*`) são **Server Components** por padrão
- Busca de dados direta no componente (`async function Page()`)
- `prisma` usado diretamente nos Server Components (sem API layer desnecessário)
- Client Components apenas onde há interatividade (`"use client"`)

### 2. **Server Actions (ZSA) + API Routes Híbrido**
| Operação | Abordagem |
|----------|-----------|
| CRUD Veículos (Admin) | Server Actions (`src/actions/vehicles.ts`) |
| Favoritos (Público) | Server Actions (`src/lib/favorites.ts`) |
| Leads/Contato/Venda | Server Actions + API Routes (webhook ready) |
| Upload Imagens | API Route (`/api/upload`) - multipart/form-data |
| Auth | NextAuth.js (API Route) |

> **Por que ZSA?** Type-safe Server Actions com validação Zod integrada, error handling tipado.

### 3. **Route Groups para Separação de Responsabilidades**
- `(public)` - Layout público com Header/Footer/SEO/Providers
- `(admin)` - Layout protegido com Sidebar, Auth Guard (middleware), sem Footer/Header público

### 4. **Middleware de Autenticação**
```typescript
// middleware.ts
- Protege rotas /admin/* (redireciona para /login se não autenticado)
- Injeta headers de segurança (CSP, HSTS)
- Locale detection (futuro i18n)
```

### 5. **Data Fetching Patterns**

**Server Components (RSC):**
```tsx
// src/app/(public)/page.tsx
async function getFeaturedVehicles(): Promise<VehicleCard[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "AVAILABLE", featured: true },
    take: 6,
    include: { brand: true, model: true, images: { where: { isCover: true }, take: 1 } },
  });
  return vehicles.map(v => ({ ...v, price: Number(v.price) }));
}
```

**Client Components (Interativos):**
- Filtros de catálogo (`nuqs` para URL state)
- Formulários multi-step (React Hook Form + Zod)
- Tabelas virtualizadas (TanStack Virtual)
- Animações (Framer Motion)

### 6. **Database Schema (Prisma) - Domínio Core**

```
User (ADMIN/SUPER_ADMIN)
  └── 1:N → Vehicle (createdBy)

Brand 1:N CarModel 1:N Vehicle
Vehicle 1:N VehicleImage
Vehicle M:N Feature (via VehicleFeature)

Vehicle 1:N Lead (opcional - lead específico do veículo)
Lead (standalone ou vinculado a veículo)
```

**Enums tipados:** `FuelType`, `TransmissionType`, `BodyType`, `VehicleStatus`, `FeatureCategory`, `LeadOrigin`, `LeadStatus`

---

## Fluxos Principais

### 1. **Catálogo Público (SSR/ISR)**
```
GET /catalogo
  → Server Component: getFilteredVehicles(filters from nuqs URL)
  → Prisma query com where dinâmico + indexes
  → Retorna VehicleCard[] tipado
  → Client Component: VehicleGridVirtual (TanStack Virtual)
  → Infinite scroll + filtros na URL (shareable)
```

### 2. **PDP - Página do Veículo (SSG/ISR)**
```
GET /veiculos/[slug]
  → generateStaticParams() → ISR (revalidate: 3600)
  → getVehicleBySlug(slug) → Vehicle com relações completas
  → JSON-LD Vehicle schema.org
  → Client: Gallery, Specs, Features, LeadForm, Share, Related
```

### 3. **Lead Capture (Server Action ZSA)**
```
LeadForm (Client) → submitAction(formData)
  → ZSA validate (Zod schema)
  → prisma.lead.create({ data, include: { vehicle: true } })
  → Return { success, leadId }
  → Toast success + WhatsApp deep link
```

### 4. **Admin - Gestão de Estoque**
```
/admin/painel/estoque (Server Component)
  → prisma.vehicle.findMany({ where, orderBy, take, cursor })
  → TanStack Table (Server-side pagination, sorting, filtering)
  → Server Actions para: create, update, delete, toggleFeatured, changeStatus
```

### 5. **Cadastro Veículo (Multi-step Form)**
```
Step 1: Básicos (marca, modelo, ano, preço, km, cor, combustível, câmbio, carroceria)
Step 2: Fotos (upload multiple → Sharp resize → Cloudinary/S3 → retorna URLs)
Step 3: Opcionais (M:N Feature selection por categoria)
Step 4: Internos (chassi, placa, observações, status, featured)
→ ZSA Server Action: createVehicle(data) → Prisma transaction
```

---

## Design System (Tailwind + CSS Variables)

**Arquivo:** `src/lib/design-system/tokens.ts` + `src/app/globals.css`

### Cores (CSS Variables - OKLCH)
```css
:root {
  --ink-50: ... --ink-950: ...     /* Neutros */
  --prime-50: ... --prime-950: ...  /* Brand (laranja/âmbar) */
  --success, --warning, --error     /* Semânticas */
}
```

### Componentes Base (`components/ui/base/`)
- `Button`, `Card`, `Input`, `Label`, `Badge`, `Avatar`, `DropdownMenu`, `Tooltip`, `Toast`, `Separator`, `Checkbox`, `Skeleton`

### Componentes Compostos (`components/ui/composite/`)
- `Layout`: Container, Section, SectionHeader, Grid, Flex
- `Motion`: FadeIn, StaggerContainer/Item, ScrollReveal, ParallaxHero

---

## Performance & SEO

| Técnica | Implementação |
|---------|---------------|
| **ISR/SSG** | `generateStaticParams` em `/veiculos/[slug]` (revalidate 1h) |
| **Streaming** | `Suspense` boundaries em seções pesadas (HeroSearch, Grid) |
| **Virtualização** | `TanStack Virtual` no grid catálogo (60+ veículos) |
| **Imagens** | `next/image` + Sharp (otimização build-time) + Cloudinary/S3 |
| **Fontes** | `next/font` (Inter + Display font) - self-hosted |
| **JSON-LD** | Schema.org `AutoDealer` (Home) + `Vehicle` (PDP) |
| **Sitemap/Robots** | `next-sitemap` (configurado) |

---

## Segurança

| Camada | Implementação |
|--------|---------------|
| **Auth** | NextAuth.js (Credentials + bcryptjs + JWT) |
| **Admin Guard** | Middleware `middleware.ts` verifica session + role ADMIN |
| **Server Actions** | ZSA - validação Zod + tipagem TypeScript end-to-end |
| **Upload** | Sharp (resize, format, strip metadata) + tipo MIME validation |
| **Rate Limit** | Próximo: Upstash/Ratelimit nas Server Actions |
| **CSP/HSTS** | Headers via `next.config.js` + middleware |

---

## Scripts & Comandos

```bash
# Desenvolvimento
npm run dev              # Next.js dev (Turbopack)

# Banco de Dados
npm run db:push          # Prisma db push (dev)
npm run db:migrate       # Prisma migrate dev
npm run db:studio        # Prisma Studio
npm run db:seed          # Seed database (tsx prisma/seed.ts)

# Build & Deploy
npm run build            # Next.js build (production)
npm run start            # Next.js start
npm run lint             # ESLint
```

---

## Variáveis de Ambiente (`.env`)

```env
# Database
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"

# Auth
NEXTAUTH_SECRET="generated-secret"
NEXTAUTH_URL="http://localhost:3000"

# Upload (Cloudflare R2 — S3-compatible)
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="autoprime"
R2_PUBLIC_URL=""

# WhatsApp
NEXT_PUBLIC_WHATSAPP="5511999999999"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Estrutura de Deploy (Vercel + Neon)

```
Vercel (Edge/Node.js)
  ├─ Next.js App (Serverless Functions)
  ├─ Static Assets (CDN)
  └─ Middleware (Edge Runtime)

Neon PostgreSQL (Serverless)
  ├─ Connection Pooling (PgBouncer)
  ├─ Prisma Data Proxy (opcional)
  └─ Branching para preview deploys
```

---

## Próximos Passos / Roadmap Técnico

- [ ] **Rate Limiting** - Upstash Redis nas Server Actions
- [ ] **i18n** - `next-intl` para PT/EN/ES
- [ ] **Testes** - Vitest (unit) + Playwright (e2e)
- [ ] **Observabilidade** - Sentry + Vercel Analytics
- [ ] **Cache** - Redis (Upstash) para catálogo + sessões
- [ ] **Webhooks** - WhatsApp Business API + CRM integration
- [ ] **PWA** - Service Worker + Manifest
- [ ] **Search** - Algolia/Meilisearch para catálogo