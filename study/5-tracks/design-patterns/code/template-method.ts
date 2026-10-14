// DP-Q13: Several reports share the same steps but differ in one part.
// Template Method (inheritance) vs Strategy (composition), same problem both ways.
// Run: npx -y tsx 5-tracks/design-patterns/code/template-method.ts

type Filters = { from: string; to: string; territoryId?: number };
type Row = Record<string, string | number>;

const fakeDb: Row[] = [
  { date: '2026-10-02', territory: 12, dsr: 'Rahim', amount: 500, delivered: 480 },
  { date: '2026-10-03', territory: 12, dsr: 'Karim', amount: 300, delivered: 300 },
  { date: '2026-10-03', territory: 15, dsr: 'Rahim', amount: 200, delivered: 150 },
];

// ---------- Template Method: the base class owns the ORDER of steps ----------
abstract class Report {
  // The template method. Not overridable in spirit: subclasses don't change the flow.
  generate(f: Filters): { title: string; rows: Row[] } {
    this.validate(f);                       // shared, fixed
    const raw = this.fetch(f);              // shared, fixed (tenant + date scoping lives here)
    const rows = this.transform(raw);       // the part that differs: abstract
    return { title: this.title(), rows: this.withTotals(rows) }; // hook below
  }

  protected abstract title(): string;
  protected abstract transform(raw: Row[]): Row[];

  // A hook: optional step with a default.
  protected withTotals(rows: Row[]): Row[] { return rows; }

  private validate(f: Filters) { if (f.from > f.to) throw new Error('bad date range'); }
  private fetch(f: Filters): Row[] {
    return fakeDb.filter((r) => r.date >= f.from && r.date <= f.to && (!f.territoryId || r.territory === f.territoryId));
  }
}

class SalesByDsrReport extends Report {
  protected title() { return 'Sales by DSR'; }
  protected transform(raw: Row[]) {
    const by = new Map<string, number>();
    for (const r of raw) by.set(String(r.dsr), (by.get(String(r.dsr)) ?? 0) + Number(r.amount));
    return [...by].map(([dsr, amount]) => ({ dsr, amount }));
  }
  protected withTotals(rows: Row[]) {
    return [...rows, { dsr: 'TOTAL', amount: rows.reduce((s, r) => s + Number(r.amount), 0) }];
  }
}

class DeliveryRateReport extends Report {
  protected title() { return 'Delivery rate'; }
  protected transform(raw: Row[]) {
    return raw.map((r) => ({ date: r.date, rate: `${Math.round((Number(r.delivered) / Number(r.amount)) * 100)}%` }));
  }
}

// ---------- Strategy version: the varying step is an object you pass in ----------
interface Transformer { title: string; transform(raw: Row[]): Row[] }

class ReportRunner {
  constructor(private readonly t: Transformer) {}
  generate(f: Filters) {
    if (f.from > f.to) throw new Error('bad date range');
    const raw = fakeDb.filter((r) => r.date >= f.from && r.date <= f.to);
    return { title: this.t.title, rows: this.t.transform(raw) };
  }
}

// ---------- demo ----------
const oct = { from: '2026-10-01', to: '2026-10-31' };
console.log(new SalesByDsrReport().generate(oct));
console.log(new DeliveryRateReport().generate({ ...oct, territoryId: 12 }));
console.log(new ReportRunner({ title: 'Row count', transform: (raw) => [{ rows: raw.length }] }).generate(oct));
