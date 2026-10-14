> Tracker ID: DP-02 · Generated: 2026-10-15 · Track: TRK-01 Phase 0 · Source: sokrio-server কোড স্ক্যান (`app/`, `vendor/tanmaymishu/laravel-funnel`) + `git log` লেখক · Status: ✅ generated

# DP-02: Sokrio কোডে যে Design Pattern আছে (১ পাতা)

> **ব্যবহার:** ইন্টারভিউয়ার "which design patterns have you used?" বা "Why X not Y?" জিজ্ঞেস করলে এখান থেকে **বাস্তব, যাচাই করা** উদাহরণ দেবে।
> প্রতিটা উদাহরণ কোডে খুঁজে দেখা হয়েছে। **লেখক** কলাম = `git log`-এর প্রধান লেখক। ⭐ = তোমার নিজের লেখা, সেগুলোতে "I built" বলতে পারো। বাকিগুলোতে "our codebase uses / I worked with" বলবে।

## পূর্ণ তালিকা

| Pattern | Sokrio-তে কোথায় | কীভাবে খাটে | লেখক |
|---|---|---|---|
| **Template Method** ⭐ | `app/Support/QaSeed/ScenarioSeeder.php` (abstract) → `database/seeders/Qa/MemoTarget/`, `VisitTarget/` | বেস ক্লাস ধাপের ক্রম ঠিক করে দেয় (`profile → plan → apply → expected → verify`); প্রতিটা মডিউল শুধু abstract ধাপগুলো লেখে | **Komol** |
| **Command + Undo (journal)** ⭐ | `QaJournal` + `QaReverter` (একই ফোল্ডার) | প্রতিটা write journal-এ `before`/`after` সহ রেকর্ড হয়; `QaReverter` উল্টো ক্রমে undo করে (insert → delete, update → `before` ফেরত, delete → reinsert)। রেকর্ড এর মধ্যে অন্য কেউ বদলালে conflict ধরে | **Komol** |
| **Decorator (function wrapper)** ⭐ | `sokrio-benchmark-python/app/common/timing.py` → `cached_with_timing(...)` = timing/log মোড়ানো `cache_remember` মোড়ানো আসল query (2026-10-15 যোগ, DP-Q08) | query কোড না বদলে cache + সময় + cache-hit log; error হলেও log। `market_benchmark`-এর private helper থেকে বের করে shared করেছ | **Komol** |
| **Adapter (error mapping)** ⭐ অংশত | `Services/SMSSender` interface → `SMSGateway` / `LogSMSGateway`; তোমার `resend()` provider-এর `ConnectionException`-কে `ProviderUnavailableException` / `SmsDeliveryUnknownException`-এ অনুবাদ করে (DP-Q07) | কলার provider-এর error format জানে না; "নিরাপদে retry" vs "জানা নেই" আলাদা | interface টিমের, `resend()` **Komol** |
| **Strategy (DI-তে বদলানো)** | `NotificationSender` interface → `FCM` / `LogFCM`; `FCMServiceProvider` বাঁধে: `testing` env-এ `LogFCM`, বাকি সময় `FCM` | কলার জানে না পুশ আসলে যায় নাকি লগ হয়। টেস্টে আসল FCM কল হয় না | টিম (Tanmay) |
| **Strategy (rule set)** | `Services/VanSales/Alerts/VanAlertRule` interface → `NoSyncRule` … | প্রতিটা alert rule আলাদা ক্লাস; নতুন rule = নতুন ক্লাস, পুরনো কোড অপরিবর্তিত (Open/Closed) | টিম (Rakib) |
| **Strategy / polymorphism** | `Services/Export/ReportServiceInterface` → ৫টা রিপোর্ট সার্ভিস (Delivery/Return/OrderTracking/Summary/Attendance) | export job একই interface দিয়ে যেকোনো রিপোর্ট চালায় | টিম (sihab) |
| **Template Method + Factory method** | `Models/Order/TargetAchiever` (abstract, `static on(Model)` → `new static`) → Product/Invoice/Delivery/Visit TargetAchiever | target হিসাবের কাঠামো এক জায়গায়, ধরন অনুযায়ী subclass | টিম (Tanmay, sumaisa) |
| **Chain of Responsibility (Pipeline)** | `app/Filters/*` (১৯৬টা Filter ক্লাস) → `laravel-funnel` `HasFilters` → `Illuminate\Pipeline\Pipeline`; প্রতিটা Filter-এর `handle($passable, $next)` | query builder একটা filter থেকে পরেরটায় যায়; যার query param আছে সে শুধু `where` যোগ করে। HTTP middleware-ও একই pattern | টিম (Tanmay-র প্যাকেজ) |
| **Observer** | `app/Observers/` (Order, Delivery, Permission, Role, Setting…) | মডেল save/update হলে side-effect (history, cache clear) মূল কোড না ছুঁয়ে | টিম |
| **Observer → Event publishing** | `Observers/Concerns/PublishesKafkaMessage` trait (Order/Delivery observer-এ) → `MessageProducerInterface::publish($topic, $eventType, $tenantId, …)` | DB change হলে Kafka-তে event, consumer সার্ভিস নিজে প্রতিক্রিয়া করে (loose coupling) | টিম (sihab) |
| **Abstract Factory / Factory** | `Contracts/Kafka/ConsumerFactoryInterface` | কোন consumer বানানো হবে তা factory ঠিক করে, কলার concrete ক্লাস জানে না | টিম (sihab) |
| **Command (queued job)** | `app/Jobs/` (১৩২টা ফাইল): যেমন `Reports/ProcessCustomSummaryReportExportJob` | কাজটাকে object বানিয়ে queue-তে পাঠানো → retry, পরে চালানো, worker-এ চালানো | মিশ্র |
| **Registry + Singleton-ish static manager** | `Support/Tenant/TenantManager` (private constructor, `static tenant()`), `MongoDBManager` | টেন্যান্ট connection এক জায়গা থেকে সুইচ | টিম (Tanmay), Komol ৫ commit |
| **Builder** | `Models/Report/PeriodBuilder`, `CoordinateBuilder`; Laravel Query Builder, `Support/Macros/BuilderMacro` | ধাপে ধাপে জটিল object/query বানানো | টিম |
| **Service layer + DTO** | `app/Services/`, `app/DTOs/`, `app/Actions/` | controller পাতলা, ব্যবসায়িক লজিক সার্ভিসে (CLAUDE.md-এর নিয়ম: >১০ লাইন হলে সার্ভিসে) | টিম কনভেনশন |
| **Facade** | Laravel `Cache::`, `DB::`, `Route::` | container-এর object-এ static-দেখতে access | Laravel |

**যা নেই (সৎভাবে বলবে):** আলাদা `Repository` লেয়ার নেই (`app/Repositories/` নেই, Eloquent সরাসরি সার্ভিসে)। State pattern ক্লাস হিসেবে নেই। status আছে মডেলে কনস্ট্যান্ট দিয়ে (যেমন `Task`, `VanLoadOut`)।

---

## ইন্টারভিউর জন্য সেরা ৫টা (মুখস্থ করো)

**1. Template Method (তোমার নিজের, তাই সবচেয়ে শক্তিশালী):**
> "In our QA Test Lab I built an abstract `ScenarioSeeder` that fixes the lifecycle: profile the tenant's data, plan scenarios, apply them, compute expected results, verify. Each module only implements those steps. Adding a new module's test seeder means one subclass, and the runner, journaling and revert logic come for free."

**2. Command + Undo:**
> "Every write the seeder makes goes through a journal, with its before and after state, so `qa:revert` can undo the run in reverse order and leave the tables exactly as they were. If someone changed a record in between, it flags a conflict instead of overwriting. It's the Command pattern with undo, applied to test data."

**3. Strategy:**
> "Push notifications sit behind a `NotificationSender` interface. The service provider binds a logging implementation in tests and the real FCM sender everywhere else, so no test ever sends a real push."

**4. Chain of Responsibility:**
> "List filtering uses a pipeline of small filter classes. Each one checks if its query parameter is present and adds one `where` clause, then passes the builder on. Adding a filter is one class, with no `if` chain in the controller."

**5. Observer:**
> "Order and delivery observers publish domain events to Kafka with the tenant id and a partition key, so downstream services react without the order code knowing they exist. *(Our team built the Kafka layer; I worked with it.)*"

---

## "Why X not Y" দ্রুত উত্তর

| প্রশ্ন | উত্তর (EN) |
|---|---|
| Strategy vs Template Method? | "Strategy swaps a whole algorithm through composition, chosen at runtime, like FCM vs log sender. Template Method fixes the skeleton in a base class and subclasses fill steps, like the scenario seeder. I prefer Strategy when variants are independent, Template Method when the order of steps must be guaranteed." |
| Observer vs direct call? | "Observer when the side effect isn't the caller's business, like publishing an event. Direct call when the result matters to the flow, because observers hide control flow and are harder to debug." |
| কেন Repository নেই? | "Eloquent already is an Active Record data layer. A repository on top mostly added indirection for us. We kept a service layer for business logic instead. If we needed to swap storage or test without a DB, I'd introduce it." |
| Job = Command কেন? | "A queued job is a serialized command: it carries its data, can be retried, delayed or run on another machine." |

🔗 Sokrio link: S3 (multi-tenant / TenantManager) · A6 (QA Test Lab, তোমার নিজের) · A4 (Kafka observer, টিমের) · পূর্ণ pattern অধ্যায় আসবে Phase 1–2-এ (`5-tracks/design-patterns/`)। পুরনো নোট: `4-library/cs/01-oop-design-pattern/`
