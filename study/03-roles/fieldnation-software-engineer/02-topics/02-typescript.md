> Tracker ID: FN-03 · Generated: 2026-09-28 · Source: `00-research/backend-system-design-study-plan.md` Phase 2 (TS) + `_memory/story-bank.md`

# TypeScript — ১০ প্রশ্ন

> Post-এ "strong understanding of TypeScript" — JS-এর পরপরই এটাও লাইভ কোডিং রাউন্ডে আসবে।

---

## Q1. `interface` vs `type` — কখন কোনটা?

- **`interface`** — object shape ডিফাইন করতে সেরা, **declaration merging** সাপোর্ট করে (একই নামের interface দুবার লিখলে merge হয়ে যায়), `extends` দিয়ে composability
- **`type`** — union, intersection, mapped/conditional type, primitive alias — যেকোনো কিছু। Object shape-ও পারে, কিন্তু merge হয় না।

**নিয়ম:** public API/library shape হলে `interface` (extend করার সুযোগ রাখো), union/complex logic হলে `type`।

🔗 Sokrio link: S6 — React/TS রিরাইটে component props সাধারণত `interface`, API response union `type` দিয়ে মডেল করা।

---

## Q2. Generics — কেন দরকার?

Type-safe reusability, একই ফাংশন/ক্লাস একাধিক type-এ কাজ করবে, কিন্তু `any`-র মতো type safety হারাবে না।

```ts
function firstOf<T>(arr: T[]): T | undefined {
  return arr[0];
}
const wo = firstOf<WorkOrder>(workOrders); // wo: WorkOrder | undefined
```

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "We use generics heavily in our typed axios wrapper — `apiGet<T>(url)` returns `T`, so every call site gets full autocomplete without re-typing the response shape."

---

## Q3. `unknown` vs `any`

- **`any`** — টাইপ চেকিং সম্পূর্ণ বন্ধ, যেকোনো property/method access করা যায়, কম্পাইলার নীরব থাকে (বিপজ্জনক)
- **`unknown`** — টাইপ-সেফ counterpart: value assign করা যায়, কিন্তু narrowing (`typeof`, `instanceof`) ছাড়া কোনো operation করা যায় না। External API response/user input-এর জন্য সঠিক choice।

```ts
function handle(input: unknown) {
  if (typeof input === 'string') input.toUpperCase(); // এখন safe
}
```

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "Any third-party webhook payload we parse starts as `unknown`, then we narrow it with a validation schema before touching it."

---

## Q4. Utility types — `Partial`, `Pick`, `Omit`, `Record`

```ts
type WorkOrder = { id: string; status: string; buyerId: string; providerId?: string };

type WOUpdate = Partial<WorkOrder>;                 // সব field optional — PATCH body-র জন্য
type WOSummary = Pick<WorkOrder, 'id' | 'status'>;  // শুধু নির্বাচিত field
type WOWithoutId = Omit<WorkOrder, 'id'>;           // create payload-এর জন্য
type StatusCounts = Record<string, number>;         // dictionary shape
```

🔗 Sokrio link: S6 — REST response আর form payload-এর জন্য আলাদা derived type বানাতে এই utility types রোজ ব্যবহার হয়।

---

## Q5. Discriminated union — WO status state machine মডেল করো

```ts
type WOState =
  | { status: 'draft' }
  | { status: 'assigned'; providerId: string }
  | { status: 'checked_in'; checkInAt: string; providerId: string }
  | { status: 'approved'; approvedAt: string; providerId: string };

function next(state: WOState) {
  switch (state.status) {
    case 'draft': /* … */ break;
    case 'assigned': console.log(state.providerId); break; // TS জানে providerId আছে
  }
}
```

কমন `status` field (discriminant) দিয়ে TS প্রতিটা branch-এ বাকি field narrow করে দেয় — invalid combination (যেমন `draft` state-এ `providerId`) কম্পাইল টাইমেই আটকায়।

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "This is exactly how I'd model Field Nation's work-order status machine — it turns an invalid-state bug into a compile error instead of a runtime 409."

---

## Q6. Type narrowing কীভাবে কাজ করে

`typeof`, `instanceof`, `in`, truthiness check, বা discriminant field দেখে TS compiler ধীরে ধীরে একটা union-কে ছোট করে। Custom **type guard** ফাংশনও লেখা যায়:

```ts
function isProvider(u: Buyer | Provider): u is Provider {
  return (u as Provider).skills !== undefined;
}
```

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "We write custom type guards for polymorphic API responses, like distinguishing a tenant admin from a field-force user in the same endpoint."

---

## Q7. `strict` mode-এ কী কী চালু হয়?

`strictNullChecks` (null/undefined আলাদা টাইপ, প্রতিটা optional access-এ চেক লাগবে), `noImplicitAny`, `strictFunctionTypes`, `strictPropertyInitialization` ইত্যাদি। প্রোডাকশন কোডবেসে `strict: true` প্রায় সবসময় রাখা উচিত — এটাই সবচেয়ে বেশি রানটাইম null-reference বাগ ধরে।

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — `[Komol পূরণ করবে: sokrio-app-frontend/tsconfig.json-এ strict mode চালু কিনা]`।

---

## Q8. Enum vs union literal — কোনটা প্রেফার করবে?

```ts
enum Status { Draft = 'draft', Assigned = 'assigned' } // রানটাইম object তৈরি হয়, bundle-এ যোগ হয়
type Status = 'draft' | 'assigned';                     // শুধু compile-time, zero runtime cost
```

আধুনিক TS-এ **union literal প্রেফার্ড** — tree-shakeable, সহজে serialize হয় (API/DB string-এর সাথে সরাসরি মেলে), আর `enum`-এর কিছু গোচরাগোছরা edge case (numeric enum reverse-mapping) নেই।

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "I'd default to string literal unions for anything that round-trips through an API or a DB column."

---

## Q9. Decorators — NestJS প্রসঙ্গে

NestJS decorator-নির্ভর (`@Controller()`, `@Get()`, `@Injectable()`, `@Body()`) — এগুলো মূলত metadata attach করে (`reflect-metadata` দিয়ে), যা Nest-এর DI container রানটাইমে পড়ে dependency resolve করতে/route bind করতে ব্যবহার করে। Laravel-এর attribute/annotation-based routing-এর সাথে conceptually কাছাকাছি।

🔗 Sokrio link: S1 — Laravel-এর convention-based ecosystem (route/middleware attribute)-এর অভিজ্ঞতা NestJS decorator model বুঝতে সরাসরি সাহায্য করে।

---

## Q10. Sokrio frontend-এর একটা টাইপ রিফ্যাক্টর উদাহরণ

`[Komol পূরণ করবে: sokrio-app-frontend বা admin-frontend-এ কোনো `any`-heavy কোড টাইপ-সেফ করার নির্দিষ্ট উদাহরণ — কোন ফাইল, কী সমস্যা ছিল, কী utility type/generic ব্যবহার করলে]`। Day 3-এর টাস্ক হলো এই উদাহরণটা প্রস্তুত রাখা, কারণ "walk me through a TS refactor you did" প্রশ্নে সরাসরি লাইভ কোড দেখাতে পারলে সবচেয়ে জোরালো হয়।

---

## দ্রুত রিভিশন চেকলিস্ট
- [ ] Discriminated union দিয়ে WO state machine ৫ মিনিটে লিখতে পারি
- [ ] `unknown` vs `any` উদাহরণসহ ব্যাখ্যা করতে পারি
- [ ] নিজের একটা TS রিফ্যাক্টর উদাহরণ প্রস্তুত (Q10 পূরণ করো)
