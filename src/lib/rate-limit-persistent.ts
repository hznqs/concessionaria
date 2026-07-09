import { prisma } from '@/lib/prisma';

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
}

interface Options {
  limit?: number;
  windowMs?: number;
  lockMs?: number;
}

const DEFAULT_OPTS = {
  limit: 5,
  windowMs: 60_000,
  lockMs: 5 * 60_000,
};

export class PersistentRateLimiter {
  private opts: typeof DEFAULT_OPTS;

  constructor(opts: Partial<Options> = {}) {
    this.opts = { ...DEFAULT_OPTS, ...opts };
  }

  async check(key: string): Promise<RateLimitResult> {
    const now = new Date();
    const windowStartThreshold = new Date(now.getTime() - this.opts.windowMs);
    const lockUntil = new Date(now.getTime() + this.opts.lockMs);

    try {
      const result = await prisma.$queryRawUnsafe<
        Array<{ count: bigint; lockedUntil: Date | null }>
      >(
        `INSERT INTO "login_attempts" ("id", "key", "count", "lockedUntil", "windowStart", "updatedAt")
         VALUES (gen_random_uuid(), $1, 1, NULL, $2::timestamp, $2::timestamp)
         ON CONFLICT ("key") DO UPDATE SET
           "count" = CASE
             WHEN "login_attempts"."windowStart" < $3::timestamp THEN 1
             ELSE "login_attempts"."count" + 1
           END,
           "lockedUntil" = CASE
             WHEN "login_attempts"."windowStart" >= $3::timestamp
              AND "login_attempts"."count" + 1 >= $4 THEN $5::timestamp
             ELSE NULL
           END,
           "windowStart" = CASE
             WHEN "login_attempts"."windowStart" < $3::timestamp THEN $2::timestamp
             ELSE "login_attempts"."windowStart"
           END,
           "updatedAt" = $2::timestamp
         RETURNING "count", "lockedUntil"`,
        key, now, windowStartThreshold, this.opts.limit, lockUntil,
      );

      const row = result[0];
      const count = Number(row.count);

      if (row.lockedUntil && row.lockedUntil > now) {
        const retryAfterMs = row.lockedUntil.getTime() - now.getTime();
        return { ok: false, remaining: 0, retryAfterMs };
      }

      const remaining = Math.max(0, this.opts.limit - count);
      return { ok: true, remaining, retryAfterMs: 0 };
    } catch (err) {
      // Fail-open: on DB errors, allow the request but log for observability
      console.error('[RateLimit] check failed (fail-open):', err);
      return { ok: true, remaining: 999, retryAfterMs: 0 };
    }
  }

  async cleanup(): Promise<number> {
    const now = new Date();
    try {
      const r = await prisma.loginAttempt.deleteMany({
        where: {
          OR: [
            { lockedUntil: { lt: now } },
            { windowStart: { lt: new Date(now.getTime() - this.opts.windowMs) } },
          ],
        },
      });
      return r.count;
    } catch {
      return 0;
    }
  }
}