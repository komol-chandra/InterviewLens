// DP-Q10: Middleware = Chain of Responsibility (pipeline style).
// Run: npx -y tsx 5-tracks/design-patterns/code/chain.ts

type Req = { host: string; token?: string; permissions: string[]; tenant?: string; path: string };
type Res = { status: number; body: string };
type Next = (req: Req) => Promise<Res>;
type Middleware = (req: Req, next: Next) => Promise<Res>;

// ---------- The pipeline: fold the middleware list around the final handler ----------
// Same idea as Illuminate\Pipeline\Pipeline::through($pipes)->then($destination).
function pipeline(middleware: Middleware[], handler: Next): Next {
  return middleware.reduceRight<Next>((next, mw) => (req) => mw(req, next), handler);
}

// ---------- Each link does ONE thing, then passes on or stops the chain ----------
const timing: Middleware = async (req, next) => {
  const t0 = Date.now();
  const res = await next(req);                       // code AFTER next() = on the way back
  console.log(`  ${req.path} -> ${res.status} (${Date.now() - t0}ms)`);
  return res;
};

const auth: Middleware = async (req, next) =>
  req.token === 'good' ? next(req) : { status: 401, body: 'Unauthenticated' }; // short-circuit

const tenant: Middleware = async (req, next) => {
  const sub = req.host.split('.')[0];
  if (!['thl', 'kitty'].includes(sub)) return { status: 404, body: 'Unknown tenant' };
  return next({ ...req, tenant: sub });              // enrich the request for later links
};

const permission = (perm: string): Middleware => async (req, next) =>
  req.permissions.includes(perm) ? next(req) : { status: 403, body: `Missing ${perm}` };

const handler: Next = async (req) => ({ status: 200, body: `orders of ${req.tenant}` });

// Order matters: auth before tenant before permission.
const app = pipeline([timing, auth, tenant, permission('VIEW_ORDER')], handler);

// ---------- Same pattern for query filters (Sokrio app/Filters + laravel-funnel) ----------
type Query = string[];
type Filter = (q: Query, params: Record<string, string>, next: (q: Query) => Query) => Query;

const byStatus: Filter = (q, p, next) => next(p.status ? [...q, `status = '${p.status}'`] : q);
const byTerritory: Filter = (q, p, next) => next(p.territory_id ? [...q, `territory_id = ${p.territory_id}`] : q);
const byDate: Filter = (q, p, next) => next(p.from ? [...q, `order_date >= '${p.from}'`] : q);

function applyFilters(filters: Filter[], params: Record<string, string>): Query {
  const run = filters.reduceRight<(q: Query) => Query>((next, f) => (q) => f(q, params, next), (q) => q);
  return run([]);
}

async function main() {
  const base = { host: 'thl.sokrio.com', path: '/api/orders' };
  console.log((await app({ ...base, token: 'good', permissions: ['VIEW_ORDER'] })).body);
  console.log((await app({ ...base, token: 'bad', permissions: [] })).body);
  console.log((await app({ ...base, host: 'evil.sokrio.com', token: 'good', permissions: ['VIEW_ORDER'] })).body);
  console.log((await app({ ...base, token: 'good', permissions: [] })).body);

  console.log('\nfilters ->', applyFilters([byStatus, byTerritory, byDate], { status: 'pending', from: '2026-10-01' }).join(' AND '));
}
main();
