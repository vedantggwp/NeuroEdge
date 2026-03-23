interface RateLimitEntry {
  readonly count: number;
  readonly expiresAt: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 60_000;

function cleanup(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) {
      store.delete(key);
    }
  }
}

const cleanupTimer = setInterval(cleanup, CLEANUP_INTERVAL_MS);
// Prevent the cleanup timer from keeping the Node.js process alive
if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
  cleanupTimer.unref();
}

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly resetAt: number;
}

/**
 * Check whether a request identified by `key` is within the rate limit.
 *
 * @param key      - Unique identifier (e.g. IP address or user ID)
 * @param max      - Maximum number of requests allowed in the window
 * @param windowMs - Window duration in milliseconds
 * @returns        - Whether the request is allowed, remaining quota, and reset time
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  // No existing entry or entry has expired — start a new window
  if (!existing || existing.expiresAt <= now) {
    const entry: RateLimitEntry = {
      count: 1,
      expiresAt: now + windowMs,
    };
    store.set(key, entry);
    return { allowed: true, remaining: max - 1, resetAt: entry.expiresAt };
  }

  // Within window but under limit
  if (existing.count < max) {
    const entry: RateLimitEntry = {
      count: existing.count + 1,
      expiresAt: existing.expiresAt,
    };
    store.set(key, entry);
    return {
      allowed: true,
      remaining: max - entry.count,
      resetAt: entry.expiresAt,
    };
  }

  // Over limit
  return { allowed: false, remaining: 0, resetAt: existing.expiresAt };
}
