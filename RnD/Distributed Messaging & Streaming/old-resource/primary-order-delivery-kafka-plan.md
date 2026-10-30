# Dev Plan — Primary Order & Delivery Summary via Kafka

> Status: **Draft — awaiting approval** (per `/sokrio-planning` protocol, Phase 1 code
> should not start until this is signed off).
> Written: 2026-09-08
> Repo: `sokrio-server` (branch at time of writing: `bulk-upload-error-visualization` —
> this work should start from a fresh branch, e.g. `kafka-primary-order-delivery`)
> Related: `_sprintSep/Kafka/order_summary/PR-5094-breakdown.md` (the Kafka
> infra + Tracking pilot this plan builds on — see §1)

---

## 1. What already exists (verified against current code, not the Aug PR doc)

PR #5094 (Aug 2026) only shipped generic Kafka plumbing + one proven pilot
(**Tracking**). Since then the infra has matured a lot further than that PR
described — batch consumption, graceful shutdown, dynamic group membership,
retry/backoff are all live today:

| Piece | File | State |
|---|---|---|
| Producer | `app/Services/Kafka/KafkaProducer.php` | Live, synchronous, used by `TrackingController` |
| Consumer transport | `app/Services/Kafka/KafkaConsumer.php` | Live — buffers into batches (`batch_size`/`batch_interval`), one offset-commit per partition per flush, signal-safe shutdown, join-group retry, mid-poll failure backoff |
| Consumer command | `app/Console/Commands/Kafka/ConsumeCommand.php` | `kafka:consume {topic}`, dispatch table is `ConsumeCommand::HANDLERS` — **only `tracking` is registered today** |
| Handler contract | `app/Contracts/Kafka/KafkaMessageHandlerInterface.php` | `handleBatch(list<{tenant_id,event_type,payload}>): void` |
| Proven handler | `app/Services/Kafka/Handlers/TrackingMessageHandler.php` | Groups batch by tenant, reconnects tenant DB once per tenant, bulk-persists via `WriteBulkTrackingActions`, retries 3x then degrades to per-point writes, never throws out of `handleBatch` |
| Topic registry | `app/Services/Kafka/TopicRegistry.php` | Already has **placeholder** keys `ORDER_SUMMARIES` / `DELIVERY_SUMMARIES` and event constants `ORDER_SUMMARY_UPDATED` / `DELIVERY_SUMMARY_UPDATED` — **but these were wired for the retail/secondary `Order`/`Delivery` models**, see §1a |
| Config | `config/kafka.php` | `batch_size=200`, `batch_interval=1.0s`, `max_runtime=21600s`, consumer timeouts, `group_id` — all tenant-agnostic, reusable as-is |

### 1a. Important disambiguation — "Order" ≠ "Primary Order" in this codebase

There are **two unrelated order domains** in sokrio-server and the existing
Kafka scaffolding targets the wrong one for this task:

- **Retail / secondary order** (`App\Models\Order\Order`, `App\Models\Order\Delivery`
  — MySQL tenant tables). `OrderObserver` / `DeliveryObserver` already exist
  (`app/Observers/OrderObserver.php`, `DeliveryObserver.php`), registered in
  `AppServiceProvider.php:100-101`, using the placeholder `ORDER_SUMMARIES` /
  `DELIVERY_SUMMARIES` topics — **but their `publishToKafka()` calls are
  commented out** (`// $this->publishToKafka($order);`). This is a separate,
  not-yet-approved piece of work and is **out of scope** for this plan.
- **Primary order** (distributor/company-level order — what this task is
  actually about) lives **natively in MongoDB**, not MySQL:
  `App\Models\MongoDB\PrimaryOrder\PrimaryOrder` (collection `primary_orders`)
  and `App\Models\MongoDB\PrimaryOrder\PrimaryDelivery` (collection
  `primary_deliveries`). There is no MySQL primary-order table to observe.

Because both domains share the generic `ORDER_SUMMARIES`/`DELIVERY_SUMMARIES`
names, **new, distinctly-named topic keys are required** (§3) so the two
pipelines never collide on the same Kafka topic or consumer-group offsets.

### 1b. Current Primary Order/Delivery summary pipeline (what we're replacing the latency of)

This is a **batch/cron pipeline today, no Kafka involved**:

1. A Primary Order/Delivery is created or its status changes via
   `app/Http/Controllers/PrimaryOrder/OrderController.php` (`store()` →
   `OrderRequest::save()`, `update()`) and
   `app/Http/Controllers/PrimaryOrder/OrderDeliveryController.php::store()`.
   These write directly to the `primary_orders` / `primary_deliveries` Mongo
   collections — no domain event is emitted today.
2. Status transitions go through `App\Models\MongoDB\PrimaryOrder\PrimaryOrderStatus`
   (a Mongo model). Its `created` boot-observer
   (`app/Models/MongoDB/PrimaryOrder/PrimaryOrderStatus.php:30-63`)
   synchronously (a) pushes `status` back onto the parent `PrimaryOrder` doc
   and (b) does `PrimaryOrderSummary::where('order_id', ...)->update(['latest_status' => ...])`
   — the **only** part of the summary that updates in real time today.
3. Everything else in the summary (one line-doc per product per order —
   pricing, buyer/seller/territory snapshot, badge, promotion, etc.) is
   rebuilt **hourly** by scheduled commands
   (`app/Console/Kernel.php:134-135`):
   ```
   tenant:primary_order_summary_mongodb    --resync=false   hourlyAt(45)
   tenant:primary_delivery_summary_mongodb --resync=false   hourlyAt(55)
   tenant:primary_order_summary_mongodb    --date=... --resync=true   dailyAt 06:30  (full-day reconciliation)
   tenant:primary_delivery_summary_mongodb --date=... --resync=true   dailyAt 06:40
   ```
   These dispatch `PrimaryOrderSummaryMongoDBJob` / `PrimaryDeliverySummaryMongoDBJob`
   (`app/Jobs/`), which call
   `App\Models\MongoDB\PrimaryOrder\SummariesQuery::generate($from, $to, [...], $orderId = null)`
   to pull the last hour's orders/deliveries out of Mongo, denormalize them
   into line-item docs, and `bulkWrite()` upserts into `PrimaryOrderSummary`
   / `PrimaryDeliverySummary` (`app/Models/MongoDB/PrimaryOrderSummary.php`,
   `PrimaryDeliverySummary.php`).
4. **Net effect:** a newly placed primary order can take up to ~1h + job
   runtime before it shows correctly in `PrimaryOrderSummary` (used by
   `app/Http/Controllers/V3/Report/PrimaryOrderSummaryReportController.php`
   and downstream dashboards/benchmarks) — status is faster (near-instant)
   but the line-item breakdown is not.

**This is the actual problem this task solves**: replace the ~1h batch
latency with a near-real-time Kafka pipeline, the same way Tracking went
from "whatever the sync write path did" to a Kafka-driven near-real-time
consumer.

Crucially — `SummariesQuery::generate()` **already accepts a single
`$orderId`** (`app/Models/MongoDB/PrimaryOrder/SummariesQuery.php:199`), so
the exact same denormalization/field-mapping logic used by the hourly job
can be reused per-order inside the new Kafka handler instead of being
reimplemented. This removes the single biggest risk in this plan (schema
drift between two independently-maintained mapping implementations).

---

## 2. Scope decision

- **Not** a landlord feature, **not** a REST CRUD module, **not** a report —
  this is an internal event-pipeline feature. No new permission constants,
  no new frontend work.
- Tenant-scoped (each event carries `tenant_id`; consumer reconnects per
  tenant via `TenantManager`, same as `TrackingMessageHandler`).
- Storage: MongoDB only (`primary_order_summaries`, `primary_delivery_summaries`
  — collections already exist, no new collection/migration needed).
- Stack: sokrio-server (Laravel) only. Nothing in sokrio-benchmark-python or
  either frontend changes for this task.

---

## 3. Kafka topic & event design

New `TopicRegistry` constants (`app/Services/Kafka/TopicRegistry.php`) —
**do not reuse** the existing `ORDER_SUMMARIES`/`DELIVERY_SUMMARIES` keys
(§1a):

```php
public const PRIMARY_ORDER_SUMMARIES    = 'primary_order_summaries';
public const PRIMARY_DELIVERY_SUMMARIES = 'primary_delivery_summaries';

private const TOPICS = [
    // ...existing...
    self::PRIMARY_ORDER_SUMMARIES    => 'primary-order-summaries.events.v1',
    self::PRIMARY_DELIVERY_SUMMARIES => 'primary-delivery-summaries.events.v1',
];

public const PRIMARY_ORDER_CREATED    = 'primary-order.created';
public const PRIMARY_ORDER_UPDATED    = 'primary-order.updated';   // status change, revision, etc.
public const PRIMARY_DELIVERY_CREATED = 'primary-delivery.created';
```

**Design decision — thin event, server-side rebuild (recommended):**
The event payload carries only `{order_id}` (or `{delivery_id}`) plus enough
to route it (`order_date`/`delivery_date` for quick log context). The
consumer re-runs `SummariesQuery::generate($from, $to, [...], $orderId)`
scoped to that one order, exactly like the hourly job does — just triggered
per-event instead of per-hour.

Why thin instead of a fat/self-contained payload (like Tracking's, which
carries full lat/long inline): a primary order can have many product lines
and the full denormalized shape is ~20+ fields per line (pricing, buyer,
seller, territory, badge, promotion) — re-deriving it via the existing,
already-tested `SummariesQuery` avoids a second, independently-maintained
mapping implementation that would drift from the hourly job's over time.
The cost is one extra Mongo round-trip per event inside the consumer
(cheap — same DB, already reconnected for the tenant) versus a larger Kafka
message and duplicated mapping logic. **Flag if you'd rather go fat-payload
instead — happy to flip this before Phase 1.**

Single `UPDATED` event type is enough for status changes (mirrors the
decision already made for retail Order/Delivery in TopicRegistry) — the
consumer doesn't need to branch on event_type beyond created vs the rest,
since `SummariesQuery` rebuilds the full current-state doc regardless of
what changed.

---

## 4. Producer side (Phase 1)

New observers on the **Mongo** models (jenssegers Eloquent models support
observers exactly like MySQL Eloquent models — same mechanism already used
for `OrderObserver`/`DeliveryObserver`):

- `app/Observers/PrimaryOrderObserver.php`
  - `created(PrimaryOrder $order)` → publish `PRIMARY_ORDER_CREATED`
  - `updated(PrimaryOrder $order)` → publish `PRIMARY_ORDER_UPDATED` (covers
    revisions/edits to the order itself, not status — status already flows
    through `PrimaryOrderStatus`, see below)
  - Uses the same `PublishesKafkaMessage` trait as the existing observers
    (`app/Observers/Concerns/PublishesKafkaMessage.php`) — no new
    boilerplate needed there.
- `app/Observers/PrimaryDeliveryObserver.php`
  - `created(PrimaryDelivery $delivery)` → publish `PRIMARY_DELIVERY_CREATED`
- **Status transitions**: extend the existing `PrimaryOrderStatus` boot
  observer (`app/Models/MongoDB/PrimaryOrder/PrimaryOrderStatus.php:30-63`)
  to also publish `PRIMARY_ORDER_UPDATED` after its current synchronous
  `latest_status` write — do **not** remove that synchronous write (it's
  cheap, single-field, and gives an instant status reflection even before
  the Kafka consumer catches up; the Kafka path fills in the rest of the
  line-item fields).
- Register both new observers in `app/Providers/AppServiceProvider.php`
  next to the existing `Order::observe(...)` / `Delivery::observe(...)`
  lines.
- **Unlike the retail pilot, ship these enabled, not commented out** — that
  was the retail path's explicit "we're not ready yet" marker; this task's
  whole point is to go live.

---

## 5. Consumer side (Phase 2)

- `app/Services/Kafka/Handlers/PrimaryOrderSummaryMessageHandler.php`
  implementing `KafkaMessageHandlerInterface`, modeled directly on
  `TrackingMessageHandler.php`:
  - `handleBatch()` groups messages by `tenant_id` (same as Tracking).
  - Per tenant: `TenantManager::tenant($org)->reconnect()`, then for the
    batch of `order_id`s in this flush, call
    `(new SummariesQuery('order', 'primary'))->generate($from, $to, [...], $orderId)`
    per order (or extend `SummariesQuery` to accept a list of order ids in
    one call if the aggregation supports an `$in` — check before assuming
    one-call-per-order; batch_size defaults to 200 so worst case is 200
    Mongo aggregations per flush, same order of magnitude as today's hourly
    job processing a full hour of orders in one call — worth confirming this
    isn't a regression before Phase 2 is done).
  - `PrimaryOrderSummary::raw(fn($c) => $c->bulkWrite($bulkOperations))` —
    same call the existing job already makes, so this is a drop-in reuse,
    not new logic.
  - Same retry contract as Tracking: bounded attempts, log + skip on
    exhaustion (never let one tenant's failure escape `handleBatch`), org
    lookup cached per-process via `Org::findById()`.
- `app/Services/Kafka/Handlers/PrimaryDeliverySummaryMessageHandler.php` —
  mirror for delivery, backed by `SummariesQuery('delivery', 'primary')`.
- Register both in `ConsumeCommand::HANDLERS`
  (`app/Console/Commands/Kafka/ConsumeCommand.php:26-28`):
  ```php
  private const HANDLERS = [
      TopicRegistry::TRACKING => TrackingMessageHandler::class,
      TopicRegistry::PRIMARY_ORDER_SUMMARIES => PrimaryOrderSummaryMessageHandler::class,
      TopicRegistry::PRIMARY_DELIVERY_SUMMARIES => PrimaryDeliverySummaryMessageHandler::class,
  ];
  ```

---

## 6. Ops / deployment (Phase 3)

- Two new Supervisor programs (README already documents the pattern for
  `sokrio-kafka-consumer-tracking`):
  - `sokrio-kafka-consumer-primary-order-summary` → `php artisan kafka:consume primary_order_summaries`
  - `sokrio-kafka-consumer-primary-delivery-summary` → `php artisan kafka:consume primary_delivery_summaries`
- No new env vars needed — `config/kafka.php` consumer knobs are already
  topic-agnostic (`batch_size`, `batch_interval`, `group_id`, timeouts all
  shared).
- **Keep the existing hourly cron jobs running** as a reconciliation net
  (rename framing from "the pipeline" to "the safety net") — same role the
  daily `--resync=true` run already plays for the hourly one. Do not touch
  `app/Console/Kernel.php` scheduling in this task; consider reducing
  frequency (e.g. hourly → every 4h reconciliation only) as a **follow-up**
  once the Kafka path has a proven track record — explicitly out of scope
  here to avoid removing the fallback before it's earned trust.

---

## 7. Testing (Phase 4)

Mirror the existing Kafka test suite structure:

- `tests/Feature/Kafka/PrimaryOrderSummaryMessageHandlerTest.php` /
  `PrimaryDeliverySummaryMessageHandlerTest.php` — modeled on
  `tests/Feature/Kafka/TrackingMessageHandlerTest.php`: unknown tenant
  skips + logs, known tenant produces the correct `bulkWrite` upserts into
  `PrimaryOrderSummary`/`PrimaryDeliverySummary`, persist failure retries
  then logs.
- Extend `tests/Unit/Console/Kafka/ConsumeCommandHandlersTest.php`'s
  reflection guard — it already asserts every `HANDLERS` entry implements
  `KafkaMessageHandlerInterface`, so the two new handlers just need to
  exist and be registered; no new test needed there beyond registration.
- New assertion in `tests/Unit/Kafka/TopicRegistryTest.php` for the two new
  topic keys (env suffixing, unknown-key exception still throws).
- Observer tests: assert `PrimaryOrderObserver`/`PrimaryDeliveryObserver`
  actually call `publish()` on create (this is the thing PR #5094's retail
  pair got wrong by shipping it commented-out with no test catching that —
  worth a regression test here specifically asserting the publish call
  happens, not just that the trait swallows errors).

---

## 8. Sequential task list

```
Phase 1 — Producer (topics + observers)
  [ ] Add PRIMARY_ORDER_SUMMARIES / PRIMARY_DELIVERY_SUMMARIES topic keys + event
      constants to TopicRegistry.php
  [ ] Write PrimaryOrderObserver (created + updated)
  [ ] Write PrimaryDeliveryObserver (created)
  [ ] Extend PrimaryOrderStatus boot observer to also publish PRIMARY_ORDER_UPDATED
  [ ] Register both observers in AppServiceProvider
  [ ] Confirm topics auto-create correctly via TopicProvisioner in a dev broker

Phase 2 — Consumer (handlers)
  [ ] Confirm whether SummariesQuery::generate() can take a list of order_ids
      in one aggregation call, or must be called once per id — decide batch
      strategy inside the handler accordingly
  [ ] Write PrimaryOrderSummaryMessageHandler (handleBatch, tenant grouping,
      retry/fallback per TrackingMessageHandler pattern)
  [ ] Write PrimaryDeliverySummaryMessageHandler (mirror)
  [ ] Register both in ConsumeCommand::HANDLERS
  [ ] Manually run `kafka:consume primary_order_summaries` against a dev
      broker + real tenant, confirm PrimaryOrderSummary docs match what the
      hourly job would have produced for the same order

Phase 3 — Ops
  [ ] Add two Supervisor program blocks, document in README (same section as
      the existing tracking consumer)
  [ ] Confirm ext-pcntl present on consumer runners (already required by the
      Tracking consumer, but re-verify for whatever box will run these)

Phase 4 — Tests
  [ ] PrimaryOrderSummaryMessageHandlerTest / PrimaryDeliverySummaryMessageHandlerTest
  [ ] TopicRegistryTest additions for the two new keys
  [ ] Observer publish-call regression tests (the thing the retail pair
      shipped without)
```

Implement phase by phase, stop after each for review — per project convention.

---

## 9. Open questions to confirm before Phase 1 starts

1. **Thin vs fat event payload** (§3) — recommending thin (`order_id` only,
   consumer re-derives via `SummariesQuery`). Confirm, or say fat if you'd
   rather avoid the extra per-event Mongo aggregation.
2. **`PrimaryOrderObserver::updated()` scope** — should *every* Mongo-level
   update to a `PrimaryOrder` doc (including ones written by the hourly job
   itself, or by `latest_transport`/append mutations) trigger a republish?
   Worth an explicit guard (e.g. only fire on `isDirty()` for
   business-meaningful fields) to avoid the consumer chasing its own tail —
   the retail `OrderObserver` doesn't have this problem because MySQL
   updates are narrower/more deliberate.
3. **Batch aggregation strategy** (Phase 2 task 1) — needs a quick read of
   `SummariesQuery::productsQuery()`'s Mongo aggregation to confirm it can
   filter by an array of order_ids cheaply, or whether the handler should
   just loop `generate()` per order (fine at batch_size=200, but worth
   confirming there's no N+1-aggregation cost surprise).
4. Reducing the hourly cron's frequency once Kafka is proven — explicitly
   deferred to a follow-up task (§6), confirm that's the right call rather
   than bundling it here.

---

## 10. File manifest

**New files**
```
app/Observers/PrimaryOrderObserver.php
app/Observers/PrimaryDeliveryObserver.php
app/Services/Kafka/Handlers/PrimaryOrderSummaryMessageHandler.php
app/Services/Kafka/Handlers/PrimaryDeliverySummaryMessageHandler.php
tests/Feature/Kafka/PrimaryOrderSummaryMessageHandlerTest.php
tests/Feature/Kafka/PrimaryDeliverySummaryMessageHandlerTest.php
```

**Changed files**
```
app/Services/Kafka/TopicRegistry.php                          — new topic + event constants
app/Providers/AppServiceProvider.php                          — register 2 new observers
app/Models/MongoDB/PrimaryOrder/PrimaryOrderStatus.php         — publish on status change
app/Console/Commands/Kafka/ConsumeCommand.php                  — register 2 new HANDLERS entries
tests/Unit/Kafka/TopicRegistryTest.php                         — new topic key assertions
tests/Unit/Console/Kafka/ConsumeCommandHandlersTest.php        — covered automatically by reflection guard
README.md                                                      — 2 new Supervisor program blocks
```

**Not touched**
```
app/Models/MongoDB/PrimaryOrderSummary.php / PrimaryDeliverySummary.php   — no schema change
app/Jobs/PrimaryOrderSummaryMongoDBJob.php / PrimaryDeliverySummaryMongoDBJob.php — kept as resync safety net
app/Console/Kernel.php                                                     — scheduling unchanged (see §6)
Any frontend                                                               — no UI surface for this task
```
