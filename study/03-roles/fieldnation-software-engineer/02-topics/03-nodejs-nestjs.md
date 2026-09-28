> Tracker ID: FN-04 · Generated: 2026-09-28 · Source: `00-research/backend-system-design-study-plan.md` Phase 2 (Node/NestJS) + `_memory/weak-areas.md`

# Node.js + NestJS — ১০ প্রশ্ন

> weak-areas.md অনুযায়ী NestJS-এ CV guess মাত্র ১ ("learning") — এই টপিকটা সবচেয়ে বেশি নতুন প্রস্তুতি লাগবে, honestly।

---

## Q1. Event loop-এর phase-গুলো কী কী?

`timers → pending callbacks → idle/prepare → poll → check → close callbacks`, প্রতিটা phase-এর শেষে microtask queue (Promise) খালি হয়। **`poll`** phase-ই সবচেয়ে গুরুত্বপূর্ণ — এখানে I/O callback আসে এবং নতুন I/O event-এর জন্য ব্লক করে অপেক্ষা করে (যদি timer/immediate পেন্ডিং না থাকে)।

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "I reason about Node's single-threaded I/O loop the same way I reason about PHP-FPM's shared-nothing model — different trade-off, same underlying question of how concurrency is achieved."

---

## Q2. Node single-threaded, তাহলে 10k concurrent connection কীভাবে সামলায়?

Node-এর I/O (file, network, DB call) **non-blocking** — libuv থ্রেড পুল/OS-level async I/O ব্যবহার করে, main thread শুধু callback/promise queue প্রসেস করে, কোনো connection-এর জন্য ব্লক করে বসে থাকে না। CPU-bound কাজ (ভারী loop, PDF generation) main thread ব্লক করে ফেলে — এটাই আসল bottleneck, connection সংখ্যা নয়।

🔗 Sokrio link: S2 — ভারী রিপোর্ট জেনারেশন যদি সরাসরি request thread-এ হতো, পুরো API স্লো হয়ে যেত; সেজন্যই queue job-এ সরানো হয়েছিল (একই নীতি Node-এও প্রযোজ্য: ভারী কাজ আলাদা worker/সার্ভিসে সরাও)।

---

## Q3. একটা এন্ডপয়েন্ট বড় PDF জেনারেট করছে, পুরো API স্লো হয়ে যাচ্ছে — কেন, ফিক্স কী?

CPU-heavy synchronous কাজ event loop ব্লক করে দেয় — যতক্ষণ PDF জেনারেশন চলে, ততক্ষণ **অন্য কোনো request-ই** প্রসেস হয় না (single thread)। ফিক্স: `worker_threads`-এ কাজটা সরাও, অথবা আলাদা microservice/queue worker-এ পাঠাও (Sokrio-র queue job প্যাটার্নের মতোই)।

🔗 Sokrio link: S2 — MongoDB aggregation + Laravel queue job দিয়ে ভারী রিপোর্ট generation মূল request cycle থেকে আলাদা করা হয়েছিল, ঠিক এই একই কারণে।

---

## Q4. Streams এবং backpressure

বড় CSV export/import পুরোটা মেমরিতে লোড না করে chunk-by-chunk প্রসেস করতে Stream ব্যবহার হয় (`Readable`/`Writable`/`Transform`)। **Backpressure** — যখন writable side readable-এর চেয়ে ধীর, `write()` `false` রিটার্ন করে, producer-কে `drain` event পর্যন্ত থামতে হয় — নাহলে মেমরি বাড়তেই থাকবে।

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "Our large report exports go through a queued job with pagination rather than streaming, but I understand streams are the more memory-efficient Node-native approach for the same problem."

---

## Q5. Cluster module vs Kubernetes pods — কোনটা কখন?

**Cluster module** — একই মেশিনে multiple Node process (CPU core প্রতি একটা), shared port, round-robin distribute। **K8s Pod scaling** — একাধিক মেশিনে/container-এ পুরো replica, Service/Ingress দিয়ে লোড ব্যালান্স, HPA দিয়ে auto-scale। প্রোডাকশনে সাধারণত **শুধু K8s pod count** বাড়ানো হয় (per-pod single process রেখে), cluster module বেশিরভাগ ক্ষেত্রে অপ্রয়োজনীয় জটিলতা।

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — `[Komol পূরণ করবে: Sokrio-র deployment horizontal scaling কীভাবে করে — pod/container replica নাকি single instance]`।

---

## Q6. Graceful shutdown (SIGTERM) — K8s-এ কেন গুরুত্বপূর্ণ?

K8s একটা pod বন্ধ করার আগে `SIGTERM` পাঠায়, তারপর grace period (ডিফল্ট ৩০s) শেষে `SIGKILL`। অ্যাপকে `SIGTERM` ধরে: নতুন request নেওয়া বন্ধ করা, চলমান request শেষ হতে দেওয়া, DB connection/queue consumer clean-ভাবে বন্ধ করা — নাহলে mid-request কানেকশন কেটে যায় বা ইন-ফ্লাইট মেসেজ হারায়।

```ts
process.on('SIGTERM', async () => {
  await server.close();      // নতুন conn নেওয়া বন্ধ
  await dataSource.destroy(); // DB pool বন্ধ
  process.exit(0);
});
```

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "This maps to how we handle Laravel queue worker restarts — let the current job finish before the worker exits, don't kill it mid-job."

---

## Q7. NestJS request lifecycle ব্যাখ্যা করো

`Incoming request → Middleware → Guards (auth check) → Interceptors (pre) → Pipes (validation/transform on DTO) → Controller handler → Service → Interceptors (post, response transform) → Exception Filters (যদি throw হয়) → Response`

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — Laravel-এর middleware pipeline + FormRequest validation-এর সাথে conceptually মিলিয়ে বলো (নিচের ম্যাপিং টেবিল দেখো)।

---

## Q8. Laravel → NestJS ম্যাপিং (interview-এ সরাসরি ব্যবহার করো)

| Laravel | NestJS |
|---|---|
| Service container / providers | DI container / providers |
| FormRequest | DTO + `ValidationPipe` (class-validator) |
| Middleware / Policies | Middleware / Guards |
| Resources (API transformers) | Interceptors / serialization |
| Exception Handler | Exception Filters |
| Queued Jobs | BullMQ / RabbitMQ consumers |
| Eloquent | TypeORM / Prisma |

🔗 Sokrio link: S1, S3 — Laravel service container ও middleware দিয়ে multi-tenant resolve করার গভীর অভিজ্ঞতা এই ম্যাপিং-এর ভিত্তি।

---

## Q9. DTO + `class-validator` — validation কীভাবে কাজ করে?

```ts
class CreateWorkOrderDto {
  @IsString() @IsNotEmpty() title: string;
  @IsNumber() @Min(0) payAmount: number;
  @IsEnum(WOStatus) status: WOStatus;
}

@Post()
create(@Body() dto: CreateWorkOrderDto) { /* … */ }
```

`ValidationPipe` (global অথবা per-route) DTO decorator পড়ে request body validate করে, fail হলে স্বয়ংক্রিয়ভাবে `400 Bad Request` রিটার্ন করে — controller-এ ম্যানুয়াল if-check লাগে না। Laravel-এর FormRequest-এর সাথে ১:১ concept mapping।

🔗 Sokrio link: S1 — Laravel FormRequest validation-এর গভীর অভিজ্ঞতা সরাসরি ট্রান্সফার হয়।

---

## Q10. TypeORM — migration + transaction basics

```ts
await dataSource.transaction(async (manager) => {
  const wo = await manager.save(WorkOrder, { status: 'assigned', providerId });
  await manager.save(AuditLog, { woId: wo.id, action: 'assigned' });
});
```

Laravel-এর `DB::transaction(fn () => ...)`-এর সাথে সরাসরি সমান — একাধিক লেখাকে atomic রাখা। Migration কনসেপ্টও এক (up/down, schema versioning) — শুধু syntax আলাদা।

🔗 Sokrio link: S1 — Laravel-এ `DB::transaction()` সব multi-step write-এ wrap করার অভ্যাস (project rule) সরাসরি এই TypeORM প্যাটার্নে ট্রান্সফার হয়।

---

## `fn-lite` হ্যান্ডস-অন (Day 4)

NestJS + TypeORM + MySQL দিয়ে `work-order-service`: controller + service + DTO validation + একটা status state machine (invalid transition-এ `409`) + `/health` এন্ডপয়েন্ট + একটা Jest টেস্ট। GitHub-এ পুশ করো।

---

## দ্রুত রিভিশন চেকলিস্ট
- [ ] NestJS request lifecycle ধাপে ধাপে বলতে পারি
- [ ] Laravel→NestJS ম্যাপিং টেবিল না দেখে বলতে পারি
- [ ] SIGTERM graceful shutdown কেন লাগে, ব্যাখ্যা করতে পারি
