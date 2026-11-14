> Tracker ID: SD-11 · Generated: 2026-10-15 · Answers: **SD বোনাস** "How do you make a system reliable?" (TRK-02) · Source: general SRE knowledge + sokrio code (`tenant_fanout.py`, `cache.py`, `ResendFailedSmsBatch.php`, `SMSGateway.php`, `config/rate_limiting.php`) · Status: ✅ generated

# SD বোনাস: How do you make a system reliable?

> **এক লাইনে:** ধরে নাও **সবকিছু ব্যর্থ হবে**: নেটওয়ার্ক, ডিপেন্ডেন্সি, ডিস্ক, তোমার নিজের deploy। Reliability মানে ব্যর্থতাকে **ছোট রাখা (contain), দ্রুত ধরা (detect), আর নিজে থেকে সেরে ওঠা (recover)**। প্রতিটা বাইরের কলে timeout, নিরাপদ retry, আর ব্যর্থ হলে "কম কিন্তু সঠিক" উত্তর।

---

## ১. টুলবক্স: ৩ ভাগে

### A. ব্যর্থতা ছড়াতে না দেওয়া (Contain)
| কৌশল | কী | ভুল হলে |
|---|---|---|
| **Timeout** (প্রতিটা নেটওয়ার্ক কলে) | সর্বোচ্চ কত অপেক্ষা; connect আর read আলাদা | timeout ছাড়া একটা ধীর dependency সব thread/worker আটকে দেয় |
| **Retry + exponential backoff + jitter** | 1s, 2s, 4s… + র‍্যান্ডম; **শুধু idempotent কাজে, শুধু transient error-এ** | retry storm: সবাই একসাথে আবার মারে, ডাউন সার্ভিস আর ওঠে না |
| **Circuit breaker** | পরপর ব্যর্থ হলে "open": কিছুক্ষণ কল-ই করো না, দ্রুত fail; পরে "half-open"-এ একটা পরীক্ষা | ডাউন dependency-তে প্রতিটা request timeout পর্যন্ত অপেক্ষা করে |
| **Bulkhead** | সীমিত concurrency/pool প্রতি dependency বা প্রতি tenant | এক ধীর অংশ সব resource খেয়ে ফেলে |
| **Rate limiting / load shedding** | সীমার বেশি হলে 429/503, জরুরি traffic আগে | overload-এ সবাই ব্যর্থ হয়, কেউ না |
| **Graceful degradation** | dependency ডাউন → আংশিক/পুরনো ডেটা + সৎ চিহ্ন | পুরো পাতা ভেঙে যায় |

### B. দ্রুত ধরা (Detect)
- **SLI/SLO:** যেমন "৯৯.৯% request ৫০০ms-এর কম আর error ছাড়া"; error budget শেষ হলে নতুন ফিচার থামিয়ে stability
- **Golden signals:** latency (p95/p99), traffic, errors, saturation (CPU, queue depth, DB connection)
- **Structured log + request id**, distributed tracing; alert **লক্ষণে** (user-এর ব্যথা), কারণে না
- **Health check:** liveness (বেঁচে আছে?) vs readiness (traffic নিতে প্রস্তুত?)

### C. সেরে ওঠা (Recover)
- **Redundancy:** একাধিক instance, multi-AZ DB, কোনো single point of failure না
- **Idempotency** সব retry-যোগ্য জিনিসে (→ SD-Q07, Q11)
- **DLQ + replay**, **backup + restore টেস্ট করা** (টেস্ট না করা backup = backup নেই)
- **নিরাপদ deploy:** canary / blue-green, feature flag, দ্রুত rollback; DB migration backward-compatible (expand → migrate → contract)
- **Runbook + postmortem (blameless):** একই ঘটনা দ্বিতীয়বার যেন না হয়

### Circuit breaker (TypeScript, ছোট)
```ts
class CircuitBreaker {
  private failures = 0;
  private openedAt = 0;
  constructor(private threshold = 5, private coolDownMs = 30_000) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    const open = this.failures >= this.threshold;
    if (open && Date.now() - this.openedAt < this.coolDownMs) {
      throw new Error('circuit open: failing fast');           // ডাকা-ই হয় না
    }
    try {
      const result = await fn();                                // half-open-এ এটাই পরীক্ষা
      this.failures = 0;
      return result;
    } catch (e) {
      this.failures++;
      if (this.failures >= this.threshold) this.openedAt = Date.now();
      throw e;
    }
  }
}
```

---

## ২. মুখে বলার লাইন (English)

**মূল উত্তর (৬০ সেকেন্ড):**
> "I assume every dependency will fail and design so failures stay small, get noticed fast, and heal on their own. To contain them: a timeout on every network call, retries with exponential backoff and jitter only for idempotent operations, circuit breakers so we fail fast instead of piling up on a dead dependency, bulkheads to cap concurrency per dependency, and graceful degradation, meaning partial but honest answers instead of a broken page. To detect them: SLOs on latency and error rate, alerts on user-facing symptoms, structured logs with request ids. To recover: redundancy, idempotent retries with dead-letter queues, safe deploys with quick rollback, tested backups, and blameless postmortems."

**Sokrio (তোমার কাজ থেকে ৩টা উদাহরণ):**
> "Three examples from my own work. In the benchmark service, the cross-tenant fan-out has a per-tenant timeout, a total time budget and bounded concurrency, and it returns which tenants degraded rather than a silently wrong total. Degraded results are never cached, so the next request retries instead of serving the failure for hours. In SMS resend, after the first provider failure the rest of the batch isn't attempted, so an outage costs one timeout per batch, not per message, which is a simple circuit breaker. And the gateway separates 'never connected' from 'no answer', so a retry can never double-send."

## ৩. ফলো-আপ প্রশ্ন

| প্রশ্ন | ছোট উত্তর |
|---|---|
| "Which errors do you retry?" | "Timeouts, connection errors, 429 and 503. Not 400s or validation errors, those will fail the same way again." |
| "What's 99.9% in downtime?" | "About 43 minutes a month; 99.99% is about 4 minutes." |
| "Liveness vs readiness?" | "Liveness failing means restart me. Readiness failing means don't send me traffic yet, for example while warming up or when the DB is unreachable." |
| "Tell me about an incident." | → `1-me/story-bank.md` S4 (Detect → Mitigate → Root cause → Fix → Prevent → Communicate) |

---

🔗 **Sokrio link:** (কোডে যাচাই করা, 2026-10-15)
- ⭐ **তোমার নিজের:**
  - Bulkhead + timeout + degradation: `sokrio-benchmark-python/app/common/tenant_fanout.py::gather_tenants()` (semaphore, 12s per-tenant, 30s wall budget, `degraded_domains`)
  - Failed ফল cache না: `app/common/cache.py` `should_cache`
  - Circuit-breaker-এর মতো: `ResendFailedSmsBatch` provider ডাউন হলে বাকি ব্যাচ skip; `SMSGateway::resend()` connect timeout ৫s + provider timeout, "never connected" vs "delivery unknown"; `failed()` hook-এ crash recovery
- **টিমের:** `config/rate_limiting.php` + `RATE_LIMITING_ENABLED` kill switch (sihab); structured JSON-lines log (A3: `log_event()` → tenant, duration_ms, cache_hit, error_code, request_id)।
- ⚠️ **সৎ ফাঁক:** benchmark-এ আসল (stateful) circuit breaker নেই (`grep` করে পাওয়া যায়নি), cache-এ stampede lock নেই (SD-Q03)। বলো "next I'd add"। S4-এর "SLO, ৬৫% দ্রুত রেজোলিউশন"-এর প্রমাণ: `[Komol পূরণ করবে]`।

📚 সম্পর্কিত: [07-queues.md](07-queues.md) · [../cases/10-notification.md](../cases/10-notification.md) · [../cases/15-reporting-pipeline.md](../cases/15-reporting-pipeline.md)
