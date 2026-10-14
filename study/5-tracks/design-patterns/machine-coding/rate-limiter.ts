// MC-3: Rate limiter class. Token bucket + sliding window, per key, testable clock.
// Run: npx -y tsx 5-tracks/design-patterns/machine-coding/rate-limiter.ts
// (System-level design of the same thing: 5-tracks/system-design/cases/09-rate-limiter.md)

type Decision = { allowed: boolean; remaining: number; retryAfterMs: number };

interface RateLimiter {
  tryAcquire(key: string, cost?: number): Decision;
}

type Clock = () => number;

// ---------- 1. Token bucket: allows short bursts, smooth average rate ----------
// capacity = max burst, refillPerSec = steady rate. Refill is computed lazily
// on each call, so there's no timer per key.
class TokenBucketLimiter implements RateLimiter {
  private buckets = new Map<string, { tokens: number; last: number }>();
  constructor(private readonly capacity: number, private readonly refillPerSec: number, private readonly now: Clock = Date.now) {}

  tryAcquire(key: string, cost = 1): Decision {
    const t = this.now();
    const b = this.buckets.get(key) ?? { tokens: this.capacity, last: t };
    b.tokens = Math.min(this.capacity, b.tokens + ((t - b.last) / 1000) * this.refillPerSec);
    b.last = t;
    this.buckets.set(key, b);

    if (b.tokens >= cost) {
      b.tokens -= cost;
      return { allowed: true, remaining: Math.floor(b.tokens), retryAfterMs: 0 };
    }
    const missing = cost - b.tokens;
    return { allowed: false, remaining: 0, retryAfterMs: Math.ceil((missing / this.refillPerSec) * 1000) };
  }
}

// ---------- 2. Sliding window log: exact "max N in any window", more memory ----------
class SlidingWindowLimiter implements RateLimiter {
  private hits = new Map<string, number[]>();
  constructor(private readonly limit: number, private readonly windowMs: number, private readonly now: Clock = Date.now) {}

  tryAcquire(key: string, cost = 1): Decision {
    const t = this.now();
    const log = (this.hits.get(key) ?? []).filter((ts) => ts > t - this.windowMs); // drop old hits
    if (log.length + cost <= this.limit) {
      for (let i = 0; i < cost; i++) log.push(t);
      this.hits.set(key, log);
      return { allowed: true, remaining: this.limit - log.length, retryAfterMs: 0 };
    }
    this.hits.set(key, log);
    // the oldest hit leaving the window frees a slot
    return { allowed: false, remaining: 0, retryAfterMs: log[0] + this.windowMs - t };
  }
}

// ---------- Using it: per tenant + per user key, like an HTTP middleware ----------
function handle(limiter: RateLimiter, tenantId: number, userId: number): string {
  const d = limiter.tryAcquire(`t${tenantId}:u${userId}`);
  return d.allowed ? `200 (remaining ${d.remaining})` : `429 Retry-After ${Math.ceil(d.retryAfterMs / 1000)}s`;
}

// ---------- tests ----------
function assert(cond: boolean, msg: string) { if (!cond) throw new Error('FAIL: ' + msg); console.log('ok  ', msg); }

let t = 0;
const clock = () => t;

console.log('-- token bucket: burst 3, 1 token/sec');
const tb = new TokenBucketLimiter(3, 1, clock);
assert([1, 2, 3].every(() => tb.tryAcquire('u1').allowed), 'burst of 3 allowed');
const denied = tb.tryAcquire('u1');
assert(!denied.allowed && denied.retryAfterMs === 1000, '4th denied, retry after 1000ms');
assert(tb.tryAcquire('u2').allowed, 'another key has its own bucket');
t = 1000;
assert(tb.tryAcquire('u1').allowed, 'after 1s one token refilled');
assert(!tb.tryAcquire('u1').allowed, 'and only one');
t = 60_000;
assert(tb.tryAcquire('u1', 3).allowed && !tb.tryAcquire('u1').allowed, 'refill caps at capacity 3');

console.log('-- sliding window: 2 per 1000ms');
t = 0;
const sw = new SlidingWindowLimiter(2, 1000, clock);
assert(sw.tryAcquire('k').allowed, 'hit 1 at 0ms');
t = 600;
assert(sw.tryAcquire('k').allowed, 'hit 2 at 600ms');
t = 900;
const d = sw.tryAcquire('k');
assert(!d.allowed && d.retryAfterMs === 100, 'hit 3 at 900ms denied, retry in 100ms');
t = 1001;
assert(sw.tryAcquire('k').allowed, 'at 1001ms the 0ms hit left the window');

console.log('-- as middleware');
t = 0;
const api = new TokenBucketLimiter(2, 0.5, clock);
console.log([1, 2, 3].map(() => handle(api, 7, 42)));

// Follow-ups: distributed = same logic in Redis (Lua script or INCR + EXPIRE for
// fixed window) so all app servers share one counter; memory = evict idle keys
// (LRU, see lru-cache.ts); fail open vs fail closed if Redis is down.
// Sokrio: Laravel RateLimiter::for(...) named limiters, e.g. the SMS resend limiters.
