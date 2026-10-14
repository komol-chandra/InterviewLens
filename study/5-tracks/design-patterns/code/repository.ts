// DP-Q14: Repository, what it buys you (and what it costs).
// Run: npx -y tsx 5-tracks/design-patterns/code/repository.ts

type Order = { id: number; tenantId: number; retailerId: number; amount: number; status: 'pending' | 'approved' };

// ---------- The interface talks in domain words, not SQL ----------
interface OrderRepository {
  find(id: number): Promise<Order | null>;
  pendingForRetailer(retailerId: number): Promise<Order[]>;
  save(order: Order): Promise<void>;
}

// Real implementation (would use Eloquent / a SQL client).
class SqlOrderRepository implements OrderRepository {
  constructor(private readonly tenantId: number, private readonly query: (sql: string, args: unknown[]) => Promise<Order[]>) {}
  async find(id: number) {
    return (await this.query('select * from orders where id = ? and tenant_id = ?', [id, this.tenantId]))[0] ?? null;
  }
  pendingForRetailer(retailerId: number) {
    return this.query("select * from orders where retailer_id = ? and status = 'pending' and tenant_id = ?", [retailerId, this.tenantId]);
  }
  async save(o: Order) { await this.query('update orders set status = ? where id = ?', [o.status, o.id]); }
}

// In-memory implementation for unit tests: no DB, runs in milliseconds.
class InMemoryOrderRepository implements OrderRepository {
  constructor(private rows: Order[] = []) {}
  async find(id: number) { return this.rows.find((o) => o.id === id) ?? null; }
  async pendingForRetailer(retailerId: number) { return this.rows.filter((o) => o.retailerId === retailerId && o.status === 'pending'); }
  async save(o: Order) { this.rows = this.rows.map((r) => (r.id === o.id ? o : r)); }
}

// ---------- The service depends on the interface ----------
class ApproveOrders {
  constructor(private readonly orders: OrderRepository, private readonly creditLimit: number) {}
  async approveAllFor(retailerId: number): Promise<number[]> {
    const approved: number[] = [];
    let used = 0;
    for (const o of await this.orders.pendingForRetailer(retailerId)) {
      if (used + o.amount > this.creditLimit) break; // business rule we want to test fast
      used += o.amount;
      await this.orders.save({ ...o, status: 'approved' });
      approved.push(o.id);
    }
    return approved;
  }
}

// ---------- demo: the business rule tested without any database ----------
async function main() {
  const repo = new InMemoryOrderRepository([
    { id: 1, tenantId: 7, retailerId: 9, amount: 400, status: 'pending' },
    { id: 2, tenantId: 7, retailerId: 9, amount: 500, status: 'pending' },
    { id: 3, tenantId: 7, retailerId: 9, amount: 300, status: 'pending' },
  ]);
  const approved = await new ApproveOrders(repo, 1000).approveAllFor(9);
  console.log('approved within credit limit 1000:', approved); // [1, 2]
  console.log('order 3 still:', (await repo.find(3))?.status);

  // The SQL one is the same interface; here with a fake query fn just to show it compiles and runs.
  const sql = new SqlOrderRepository(7, async (q, args) => { console.log('  SQL:', q, args); return []; });
  await new ApproveOrders(sql, 1000).approveAllFor(9);
}
main();
