> Tracker ID: FN-05 · Generated: 2026-09-28 · Source: `00-research/backend-system-design-study-plan.md` Phase 4, `_memory/story-bank.md` S2

# MySQL Advanced — Field Nation SE

JD-তে লেখা "Knowledge of SQL, MySQL specifically is a plus", কিন্তু একটা work-order marketplace আসলে transaction-heavy, তাই এটাকে 🔴 must হিসেবেই ধরো।

## Q1. Composite index আর leftmost prefix কী?

InnoDB-তে composite index `(a, b, c)` একটা single B-tree, যেখানে key = `a` তারপর `b` তারপর `c` — এভাবে sort করা থাকে। **Leftmost prefix rule:** query-তে যদি `a` না থাকে, ইনডেক্স ব্যবহার হবে না (বা partial হবে)। তাই `WHERE b=? AND c=?` কাজ করবে না এই ইনডেক্সে, কিন্তু `WHERE a=?` বা `WHERE a=? AND b=?` কাজ করবে।

কখন ইনডেক্স ব্যবহার হয় **না**: column-এর ওপর ফাংশন (`WHERE YEAR(created_at)=2026`), leading `%LIKE`, implicit type cast (varchar column-কে int দিয়ে compare)।

🔗 Sokrio link: S2 — রিপোর্ট অপ্টিমাইজেশনে composite index যোগ করে ৮৫% পর্যন্ত লোড টাইম কমানো।

## Q2. EXPLAIN আউটপুট কীভাবে পড়বে?

- `type`: `const` > `ref` > `range` > `index` > `ALL` (ALL মানে full table scan — খারাপ)
- `key`: কোন ইনডেক্স আসলে ব্যবহার হলো
- `rows`: MySQL কত রো স্ক্যান করবে বলে অনুমান করছে
- `Extra`: `Using index` (covering index, ভালো) · `Using filesort` (extra sort দরকার, খারাপ হতে পারে) · `Using temporary` (temp টেবিল, খারাপ)

**Covering index** = query-র সব কলাম ইনডেক্সেই আছে, টেবিলে ফিরে যেতে হয় না।

🔗 Sokrio link: S2 — "কোন index যোগ করেছিলে, EXPLAIN-এ কী দেখেছিলে" এটা Defend লাইনে আছে, নিজের আসল উদাহরণ দিয়ে ভরাট করো: `[Komol পূরণ করবে: EXPLAIN-এর আগে/পরে rows আর Extra কেমন ছিল]`

## Q3. Window function দিয়ে "প্রতি অঞ্চলে টপ ৩ provider" কীভাবে লিখবে?

```sql
SELECT provider_id, region_id, completed_count
FROM (
  SELECT provider_id, region_id,
         COUNT(*) AS completed_count,
         ROW_NUMBER() OVER (PARTITION BY region_id ORDER BY COUNT(*) DESC) AS rn
  FROM work_orders
  WHERE status = 'completed' AND completed_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
  GROUP BY provider_id, region_id
) ranked
WHERE rn <= 3;
```

`ROW_NUMBER`, `RANK`, `LAG`/`LEAD` — running total বা "আগের রো"-র সাথে তুলনার জন্য।

🔗 Sokrio link: MongoDB aggregation দিয়ে সমতুল্য কাজ করেছি (S2), কিন্তু MySQL window function-এর সরাসরি প্রোডাকশন উদাহরণ নেই — এভাবে বলো: "Sokrio-তে এই ধরনের ranking MongoDB aggregation দিয়ে করতাম, কিন্তু MySQL-এ window function-এর সিনট্যাক্স আমি জানি এবং প্র্যাকটিস করেছি।"

## Q4. CTE (সাধারণ ও recursive) কোথায় লাগে?

সাধারণ CTE readability-র জন্য (subquery-র বদলে নাম দেওয়া)। **Recursive CTE** — territory/region hierarchy ট্রি ট্রাভার্স করতে (parent → child → grandchild)।

🔗 Sokrio link: territory-scoped RBAC (S3)-এ hierarchy আছে, কিন্তু ওটা MongoDB-তে aggregation দিয়ে — এভাবে বলো: "আমাদের territory hierarchy MongoDB-তে ছিল, recursive CTE MySQL-এ একই প্যাটার্নের সমাধান হতো।"

## Q5. Transaction isolation levels — REPEATABLE READ vs READ COMMITTED

InnoDB default = **REPEATABLE READ** (MVCC দিয়ে phantom read আটকায় gap lock সহ)। READ COMMITTED-এ প্রতিটা statement নতুন snapshot নেয় (কম lock, কিন্তু non-repeatable read সম্ভব)। **Phantom read** = একই transaction-এ দুইবার একই range query চালালে নতুন রো দেখা যায়।

## Q6. Deadlock কীভাবে আটকাবে?

কারণ: দুইটা transaction বিপরীত ক্রমে লক নিচ্ছে। সমাধান: **consistent lock order** (সব জায়গায় একই ক্রমে row lock নাও — যেমন সবসময় লোয়ার id আগে), ছোট transaction, retry-with-backoff logic অ্যাপ লেয়ারে।

## Q7. "দুইজন টেকনিশিয়ান একসাথে Accept করলে" — race condition সমাধান (Field Nation-এর মূল প্রশ্ন)

তিনটা সমাধান, সবচেয়ে সহজেরটা আগে:

1. **Conditional UPDATE (সবচেয়ে সহজ, recommended):**
```sql
UPDATE work_orders
SET provider_id = ?, status = 'assigned'
WHERE id = ? AND status = 'published';
-- affected_rows চেক করো: 1 হলে জিতেছ, 0 হলে অন্য কেউ আগেই নিয়েছে
```
2. **SELECT ... FOR UPDATE** — transaction-এর ভেতর row lock নিয়ে read-then-write (pessimistic)।
3. **Optimistic locking** — `version` column, `UPDATE ... WHERE id=? AND version=?`, affected_rows=0 মানে conflict, retry করো।

🔗 Sokrio link: সরাসরি এই exact race condition নেই — এভাবে বলো: "আমার কাছে conditional-UPDATE + affected_rows চেক করার প্যাটার্ন পরিচিত, কারণ multi-tenant order status transition-এও একই রেসের ঝুঁকি ছিল, যেখানে queue job আর user action একসাথে একই order আপডেট করতে পারত।" `[Komol পূরণ করবে: এমন কোনো নির্দিষ্ট Sokrio ঘটনা থাকলে]`

## Q8. N+1 সমস্যা কী, কীভাবে ধরবে/ঠিক করবে?

লুপে প্রতিটা আইটেমের জন্য আলাদা query চালানো (১ + N)। ধরার উপায়: query log/Telescope-এ একই প্যাটার্নের বহু query। ঠিক করা: eager loading (`with()`/`JOIN`), batch loading (dataloader প্যাটার্ন)।

🔗 Sokrio link: S2 — রিপোর্ট অপ্টিমাইজেশনে N+1 দূর করা CV-তে সরাসরি আছে।

## প্র্যাকটিস SQL (নিজে লেখো, `practical/14-sql`-এও প্র্যাকটিস করো)

1. গত মাসে অঞ্চলপ্রতি টপ ৩ provider (উপরে Q3-এ সমাধান)
2. গত ৩০ দিনে কোনো WO-তে check-in করেনি এমন provider
3. buyer-প্রতি average `published → assigned` সময়
4. Data quality: check-out, check-in-এর আগে হয়েছে এমন WO
5. Provider-প্রতি সাপ্তাহিক payout-এর running total (window function)
6. Index ডিজাইন: `WHERE buyer_id=? AND status=? ORDER BY scheduled_at DESC LIMIT 20` → কম্পোজিট ইনডেক্স `(buyer_id, status, scheduled_at)`

**Done when:** EXPLAIN আউটপুট জোরে পড়ে ব্যাখ্যা করতে পারো, আর একটা কম্পোজিট ইনডেক্স ডিজাইন করে কারণ বলতে পারো।
