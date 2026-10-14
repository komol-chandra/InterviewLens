// DP-Q07: Adapter, three SMS providers with different APIs behind one interface.
// Run: npx -y tsx 5-tracks/design-patterns/code/adapter.ts

// ---------- Our interface: what OUR code wants ----------
type SendResult = { ok: boolean; providerMessageId?: string; error?: string };

interface SmsSender {
  readonly name: string;
  send(to: string, body: string): Promise<SendResult>;
}

// ---------- Three "third-party SDKs" we don't control ----------
// Each has a different method name, argument shape and response format.
class AlphaSmsSdk {
  async sendMessage(payload: { msisdn: string; text: string }) {
    return { status: 'SENT', id: `alpha-${payload.msisdn.slice(-4)}` };
  }
}
class BetaSmsClient {
  async post(numbers: string[], message: string, opts: { unicode: boolean }) {
    if (numbers[0].length !== 11) return { code: 400, detail: 'bad number' };
    return { code: 200, ref: `beta-${Date.now() % 1000}`, unicode: opts.unicode };
  }
}
class GammaGateway {
  async dispatch(xml: string): Promise<string> {
    return xml.includes('<to>') ? '<ok msgid="g-1"/>' : '<error/>';
  }
}

// ---------- Adapters: translate our call into theirs, and their answer into ours ----------
class AlphaAdapter implements SmsSender {
  readonly name = 'alpha';
  constructor(private readonly sdk = new AlphaSmsSdk()) {}
  async send(to: string, body: string): Promise<SendResult> {
    const r = await this.sdk.sendMessage({ msisdn: to, text: body });
    return r.status === 'SENT' ? { ok: true, providerMessageId: r.id } : { ok: false, error: r.status };
  }
}

class BetaAdapter implements SmsSender {
  readonly name = 'beta';
  constructor(private readonly client = new BetaSmsClient()) {}
  async send(to: string, body: string): Promise<SendResult> {
    const unicode = /[^\x00-\x7F]/.test(body); // Bangla text needs unicode
    const r = await this.client.post([to], body, { unicode });
    return r.code === 200 ? { ok: true, providerMessageId: r.ref } : { ok: false, error: r.detail };
  }
}

class GammaAdapter implements SmsSender {
  readonly name = 'gamma';
  constructor(private readonly gw = new GammaGateway()) {}
  async send(to: string, body: string): Promise<SendResult> {
    const xml = `<sms><to>${to}</to><body>${body}</body></sms>`;
    const r = await this.gw.dispatch(xml);
    const id = r.match(/msgid="([^"]+)"/)?.[1];
    return id ? { ok: true, providerMessageId: id } : { ok: false, error: 'gamma rejected' };
  }
}

// ---------- Switching = config. Fallback = a list of adapters. ----------
function senderFor(name: string): SmsSender {
  const all: Record<string, () => SmsSender> = {
    alpha: () => new AlphaAdapter(),
    beta: () => new BetaAdapter(),
    gamma: () => new GammaAdapter(),
  };
  const make = all[name];
  if (!make) throw new Error(`Unknown SMS provider ${name}`);
  return make();
}

// Business code: never mentions a provider.
async function sendOtp(sms: SmsSender, phone: string, code: string) {
  return sms.send(phone, `Your Sokrio OTP is ${code}`);
}

async function main() {
  for (const p of ['alpha', 'beta', 'gamma']) {
    console.log(p.padEnd(6), await sendOtp(senderFor(p), '01711111111', '4821'));
  }
  console.log('beta, bad number ->', await sendOtp(senderFor('beta'), '123', '4821'));
}
main();
