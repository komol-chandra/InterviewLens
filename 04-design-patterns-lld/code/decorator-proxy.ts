// DP-Q08: Add caching and logging without changing the service. Decorator vs Proxy.
// Run: npx -y tsx 5-tracks/design-patterns/code/decorator-proxy.ts

interface ReportService {
  salesSummary(tenantId: number, month: string): Promise<number>;
}

// The real service. We do NOT edit this class.
class MongoReportService implements ReportService {
  calls = 0;
  async salesSummary(tenantId: number, month: string): Promise<number> {
    this.calls++;
    await new Promise((r) => setTimeout(r, 20)); // pretend a slow aggregation
    return tenantId * 1000 + Number(month.slice(5));
  }
}

// ---------- Decorators: same interface, wrap another ReportService, ADD behaviour ----------
class LoggingReportService implements ReportService {
  constructor(private readonly inner: ReportService, private readonly log: string[]) {}
  async salesSummary(tenantId: number, month: string) {
    const t0 = Date.now();
    const v = await this.inner.salesSummary(tenantId, month);
    this.log.push(`salesSummary(${tenantId}, ${month}) = ${v} in ${Date.now() - t0}ms`);
    return v;
  }
}

class CachingReportService implements ReportService {
  private cache = new Map<string, { v: number; exp: number }>();
  constructor(private readonly inner: ReportService, private readonly ttlMs: number) {}
  async salesSummary(tenantId: number, month: string) {
    const key = `t${tenantId}:sales:${month}`; // tenant in the key, always
    const hit = this.cache.get(key);
    if (hit && hit.exp > Date.now()) return hit.v;
    const v = await this.inner.salesSummary(tenantId, month);
    this.cache.set(key, { v, exp: Date.now() + this.ttlMs });
    return v;
  }
}

// ---------- Proxy: same interface, CONTROLS ACCESS to the real object ----------
// Here it's a protection + lazy proxy: it checks permission and only creates
// the expensive real service on first allowed use. The caller doesn't choose
// what it wraps; the proxy owns its subject.
class GuardedReportProxy implements ReportService {
  private real: ReportService | null = null;
  constructor(private readonly can: (perm: string) => boolean) {}
  async salesSummary(tenantId: number, month: string) {
    if (!this.can('VIEW_SALES_REPORT')) throw new Error('403: missing VIEW_SALES_REPORT');
    this.real ??= new MongoReportService(); // lazy
    return this.real.salesSummary(tenantId, month);
  }
}

async function main() {
  const real = new MongoReportService();
  const log: string[] = [];
  // Order matters: logging outside caching logs every call (hits too).
  const service: ReportService = new LoggingReportService(new CachingReportService(real, 60_000), log);

  await service.salesSummary(7, '2026-10');
  await service.salesSummary(7, '2026-10'); // cache hit
  await service.salesSummary(8, '2026-10'); // different tenant, different key
  console.log('real service called', real.calls, 'times for 3 requests');
  console.log(log.join('\n'));

  console.log('\nproxy, allowed  ->', await new GuardedReportProxy(() => true).salesSummary(7, '2026-10'));
  try {
    await new GuardedReportProxy(() => false).salesSummary(7, '2026-10');
  } catch (e) {
    console.log('proxy, denied   ->', (e as Error).message);
  }
}
main();
