// DP-Q15: CQRS, Saga, Outbox, Circuit Breaker, each in a few lines.
// Run: npx -y tsx 5-tracks/design-patterns/code/distributed-patterns.ts

// ===================== 1. Outbox =====================
// Problem: "save order, then publish event". If the publish fails after commit,
// other services never hear about it. Fix: write the event into an outbox table
// in the SAME transaction; a relay publishes it later (at-least-once).
type Tx = { orders: object[]; outbox: { id: number; topic: string; payload: object; sentAt?: number }[] };
const db: Tx = { orders: [], outbox: [] };

function placeOrder(order: { id: number }) {
  // pretend this whole block is one DB transaction: both rows or neither
  db.orders.push(order);
  db.outbox.push({ id: db.outbox.length + 1, topic: 'order.placed', payload: order });
}

let brokerUp = false;
function relayOutbox(publish: (topic: string, p: object) => void) {
  for (const m of db.outbox.filter((m) => !m.sentAt)) {
    try { publish(m.topic, m.payload); m.sentAt = Date.now(); }
    catch { /* stays unsent, next run retries; consumers must be idempotent */ }
  }
}
const publish = (t: string, p: object) => { if (!brokerUp) throw new Error('broker down'); console.log('  published', t, p); };

console.log('1) Outbox');
placeOrder({ id: 1 });
relayOutbox(publish);                    // broker down: nothing lost, still in outbox
console.log('  unsent after failure:', db.outbox.filter((m) => !m.sentAt).length);
brokerUp = true;
relayOutbox(publish);                    // later run delivers it

// ===================== 2. Saga (orchestrated) =====================
// A business transaction across services with no shared DB transaction.
// Each step has a compensating action; on failure, undo completed steps in reverse.
type Step = { name: string; run: () => void; compensate: () => void };

function runSaga(steps: Step[]): string[] {
  const log: string[] = [];
  const done: Step[] = [];
  for (const s of steps) {
    try { s.run(); done.push(s); log.push(`ok ${s.name}`); }
    catch (e) {
      log.push(`FAIL ${s.name}: ${(e as Error).message}`);
      for (const d of done.reverse()) { d.compensate(); log.push(`undo ${d.name}`); }
      break;
    }
  }
  return log;
}

console.log('\n2) Saga');
console.log(runSaga([
  { name: 'reserve stock', run: () => {}, compensate: () => {} },
  { name: 'charge wallet', run: () => {}, compensate: () => {} },
  { name: 'book delivery van', run: () => { throw new Error('no van free'); }, compensate: () => {} },
]));

// ===================== 3. Circuit breaker =====================
// After N failures, stop calling the sick dependency for a cool-down, fail fast,
// then let ONE trial call through (half-open) to see if it recovered.
class CircuitBreaker {
  private failures = 0;
  private openedAt = 0;
  state: 'closed' | 'open' | 'half-open' = 'closed';
  constructor(private readonly threshold: number, private readonly coolDownMs: number, private readonly now = () => Date.now()) {}

  async call<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
    if (this.state === 'open') {
      if (this.now() - this.openedAt < this.coolDownMs) return fallback(); // fail fast
      this.state = 'half-open';
    }
    try {
      const v = await fn();
      this.failures = 0; this.state = 'closed';
      return v;
    } catch {
      this.failures++;
      if (this.state === 'half-open' || this.failures >= this.threshold) { this.state = 'open'; this.openedAt = this.now(); }
      return fallback();
    }
  }
}

// ===================== 4. CQRS =====================
// Writes go to the normalized model; reads come from a model shaped for the screen,
// updated from events. Here: orders write side, per-day summary read side.
const writeSide: { id: number; day: string; amount: number }[] = [];
const readSide = new Map<string, { orders: number; amount: number }>(); // like Mongo order_summaries

function handlePlaceOrder(cmd: { id: number; day: string; amount: number }) {
  writeSide.push(cmd);
  onOrderPlaced(cmd); // in real life: via event/queue, so the read side is eventually consistent
}
function onOrderPlaced(e: { day: string; amount: number }) {
  const s = readSide.get(e.day) ?? { orders: 0, amount: 0 };
  readSide.set(e.day, { orders: s.orders + 1, amount: s.amount + e.amount });
}

async function main() {
  console.log('\n3) Circuit breaker');
  let t = 0;
  const cb = new CircuitBreaker(2, 1000, () => t);
  const sick = async () => { throw new Error('timeout'); };
  const healthy = async () => 'fresh data';
  const cached = () => 'cached data';
  for (const [label, fn, at] of [['fail', sick, 0], ['fail', sick, 10], ['skipped', sick, 20], ['trial', healthy, 1500], ['ok', healthy, 1600]] as const) {
    t = at;
    console.log(`  t=${at} ${label.padEnd(7)} -> ${await cb.call(fn, cached)} (state ${cb.state})`);
  }

  console.log('\n4) CQRS');
  handlePlaceOrder({ id: 1, day: '2026-10-15', amount: 500 });
  handlePlaceOrder({ id: 2, day: '2026-10-15', amount: 300 });
  console.log('  read model:', Object.fromEntries(readSide));
}
main();
