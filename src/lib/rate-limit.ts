/**
 * @deprecated Use PersistentRateLimiter from @/lib/rate-limit-persistent instead.
 * In-memory rate limiter — does NOT work in serverless environments and is NOT
 * safe for production use. Replaced by PersistentRateLimiter (atomic PostgreSQL).
 */
export class RateLimiter {
  private cache = new Map<string, { count: number; expiresAt: number }>();
  private limit: number;
  private windowMs: number;
  private lastCleanup = Date.now();
  private cleanupIntervalMs: number;

  constructor({ limit = 5, windowMs = 60000, cleanupIntervalMs = 120000 }: { limit?: number; windowMs?: number; cleanupIntervalMs?: number } = {}) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.cleanupIntervalMs = cleanupIntervalMs;
  }

  check(ip: string): boolean {
    const now = Date.now();

    if (now - this.lastCleanup > this.cleanupIntervalMs) {
      this.cleanup(now);
      this.lastCleanup = now;
    }

    const entry = this.cache.get(ip);

    if (!entry) {
      this.cache.set(ip, { count: 1, expiresAt: now + this.windowMs });
      return true;
    }

    if (now > entry.expiresAt) {
      this.cache.set(ip, { count: 1, expiresAt: now + this.windowMs });
      return true;
    }

    if (entry.count >= this.limit) {
      return false;
    }

    entry.count++;
    return true;
  }

  private cleanup(now: number) {
    for (const [key, value] of Array.from(this.cache.entries())) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}
