// DP-Q09: Order placed -> send SMS, update stock, write a log, without coupling.
// Run: npx -y tsx 5-tracks/design-patterns/code/observer.ts

type OrderPlaced = { type: 'OrderPlaced'; orderId: number; tenantId: number; phone: string; items: { sku: string; qty: number }[] };

type Listener<E> = (event: E) => void | Promise<void>;

// ---------- A tiny event bus (Laravel: Event::dispatch + EventServiceProvider::$listen) ----------
class EventBus<E extends { type: string }> {
  private listeners = new Map<string, Listener<E>[]>();
  private queue: { listener: Listener<E>; event: E }[] = [];

  on(type: E['type'], listener: Listener<E>, opts: { queued?: boolean } = {}) {
    const wrapped: Listener<E> = opts.queued
      ? (e) => { this.queue.push({ listener, event: e }); } // later, by a worker
      : listener;
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), wrapped]);
  }

  // Sync listeners run now, in order. One failing listener must not stop the others.
  async dispatch(event: E): Promise<string[]> {
    const errors: string[] = [];
    for (const l of this.listeners.get(event.type) ?? []) {
      try { await l(event); } catch (err) { errors.push((err as Error).message); }
    }
    return errors;
  }

  // The "queue worker": runs queued listeners with a retry.
  async work(maxTries = 3) {
    for (const job of this.queue.splice(0)) {
      for (let attempt = 1; attempt <= maxTries; attempt++) {
        try { await job.listener(job.event); break; }
        catch (err) { console.log(`  retry ${attempt}/${maxTries}: ${(err as Error).message}`); }
      }
    }
  }
}

// ---------- The order service only publishes. It doesn't know who listens. ----------
class OrderService {
  constructor(private readonly bus: EventBus<OrderPlaced>) {}
  async place(orderId: number, tenantId: number, phone: string) {
    // ... save order inside a DB transaction ...
    // Dispatch AFTER commit, or a listener may see an order that rolls back.
    return this.bus.dispatch({ type: 'OrderPlaced', orderId, tenantId, phone, items: [{ sku: 'SOAP-1', qty: 3 }] });
  }
}

// ---------- Listeners: each one is small and testable alone ----------
const stock = new Map([['SOAP-1', 10]]);
const auditLog: string[] = [];
let smsFailuresLeft = 1; // the SMS provider fails once

const bus = new EventBus<OrderPlaced>();
bus.on('OrderPlaced', (e) => {                       // must be in the same flow: sync
  for (const i of e.items) stock.set(i.sku, (stock.get(i.sku) ?? 0) - i.qty);
});
bus.on('OrderPlaced', (e) => { auditLog.push(`order ${e.orderId} placed (tenant ${e.tenantId})`); });
bus.on('OrderPlaced', async (e) => {                 // slow + flaky: queued
  if (smsFailuresLeft-- > 0) throw new Error('SMS provider timeout');
  auditLog.push(`sms sent to ${e.phone}`);
}, { queued: true });

async function main() {
  const errors = await new OrderService(bus).place(101, 7, '01711111111');
  console.log('sync errors:', errors);
  console.log('stock after order:', stock.get('SOAP-1'));
  console.log('worker runs queued listeners:');
  await bus.work();
  console.log(auditLog);
}
main();
