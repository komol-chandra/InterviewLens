// DP-Q05: Builder, an object with many optional fields.
// Run: npx -y tsx 5-tracks/design-patterns/code/builder.ts

// ---------- BEFORE: telescoping constructor ----------
// new ReportRequestBad('2026-10-01', '2026-10-31', null, null, 5, true, false, 'xlsx', 50, null)
// Which argument is `territoryId`? Nobody knows without opening the class.

// ---------- AFTER: builder ----------
type Interval = 'daily' | 'weekly' | 'monthly';

class ReportRequest {
  // Readonly: once built, it can't change. The builder is the only way in.
  constructor(
    readonly from: string,
    readonly to: string,
    readonly interval: Interval,
    readonly territoryIds: readonly number[],
    readonly productIds: readonly number[],
    readonly includeZeroRows: boolean,
    readonly format: 'json' | 'xlsx',
    readonly perPage: number,
  ) {}
}

class ReportRequestBuilder {
  private interval: Interval = 'daily';
  private territoryIds: number[] = [];
  private productIds: number[] = [];
  private includeZeroRows = false;
  private format: 'json' | 'xlsx' = 'json';
  private perPage = 15;

  // Required fields go in the constructor, so you can't forget them.
  constructor(private readonly from: string, private readonly to: string) {}

  monthly(): this { this.interval = 'monthly'; return this; }
  weekly(): this { this.interval = 'weekly'; return this; }
  forTerritories(...ids: number[]): this { this.territoryIds.push(...ids); return this; }
  forProducts(...ids: number[]): this { this.productIds.push(...ids); return this; }
  withZeroRows(): this { this.includeZeroRows = true; return this; }
  asExcel(): this { this.format = 'xlsx'; return this; }
  perPageOf(n: number): this { this.perPage = n; return this; }

  // All cross-field validation lives here, in one place.
  build(): ReportRequest {
    if (this.from > this.to) throw new Error('from must be before to');
    if (this.perPage < 1 || this.perPage > 500) throw new Error('perPage must be 1..500');
    if (this.format === 'xlsx' && this.interval === 'daily' && this.territoryIds.length === 0) {
      throw new Error('daily xlsx for all territories is too big; pick territories or a wider interval');
    }
    return new ReportRequest(
      this.from, this.to, this.interval,
      [...this.territoryIds], [...this.productIds],
      this.includeZeroRows, this.format, this.perPage,
    );
  }
}

// ---------- The lighter option in TypeScript: an options object ----------
type ReportOptions = {
  from: string;
  to: string;
  interval?: Interval;
  territoryIds?: number[];
  format?: 'json' | 'xlsx';
};
function makeRequest({ from, to, interval = 'daily', territoryIds = [], format = 'json' }: ReportOptions) {
  return { from, to, interval, territoryIds, format };
}

// ---------- demo ----------
const req = new ReportRequestBuilder('2026-10-01', '2026-10-31')
  .monthly()
  .forTerritories(12, 15)
  .asExcel()
  .perPageOf(50)
  .build();
console.log('builder  ->', req);

console.log('options  ->', makeRequest({ from: '2026-10-01', to: '2026-10-31', format: 'xlsx' }));

try {
  new ReportRequestBuilder('2026-10-01', '2026-10-31').asExcel().build();
} catch (e) {
  console.log('invalid  ->', (e as Error).message);
}
