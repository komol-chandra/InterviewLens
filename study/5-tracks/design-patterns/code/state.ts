// DP-Q12: Order lifecycle without status if/else everywhere.
// Run: npx -y tsx 5-tracks/design-patterns/code/state.ts

type Status = 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
type Action = 'approve' | 'ship' | 'deliver' | 'cancel';

// ---------- Option A: transition table (usually enough) ----------
// One place answers "from X, what can I do, and where do I land?"
const TRANSITIONS: Record<Status, Partial<Record<Action, Status>>> = {
  pending:   { approve: 'approved', cancel: 'cancelled' },
  approved:  { ship: 'shipped', cancel: 'cancelled' },
  shipped:   { deliver: 'delivered' },
  delivered: {},
  cancelled: {},
};

class InvalidTransition extends Error {}

class OrderA {
  history: { from: Status; to: Status; by: string }[] = [];
  constructor(public status: Status = 'pending') {}
  can(action: Action) { return action in TRANSITIONS[this.status]; }
  apply(action: Action, by: string) {
    const to = TRANSITIONS[this.status][action];
    if (!to) throw new InvalidTransition(`cannot ${action} an order that is ${this.status}`);
    this.history.push({ from: this.status, to, by });
    this.status = to;
  }
}

// ---------- Option B: State pattern (when each state has real behaviour) ----------
interface OrderState {
  readonly name: Status;
  approve(o: OrderB): void;
  ship(o: OrderB): void;
  deliver(o: OrderB): void;
  cancel(o: OrderB): void;
}

// Default: every action is invalid. Each state overrides only what it allows.
abstract class BaseState implements OrderState {
  abstract readonly name: Status;
  approve(_: OrderB) { this.deny('approve'); }
  ship(_: OrderB) { this.deny('ship'); }
  deliver(_: OrderB) { this.deny('deliver'); }
  cancel(_: OrderB) { this.deny('cancel'); }
  protected deny(a: string): never { throw new InvalidTransition(`cannot ${a} an order that is ${this.name}`); }
}

class Pending extends BaseState {
  readonly name = 'pending' as const;
  approve(o: OrderB) { o.reserveStock(); o.setState(new Approved()); }
  cancel(o: OrderB) { o.setState(new Cancelled()); }
}
class Approved extends BaseState {
  readonly name = 'approved' as const;
  ship(o: OrderB) { o.setState(new Shipped()); }
  cancel(o: OrderB) { o.releaseStock(); o.setState(new Cancelled()); } // side effect lives with the state
}
class Shipped extends BaseState {
  readonly name = 'shipped' as const;
  deliver(o: OrderB) { o.setState(new Delivered()); }
}
class Delivered extends BaseState { readonly name = 'delivered' as const; }
class Cancelled extends BaseState { readonly name = 'cancelled' as const; }

class OrderB {
  log: string[] = [];
  private state: OrderState = new Pending();
  get status() { return this.state.name; }
  setState(s: OrderState) { this.log.push(`${this.state.name} -> ${s.name}`); this.state = s; }
  reserveStock() { this.log.push('stock reserved'); }
  releaseStock() { this.log.push('stock released'); }
  approve() { this.state.approve(this); }
  ship() { this.state.ship(this); }
  deliver() { this.state.deliver(this); }
  cancel() { this.state.cancel(this); }
}

// ---------- demo ----------
const a = new OrderA();
a.apply('approve', 'manager-1');
a.apply('ship', 'dsr-4');
console.log('A status:', a.status, '| can cancel?', a.can('cancel'));
try { a.apply('cancel', 'manager-1'); } catch (e) { console.log('A blocked:', (e as Error).message); }

const b = new OrderB();
b.approve();
b.cancel();
console.log('B log:', b.log);
try { b.ship(); } catch (e) { console.log('B blocked:', (e as Error).message); }
