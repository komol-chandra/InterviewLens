> Tracker ID: FN-11 · Generated: 2026-09-28 · Source: backend-system-design-study-plan.md Phase 6+7, story-bank.md S1

# Microservices + Event-Driven Architecture — Q&A

## ১. Service boundary কীভাবে ঠিক করবে?

DDD-এর bounded context ধরে — একটা বিজনেস ক্যাপাবিলিটি নিজের ডেটা আর লজিক নিয়ে স্বাধীন থাকে। Field Nation-এর সম্ভাব্য বাউন্ডারি: Work Orders, Providers, Payments, Notifications, Ratings। নিয়ম: যদি দুটো জিনিস সবসময় একসাথে বদলায় বা একই ট্রানজ্যাকশনে লাগে, তারা সম্ভবত একই সার্ভিসে থাকা উচিত — অকারণে ভাঙলে distributed transaction-এর ব্যথা বাড়ে।

🔗 Sokrio link: S1 — মনোলিথ ভেঙে Report, Notification, SOP আলাদা সার্ভিসে সরানো হয়েছিল কারণ এগুলোর স্কেলিং/ডিপ্লয় প্যাটার্ন কোর অর্ডার সিস্টেম থেকে আলাদা ছিল।

## ২. Sync (REST/gRPC) বনাম Async (event) — কখন কোনটা?

Sync: রেসপন্স তখনই দরকার (যেমন "এই WO-টা কি valid?")। Async: side effect, যা এখনই ইউজারকে ব্লক করার দরকার নেই (নোটিফিকেশন পাঠানো, অডিট লগ লেখা, রিপোর্ট আপডেট করা)। Async decoupling দেয় — এক সার্ভিস ডাউন থাকলেও অন্যগুলো চলতে থাকে, spike absorb করে queue।

## ৩. RabbitMQ vs Kafka — পার্থক্য কী, কখন কোনটা?

RabbitMQ = message broker/task queue (exchange → binding → queue, ব্যবহারের পর মেসেজ চলে যায়, ack/nack দিয়ে নিশ্চিত)। Kafka = distributed log (topic-এ partition, প্রতিটা মেসেজের offset, consumer group নিজের গতিতে পড়ে, retention period পর্যন্ত মেসেজ থেকে যায় — replay করা যায়)।
- RabbitMQ ভালো: complex routing (topic/direct/fanout exchange), task distribution, DLQ দরকার হলে।
- Kafka ভালো: high-throughput event stream, একাধিক consumer একই ডেটা replay করতে চাইলে, event sourcing।

🔗 Sokrio link: S1 — RabbitMQ প্রোডাকশনে ব্যবহৃত হয়েছে সার্ভিস-টু-সার্ভিস কমিউনিকেশনে। Kafka শুধু "basics" লেভেলে জানা (weak-areas.md অনুযায়ী), গভীর প্রশ্নে সৎভাবে বলো: "Kafka হাতে-কলমে প্রোডাকশনে ব্যবহার করিনি, কিন্তু concept (partition, offset, consumer group) স্পষ্ট।"

## ৪. At-least-once delivery মানে কী, আর তার সমস্যা কী?

ব্রোকার গ্যারান্টি দেয় মেসেজ অন্তত একবার পৌঁছাবে — কিন্তু নেটওয়ার্ক/ack টাইমিং ইস্যুতে একই মেসেজ দুবার আসতে পারে। তাই consumer-কে duplicate-safe (idempotent) হতে হবে। "Exactly-once" বাস্তবে প্রায় সবসময় at-least-once + idempotent consumer দিয়ে সিমুলেট করা হয়, সত্যিকারের exactly-once ডেলিভারি বিতরিত সিস্টেমে ব্যবহারিকভাবে অসম্ভবের কাছাকাছি।

## ৫. Idempotent consumer কীভাবে বানাবে?

প্রতিটা ইভেন্টের একটা ইউনিক `event_id`। Consumer প্রসেস করার আগে একটা "processed_events" টেবিলে (বা Redis set-এ) চেক করে — থাকলে স্কিপ, না থাকলে প্রসেস করে ID সেভ করে (একই ট্রানজ্যাকশনে বিজনেস আপডেট + ID ইনসার্ট, যাতে ক্র্যাশে ইনকনসিসটেন্সি না হয়)।

🔗 Sokrio link: S5 — payment webhook-এ একই ধরনের idempotency key প্যাটার্ন ব্যবহৃত হয়েছে ("একই webhook দুবার এলে ডাবল-চার্জ হবে না")। এখানে সেই একই আইডিয়া কনজিউমার সাইডে।

## ৬. Transactional outbox pattern কী, কেন দরকার?

সমস্যা: একটা DB write (যেমন WO status আপডেট) আর একটা event publish (broker-এ) — দুটো আলাদা সিস্টেম, একটা ট্রানজ্যাকশনে বাঁধা যায় না। যদি DB commit হয় কিন্তু publish ফেল করে, বাকি সার্ভিসগুলো কখনো জানবে না।
সমাধান: একই DB ট্রানজ্যাকশনে বিজনেস টেবিল + একটা `outbox` টেবিলে ইভেন্ট রো ইনসার্ট করা (দুটোই atomic, কারণ একই DB)। একটা আলাদা relay process outbox টেবিল পোল করে ব্রোকারে পাবলিশ করে, সফল হলে outbox রো মার্ক/ডিলিট করে।

## ৭. Saga pattern — choreography vs orchestration

Distributed transaction-এ 2PC এড়ানো হয় কারণ ব্লকিং আর স্কেল করে না। সাগা = ধাপে ধাপে লোকাল ট্রানজ্যাকশন, প্রতিটার একটা compensating action আছে যদি পরের ধাপ ফেল করে।
- **Choreography:** প্রতিটা সার্ভিস ইভেন্ট শুনে নিজেই পরের ইভেন্ট পাবলিশ করে — কোনো কেন্দ্রীয় কন্ট্রোলার নেই। ছোট flow-এ ভালো, বড় হলে flow ট্র্যাক করা কঠিন হয়ে যায়।
- **Orchestration:** একটা কেন্দ্রীয় orchestrator প্রতিটা ধাপ কল করে আর ব্যর্থতায় compensation ট্রিগার করে। Flow দেখা সহজ, কিন্তু orchestrator single point of coordination হয়ে যায়।

**Approve & Pay সাগা (Field Nation-স্টাইল):**
```
Buyer approves WO
 → PaymentService: charge buyer (বা prepaid funds deduct)
 → PayoutService: schedule provider payout
 → WorkOrderService: status = Paid
 ✗ payout fails → compensate: refund/hold + status = Payment Issue + alert
```
এই ফ্লো-তে Payment→Payout দুই ধাপ, তাই choreography (PaymentCompleted ইভেন্ট শুনে PayoutService নিজেই কাজ করে) সহজ এবং যথেষ্ট — orchestration দরকার পড়ে যখন ৪-৫+ ধাপ আর জটিল conditional branching থাকে।

## ৮. DLX/DLQ (Dead Letter Exchange/Queue) কী কাজ করে?

কোনো মেসেজ বারবার (N বার) প্রসেস ফেল করলে সেটা মূল queue থেকে সরিয়ে একটা আলাদা DLQ-তে পাঠানো হয় — যাতে একটা "poison message" পুরো queue ব্লক না করে দেয়। DLQ পরে ম্যানুয়ালি ইন্সপেক্ট/রিপ্লে করা হয়।

## ৯. Ordering সমস্যা কীভাবে হ্যান্ডল করবে?

RabbitMQ-তে একটা single queue-তে অর্ডার বজায় থাকে, কিন্তু multiple consumer/prefetch থাকলে ভেঙে যায়। Kafka-তে একই partition key (যেমন `work_order_id`) দিলে সেই key-র সব ইভেন্ট একই partition-এ যায়, ফলে সেই key-র জন্য অর্ডার গ্যারান্টিড। ক্রস-এন্টিটি অর্ডারিং সাধারণত দরকারও হয় না — বিজনেসে "per-WO" অর্ডার যথেষ্ট।

## ১০. Monolith থেকে event-driven-এ migrate করার সময় সবচেয়ে বড় ঝুঁকি কী ছিল?

🔗 Sokrio link: S1 — "প্যারালাল রানে ডেটা সিঙ্ক কীভাবে হতো?", "সার্ভিস বাউন্ডারি কীভাবে ঠিক করেছিলে?" — এই ডিফেন্ড প্রশ্নগুলোর উত্তর `[Komol পূরণ করবে]` (story-bank-এ চিহ্নিত গ্যাপ)। বলার লাইন: "I led the move from a Laravel/Vue monolith to a core API plus separate Report, Notification and SOP services talking over RabbitMQ. We ran old and new in parallel and cut over with zero downtime. Server load dropped by about 20%."
