---
name: api-security
description: Implement API security with custom CSRF headers, PostgreSQL-backed rate limiting, NextAuth JWT auth, and Edge middleware protection. Use when securing Next.js API routes or admin panels.
---

# API Security

Layered security: Edge middleware auth → CSRF custom header → PostgreSQL rate limiting → Zod input validation.

## When to Use

- Securing admin API routes
- Protecting against CSRF without cookie-based tokens
- Rate limiting login attempts and form submissions
- Implementing role-based access control

## Architecture

```
Request
  ↓ Edge Middleware (middleware.ts)
  ↓ Verify JWT, check role → redirect to /login
  ↓
API Route
  ↓ requireCsrf(req)    → check x-requested-by header
  ↓ requireAdmin()       → verify session + role
  ↓ Zod validation       → sanitize input
  ↓ Rate limiter         → check IP + email limits
  ↓ Business logic
```

## Key Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Edge middleware (JWT verify + role check) |
| `src/lib/admin-auth.ts` | `requireAdmin()` + `requireCsrf()` |
| `src/lib/auth.ts` | NextAuth config (Credentials provider) |
| `src/lib/rate-limit-persistent.ts` | PostgreSQL rate limiter |
| `src/lib/api-client.ts` | `apiFetch()` wrapper (auto-attaches CSRF header) |

## Edge Middleware (Route Protection)

```ts
// src/middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  if (!process.env.NEXTAUTH_SECRET) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || (token.role !== "ADMIN" && token.role !== "SUPER_ADMIN")) {
    const callbackUrl = encodeURIComponent(req.nextUrl.pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/painel/:path*"] };
```

**Note**: Uses `next-auth/jwt` (not `next-auth`) because middleware runs on Edge.

## CSRF Protection (Custom Header)

Not cookie-based — uses a custom header that browsers can't forge from cross-origin forms:

```ts
// src/lib/admin-auth.ts
const CSRF_HEADER = "x-requested-by";
const CSRF_VALUE = "autoprime";

export async function requireCsrf(req: Request) {
  if (req.headers.get(CSRF_HEADER) !== CSRF_VALUE) {
    return new Response("Forbidden", { status: 403 });
  }
}
```

Client-side wrapper auto-attaches the header:

```ts
// src/lib/api-client.ts
export async function apiFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      "x-requested-by": "autoprime",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}
```

## PostgreSQL Rate Limiter

In-memory rate limiters don't work in serverless (each invocation has its own memory). Use PostgreSQL:

```ts
// src/lib/rate-limit-persistent.ts
export class PersistentRateLimiter {
  constructor(private config: {
    limit: number;
    windowMs: number;
    lockMs: number;
  }) {}

  async check(key: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const windowStart = new Date(Date.now() - this.config.windowMs);

    // PostgreSQL: INSERT ... ON CONFLICT DO UPDATE
    const result = await prisma.$queryRaw`
      INSERT INTO login_attempts (key, count, window_start, locked_until)
      VALUES (${key}, 1, NOW(), NULL)
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN login_attempts.window_start < ${windowStart} THEN 1
          ELSE login_attempts.count + 1
        END,
        window_start = CASE
          WHEN login_attempts.window_start < ${windowStart} THEN NOW()
          ELSE login_attempts.window_start
        END
      RETURNING count, locked_until
    `;

    if (result[0].locked_until && result[0].locked_until > new Date()) {
      return { allowed: false, retryAfter: result[0].locked_until };
    }

    if (result[0].count > this.config.limit) {
      // Lock the key
      await prisma.$executeRaw`
        UPDATE login_attempts SET locked_until = NOW() + ${this.config.lockMs} * INTERVAL '1 millisecond'
        WHERE key = ${key}
      `;
      return { allowed: false, retryAfter: new Date(Date.now() + this.config.lockMs) };
    }

    return { allowed: true };
  }
}
```

## Two-Tier Login Limiting

```ts
// src/lib/auth.ts
const ipLimiter = new PersistentRateLimiter({ limit: 20, windowMs: 60_000, lockMs: 0 });
const emailLimiter = new PersistentRateLimiter({ limit: 10, windowMs: 900_000, lockMs: 900_000 });

async function authorize(credentials) {
  const ip = req.headers["x-forwarded-for"] || "unknown";
  const emailKey = `${ip}:${credentials.email}`;

  // Tier 1: per-IP (20/min)
  const ipCheck = await ipLimiter.check(ip);
  if (!ipCheck.allowed) throw new Error("Too many attempts. Try again later.");

  // Tier 2: per-IP+email (10/15min with 15min lock)
  const emailCheck = await emailLimiter.check(emailKey);
  if (!emailCheck.allowed) throw new Error("Account locked. Try again in 15 minutes.");

  // Timing-attack prevention: always run bcrypt, even if user doesn't exist
  const dummyHash = "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012";
  const user = await prisma.user.findUnique({ where: { email: credentials.email } });
  const hash = user?.password || dummyHash;
  await bcrypt.compare(credentials.password, hash);

  if (!user) throw new Error("Invalid credentials");
  return { id: user.id, email: user.email, role: user.role };
}
```

## Auth Config

```ts
// src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [CredentialsProvider({ authorize })],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = user.role; }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
};
```

## Gotchas

- **In-memory rate limiter is deprecated**: `src/lib/rate-limit.ts` doesn't work in serverless — use PostgreSQL-backed `PersistentRateLimiter`
- **`NEXTAUTH_SECRET` must be set**: Without it, JWT signing fails silently between API (Node.js) and middleware (Edge)
- **Fail-open on rate limit DB errors**: If the PostgreSQL query fails, the request is allowed (logged for observability)
- **Timing-attack prevention**: Always run `bcrypt.compare` even when user doesn't exist (use `DUMMY_HASH`)
- **Middleware uses `next-auth/jwt`**: Not `next-auth` — Edge runtime can't run Node.js APIs
- **CSRF header value is constant**: `x-requested-by: autoprime` — simple but effective against cross-origin form submissions
