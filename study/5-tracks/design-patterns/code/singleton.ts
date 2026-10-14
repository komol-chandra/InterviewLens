// DP-Q06: Singleton, and why dependency injection is usually better.
// Run: npx -y tsx 5-tracks/design-patterns/code/singleton.ts

// ---------- Classic Singleton ----------
class ConfigSingleton {
  private static instance: ConfigSingleton | null = null;
  private values = new Map<string, string>();

  private constructor() {} // nobody else can `new` it

  static get(): ConfigSingleton {
    return (this.instance ??= new ConfigSingleton());
  }

  set(k: string, v: string) { this.values.set(k, v); }
  read(k: string) { return this.values.get(k); }
}

// The problem: hidden global state. This function's dependency is invisible
// in its signature, and tests leak into each other.
function smsEnabledHidden(): boolean {
  return ConfigSingleton.get().read('sms.enabled') === 'true';
}

ConfigSingleton.get().set('sms.enabled', 'true'); // "test A" sets this...
console.log('test B sees leftover state from test A:', smsEnabledHidden()); // true, surprise

// ---------- Better: one instance, but passed in (DI) ----------
interface Config { read(k: string): string | undefined }

class MapConfig implements Config {
  constructor(private readonly values: Record<string, string>) {}
  read(k: string) { return this.values[k]; }
}

class SmsService {
  constructor(private readonly config: Config) {} // dependency is visible
  enabled(): boolean { return this.config.read('sms.enabled') === 'true'; }
}

// A tiny container: "singleton" is a lifetime the container manages,
// not something the class enforces. (Laravel: $this->app->singleton(...).)
class Container {
  private factories = new Map<string, () => unknown>();
  private shared = new Map<string, unknown>();

  singleton<T>(key: string, make: () => T) {
    this.factories.set(key, () => {
      if (!this.shared.has(key)) this.shared.set(key, make());
      return this.shared.get(key);
    });
  }
  bind<T>(key: string, make: () => T) { this.factories.set(key, make); }
  make<T>(key: string): T {
    const f = this.factories.get(key);
    if (!f) throw new Error(`Nothing bound for ${key}`);
    return f() as T;
  }
}

const app = new Container();
app.singleton<Config>('config', () => new MapConfig({ 'sms.enabled': 'false' }));
app.bind('sms', () => new SmsService(app.make<Config>('config')));

console.log('same config instance:', app.make('config') === app.make('config')); // true
console.log('new SmsService each time:', app.make('sms') !== app.make('sms'));   // true

// In a test you just pass a different config, no global reset needed:
console.log('test with sms on :', new SmsService(new MapConfig({ 'sms.enabled': 'true' })).enabled());
console.log('test with sms off:', new SmsService(new MapConfig({})).enabled());
