// DP-Q11: Command, an action as an object, so it can be queued, retried or undone.
// Run: npx -y tsx 5-tracks/design-patterns/code/command.ts

type Db = Map<string, number>; // "table": sku -> stock qty

interface Command {
  readonly id: string;          // idempotency: the same command never runs twice
  execute(db: Db): void;
  undo(db: Db): void;
}

// ---------- Concrete commands carry their own data ----------
class AdjustStock implements Command {
  private before: number | undefined; // remembered on execute, used by undo
  constructor(readonly id: string, private readonly sku: string, private readonly delta: number) {}
  execute(db: Db) {
    this.before = db.get(this.sku);
    const next = (this.before ?? 0) + this.delta;
    if (next < 0) throw new Error(`stock for ${this.sku} would go negative`);
    db.set(this.sku, next);
  }
  undo(db: Db) {
    if (this.before === undefined) db.delete(this.sku);
    else db.set(this.sku, this.before);
  }
}

// ---------- Invoker 1: a queue with retry + idempotency ----------
class CommandQueue {
  private pending: Command[] = [];
  private done = new Set<string>();
  push(c: Command) { this.pending.push(c); }
  work(db: Db, maxTries = 2) {
    for (const c of this.pending.splice(0)) {
      if (this.done.has(c.id)) { console.log(`  skip ${c.id} (already done)`); continue; }
      for (let i = 1; i <= maxTries; i++) {
        try { c.execute(db); this.done.add(c.id); break; }
        catch (e) { console.log(`  ${c.id} try ${i} failed: ${(e as Error).message}`); }
      }
    }
  }
}

// ---------- Invoker 2: a journal that can undo a whole run in reverse order ----------
// (Sokrio QA Test Lab: QaJournal records every write with before/after,
//  QaReverter undoes the run newest-first.)
class Journal {
  private entries: Command[] = [];
  run(c: Command, db: Db) { c.execute(db); this.entries.push(c); }
  revert(db: Db) {
    for (const c of this.entries.reverse()) c.undo(db);
    this.entries = [];
  }
}

// ---------- demo ----------
const db: Db = new Map([['SOAP-1', 10], ['OIL-5', 4]]);

console.log('queue with retry + duplicate:');
const q = new CommandQueue();
q.push(new AdjustStock('cmd-1', 'SOAP-1', -3));
q.push(new AdjustStock('cmd-1', 'SOAP-1', -3));   // same id: a double click / redelivery
q.push(new AdjustStock('cmd-2', 'OIL-5', -9));    // fails validation every time
q.work(db);
console.log('  db:', Object.fromEntries(db));

console.log('\njournal + revert:');
const snapshot = JSON.stringify([...db]);
const j = new Journal();
j.run(new AdjustStock('qa-1', 'SOAP-1', +100), db);
j.run(new AdjustStock('qa-2', 'NEW-SKU', +5), db);
console.log('  after run   :', Object.fromEntries(db));
j.revert(db);
console.log('  after revert:', Object.fromEntries(db));
console.log('  identical to before?', JSON.stringify([...db]) === snapshot);
