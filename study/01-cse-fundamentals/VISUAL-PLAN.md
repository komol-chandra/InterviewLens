# Visual Presentation Plan — `topics/` ফোল্ডার

> এই ফাইলটা একটা **এক্সিকিউশন প্ল্যান**, কনটেন্ট না। প্রতিটা টপিক ফাইলে কোন সেকশনে কী ধরনের ডায়াগ্রাম বসবে, তার তালিকা। রান করার সময় একটা ফাইল বেছে বলবে — *"VISUAL-PLAN.md অনুযায়ী `topics/XX-....md`-এ ডায়াগ্রাম বসাও"* — একবারে একটা ফাইল, পুরো ফোল্ডার একসাথে না (রিভিউ করা সহজ রাখার জন্য)।

---

## ফরম্যাট সিদ্ধান্ত

- **টুল: Mermaid** — GitHub, Claude Code/Artifact, ও VS Code (Markdown Preview Mermaid Support এক্সটেনশন দিয়ে) সবখানে রেন্ডার হয়। প্লেইন ASCII-র চেয়ে মেইনটেইন করা সহজ।
  - ⚠️ VS Code-এ মেইন এডিটরে দেখতে চাইলে "Markdown Preview Mermaid Support" এক্সটেনশন লাগবে — না থাকলে প্রথম ফাইল রান করার আগে ইনস্টল করে নিও।
- **ডায়াগ্রাম টাইপ বাছাই নিয়ম:**
  - সম্পর্ক/hierarchy বোঝাতে → `classDiagram`
  - ধাপে-ধাপে ফ্লো/লাইফসাইকেল → `flowchart` / `graph LR`
  - সময়ের সাথে events/interaction → `sequenceDiagram`
  - স্টেট বদলানো (transaction, job status) → `stateDiagram-v2`
  - টুল/অপশন তুলনা → টেবিল (ইতিমধ্যে আছে, ডায়াগ্রামের দরকার নেই)
- **বসানোর জায়গা:** প্রতিটা সেকশনে existing `**Description:**` লাইনের ঠিক পরে, `**মনে রাখার পয়েন্ট:**`/`**৬টা Key Point:**`-এর আগে। মূল টেক্সট কনটেন্ট **অপরিবর্তিত** থাকবে — শুধু ডায়াগ্রাম যোগ হবে।
- **স্কোপ:** প্রতি সেকশনে ১টা ডায়াগ্রাম, ছোট ও রিভিশন-ফ্রেন্ডলি (৫-১০ সেকেন্ডে চোখ বোলানো যায় এমন) — বড় জটিল ডায়াগ্রাম না।
- **কোন ফাইলে বাদ:** `11-hr-questions.md`, `12-questions-to-ask.md`, `13-automatrix-services-research.md` — এগুলো narrative/প্রশ্নভিত্তিক, ডায়াগ্রামযোগ্য টেকনিক্যাল সম্পর্ক নেই। বাদ।

---

## 01-oop-design-pattern.md ✅ done

- [ ] ১. OOP-এর চার স্তম্ভ → `classDiagram`: একটা PaymentGateway উদাহরণে Encapsulation (private state), Abstraction (interface), Inheritance (base→child হলে কেন সমস্যা), Polymorphism (একই কলে ভিন্ন implementation) একসাথে দেখানো
- [ ] ২. SRP → `flowchart`: Fat Controller ভেঙে Controller → FormRequest → Service → Model — ৪টা বক্স, প্রতিটার responsibility label সহ
- [ ] ৩. OCP → `graph LR`: বাম দিকে "if/else ছড়ানো" (❌), ডান দিকে DiscountCalculator → DiscountStrategy interface → FixedDiscount/PercentDiscount (✅) — before/after পাশাপাশি
- [ ] ৪. LSP + ISP → `classDiagram`: Rectangle ← Square (LSP ভাঙার ক্লাসিক কেস, override এ exception) + ফ্যাট interface ভেঙে ছোট ২-৩টা interface-এ (ISP)
- [ ] ৫. DIP → `graph LR`: NotificationService → SmsGateway interface → SslWirelessGateway/অন্য implementation — high-level module directly concrete class-এর ওপর না, interface-এর ওপর নির্ভর করছে সেটা তীর দিয়ে দেখানো
- [ ] ৬. Factory ও Strategy → `classDiagram`: PaymentGatewayFactory creates → PaymentGateway interface ← BkashGateway/NagadGateway; পাশে Strategy হিসেবে DiscountStrategy একইভাবে
- [ ] ৭. Repository ও Service Layer → `flowchart` layered: Controller → Service (business logic) → Repository (data access) → Eloquent/DB, ডানে নোট "storage বদলালে শুধু Repository বদলায়"
- [ ] ৮. Observer ও Event-driven → `sequenceDiagram`: OrderController ->> Event: OrderPlaced dispatch; Event -->> SMS Listener, Stock Listener, Invoice Listener (parallel/async, `ShouldQueue` নোট সহ)
- [ ] ৯. Singleton, Facade, Anti-pattern → `graph LR`: Facade (static-looking call) → Container → resolved singleton instance (mock করা যায় এই পয়েন্ট হাইলাইট); আলাদা ছোট বক্সে "God Object" anti-pattern (একটা ক্লাস অনেক responsibility-র সাথে কানেক্টেড)
- [ ] ১০. Composition over Inheritance → `graph TB`: বাম দিকে গভীর inheritance tree (fragile), ডান দিকে flat composition (behavior interface inject করা) — before/after; Decorator wrap করার ছোট চেইনও (Service → CachedService wrap)

## 02-problem-solving.md ✅ done

- [ ] ১. Two Sum → `flowchart`: array iterate করতে করতে hash map build হওয়া, প্রতি ধাপে lookup — ছোট ৩-৪ ধাপের ট্রেস
- [ ] ২. Valid Parentheses → `flowchart`/stack visual: push/pop হওয়া bracket-এর ধাপে-ধাপে stack অবস্থা
- [ ] ৩. Longest Substring Without Repeating → `flowchart`: sliding window-এর left/right pointer একটা sample string-এর ওপর move করা, window expand/shrink মুহূর্ত হাইলাইট
- [ ] ৪. Merge Intervals → `graph LR`: sort করা intervals টাইমলাইনে বসানো, overlap হওয়া pair-গুলো merge হয়ে একটায় পরিণত হওয়া (আগে/পরে)
- [ ] ৫. Top K Frequent Elements → `flowchart`: hash map frequency count → bucket/heap-এ sort → top K বাছাই, ৩ ধাপ

## 03-laravel-backend.md

- [ ] ১. Request Lifecycle → `sequenceDiagram`: Client → public/index.php → Kernel → Middleware stack → Router → Controller → Response, ফিরতি পথও
- [ ] ২. Service Container vs Provider → `graph LR`: ServiceProvider (register/boot) → bind হওয়া interface → Container resolve করে Controller-এ inject
- [ ] ৩. N+1 Problem → `graph LR`: বাম — loop-এর ভেতর প্রতিবার query (N+1, ❌ red), ডান — `with()` eager load একটা query-তে join (✅ green)
- [ ] ৪. Queue ও Job ডিজাইন → `sequenceDiagram`: Controller dispatch → Queue (Redis/DB) → Worker picks → Job handle() → retry/failed path
- [ ] ৫. Middleware → `flowchart`: Request → Middleware 1 (auth) → Middleware 2 (tenant) → Middleware 3 (permission) → Controller, প্রতিটায় "pass/reject" branch
- [ ] ৬. Transaction ও Race Condition → `sequenceDiagram`: দুই concurrent request একই row-তে race করলে কী হয় (lock ছাড়া vs `lockForUpdate` দিয়ে) — দুই প্যানেল
- [ ] ৭. Sanctum vs Passport → `graph LR`: দুই ফ্লো পাশাপাশি — Sanctum (SPA/token, সহজ) vs Passport (OAuth2 grant types, third-party)
- [ ] ৮. Event, Listener, Observer → `sequenceDiagram`: Model save → Observer hook (created/updated), আলাদা Event dispatch → একাধিক Listener (fan-out)
- [ ] ৯. Multi-tenant Architecture → `graph TB`: Landlord DB (central) থেকে tenant resolve → `TenantManager::reconnect()` → Tenant DB — Sokrio-র নিজস্ব প্যাটার্নের রেফারেন্স
- [ ] ১০. Scale ও Performance → `graph LR`: Request path-এ bottleneck পয়েন্টগুলো (DB query, cache miss, N+1, queue backlog) আর প্রতিটার সমাধান তীর দিয়ে

## 04-aws-server-tools.md ✅ done

- [ ] ১. Standard AWS Deployment Architecture → `graph TB`: Route53 → CloudFront → ALB → EC2/ECS (multi-AZ) → RDS (primary+replica), S3 পাশে — পূর্ণ আর্কিটেকচার ডায়াগ্রাম
- [ ] ২. EC2 vs ECS/Fargate vs Lambda → `graph LR`: তিনটা compute অপশন পাশাপাশি, ম্যানেজমেন্ট লেভেল কম→বেশি স্পেকট্রাম হিসেবে
- [ ] ৩. RDS Production Operations → `graph LR`: Primary → Read Replica(s), ব্যাকআপ/snapshot flow, failover পাথ
- [ ] ৪. S3 ও CloudFront → `sequenceDiagram`: User request → CloudFront edge (cache hit/miss) → origin S3 fetch → cache করে ফেরত
- [ ] ৫. IAM → `graph TB`: Root → IAM User/Role → Policy attach → Resource access, least-privilege নোট সহ
- [ ] ৬. Auto Scaling ও Load Balancing → `graph LR`: ALB → Target Group → Auto Scaling Group (min/desired/max), CPU metric থেকে scale-out trigger
- [ ] ৭. Docker ও Container Workflow → `flowchart`: Dockerfile build → Image → Registry push → Container run, dev→prod পাইপলাইন
- [ ] ৮. CI/CD Pipeline → `flowchart`: Git push → CI (test/build) → Image/Artifact → CD (deploy) → Production, রোলব্যাক arrow সহ
- [ ] ৯. Monitoring, Logging, Alerting → `graph LR`: App → CloudWatch Logs/Metrics → Alarm threshold → SNS/Alert (Slack/Email)
- [ ] ১০. Linux Server Essentials → স্কিপ (কমান্ড-ভিত্তিক টপিক, ডায়াগ্রাম দরকার নেই) — মার্ক করে রাখা শুধু, খালি রাখা ঠিক আছে

## 05-relational-database.md

- [ ] ১. Index → `graph LR`: B-Tree index স্ট্রাকচার সরলীকৃত (root → branch → leaf) vs full table scan তুলনা
- [ ] ২. Transaction Isolation Level → `graph LR`: Read Uncommitted → Read Committed → Repeatable Read → Serializable স্পেকট্রাম, প্রতিটায় কোন anomaly বন্ধ হয়
- [ ] ৩. Slow Query Debug → `flowchart`: Slow query শনাক্ত → EXPLAIN চালানো → index missing/full scan শনাক্ত → fix (index/rewrite) → verify — ডিবাগ ফ্লো
- [ ] ৪. Normalization vs Denormalization → `graph LR`: একটা টেবিল split হয়ে normalized ফর্মে (৩NF) vs জয়েন এড়াতে denormalized কলাম — পাশাপাশি
- [ ] ৫. JOIN-এর ধরন → `graph LR`: INNER/LEFT/RIGHT/FULL JOIN-এর ভেন-ডায়াগ্রাম স্টাইল ওভারল্যাপ ভিজুয়াল
- [ ] ৬. Locking → `sequenceDiagram`: দুই transaction একই row lock করতে গেলে deadlock হওয়ার মুহূর্ত (Optimistic vs Pessimistic দুই প্যানেল)
- [ ] ৭. DB Scaling → `graph TB`: Replication (primary→replica), Sharding (key দিয়ে ডেটা split), Partitioning (একই টেবিল ভেতরে split) — তিনটা প্যাটার্ন পাশাপাশি
- [ ] ৮. SQL vs NoSQL → `graph LR`: দুই মডেলের ডেটা শেপ (rows+joins vs documents) সরল তুলনা
- [ ] ৯. Migration বড় টেবিলে → `flowchart`: নিরাপদ migration ধাপ — add nullable column → backfill background → constraint enforce → cleanup
- [ ] ১০. ACID → `graph LR`: চারটা প্রপার্টি (Atomicity, Consistency, Isolation, Durability) থেকে বাস্তব trade-off (eventual consistency) পর্যন্ত স্পেকট্রাম

## 06-system-design-bd.md ✅ done

- [ ] ১. Order & Stock Management → `graph TB`: Client → API → Order Service → Stock check/lock → Payment → Notification, পূর্ণ সিস্টেম ডায়াগ্রাম
- [ ] ২. Ticket Management System → `graph TB`: Ticket create → Queue/Assign → Agent → Status transition (`stateDiagram-v2`: Open→In Progress→Resolved→Closed)
- [ ] ৩. Heavy-load Background Job (Report) → `sequenceDiagram`: User request → Job dispatch → Queue → Worker generates → S3/storage → Notify user (email/download link)
- [ ] ৪. User CSV Registration → `flowchart`: CSV upload → validate rows → Job per chunk → success/failure per row → summary notification
- [ ] ৫. Failed Job Handling ও Backup → `stateDiagram-v2`: Job states — Pending → Processing → Failed → Retry (backoff) → Dead Letter/Manual review

## 07-kafka-redis-rabbitmq.md ✅ done

- [ ] ১. Kafka vs RabbitMQ vs Redis → `graph LR`: use-case ভিত্তিক ডিসিশন ট্রি (high-throughput log? → Kafka; task queue+routing? → RabbitMQ; cache/simple pub-sub? → Redis)
- [ ] ২. Redis Data Structures → `graph LR`: String/Hash/List/Set/Sorted Set — প্রতিটার একটা বাস্তব use-case টাইপ mapping (session, cache, queue, leaderboard)
- [ ] ৩. Cache Strategy ও Invalidation → `sequenceDiagram`: Cache-aside pattern (miss → DB → set cache) + invalidation trigger (write হলে delete/update key)
- [ ] ৪. Delivery Guarantee ও Idempotency → `graph LR`: At-most-once / At-least-once / Exactly-once স্পেকট্রাম, idempotency key দিয়ে duplicate handle
- [ ] ৫. Kafka Architecture → `graph TB`: Producer → Topic (multiple Partitions) → Consumer Group (একেক consumer একেক partition)
- [ ] ৬. RabbitMQ Exchange ও Routing → `graph LR`: Producer → Exchange (direct/topic/fanout) → Binding → Queue(s), Dead Letter Queue আলাদা arrow-এ
- [ ] ৭. Redis Persistence ও Cluster → `graph TB`: RDB snapshot vs AOF log; Cluster mode-এ master-replica shard বিন্যাস
- [ ] ৮. Queue Worker Scaling ও Backpressure → `graph LR`: Producer rate বাড়লে Queue বাড়া → Worker pool auto-scale, backpressure limit trigger
- [ ] ৯. Pub/Sub vs Queue → `graph LR`: Queue (একজন consume করলে গায়েব) vs Pub/Sub (সব subscriber পায়) — পাশাপাশি ফ্যান-আউট
- [ ] ১০. Event-driven Architecture ঝুঁকি → `graph TB`: একটা flow বিভিন্ন সার্ভিসে event দিয়ে ছড়ানো — "invisible flow" সমস্যা visualize করা, observability (tracing) যোগ করলে কেমন দেখতে হয়

## 08-react-js.md

- [ ] ১. Rendering ও Reconciliation → `flowchart`: State change → Virtual DOM diff → Fiber reconciliation → real DOM patch (মিনিমাল update)
- [ ] ২. useEffect সঠিক ব্যবহার → `sequenceDiagram`: Render → DOM commit → Effect run → (dependency change) → Cleanup → Effect পুনরায় run
- [ ] ৩. State Management স্পেকট্রাম → `graph LR`: Local state → Context → Redux — কখন কোনটা, complexity স্কেলে বসানো
- [ ] ৪. memo/useMemo/useCallback → `graph LR`: Parent re-render → memo না থাকলে সব child re-render (❌) vs memo থাকলে শুধু prop-changed child (✅)
- [ ] ৫. Custom Hooks → `graph TB`: দুই কম্পোনেন্ট একই logic (fetch/form) আলাদা লিখছে (❌) vs shared `useX()` hook থেকে দুজনেই নিচ্ছে (✅)
- [ ] ৬. Controlled vs Uncontrolled → `graph LR`: Controlled (state ↔ input, দুই-দিকের arrow) vs Uncontrolled (ref দিয়ে সরাসরি DOM read, এক-দিকের arrow)
- [ ] ৭. React Router ও SPA → `graph TB`: URL change → Router match → Route component render, nested route হলে layout+outlet
- [ ] ৮. React 18+ Features → `flowchart`: Suspense boundary → fallback UI দেখানো → data ready হলে swap; Transition দিয়ে urgent vs non-urgent update আলাদা
- [ ] ৯. API Integration Pattern → `sequenceDiagram`: Component mount → API call → loading/error/success state transition, retry/error boundary সহ
- [ ] ১০. Component Design ও Testing → `graph TB`: Container/Presentational split, টেস্ট পিরামিড (unit → integration → e2e) ছোট triangle

## 09-nodejs.md

- [ ] ১. Event Loop → `graph TB`: Call Stack → (async op) → Callback Queue/Microtask Queue → Event Loop phases (timers, poll, check) — ক্লাসিক ডায়াগ্রাম
- [ ] ২. Blocking Code বিপদ → `graph LR`: বাম — sync CPU-heavy কাজ পুরো event loop ব্লক করছে (❌), ডান — worker thread/child process-এ অফলোড (✅)
- [ ] ৩. Promise/async-await Error Handling → `sequenceDiagram`: async ফাংশন কল → await চেইন → reject হলে try/catch/`.catch()` পাথ
- [ ] ৪. Streams → `flowchart`: Readable stream → chunk-by-chunk → Writable stream (pipe), backpressure নোট
- [ ] ৫. Cluster/PM2 Scaling → `graph TB`: Master process → fork → multiple Worker processes (same port, load balanced) — Node cluster মডেল
- [ ] ৬. Express/NestJS Architecture → `graph LR`: Request → Middleware → Router → Controller → Service → Response, NestJS হলে Module বক্স যোগ
- [ ] ৭. Security Essentials → স্কিপ (checklist-স্টাইল টপিক, ডায়াগ্রাম বাড়তি ভ্যালু দেয় না)
- [ ] ৮. Testing ও Debugging → স্কিপ (টুল-ভিত্তিক, ডায়াগ্রাম দরকার নেই)
- [ ] ৯. TypeScript Node Backend → স্কিপ (কনসেপ্ট প্রাথমিকভাবে সিনট্যাক্স-ভিত্তিক)
- [ ] ১০. Node.js vs PHP/Laravel → `graph LR`: দুই স্ট্যাকের request-handling মডেল পাশাপাশি (single-thread event loop vs process-per-request/PHP-FPM)

## 10-python.md

- [ ] ১. GIL → `graph LR`: Multi-thread হলেও GIL-এর কারণে একসাথে একটাই thread Python bytecode execute করছে (CPU-bound কাজে সমান্তরাল না) — visual
- [ ] ২. asyncio → `sequenceDiagram`: Event loop → একাধিক coroutine `await` পয়েন্টে switch করা (I/O bound concurrency, GIL-এর concurrency vs parallelism তফাত)
- [ ] ৩. FastAPI Architecture → `graph LR`: Request → Path Operation → Dependency Injection (`Depends`) → Pydantic validation → Response
- [ ] ৪. Decorator/Context Manager/Generator → `graph TB`: তিনটা concept-এর একটা করে মিনি ফ্লো (function wrap, with-block enter/exit, yield-এ lazy value flow)
- [ ] ৫. Data Structures Performance → স্কিপ (এটা তুলনা টেবিলেই ভালো ফিট করে, আগেও থাকতে পারে)
- [ ] ৬. Type Hints → স্কিপ (সিনট্যাক্স-ভিত্তিক)
- [ ] ৭. MongoDB Aggregation Pipeline → `flowchart`: Collection → `$match` → `$group` → `$sort` → `$project` — পাইপলাইন স্টেজ চেইন, প্রতিটা স্টেজে ডেটা শেপ বদলানো নোট
- [ ] ৮. Testing: pytest → স্কিপ (টুল-ভিত্তিক)
- [ ] ৯. Background Job/Task Queue → `sequenceDiagram`: FastAPI endpoint → Task Queue (Celery/RQ) → Worker → Result store/callback
- [ ] ১০. Python vs PHP vs Node → `graph LR`: তিন ভাষার concurrency মডেল পাশাপাশি (GIL thread vs PHP-FPM process vs Node event loop)

---

## রান করার অর্ডার (প্রস্তাবিত)

ওজন অনুযায়ী — ইন্টারভিউ-এ যেগুলো সবচেয়ে বেশি জিজ্ঞেস হয় সেগুলো আগে:

1. `01-oop-design-pattern.md` (সবচেয়ে ডায়াগ্রাম-নির্ভর টপিক)
2. `06-system-design-bd.md`
3. `03-laravel-backend.md`
4. `07-kafka-redis-rabbitmq.md`
5. `05-relational-database.md`
6. `04-aws-server-tools.md`
7. `08-react-js.md`
8. `09-nodejs.md`
9. `10-python.md`
10. `02-problem-solving.md`

## এক্সিকিউশন নিয়ম

- একবারে **একটা ফাইল** — শেষ হলে ফাইলটা VS Code preview-তে চোখ বুলিয়ে ঠিক আছে কিনা দেখে নেওয়া, তারপর পরেরটা
- মূল টেক্সট (Description, Key Points) **হুবহু অপরিবর্তিত** থাকবে — শুধু mermaid ব্লক ইনসার্ট
- যেসব সেকশন "স্কিপ" মার্ক করা, ওগুলোতে জোর করে ডায়াগ্রাম বসানো হবে না — ফাঁকা রাখাই ঠিক
- এই ফাইলের চেকবক্স ফাইল-লেভেলে টিক দাও (প্রতিটা ফাইল শেষ হলে ফাইলনামের লাইনে ✅), সেকশন-লেভেল চেকবক্স অপশনাল
