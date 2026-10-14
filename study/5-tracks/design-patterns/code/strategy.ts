// DP-Q03: Strategy pattern, discount rules without an if/else chain.
// Run: npx -y tsx 5-tracks/design-patterns/code/strategy.ts

type Order = { subtotal: number; customerType: 'regular' | 'vip'; couponCode?: string };

// ---------- BEFORE: every new discount type edits this function ----------
function discountBefore(order: Order, type: string): number {
  if (type === 'none') {
    return 0;
  } else if (type === 'percentage') {
    return order.subtotal * 0.1;
  } else if (type === 'flat') {
    return Math.min(50, order.subtotal);
  } else if (type === 'vip') {
    return order.customerType === 'vip' ? order.subtotal * 0.15 : 0;
  }
  throw new Error(`Unknown discount type: ${type}`);
}

// ---------- AFTER: one interface, one class per rule ----------
interface DiscountStrategy {
  readonly type: string;
  calculate(order: Order): number;
}

class NoDiscount implements DiscountStrategy {
  readonly type = 'none';
  calculate(): number {
    return 0;
  }
}

class PercentageDiscount implements DiscountStrategy {
  readonly type = 'percentage';
  constructor(private readonly percent: number) {}
  calculate(order: Order): number {
    return order.subtotal * (this.percent / 100);
  }
}

class FlatDiscount implements DiscountStrategy {
  readonly type = 'flat';
  constructor(private readonly amount: number) {}
  calculate(order: Order): number {
    return Math.min(this.amount, order.subtotal); // never below zero
  }
}

class VipDiscount implements DiscountStrategy {
  readonly type = 'vip';
  calculate(order: Order): number {
    return order.customerType === 'vip' ? order.subtotal * 0.15 : 0;
  }
}

// Registry: the only place that maps a type string to a strategy.
// Adding a new rule = new class + one line here. Checkout code never changes.
class DiscountRegistry {
  private readonly byType = new Map<string, DiscountStrategy>();
  constructor(strategies: DiscountStrategy[]) {
    for (const s of strategies) this.byType.set(s.type, s);
  }
  get(type: string): DiscountStrategy {
    const s = this.byType.get(type);
    if (!s) throw new Error(`Unknown discount type: ${type}`);
    return s;
  }
}

// Context: uses a strategy, doesn't know which one.
class Checkout {
  constructor(private readonly discounts: DiscountRegistry) {}
  total(order: Order, discountType: string): number {
    const discount = this.discounts.get(discountType).calculate(order);
    return order.subtotal - discount;
  }
}

// ---------- demo ----------
const registry = new DiscountRegistry([
  new NoDiscount(),
  new PercentageDiscount(10),
  new FlatDiscount(50),
  new VipDiscount(),
]);
const checkout = new Checkout(registry);
const order: Order = { subtotal: 1000, customerType: 'vip' };

for (const type of ['none', 'percentage', 'flat', 'vip']) {
  const before = order.subtotal - discountBefore(order, type);
  const after = checkout.total(order, type);
  console.log(`${type.padEnd(10)} before=${before}  after=${after}  same=${before === after}`);
}

// Testing one strategy needs no checkout, no other rules:
console.assert(new FlatDiscount(50).calculate({ subtotal: 30, customerType: 'regular' }) === 30);
