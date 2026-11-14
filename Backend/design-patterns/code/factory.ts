// DP-Q04: Simple Factory vs Factory Method vs Abstract Factory.
// Run: npx -y tsx 5-tracks/design-patterns/code/factory.ts

type Row = Record<string, string | number>;

// ---------- 1. Simple factory: one function picks the class ----------
interface Exporter {
  readonly ext: string;
  export(rows: Row[]): string;
}

class CsvExporter implements Exporter {
  readonly ext = 'csv';
  export(rows: Row[]): string {
    const head = Object.keys(rows[0] ?? {});
    return [head.join(','), ...rows.map((r) => head.map((h) => r[h]).join(','))].join('\n');
  }
}

class JsonExporter implements Exporter {
  readonly ext = 'json';
  export(rows: Row[]): string {
    return JSON.stringify(rows);
  }
}

// The only place that knows the concrete classes.
const exporters: Record<string, () => Exporter> = {
  csv: () => new CsvExporter(),
  json: () => new JsonExporter(),
};

function makeExporter(format: string): Exporter {
  const make = exporters[format];
  if (!make) throw new Error(`Unsupported format: ${format}`);
  return make();
}

// ---------- 2. Factory Method: subclass decides what to create ----------
// The base class runs the job; one abstract method creates the "product".
// (Same shape as Sokrio's ReportableJobService::createReportService().)
interface ReportService {
  rows(): Row[];
}

abstract class ReportExportJob {
  protected abstract createService(): ReportService; // <- the factory method

  run(format: string): string {
    const service = this.createService();
    return makeExporter(format).export(service.rows());
  }
}

class DeliveryReportJob extends ReportExportJob {
  protected createService(): ReportService {
    return { rows: () => [{ dsr: 'Rahim', delivered: 42 }] };
  }
}

class AttendanceReportJob extends ReportExportJob {
  protected createService(): ReportService {
    return { rows: () => [{ user: 'Karim', present: 22 }] };
  }
}

// ---------- 3. Abstract Factory: a FAMILY of related objects ----------
// Production gets real senders, tests get log senders, and you can never
// mix a real SMS sender with a fake push sender by accident.
interface SmsSender { send(to: string, body: string): string }
interface PushSender { push(user: string, title: string): string }

interface NotificationKit {
  sms(): SmsSender;
  push(): PushSender;
}

class ProductionKit implements NotificationKit {
  sms(): SmsSender { return { send: (to, body) => `HTTP POST sms-provider to=${to} "${body}"` }; }
  push(): PushSender { return { push: (u, t) => `FCM push to ${u}: ${t}` }; }
}

class TestingKit implements NotificationKit {
  sms(): SmsSender { return { send: (to, body) => `[log] sms to=${to} "${body}"` }; }
  push(): PushSender { return { push: (u, t) => `[log] push to ${u}: ${t}` }; }
}

function kitFor(env: string): NotificationKit {
  return env === 'production' ? new ProductionKit() : new TestingKit();
}

// Client code only sees the interfaces.
function notifyOrderApproved(kit: NotificationKit, phone: string, userId: string): string[] {
  return [kit.sms().send(phone, 'Your order is approved'), kit.push().push(userId, 'Order approved')];
}

// ---------- demo ----------
console.log('1) simple factory');
console.log(makeExporter('csv').export([{ a: 1, b: 2 }]));

console.log('\n2) factory method');
console.log(new DeliveryReportJob().run('csv'));
console.log(new AttendanceReportJob().run('json'));

console.log('\n3) abstract factory');
for (const env of ['production', 'testing']) {
  console.log(env, notifyOrderApproved(kitFor(env), '01700000000', 'u-7'));
}

try {
  makeExporter('pdf');
} catch (e) {
  console.log('\nunknown format ->', (e as Error).message);
}
