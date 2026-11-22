type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const store = new Map<string, RateLimitEntry>();
const MAX_STORE_SIZE = 5000;

function pruneExpiredEntries(now: number) {
  if (store.size < MAX_STORE_SIZE) {
    return;
  }

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  pruneExpiredEntries(now);

  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    allowed: true,
    remaining: maxAttempts - existing.count,
    retryAfterSeconds: 0,
  };
}

export function resetRateLimit(key: string) {
  store.delete(key);
}