// MC-4: Work-order lifecycle (Field Nation style) with the State pattern.
// Run: npx -y tsx 5-tracks/design-patterns/machine-coding/work-order-lifecycle.ts
//
// Requirements I'd confirm first:
//  draft -> published -> assigned -> in_progress -> completed -> approved -> paid
//  - only the buyer publishes / approves; only the assigned tech checks in / completes
//  - cancel allowed before work starts; after check-in it needs a different flow
//  - buyer can reject a completion -> back to in_progress with a reason
//  - every change is recorded (who, when, from, to) and emits an event

type Status = 'draft' | 'published' | 'assigned' | 'in_progress' | 'completed' | 'approved' | 'paid' | 'cancelled';
type Role = 'buyer' | 'tech' | 'system';
type Actor = { id: string; role: Role };

class TransitionError extends Error {}

interface WorkOrderState {
  readonly status: Status;
  publish(wo: WorkOrder, by: Actor): void;
  assign(wo: WorkOrder, by: Actor, techId: string): void;
  checkIn(wo: WorkOrder, by: Actor): void;
  complete(wo: WorkOrder, by: Actor): void;
  approve(wo: WorkOrder, by: Actor): void;
  reject(wo: WorkOrder, by: Actor, reason: string): void;
  pay(wo: WorkOrder, by: Actor): void;
  cancel(wo: WorkOrder, by: Actor): void;
}

// Every action is invalid unless a state allows it. Unknown = refused, not ignored.
abstract class State implements WorkOrderState {
  abstract readonly status: Status;
  publish(_w: WorkOrder, _b: Actor) { this.no('publish'); }
  assign(_w: WorkOrder, _b: Actor, _t: string) { this.no('assign'); }
  checkIn(_w: WorkOrder, _b: Actor) { this.no('check in'); }
  complete(_w: WorkOrder, _b: Actor) { this.no('complete'); }
  approve(_w: WorkOrder, _b: Actor) { this.no('approve'); }
  reject(_w: WorkOrder, _b: Actor, _r: string) { this.no('reject'); }
  pay(_w: WorkOrder, _b: Actor) { this.no('pay'); }
  cancel(_w: WorkOrder, _b: Actor) { this.no('cancel'); }
  protected no(action: string): never { throw new TransitionError(`cannot ${action} a work order that is ${this.status}`); }
}

function requireRole(by: Actor, role: Role) {
  if (by.role !== role) throw new TransitionError(`${by.role} ${by.id} is not allowed; needs ${role}`);
}

class Draft extends State {
  readonly status = 'draft' as const;
  publish(w: WorkOrder, by: Actor) { requireRole(by, 'buyer'); w.moveTo(new Published(), by); }
  cancel(w: WorkOrder, by: Actor) { requireRole(by, 'buyer'); w.moveTo(new Cancelled(), by); }
}
class Published extends State {
  readonly status = 'published' as const;
  assign(w: WorkOrder, by: Actor, techId: string) { requireRole(by, 'buyer'); w.techId = techId; w.moveTo(new Assigned(), by, `tech ${techId}`); }
  cancel(w: WorkOrder, by: Actor) { requireRole(by, 'buyer'); w.moveTo(new Cancelled(), by); }
}
class Assigned extends State {
  readonly status = 'assigned' as const;
  checkIn(w: WorkOrder, by: Actor) { w.requireAssignedTech(by); w.moveTo(new InProgress(), by); }
  cancel(w: WorkOrder, by: Actor) { requireRole(by, 'buyer'); w.techId = null; w.moveTo(new Cancelled(), by, 'tech released'); }
}
class InProgress extends State {
  readonly status = 'in_progress' as const;
  complete(w: WorkOrder, by: Actor) { w.requireAssignedTech(by); w.moveTo(new Completed(), by); }
}
class Completed extends State {
  readonly status = 'completed' as const;
  approve(w: WorkOrder, by: Actor) { requireRole(by, 'buyer'); w.moveTo(new Approved(), by); }
  reject(w: WorkOrder, by: Actor, reason: string) {
    requireRole(by, 'buyer');
    if (!reason.trim()) throw new TransitionError('a rejection needs a reason');
    w.moveTo(new InProgress(), by, `rejected: ${reason}`);
  }
}
class Approved extends State {
  readonly status = 'approved' as const;
  pay(w: WorkOrder, by: Actor) { requireRole(by, 'system'); w.moveTo(new Paid(), by); }
}
class Paid extends State { readonly status = 'paid' as const; }
class Cancelled extends State { readonly status = 'cancelled' as const; }

const STATES: Record<Status, () => WorkOrderState> = {
  draft: () => new Draft(), published: () => new Published(), assigned: () => new Assigned(),
  in_progress: () => new InProgress(), completed: () => new Completed(), approved: () => new Approved(),
  paid: () => new Paid(), cancelled: () => new Cancelled(),
};

type HistoryRow = { from: Status; to: Status; by: string; at: number; note?: string };
type Listener = (e: { workOrderId: string; from: Status; to: Status }) => void;

class WorkOrder {
  techId: string | null = null;
  version = 0;                       // optimistic locking: UPDATE ... WHERE id=? AND version=?
  readonly history: HistoryRow[] = [];
  private state: WorkOrderState;

  constructor(readonly id: string, status: Status = 'draft', private readonly listeners: Listener[] = [], private readonly now = () => Date.now()) {
    this.state = STATES[status]();   // rebuild state object from the DB column
  }

  get status() { return this.state.status; }

  // Only states call this.
  moveTo(next: WorkOrderState, by: Actor, note?: string) {
    const from = this.state.status;
    this.history.push({ from, to: next.status, by: by.id, at: this.now(), note });
    this.state = next;
    this.version++;
    for (const l of this.listeners) l({ workOrderId: this.id, from, to: next.status }); // Observer
  }

  requireAssignedTech(by: Actor) {
    requireRole(by, 'tech');
    if (by.id !== this.techId) throw new TransitionError(`tech ${by.id} is not assigned to ${this.id}`);
  }

  publish(by: Actor) { this.state.publish(this, by); }
  assign(by: Actor, techId: string) { this.state.assign(this, by, techId); }
  checkIn(by: Actor) { this.state.checkIn(this, by); }
  complete(by: Actor) { this.state.complete(this, by); }
  approve(by: Actor) { this.state.approve(this, by); }
  reject(by: Actor, reason: string) { this.state.reject(this, by, reason); }
  pay(by: Actor) { this.state.pay(this, by); }
  cancel(by: Actor) { this.state.cancel(this, by); }
}

// ---------- tests ----------
function assert(cond: boolean, msg: string) { if (!cond) throw new Error('FAIL: ' + msg); console.log('ok  ', msg); }
function throws(fn: () => void, msg: string) {
  try { fn(); } catch (e) { if (e instanceof TransitionError) { console.log('ok  ', msg, '->', e.message); return; } throw e; }
  throw new Error('FAIL (did not throw): ' + msg);
}

const buyer: Actor = { id: 'buyer-1', role: 'buyer' };
const tech: Actor = { id: 'tech-9', role: 'tech' };
const otherTech: Actor = { id: 'tech-3', role: 'tech' };
const system: Actor = { id: 'payout-job', role: 'system' };

const events: string[] = [];
const wo = new WorkOrder('WO-1', 'draft', [(e) => events.push(`${e.from}->${e.to}`)]);

throws(() => wo.checkIn(tech), 'cannot check in a draft');
throws(() => wo.publish(tech), 'tech cannot publish');
wo.publish(buyer);
wo.assign(buyer, 'tech-9');
throws(() => wo.checkIn(otherTech), 'other tech cannot check in');
wo.checkIn(tech);
throws(() => wo.cancel(buyer), 'no plain cancel after work started');
wo.complete(tech);
throws(() => wo.reject(buyer, ' '), 'reject needs a reason');
wo.reject(buyer, 'photos missing');
assert(wo.status === 'in_progress', 'rejected completion goes back to in_progress');
wo.complete(tech);
wo.approve(buyer);
throws(() => wo.pay(buyer), 'only the payout system pays');
wo.pay(system);
assert(wo.status === 'paid', 'reached paid');
throws(() => wo.approve(buyer), 'paid is final');
assert(wo.version === wo.history.length, 'version bumps once per transition');
console.log('events:', events.join(' | '));

// Loading from DB: state is rebuilt from the status column.
const loaded = new WorkOrder('WO-2', 'assigned');
loaded.techId = 'tech-9';
loaded.cancel(buyer);
assert(loaded.status === 'cancelled' && loaded.techId === null, 'cancel an assigned order releases the tech');

// Follow-ups: persistence (status column + work_order_status_history table, like
// Sokrio's order_statuses), concurrency (two techs accept at once -> optimistic
// version check or a conditional UPDATE), timeouts (system job moves assigned ->
// published if no check-in within N hours), events to notification service.
