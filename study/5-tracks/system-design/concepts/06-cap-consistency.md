> Tracker ID: SD-06 · Generated: 2026-10-15 · Answers: **SD-Q06** (TRK-02 Phase 3) · Source: general SD knowledge + sokrio code (`MessageResendService::claim`, `config/database.php` `read` connection, A2 rollups) · Status: ✅ generated

# SD-Q06: Explain CAP and consistency. When is eventual consistency OK?

> **এক লাইনে:** নেটওয়ার্ক ভাঙবেই (Partition), তখন বাছতে হয়: **ভুল/পুরনো উত্তর দেব (Availability)**, নাকি **উত্তর দেব না (Consistency)**। আর নেটওয়ার্ক ঠিক থাকলেও বাছতে হয়: **দ্রুত** নাকি **টাটকা** (PACELC)। Eventual consistency চলে যেখানে কয়েক সেকেন্ড পুরনো ডেটায় **টাকা/স্টক/নিরাপত্তার ক্ষতি নেই**।

---

## ১. CAP: তিনটা অক্ষর

| অক্ষর | মানে |
|---|---|
| **C**onsistency | প্রতিটা read সর্বশেষ write দেখে (সব node একই উত্তর দেয়) |
| **A**vailability | প্রতিটা request উত্তর পায় (error/timeout না), যদিও পুরনো হতে পারে |
| **P**artition tolerance | node-গুলোর মধ্যে নেটওয়ার্ক কেটে গেলেও সিস্টেম চলে |

**ভুল ব্যাখ্যা:** "তিনটার মধ্যে দুটো বাছো।" **সঠিক:** distributed সিস্টেমে partition হবেই, তাই P বাধ্যতামূলক। আসল বাছাই শুধু **partition চলাকালীন**: **CP** (consistent থাকো, কিছু request ফিরিয়ে দাও) নাকি **AP** (উত্তর দাও, পরে মিলিয়ে নাও)।

| ধরন | partition হলে | উদাহরণ | কোথায় ঠিক |
|---|---|---|---|
| **CP** | যে পাশ নিশ্চিত না, সে লেখা/পড়া বন্ধ করে | ZooKeeper, etcd, ব্যাংক ledger, single-primary MySQL | টাকা, স্টক, lock, leader election |
| **AP** | দুই পাশই চলে, পরে conflict মেলায় | Cassandra, DynamoDB (ডিফল্ট), DNS, shopping cart | লাইক কাউন্ট, feed, presence, analytics |

### PACELC (CAP-এর বাস্তব সংস্করণ)
> **if P**artition → **A** or **C**; **E**lse (স্বাভাবিক সময়ে) → **L**atency or **C**onsistency।

স্বাভাবিক সময়েও replica-তে sync করে লেখা (consistent) মানে ধীর; async লেখা মানে দ্রুত কিন্তু replica পুরনো। **Read replica-র replication lag ঠিক এই "EL" বাছাই।** ইন্টারভিউতে PACELC বললে গভীরতা দেখায়।

---

## ২. Consistency-র স্তর (শক্ত থেকে নরম)

| মডেল | গ্যারান্টি | উদাহরণ |
|---|---|---|
| **Strong / Linearizable** | লেখা শেষ হলেই সবাই নতুন মান দেখে | primary DB-তে read, bank balance |
| **Read-your-writes** | **আমি** যা লিখেছি, আমি সাথে সাথে দেখব (অন্যরা পরে দেখতে পারে) | প্রোফাইল এডিট করে রিফ্রেশ |
| **Monotonic reads** | একবার নতুন মান দেখলে আর পুরনোটা দেখব না | এক replica-তে sticky থাকা |
| **Causal** | কারণ-ফলের ক্রম ঠিক থাকে (প্রশ্নের আগে উত্তর না দেখা) | কমেন্ট থ্রেড |
| **Eventual** | লেখা থামলে শেষমেশ সবাই একই মান দেখবে | DNS, cache, search index, analytics summary |

> **ব্যবহারিক কৌশল:** পুরো সিস্টেম eventual রেখে **user-এর নিজের লেখার জন্য** read-your-writes দাও (লেখার পর কয়েক সেকেন্ড সেই user-এর read primary থেকে)। বেশিরভাগ UX সমস্যা এতেই মেটে।

---

## ৩. Eventual consistency কখন চলে?

প্রশ্ন করো: **"কয়েক সেকেন্ড/মিনিট পুরনো ডেটা দেখালে কার কী ক্ষতি?"**

| ✅ চলে | ❌ চলে না |
|---|---|
| লাইক/ভিউ কাউন্ট, follower সংখ্যা | একাউন্ট ব্যালান্স, পেমেন্ট |
| রিপোর্ট, ড্যাশবোর্ড, benchmark | শেষ স্টক বিক্রি (oversell) |
| search index, recommendation | unique username / ডাবল বুকিং |
| notification "read" স্ট্যাটাস | permission revoke (সরানো ইউজার যেন আর ঢুকতে না পারে) |
| cache, CDN | lock, leader election |
| technician-এর লোকেশন (কয়েক সেকেন্ড পুরনো) | একটা job দুজনকে assign হওয়া |

**এক সিস্টেমে দুটোই:** e-commerce-এ product catalog আর রিভিউ = eventual; checkout-এ stock + payment = strong। ইন্টারভিউতে প্রতিটা ডেটার জন্য আলাদা করে বলো, পুরো সিস্টেমের জন্য একটা না।

### Conflict মেলানো (AP সিস্টেমে)
- **Last-write-wins** (timestamp): সহজ, কিন্তু ডেটা হারাতে পারে
- **Version vector / merge:** শপিং কার্ট দুই পাশের item মিলিয়ে নেয়
- **CRDT:** গাণিতিকভাবে নিরাপদ merge (counter, set)। নাম জানলেই যথেষ্ট

---

## ৪. Distributed transaction (সংক্ষেপে)

| পদ্ধতি | কীভাবে | খরচ |
|---|---|---|
| **2PC** (two-phase commit) | coordinator সবাইকে "prepare" → সবাই হ্যাঁ বললে "commit" | blocking, coordinator মরলে আটকে যায়; microservice-এ এড়ানো হয় |
| **Saga** | প্রতিটা সার্ভিস নিজের local transaction; ব্যর্থ হলে আগেরগুলোর **compensating action** (refund) | eventual, compensation লজিক লিখতে হয় (→ DP-Q15) |
| **Outbox** | DB write আর "event পাঠাও" একই local transaction-এ, পরে relay পাঠায় | event হারায় না, কিন্তু at-least-once (→ SD-Q07) |

---

## ৫. মুখে বলার লাইন (English)

**CAP (৩০ সেকেন্ড):**
> "CAP says that during a network partition you have to choose between consistency and availability, since partitions will happen in any distributed system. CP systems refuse some requests to stay correct; AP systems keep answering and reconcile later. PACELC adds the everyday part: even without a partition, you trade latency for consistency, which is exactly what replication lag on a read replica is."

**কখন eventual (মূল অংশ):**
> "I decide per piece of data, not per system. I ask: if a user sees data a few seconds old, does anyone lose money, stock or access? Like counts, dashboards, search and reports are fine eventually consistent. Balances, the last unit of stock, and permission changes need strong consistency. And for user experience I add read-your-writes, so people always see their own changes immediately."

**Sokrio উদাহরণ:**
> "In Sokrio both live side by side. Our benchmark rollups are rebuilt by a scheduled job, so they're eventually consistent by design, and that's fine for monthly market data. But when I built bulk SMS resend, the tenant's SMS balance had to be strongly consistent: two admins resending at once must not both pass the balance check. So the claim runs under a per-tenant lock, inside a transaction with row locks, and it subtracts what other in-flight resends have already reserved."

---

## ৬. ফলো-আপ প্রশ্ন

| প্রশ্ন | ছোট উত্তর |
|---|---|
| "Is MySQL CP or AP?" | "A single primary is consistent; with async replicas, reads from replicas are eventually consistent. With failover you can lose recent writes, so it depends on configuration." |
| "User updates profile, refreshes, sees old data. Fix?" | "Read-your-writes: after a write, route that user's reads to the primary for a short window, or return the new value from the write response." |
| "How long is 'eventually'?" | "Usually milliseconds to seconds. I'd measure replication lag and alert if it crosses a threshold, because 'eventually' needs a bound to be acceptable." |
| "Quorum?" | "With N replicas, if write quorum W plus read quorum R is greater than N, every read overlaps the latest write. That's how Dynamo-style stores tune consistency." |

---

🔗 **Sokrio link:** (কোডে যাচাই করা)
- **তোমার নিজের strong consistency (সবচেয়ে ভালো):** `app/Services/SMS/MessageResendService.php::claim()` (Komol, 2026-10-05/06): `Cache::lock('sms-resend:{tenant}:claim')` + `DB::transaction` + `lockForUpdate()`, আর অন্য চলমান resend-এর **reserved** SMS বাদ দিয়ে balance চেক। ব্যালান্স কম হলে transaction rollback, row আবার `failed`।
- **Eventual by design (A2, B5):** `order_rollups_monthly` scheduled job লেখে; benchmark cache TTL ৩ ঘণ্টা।
- **PACELC-এর বাস্তব রূপ:** ২৭টা report job `reconnect('read')` করে (SD-Q04) → রিপোর্ট replica lag মেনে নেয়, write DB মুক্ত থাকে।
- **Per-tenant DB (S3):** এক টেন্যান্টের ভেতরে strong consistency সহজ (এক DB); cross-tenant (benchmark) সবসময় eventual।

📚 আগে: [05-sql-vs-nosql.md](05-sql-vs-nosql.md) · পরে: [07-queues.md](07-queues.md)
