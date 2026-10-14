> Tracker ID: DP-01 · Generated: 2026-10-15 · Answers: **DP-Q01** (TRK-02 Phase 1) · Source: GoF + SOLID general knowledge + `5-tracks/design-patterns/02-sokrio-pattern-map.md` (DP-02, code-verified) · Status: ✅ generated

# DP-Q01: What is a design pattern? When does using one make code worse?

> **এক লাইনে:** Design pattern = **একটা বারবার আসা সমস্যার পরিচিত, নাম-দেওয়া সমাধানের ছাঁচ**, কপি করার কোড না। এর আসল লাভ দুটো: (১) টিমের সাথে **একটা শব্দে** ডিজাইন বোঝানো ("এটা Strategy"), (২) পরিবর্তন সহজ করা। কিন্তু যেখানে পরিবর্তন আসবেই না, সেখানে pattern শুধু জটিলতা।

---

## ১. সংজ্ঞা: ৩টা অংশ

| অংশ | মানে | উদাহরণ (Strategy) |
|---|---|---|
| **Problem** | কোন ব্যথা | পেমেন্ট টাইপ অনুযায়ী `if/else` বাড়তেই থাকে |
| **Solution** | কাঠামো (class/interface-এর সম্পর্ক) | প্রতিটা টাইপ একটা class, সবাই এক interface মানে |
| **Consequences** | লাভ আর খরচ | নতুন টাইপ = নতুন class (লাভ) · class সংখ্যা বাড়ে (খরচ) |

> Pattern **শেখা হয় consequences দিয়ে**। শুধু structure মুখস্থ করলে ভুল জায়গায় বসাবে।

## ২. তিন গ্রুপ (GoF, ১৯৯৪, ২৩টা pattern)

| গ্রুপ | প্রশ্ন | উদাহরণ | এই ট্র্যাকে |
|---|---|---|---|
| **Creational** | object **কীভাবে তৈরি** হবে | Factory, Builder, Singleton | DP-Q04, Q05, Q06 |
| **Structural** | object **কীভাবে জোড়া** লাগবে | Adapter, Decorator, Proxy, Facade | DP-Q07, Q08 |
| **Behavioral** | object **কীভাবে কথা বলবে / দায়িত্ব ভাগ করবে** | Strategy, Observer, Command, State, Template Method, Chain | DP-Q03, Q09–Q13 |
| (Architectural, GoF-এর বাইরে) | পুরো সিস্টেমের স্তরে | Repository, CQRS, Saga, Outbox | DP-Q14, Q15 |

## ৩. SOLID-এর সাথে সম্পর্ক

Pattern হলো SOLID নীতির **বাস্তব রূপ**। নীতি বলে "কী চাই", pattern বলে "কীভাবে"।

| নীতি | এক লাইনে | কোন pattern এটা মানে |
|---|---|---|
| **S**ingle Responsibility | একটা class-এর বদলানোর একটাই কারণ | Command, Strategy (প্রতিটা লজিক আলাদা class) |
| **O**pen/Closed | নতুন আচরণ যোগে পুরনো কোড বদলাতে হবে না | Strategy, Decorator, Observer |
| **L**iskov Substitution | subclass বসালে কিছু ভাঙবে না | Template Method, যেকোনো polymorphism |
| **I**nterface Segregation | বড় interface না, ছোট ছোট | Adapter (শুধু যা দরকার তা expose) |
| **D**ependency Inversion | concrete না, interface-এর ওপর নির্ভর | Strategy + DI container, Factory |

> **মূল সূত্র:** *"Program to an interface, not an implementation"* আর *"Favor composition over inheritance"*। প্রায় সব pattern এই দুটোর কোনো রূপ।

---

## ৪. কখন pattern কোডকে **খারাপ** করে ⭐ (প্রশ্নের আসল অংশ)

| লক্ষণ | কেন খারাপ | উদাহরণ |
|---|---|---|
| **একটাই implementation-এর জন্য interface** | indirection বাড়ে, লাভ নেই | `UserServiceInterface` যার একটাই `UserService` আর কোনোদিন দ্বিতীয়টা আসবে না |
| **"ভবিষ্যতে লাগতে পারে"** (speculative generality) | YAGNI ভাঙে; ভবিষ্যৎ প্রায় কখনো সেভাবে আসে না | ২টা `if` থাকা অবস্থায় Strategy + Factory + Registry |
| **Pattern-এর নাম লক্ষ্য হয়ে যাওয়া** | সমস্যা না থাকলেও সমাধান বসানো | "আমরা Repository pattern ব্যবহার করি" কারণ শুনতে পেশাদার |
| **Framework যা দেয় তার ওপর আবার একই layer** | দুই স্তরে একই কাজ | Eloquent-এর ওপর পাতলা Repository যেটা শুধু `Model::find()` ডাকে |
| **Singleton = লুকানো global state** | টেস্ট কঠিন, coupling লুকিয়ে থাকে | (→ DP-Q06) |
| **Control flow খুঁজে পাওয়া যায় না** | ডিবাগ কঠিন | Observer/Event-এর শৃঙ্খল: কোড পড়ে বোঝা যায় না order save হলে কী কী ঘটে |
| **নতুন ডেভেলপার ৫টা ফাইল ঘুরে ১ লাইনের লজিক খোঁজে** | পড়ার খরচ > লেখার লাভ | |

### সিদ্ধান্তের নিয়ম
1. **Rule of three:** প্রথমবার সরাসরি লেখো, দ্বিতীয়বার কপি সহ্য করো, **তৃতীয়বার** একই ধরনের পরিবর্তন এলে abstraction বানাও।
2. **পরিবর্তনের অক্ষ (axis of change) আছে কি?** যদি স্পষ্ট দেখা যায় এই অংশটা বারবার বদলাবে/নতুন ধরন যোগ হবে, তবেই pattern।
3. **Refactor *to* a pattern, don't start with one.** pattern সাধারণত refactoring-এর গন্তব্য, শুরুর বিন্দু না।
4. সহজতম সমাধান কি পড়তে সহজ আর টেস্টযোগ্য? তাহলে সেটাই রাখো।

### কোড: একই সমস্যা, দুই মাত্রা (TypeScript)

```ts
// ✅ যথেষ্ট: ২টা ধরন, স্থির, বদলানোর লক্ষণ নেই
function shippingFee(type: 'standard' | 'express', weightKg: number): number {
  return type === 'express' ? 120 + weightKg * 20 : 60 + weightKg * 10;
}

// ❌ ওভার-ইঞ্জিনিয়ারড, যখন ধরন মাত্র ২টা এবং বাড়ার কোনো লক্ষণ নেই
interface ShippingStrategy { fee(weightKg: number): number }
class StandardShipping implements ShippingStrategy { fee(w: number) { return 60 + w * 10; } }
class ExpressShipping implements ShippingStrategy { fee(w: number) { return 120 + w * 20; } }
class ShippingStrategyFactory {
  static create(type: string): ShippingStrategy { /* ... */ throw new Error(); }
}
// ৩টা class + ১টা factory = ২ লাইনের কাজ।
// কিন্তু যদি প্রতি মাসে নতুন courier যোগ হয়, প্রতিটার নিজের API + নিয়ম থাকে,
// তখন এই Strategy-ই সঠিক হয়ে যায় (→ DP-Q03)।
```

---

## ৫. মুখে বলার লাইন (English)

**সংজ্ঞা (২০ সেকেন্ড):**
> "A design pattern is a named, proven solution shape for a problem that keeps coming up. It's not code to copy. The real value is shared vocabulary: if I say 'this is a Strategy', the team knows the structure without reading it, and it makes a specific kind of change cheap."

**কখন খারাপ (মূল অংশ):**
> "A pattern makes code worse when it solves a problem you don't have. The common signs are an interface with only one implementation that will never get a second, a factory for one class, or layers that just repeat what the framework already does. I follow the rule of three: I write it directly first, and only introduce a pattern when I see the same kind of change for the third time. Patterns are where you refactor to, not where you start."

**SOLID সংযোগ:**
> "Most patterns are just SOLID applied: Strategy and Decorator are Open/Closed in practice, and dependency injection is Dependency Inversion."

**নিজের উদাহরণ দিয়ে শেষ:**
> "In our Laravel codebase we deliberately didn't add a Repository layer over Eloquent, because it would mostly forward calls. But where variants were real, like push notification senders, we used a Strategy behind an interface so tests use a logging sender instead of Firebase."

---

## ৬. ফলো-আপ প্রশ্ন

| প্রশ্ন | ছোট উত্তর |
|---|---|
| "Name a pattern you removed or regretted." | `[Komol পূরণ করবে: কোনো অপ্রয়োজনীয় abstraction সরিয়েছিলে? না থাকলে বলো: "I haven't removed one, but I've pushed back on adding a repository layer over Eloquent."]` |
| "Pattern vs principle?" | "A principle is a guideline, like Open/Closed. A pattern is a concrete structure that follows it." |
| "Pattern vs framework/library?" | "A library is code you call. A pattern is an idea you implement. Laravel implements many patterns for you: middleware is Chain of Responsibility, facades sit over the service container, jobs are Commands." |
| "Anti-pattern?" | "A common solution that looks right but causes more harm, like a God object, Singleton as global state, or copy-paste inheritance." |

---

🔗 **Sokrio link:** `5-tracks/design-patterns/02-sokrio-pattern-map.md` (DP-02, কোডে যাচাই করা):
- **ভালো ব্যবহার:** `NotificationSender` → `FCM` / `LogFCM` (টিমের লেখা Strategy, আসল দুটো variant আছে) · তোমার নিজের **Template Method** `ScenarioSeeder` (QA Test Lab, A6), যেটা এখন ২টা মডিউল (MemoTarget, VisitTarget) ব্যবহার করে। base class কি আগে বানিয়েছিলে, নাকি প্রথম মডিউলের পরে বের করেছিলে? `[Komol পূরণ করবে]`। পরেরটা হলে এটা "refactor to a pattern"-এর নিখুঁত গল্প।
- **ইচ্ছাকৃত ভাবে না-বসানো:** আলাদা Repository layer নেই (`app/Repositories/` নেই) → "pattern যখন লাভ দেয় না" প্রশ্নের সেরা প্রমাণ।
- ⚠️ সৎ থাকো: Strategy/Pipeline/Kafka observer **টিমের লেখা** → বলো "our codebase uses"; Template Method + journal/undo **তোমার** → বলো "I built"।

📚 পুরনো নোট (SOLID বিস্তারিত): `4-library/cs/01-oop-design-pattern/01-notes.md`, `02-cheatsheet.md` · পরের প্রশ্ন: DP-Q03 Strategy
