# MEMORY — verified facts, decisions, open items

> Append-only working memory for this deep dive. Read it before every task and reuse it instead of re-researching.
> Snapshot base: `sokrio-server` `master` @ `d14c0ebb2` (2026-10-26). Paths are relative to `sokrio-server/`.
> Full detail with tables lives in `../sections/00-inventory.md`.

## 1. Key facts (verified in code)

### Stack
- Laravel **9.52.22** (not 10), PHP ^8.0 (CI 8.3).
- `longlang/phpkafka` v1.2.5 (pure PHP), `predis/predis` 1.1.10, `pusher/pusher-php-server`, `aws/aws-sdk-php` (S3 only), `ext-pcntl` required.
- None of these: Horizon, Octane, rdkafka, RabbitMQ.
- Frontend realtime is `sokrio-app-frontend/src/lib/echo.ts` (laravel-echo + pusher-js). The admin frontend has none.

### Kafka core files
| File | Key lines |
|---|---|
| `config/kafka.php` | brokers :5, group_id :7, legacy topics :16, producer :24-37, consumer :41-71, auto-create P=3/RF=1 :74-75, report flag :81 |
| `app/Services/Kafka/KafkaProducer.php` | MAX_PUBLISH_ATTEMPTS=3 :26, socket :51, publish :54-68, key default tenantId :58/:76, envelope :93-102, sendWithRetry :113-192 |
| `app/Services/Kafka/KafkaConsumer.php` | autoCommit false :69, groupInstanceId '' :79-95, consume :109-191, pollLoop :206-267, advanceCursor :279-294, flush+sigprocmask+saveOffsets :301-339, decode :347-365, failure exit :371-393, join retry :404-432 |
| `app/Console/Commands/Kafka/ConsumeCommand.php` | HANDLERS :27-30 (tracking, departments), set_time_limit :45-46, max-runtime fallback 3600 :70-73, resolveGroupId :97-107 |
| `app/Services/Kafka/TopicRegistry.php` | keys :12-15, names :18-24, event types :26-30, env suffix :51-58 |
| `app/Services/Kafka/TopicProvisioner.php` | cache key :23, create :52-81, cache-safe :94-124 |
| `app/Services/Kafka/Handlers/TrackingMessageHandler.php` | MAX_ATTEMPTS=3 :23, group by tenant :50-71, retry+sleep :85-116, per-point fallback :125-158, org self-heal :160-186 |
| `app/Services/Kafka/Handlers/DepartmentMessageHandler.php` | upsert ops :87-100, bulkWrite :110-112, per-record fallback :130-156 |
| `app/Services/Kafka/Socket/InterruptResilientStreamSocket.php` | EINTR select :36-83, connect :85-116 |
| `app/Observers/Concerns/PublishesKafkaMessage.php` | :11-26 swallow + log |
| `app/Providers/KafkaServiceProvider.php` | singletons :23-35, registered in `config/app.php:186` |
| `config/logging.php` | kafka channel :54-68 (file + stderr, not stack) |

### Producers
- **Tracking v1:** `app/Http/Controllers/Tracking/TrackingController.php:62-83`. Key = user_id; null → `WriteTrackingActions`; returns 503 + Retry-After 5; otherwise 202.
- **Tracking v2 (bulk):** `app/Http/Controllers/V2/Tracking/TrackingController.php:52-78`. `publishBatch` → fallback `WriteBulkTrackingActions` (MySQL txn :67-69, best-effort Mongo :75-82).
- **Departments:** `app/Observers/DepartmentChangeObserver.php:26-46,104-145`. Key = department_id; skipped in `testing`; **no fallback**.
- **Order/Delivery:** publish commented out (`OrderObserver.php:23`, `DeliveryObserver.php:23`). Observers registered at `AppServiceProvider.php:105,110,111`.
- Lost-ack duplicate accepted on purpose (`app/Actions/Tracking/WriteTrackingActions.php:26-28`).

### Consumers & ops
- Supervisor programs exist only in `README.md:178-212`: `sokrio-kafka-consumer-tracking`, `sokrio-kafka-consumer-departments`, `sokrio-feature-tracking` (queue:work). Each has numprocs=1, stopwaitsecs=35, and DD_* off.
- Group ids: tracking = bare `KAFKA_GROUP`; others = `{KAFKA_GROUP}-{topic}`.

### Queues / Redis
- `config/queue.php`: default `sync` fallback :16; redis `retry_after` **9000** :65; failed_jobs :82-86.
- Queues in use: `summary` (20 jobs), `default`, `feature-tracking`, `order-approved` (`app/Models/Order/Order.php:243`), `sequential` (`config/deferred-jobs.php:19`).
- `$timeout = 0` jobs: GenerateAdvanceInvoicePDF, GenerateVisitTargetReport, StockReport, GenerateTrackingReport, GenerateOrderProductSummery.
- Ignored properties: `ApproveOrder::$retry_after` (`app/Jobs/ApproveOrder.php:26`), `PrimaryOrderSummaryMongoDBJob::$retries` (`:32`).
- No `afterCommit` (except `ApprovalNotifier.php:67`, D13), `Bus::batch`/`chain`, job middleware or `onOneServer()`. Scheduler is gated by `RUN_SCHEDULER` (`app/Console/Kernel.php:113-117`). It has about 40 entries, and `FlushFeatureEventsJob` runs every 15 min (`:180-181`).
- Redis DB0 holds queues, DB1 holds cache (`config/database.php:202-219`). Default client is `phpredis` (`:195`), cache driver defaults to `file` (`config/cache.php:21`).
- Tenant cache prefix: `app/Http/Middleware/ScopeCacheToTenant.php:37-69` (HTTP only, so jobs don't get it; see the global memory note on tenant cache prefixes in jobs).
- Locks: KPISummary:88, StockUpdateController:115,152, MessageResendService:153, SequentialJobDispatcher:15, MatrixAggregator:170, VanSettlementService:331, VanLoadOutStockService:22, SmsResendRun:59.
- Feature-tracking buffer: `BufferFeatureUsageListener.php:16-46` (RPUSH/LTRIM 5000/EXPIRE 1800/threshold 100) and `FlushFeatureEventsJob.php:18-127` (RENAME claim, uniqueFor 300 > timeout 240).
- Idempotency-Key handling exists only in Task Manager (`app/Support/Concerns/HandlesIdempotency.php`).

### Flows verified in T1
- Summary fan-out: `BaseCommand.php:12,50-70` (active orgs only) → `dispatchJob` per tenant; e.g. `SecondaryOrderSummary.php:33-36` → `SecondaryOrderSummaryJob` (queue summary :37, timeout 900 :25, bulkWrite :68-71 default ordered=true, verifySync :73-84).
- `SummariesQuery` emits `updateOne` + `$set`/`$setOnInsert` + upsert (`app/Models/MongoDB/SummariesQuery.php:229-238`), so summary re-runs are idempotent.
- Scheduler lines: secondary_order_summary hourly `Kernel.php:149`, primary_order_summary_mongodb hourly :152, daily resync :155, department_erp_code_sync 06:00 :147.
- Broadcast: `ReportProgressUpdated` is `ShouldBroadcastNow` (sync Pusher call inside the export job, via `app/Support/Macros/ReportProgress.php:12`); `ReportNotification` is `ShouldBroadcast` (queued). `BROADCAST_DRIVER` default `null` (`config/broadcasting.php:18`).
- Exports: `SequentialJob::put` → `create` (`app/Models/Core/SequentialJob.php:32-44`) → `SequentialJobDispatcher::dispatchNext` lock + `lockForUpdate` (`:15,31`).
- Delayed approval: `Order::approveAfter` (`app/Models/Order/Order.php:240-243`).

### New findings (T1)
- F1 `DepartmentSync` (full Mongo resync) is **manual only**: `tenant:department_sync_with_mongodb` (`app/Console/Commands/DepartmentSyncWithMongoDB.php:15,31`), not scheduled. No automatic safety net for lost department events.
- F2 `DepartmentErpCodeSyncJob.php:71` uses `Department::upsert()`, which bypasses observers. `erp_code` is in the Mongo doc (`app/Models/MongoDB/Department.php:71,213`), so ERP codes never reach Mongo via Kafka. `VanSystemController.php:98,138,152` `->update()` also bypasses, but `van_sales_enabled` is not in the Mongo doc, so it is harmless.
- F3 `SecondaryOrderSummaryJob::uniqueId()` appends `rand(1000,9999)` (`:40-43`), so `ShouldBeUnique` is a no-op. It is the only job with this pattern.
- F4 `ReportProgressUpdated` is `ShouldBroadcastNow`, so Pusher latency or an outage hits the export job directly.

### New findings (T2) — library = `vendor/longlang/phpkafka/src/`
- F5 **Producer acks = 0.** Library default `ProducerConfig.php:36`; Sokrio never calls `setAcks()`. `Producer.php:159-163`: no response read when acks=0. Publish "success" = socket write only, so broker-side rejections are silent. The fallback only covers transport errors. The `WriteTrackingActions.php:26-28` "lost-ack duplicate" comment assumes acks≥1.
- F6 **No auto.offset.reset.** New group → `max(committed,0)` = offset 0 (earliest) (`OffsetManager.php:107`). OFFSET_OUT_OF_RANGE → ListOffsets ts −1 → `latest − 1` (`OffsetManager.php:140,150`, `Consumer.php:345,364`), so a consumer down past retention silently skips the gap.
- F7 `[INFERENCE]` **The library counts messages, never reads record offsets** (`RecordBatch::$baseOffset` unused; `Consumer.php:321,351-353`; Sokrio `advanceCursor` +1 at `KafkaConsumer.php:282`). The producer packs one `RecordBatch` per partition per `sendBatch`, so a v2 bulk publish = one batch. Committing mid-batch, then restarting → the broker returns the whole batch → head duplicated + the same count of later records skipped. Needs a T9 lab.
- F8 **A8 confirmed:** `DepartmentBulkDataUpdateController.php:41-52` runs `->update()` per department inside `DB::beginTransaction()`, so the observer publishes before commit. A rollback leaves a phantom event in Mongo, and with the broker down each row pays ~3.75 s of publish retries.
- F9 **Heartbeats only on fetch** outside Swoole (`KafkaUtil.php:45-53` → `NoopTimer`; `Consumer.php:292-294,421-427`). A flush > `session_timeout` 30 s → eviction → commit swallowed (`KafkaConsumer.php:329-335`) → batch replayed.
- Other library facts: partitioner `crc32(key) % N` (`DefaultPartitioner.php:48-53`); no compression; `producerId=-1` (no idempotent producer); RangeAssignor (`ConsumerConfig.php:115`); fetch partition `maxBytes = 0` (`Protocol/Fetch/FetchPartition.php:45`) → likely ~1 batch per fetch [INFERENCE]. Library `autoCreateTopic=true` on both sides.
- Consumer decode drops `event_id` and `occurred_at` (`KafkaConsumer.php:360-364`), so no dedup is possible downstream.
- `trackings` has no unique key (only `user_id` index + `(created_at,user_id)`), migration `2020_08_18_074138_create_trackings_table.php:18,24`.
- `TopicProvisioner`: createTopic `:52-81`, warning-only failure `:69-80`, `Cache::put` 1 day `:114`.
- Static `group.instance.id=""` blocks numprocs > 1 (both would fence); scaling needs a per-process id.

### New findings (T3)
- RabbitMQ search re-run on `d14c0ebb2`: not found (code, composer, `config/queue.php:30-72` connections, Amazon MQ).
- F10 **Primary-order delayed approval** dispatches `App\Jobs\PrimaryOrder\ApproveOrder` with no `onQueue` → `default` queue (`app/Models/MongoDB/PrimaryOrder/PrimaryOrder.php:199-203`); that job has `$timeout = 0` (`app/Jobs/PrimaryOrder/ApproveOrder.php:20`). Double-runs are harmless thanks to the `pending()` guard (`:47`). The secondary `ApproveOrder` is also idempotent via `pending()` (`app/Jobs/ApproveOrder.php:53`).
- SMS: no automatic retry. Manual resend = `MessageResendService::startResend` (claim under lock `:111-198`, dispatch `:233-257`) → `ResendFailedSmsBatch` on `default`, `tries=1`, `timeout=1800` (`:37-41`); own cap `sms.resend.max_retry=5`, `batch_size=100` (`config/sms.php:14-15`). `SmsDeliveryUnknownException` = may have been sent, so it is **not safe** to auto-retry (`app/Services/SMSSender.php:12-19`).
- ERP (IFS) integration = shared-DB poll: `{ifs_database}.customer_responses` `fetch` flag (`DepartmentErpCodeSyncJob.php:44-73`, daily 06:00 `Kernel.php:147`) and `sales_part` `FetchCount` (`app/Jobs/IFS/SalePartProductPriceSyncJob.php:51-55,133`, daily 05:40 `Kernel.php:143`). Up to 24 h latency for ERP codes.

### New findings (T4) — Redis
- Config: `redis` cache store → connection `cache` = DB 1 (`config/cache.php:74-77`, `config/database.php:212-220`); queues + `Redis::` facade = DB 0. Session default `file` (`config/session.php:21`); ScopeCacheToTenant re-prefixes a `CacheBasedSessionHandler` (`:62-68`). Unique locks use the default cache store (`vendor/…/Bus/UniqueLock.php:39-41`). `.env.example:51` `REDIS_CLIENT=` empty → `RedisManager::connector()` returns null → crash, so prod must set it or omit it (omit = phpredis). Code catches both Predis and phpredis exceptions → A7 still undecidable from code.
- A6 now very likely true: ScopeCacheToTenant only works with `setPrefix()` stores (not file), and SmsResendRun / FlushFeatureEventsJob comments assume Redis DB 1; a Redis OOM test exists (`tests/Unit/Kafka/KafkaProducerTest.php:231`) → prod probably `maxmemory` + `noeviction`.
- F11 🔴 `app/Jobs/Stock/BulkStockImportJob.php:30` is `ShouldBeUnique` with no `uniqueId`/`uniqueFor` → one global lock with no TTL; `BulkStockBatchImportJob` dispatches 30k-row chunks in a loop (`:20,104-107`) → chunk 2+ and other tenants' imports silently dropped. [LAB] confirmed. Fix: uniqueId org+upload+startingRow, uniqueFor 3600.
- F12 🟡 Prefix split: web = `{CACHE_PREFIX}:tenant_N|landlord:`, workers/scheduler/consumers = bare prefix (`ScopeCacheToTenant.php:37-76`, since `ff97230d4` 2026-08-10). Leaks: ReportCacheMacro guard set in 16 controllers, removed in 17 jobs → 429 until TTL 3600 (`app/Support/Macros/ReportCacheMacro.php:24-57`); unique locks dispatched in HTTP never released by the worker [LAB] (today only KPISummary via `Admin/DailyReportController.php:81`, 24 h); `custom-jobs:one-at-a-time` split; `Org::updated` forgets only the current namespace (`Org.php:45-48`) → `EnsureTenantAccess` (`:24-29`, checks `active`) can serve a deactivated tenant for up to the TTL. Correct template: `SmsResendRun` cloned store with fixed prefix (`:24-25,197-214`).
- F13 🟡 `Guest/StockUpdateController.php` stock lock `:152-153` released at `:166` but `DB::commit()` at `:263` (txn begins `:125`); PHP read-modify-write `qty + n` → lost update across challans. Atomic `increment()` is commented out at `:163`.
- F14 🔴-if-phpredis `Redis::scan($cursor,'MATCH',…)` (`FlushFeatureEventsJob.php:68`, `PurgeFeatureTrackingLeaderboards.php:38`) works on predis only. [LAB]: phpredis finds 0 keys → feature analytics never flushed. Tested fix: start cursor `null` + options array (`['match'=>…,'count'=>…]`), 120/120 on both clients.
- F15 🟢 `SequentialJobDispatcher.php:31` `$candidate->lockForUpdate()` builds a query and never runs it → no row lock.
- D12: `Org::findByDomain/findById` TTL `60*24*7` = 10 080 s ≈ 2.8 h, not a week as the comments say (`TrackingMessageHandler.php:27`).
- Locks (9 Cache::lock calls at 8 sites): KPISummary 1800/1740 (blocks a `summary` worker while waiting); StockUpdate challan 30 s + stock 10/5; VanSettlement 30; VanLoadOut 30; SequentialJobDispatcher 10; MessageResendService 30/10 (DB row locks are the real guard); MatrixAggregator 90/60 with query cap 60 s and double-checked remember (stampede model); SmsResendRun 10/10. RetailerConnectionService = DB lock, not cache. RedisLock = `SET NX EX` + owner Lua release (`vendor/…/Cache/RedisLock.php:38-40`), single-instance lease.
- Unique-job implementers (only 5): KPISummary (uniqueFor 86400), UserSalesSummaryJob, FlushFeatureEventsJob (300 > timeout 240), SecondaryOrderSummaryJob (rand, F3), Stock\BulkStockImportJob (F11).
- Rate limiters: api/auth/otp/otp-verify/bulk (`RouteServiceProvider.php:66-150`, `config/rate_limiting.php`), plain `ThrottleRequests` (`Http/Kernel.php:136`) = cache store, runs after auth, keys self-scoped (`:253-270`).
- Cache usage: ~192 `remember`, 9 `rememberForever`, 0 tags; only MatrixAggregator has stampede protection.
- Broadcast: Pusher only; `redis` broadcaster unused, no pub/sub anywhere. Queued `ShouldBroadcast` events go to `default`.
- No redis.conf / maxmemory / appendonly anywhere in the monorepo. A restart loses `:delayed` delayed approvals with no sweeper.
- RedisQueue internals refs: later `:193-196`, migrate `:244-249`, Lua pop `:275-286`, delete `:305`, release `:321`; Worker timeout `:229-254` ($timeout=0 → alarm off).

### New findings (T5) — Laravel implementation layer
- Code read from `git archive d14c0ebb2` (working tree was on `survey-question-image-stg`; `master` = `bf223a126`, +2 commits, no messaging files).
- Job idiom: 127 `ShouldQueue` jobs, 119 call `TenantManager::tenant`, 77 hold `Org` (landlord, `Org.php:29`). Best template `Jobs/Notification/SendApprovalNotificationJob.php:34-68` (Org+arrays, reconnect `:45`, per-step try, dispatched `->afterCommit()`); delayed+idempotent template `ApproveOrder.php:37-54`.
- F16 🔴 Tenant models in job ctor restored BEFORE `handle()` on the `tenant` connection, which still points at the previous job's tenant (`SerializesAndRestoresModelIdentifiers.php:104-108`, `SerializesModels.php:62-88`, `CallQueuedHandler.php:60`; `TenantManager.php:96-99` Config::set persists). [LAB] two SQLite DBs: dispatched Alice(A) → restored Bob(B). Live: `BatchTransferJob.php:35`, `PreInventoryTransferJob.php:34`, `BulkPrimaryPaymentActions.php:30`, `BulkProductBatchImportJob.php:34` (`Mail::to($this->user)` `:142` → other tenant's user). Latent: `GenerateSurveyReport.php:32` (static `User::getOrg()` `User.php:248-253` → wrong tenant; no dispatch site), `SendAnnouncementNotify` (dispatch commented `AnnouncementController.php:136`). Root fix: provider-level `JobProcessing` listener reading `payload()['tenant_id']` — fires before unserialize (`Worker.php:412` → fire `:425`).
- F17 🟢 `EnsureTenantAccess.php:56-58` stamps `tenant_id` into payloads, but the `JobProcessing` listener `:60-64` is registered only in the HTTP process (and reconnects to the captured tenant, not the payload's) → dead on workers; worker-dispatched jobs aren't stamped.
- F18 🟢 Handlers cache Org for the process life (`TrackingMessageHandler.php:33,162`, `DepartmentMessageHandler.php:23,160-180`) up to `max_runtime` 21600 (`config/kafka.php:70`); no `active` check → deactivated tenant consumed ≤6 h.
- afterCommit: Laravel 9 supports job `->afterCommit()` (`Queue/Queue.php:326-337`), observer `$afterCommit` (`Events/Dispatcher.php:526-548`), runs immediately outside a txn (`DatabaseTransactionsManager.php:90-97`); not set in `config/queue.php`. Sites: DepartmentChangeObserver (F8, fix = property); `SequentialJobDispatcher.php:30-56` dispatch inside txn 🟢; `ImportSecondaryOrderJob.php:260` inside txn but delayed + pending guard ✅; `OrderRequest.php:205`/`PrimaryOrder/OrderRequest.php:168` NOT in a txn (`Order/OrderController.php:44`) ✅; PromotionAction dispatches after commit ✅. Bus/Queue fakes ignore afterCommit.
- Worker auth never reset (no reset in `Queue/Worker.php`); only `ApproveOrder.php:52` and `PrimaryOrder/ApproveOrder.php:46` log in; `DepartmentBulkUpdateJob` reads `auth()` (latent).
- `TenantManager::reconnect()` is a no-op and returns null in `testing` (`TenantManager.php:92-106`); `TenantManager` ctor rebinds `app('tenant')` (`:33-34`).
- Tests: 13 Kafka-related files (11 core + TrackingTest/BulkTrackingTest). `KafkaLogsNeverAtErrorLevelTest.php:21-28` path list misses DepartmentMessageHandler. `FlushFeatureEventsJobTest.php:46-48` mocks the predis `scan` shape (why F14 is green). TestCase: separate `:memory:` SQLite landlord/tenant, one tenant (`TestCase.php:41-49,77`); sync queue round-trips the payload (`SyncQueue.php:38`) but within the same tenant.
- README tells devs `REDIS_CLIENT=phpredis` (`README.md:43,85`) → A7 leans phpredis → F14 likely live.

### New findings (T6) — AWS infrastructure
- Deploys: 5 server workflows = `appleboy/ssh-action@master` (unpinned) → `sudo bash …/post-deploy/pipeline.sh`. Password SSH on prod (`ci-cd.yml:17-23`), PVM (`pvm-ci-cd.yml:19-23`, **same `AWS_VM_HOST` secret as prod** → same VM [INFERENCE]) and staging; key SSH on queue (`queue-worker-deploy.yml:20-26`) and report (`prod-report-deploy.yml:20-26`). No `concurrency` guard (Python deploy has one, `sokrio-benchmark-python/.github/workflows/deploy.yml:7-9`). `Kernel.php:113-117` comment: scheduler only on the "all task" prod server, not the report server.
- AWS in use (evidenced): **S3 only** (`config/filesystems.php:29,58-65`, `composer.json:27`). Also DigitalOcean Spaces disk `spaces` (`:67-75`). `sqs` (`config/queue.php:52-59`), `dynamodb` cache (`config/cache.php:79-86`), `ses` (`config/services.php:27-30`) are untouched defaults; no `SQS_*`/`DYNAMODB_*`/`DD_*`/`REDIS_URL` in `.env.example`.
- A4/A5 evidence: no TLS/SASL anywhere in Kafka config; RF default 1; Redis config has no `scheme`/`clusters` (`config/database.php:193-220`); `[HIST]` deleted prod compose (`557e63d68^:docker-compose.prod.yml`) ran `redis:alpine` container `sokrio-redis` with `./data/redis` volume and no Kafka; 2024 worker image `pecl install redis` (phpredis → A7 hint), `laravel-worker.conf` `queue:work redis --sleep=3 --tries=3 --max-time=3600`, no `--queue`, numprocs=8. Verdict: leans self-hosted, still `[ASSUMPTION]`.
- PHP probably in Docker on the VMs [INFERENCE]: `/var/www/html` paths + "not container-wide" (`README.md:179,190,203,224`), benchmark compose joins an external network `sokrio` (`sokrio-benchmark-python/docker-compose.yml:14-19`), `.env.example:143-148` compose-style knobs.
- F19 🟡 [INFERENCE] `BulkStockController.php:58-62,88` stores upload on `local` disk; `BulkStockBatchImportJob.php:23,36-38` (queue `default`) reads local disk → on another VM: warning + silent return. README feature-tracking worker also consumes `default` (`README.md:173`). Export jobs are same-job local temp → safe. Fix: S3 handoff.
- F20 🟡 Python benchmark `REDIS_URL` default and `.env.example` DB `/0` (`sokrio-benchmark-python/app/config.py:20`) = Laravel queue DB → shared maxmemory/eviction.
- F21 🟢 `longlang/phpkafka` SASL = PLAIN only (`Sasl/PlainSasl.php:27`, `Client/SyncClient.php:203-211`); TLS via `setSsl` (`Config/CommonConfig.php:197-216`, `Socket/StreamSocket.php:270,277-279`), and Sokrio's socket calls `parent::connect()` so TLS would work. → MSK IAM/SCRAM/Serverless impossible; TLS-unauthenticated or mTLS only.
- F22 🟡 Approval delay validated `max:60` minutes (`SettingRequest.php:39,45`; migration `2020_10_09_074826_create_settings_table.php:19,21` "In minute") vs SQS `DelaySeconds` ≤ 900; `SqsQueue::later` passes it straight (`vendor/…/Queue/SqsQueue.php:127-142`, `:138`). `pop()` (`:169-182`) sets no VisibilityTimeout (retry_after ignored) and no WaitTimeSeconds (short polling). `SqsJob` release `:50-58`, attempts `:82`. No `MessageGroupId` in Laravel 9.52 SqsQueue (no FIFO). `queue:monitor` exists (`Queue/Console/MonitorCommand.php`).
- F23 🟡 deploy hygiene (above).
- Monitoring: Sentry (`composer.json:34`, `config/sentry.php`), Slack log channels (`config/logging.php:38-41,77-108`), Datadog per README. Not found: consumer lag, queue depth/age, `queue:monitor`, failed_jobs alert, Redis memory alert, scheduler heartbeat (`thenPing`).
- Workers for `summary`/`order-approved`/`sequential` are undocumented anywhere (only feature-tracking + 2 Kafka programs in README).

### New findings (T7) — failure modes
- F24 🟡 `[INFERENCE]` **Global export lane can get stuck.** `SequentialJob` is landlord (`app/Models/Core/SequentialJob.php:18`), so exports run one at a time **for the whole platform** (`app/Support/Dispatcher/SequentialJobDispatcher.php:15,21-23`: returns if any row is `processing`). The row is cleared only by the export job's `updateSequentialJob` / `failed()` (e.g. `ProcessOrderSummaryExportJob.php:125,138-149`). A SIGKILL/OOM, or a Redis restart that loses the reserved job → the row stays `processing` → every tenant's exports are blocked (2.5 h until `retry_after` + `tries=1` frees it, or forever if Redis lost the job). The `sequential:jobs` kick runs only every 4 h (`Kernel.php:160`) and does the same check. Fix: treat stale `processing` as dead, kick every 5 min, per-org fairness. Also a noisy-neighbor source (R18).
- 13 export jobs call `dispatchNext` and all have `failed()`; timeouts: 3600 (CachedOutletDownload, ReturnSummary), 7200 (DeliverySummary, OrderSummary, OrderTracking), the rest none (worker default, A10).
- Handlers ignore `event_type` (branch on topic only); the envelope has no schema version (`KafkaProducer.php:93-102`). Required tracking keys `user_id, lat, long, address, created_at` (`WriteBulkTrackingActions.php:56-61`) → a missing key = 3 retries (~3 s) then per-point drop + `report()`. Departments `$set` the whole payload (`DepartmentMessageHandler.php:94-96`), so renamed fields linger in Mongo; rows without `department_id` are skipped silently (`:88-90`).
- `DepartmentChangeObserver` publishes on `created` (`:26`) / `updated` (`:35`).
- 0 of 125 `SerializesModels` jobs set `$deleteWhenMissingModels`. No `queue:prune-failed` in the scheduler (only `tenant:prune` `:141`, `retail:prune_tokens` `:145`).
- Supervisor programs set `autorestart=true` but no `startretries`/`startsecs` (`README.md:170-212`) → Supervisor default 3 retries → FATAL with no alert `[GENERAL]`.

### T7 Top 5 risks (final ranking, in `07b` §7.6)
1. F16 cross-tenant restore → per-job ids + Org, then the `JobProcessing` listener
2. Silent Kafka loss (acks=0, RF=1, single broker; F6 variant) → `setAcks(1)` + nightly `DepartmentSync`
3. F11 stock import drop (F19 compounds) → `uniqueId` + `uniqueFor 3600`
4. Delayed approvals lost or 2.5 h late (R12/R13, F10) → `orders:approve-overdue` sweeper, then `onQueue` + timeout + short `retry_after`
5. No alerting → AL6 + AL2 + AL3 + the stale-`processing` query
- Conditional: F14 moves to #3 if A7 = phpredis.
- Runbook ids: R1–R20 = README_2 list, R21–R28 Kafka-specific (07a), R29–R35 queue/Redis/infra findings (07b). Alert codes AL1–AL7 = the T6 §6.9 list, renamed so they don't clash with assumption ids A1–A11.

### New findings (T9) — labs (`../labs/`, run 2026-10-26)
- Harness: `labs/compose.yml` (3 KRaft brokers `k1`–`k3` on `apache/kafka:3.7.0` + `redis`), `labs/bin/k.sh` (Kafka CLI in a broker), `labs/bin/php.sh` (memo-phptest:jpeg, PHP 8.3 + phpredis/pcntl/sqlite, Sokrio `vendor/` mounted **read-only** at `/srv/vendor`), `labs/laravel/artisan` = a ~10-line Laravel 9.52.22 console booted on Sokrio's vendor (`php artisan run <script>` runs a lab script). Network `t9lab_default`, project `-p t9lab`. A fresh `composer create-project laravel/laravel:^9.0` is blocked by 7 Packagist security advisories on laravel/framework 9.19–9.52.22 (Sokrio runs 9.52.22), and bypassing the block was denied, so reuse the vendor instead. zsh doesn't word-split `$VAR` commands → use the scripts.
- F5 **[LAB]**: acks=0 + 5000-byte message to a topic with `max.message.bytes=1000` → `send()` returns normally, end offset 0; `setAcks(1)` → `KafkaErrorException [10]`.
- F7 **[LAB]** + **F25 🟡→🔴 (new) replay loop**: restart from a committed offset inside a RecordBatch → the broker returns the whole batch → head duplicated, the counted cursor overshoots the LEO → OFFSET_OUT_OF_RANGE → reset to `latest − 1` (`phpkafka/Consumer/OffsetManager.php:140,150` via `Consumer.php:345,364`) = again inside the last batch → the whole last batch is re-delivered on every poll while idle (lab: 3× in 3 polls). Stops when a 1-record batch arrives (v1 tracking `send()`). Aligned start = exact (control). Record loop `Consumer.php:357`, cursor `KafkaConsumer.php:282`, flush trigger `:251` (200 msgs / 1 s, `config/kafka.php:63-64`) can commit mid-batch; restarts: 6 h recycle, deploys, crashes, F9 evictions. Skips: not seen; possible `[INFERENCE]` when the drift exceeds the next batch's size. Fixes: offsets from the batch, commit only at batch boundaries, idempotent handler, rdkafka client.
- F9 **[LAB]**: 40 s flush → commit `[25] UNKNOWN_MEMBER_ID` → the next process replays all; 20 s control commits fine. Sokrio logs the failed commit at debug (`KafkaConsumer.php:328-335`).
- R13 **[LAB]** on real Laravel 9.52.22: a 12 s job with `$timeout=0`, `retry_after=5` and 2 workers ran 3× overlapping, then `MaxAttemptsExceededException` although every run finished.
- Redis eviction **[LAB]** (4 MB): `noeviction` → `OOM command not allowed` on RPUSH; a Lua script is checked only at its start (memory reached 13.5 MB). `allkeys-lru` evicted the idle queue list 3/3 when there were few big keys (and survived among 32k small keys: sampling makes it probabilistic). `volatile-lru` kept it 3/3 (no TTL on queue keys).
- Idempotency **[LAB]** (MySQL 8.0, `trackings`-shaped table): a replayed batch doubles rows; dedupe → `UNIQUE(user_id, created_at)` → `INSERT IGNORE` keeps 3; a plain INSERT → 1062.
- F11 re-confirmed **[LAB]** with the real `UniqueLock` (TTL −1).

### Master drift (T12, 2026-10-29): `master` = `75c787a2c`
- Refs stay pinned to `d14c0ebb2`. Kafka files are unchanged on master.
- **F13 fixed on master** (`e39909947`, `428b098ec`): `LockOrCreateStock` row lock inside `DB::transaction(…, 3)`. The per-stock Redis lock is gone.
- **F12 partly mitigated** (`9d3d42cd6`): `ScopeCacheToTenant::tenantPrefix($orgId)`, used only by `Module::forgetAllModulesCache`.
- **F10 still holds**: `PrimaryOrder/ApproveOrder` now takes a status lock (`d3fd1f69e`), but there's still no `onQueue` and `$timeout = 0`.
- **R31 / F16 still live**: the transfer jobs still take `User $user`.
- New, not reviewed: `Jobs/PrimaryOrder/SyncPrimaryOrderToSap.php`, `config/sap.php`.
- Full table: `00-inventory.md` §0.14.

### Infra
- GitHub Actions SSH deploys: `ci-cd.yml` (master→prod), `queue-worker-deploy.yml` (prod-queue), `prod-report-deploy.yml`, `pvm-ci-cd.yml`, `stg.yml`. Each runs a server-side `pipeline.sh`.
- No IaC, no compose file for the server, no Kafka/Redis in CI.

### Git history (Kafka)
`dcc8984e8` add-kafka → `22e866c83`/`ad4aa8aa7` order-summary revert → `d85dcb4bc`/`2b0587fd0` tracking revert/re-merge → `d32d99105` shadow removed → `37840a3b5` Redis-OOM hardening → `ce3a7aaab` retry after dead socket → `59922533e`/`3af8daa1f` real writes + fallback → `e99d02a03` bulk endpoint → `a7e63f4bb` batch + graceful shutdown → `de9b53f38`/`d1cbf7c54` group membership → `6486a0607` 6h runtime → `94791dabd` DepartmentMessageHandler → `9d902b7e8` group isolation → `967b4276e` skip publish in tests.

## 2. Notes-vs-code conflicts (the code wins)
| # | Notes say | Code says |
|---|---|---|
| D1 | `''` instance id means dynamic membership | `''` means **static** membership under id "" (`KafkaConsumer.php:79-95`) |
| D2 | One shared `KAFKA_GROUP` | One group per topic; tracking is legacy (`ConsumeCommand.php:97-107`) |
| D3 | Only tracking is live | Departments is live too |
| D4 | Key always tenant_id | user_id / department_id override it |
| D5 | Sync write + publish (shadow) | Sync write is a fallback only; 202 response |
| D6 | Department publish commented out | Enabled (the Mongo sync is what's commented out) |
| D7 | Laravel 10 | Laravel 9.52.22 |
| D8 | PR-5094 autoCommit=true | autoCommit=false, per-flush manual commit |
| D9 | Blog 04 snippet: null → fallback → 202 | The fallback is wrapped in try/catch → 503 + Retry-After 5 (`Tracking/TrackingController.php:70-81`) |
| D10 | Nightly resync is the department safety net (MEMORY risk #2) | `DepartmentSync` is manual only (F1) |
| D11 | Blog rule 1: a sync fallback "where the data matters" | Departments have no fallback, and `Department::upsert` never publishes (F2) |
| D12 | Org lookups are "Redis-cached for a week" (`TrackingMessageHandler.php:27`) | `60*24*7` seconds = ~2.8 h (`Org.php:57,72`) |
| D13 | MEMORY §Queues: "No `afterCommit`" | One site: `ApprovalNotifier.php:67` (`91d04f736`, 2026-10-06) |
| D14 | Handler comments: in-process Org cache "does not change freshness" | Process cache lives ≤6 h > 2.8 h Redis TTL (F18) |
| D15 | README Docker setup (`./dev`, `.docker/`); devops skill `containerization/docker-compose.yml` | Server docker files removed `557e63d68` (2024-01-02); `containerization/` absent; no compose provides Kafka |
| D16 | Study guide: logs at `storage/logs/kafka.log` | `daily` driver → `kafka-YYYY-MM-DD.log`, 7 days (`config/logging.php:60-64`) |
| D17 | Devops skill: `containerization/docker-compose.prod.yml` "AWS overlay (ECR, RDS/ElastiCache)" (`.claude/skills/sokrio-devops/SKILL.md:42`) | File exists nowhere under `~/code`; no ECR/RDS/ElastiCache evidence in any repo |
| D18 | Inventory §0.10: server has `.docker/php/` | Empty untracked local folder; git has no `.docker/` since `557e63d68` |
| D19 | T2 §2.2: Debezium is heavy because of "one binlog per tenant DB" | `[GENERAL]` The MySQL binlog is per **server**; one connector covers every tenant DB on a server via `database.include.list`. Cost scales with MySQL servers (some tenants are on a separate host), not tenants. Corrected in 08b Q28 |
| D20 | T4 §4.6: `ThrottleRequestsWithRedis` is a "Lua sliding window" | `[LIB]` `DurationLimiter` is a **fixed window** anchored at the first hit (`vendor/…/Redis/Limiters/DurationLimiter.php:154-168`); plain `RateLimiter::hit` is fixed-window too (`Cache/RateLimiter.php:110-122`). Corrected in 08c Q47 |
| D21 | T4 §4.7 / 07b R30 / 08e Q90: SCAN fix "start `null` + options array" tested 120/120 on both clients | `[LAB]` T9: predis + `null` → `ERR invalid cursor`; phpredis + `0`/`'0'` → 0/120. Laravel wraps `scan` only for phpredis (`Redis/Connections/PhpRedisConnection.php:314-326`). Portable fix: start = `null` if phpredis else `'0'`, options array, loop `while ($cursor && (string)$cursor !== '0')`, `?: [0, []]` for the phpredis `false`. Patched in 04, 07b, 08e |

## 3. Open assumptions (verify when possible)
| ID | Assumption | How to verify | Status |
|---|---|---|---|
| A1 | phpkafka producer `acks` default is 0 or 1, not `all` | Read `vendor/longlang/phpkafka/src/Producer/ProducerConfig.php` | **resolved T2: acks=0, never overridden (F5)** |
| A2 | `auto.offset.reset` default (earliest/latest) | Read `vendor/longlang/phpkafka/src/Consumer/ConsumerConfig.php` | **resolved T2: no setting; new group = offset 0, out-of-range = latest−1 (F6)** |
| A3 | Production topics have RF=1 (auto-created) | `kafka-topics.sh --describe` on the broker | open (ask Komol) |
| A4 | Kafka is self-hosted on EC2, not MSK | Host pattern behind `KAFKA_BROKERS` (no TLS/SASL in config) | open (ask Komol) |
| A5 | Redis is self-hosted, not ElastiCache | Host pattern behind `REDIS_HOST` | open (ask Komol) |
| A6 | Production `QUEUE_CONNECTION=redis`, `CACHE_DRIVER=redis` | `php artisan tinker` config() on prod | **very likely (T4): ScopeCacheToTenant/SmsResendRun only make sense on Redis; confirm** |
| A7 | Production `REDIS_CLIENT=predis` | `.env` name check, or: does Mongo `feature_usage_events` have rows from the last day? (yes → predis) | **open, urgent (F14); T5: README recommends phpredis (`README.md:43,85`) → leans phpredis** |
| A9 | Prod Redis runs `maxmemory` + `noeviction`, no AOF | `redis-cli CONFIG GET maxmemory*` / `appendonly` on the box | open (T4, OOM test hints yes) |
| A10 | Which boxes run `queue:work` with which `--queue` lists; is `storage/app` shared web↔queue VM? (F19) | Komol / `supervisorctl status` + `df`/mount on both boxes | open (T6) |
| A11 | Does each `pipeline.sh` run `queue:restart`/`supervisorctl restart` and stop Kafka consumers gracefully? | Read `pipeline.sh` on the servers | open (T6) |
| A8 | DepartmentChangeObserver publishes before the outer DB txn commits | Find Department saves wrapped in `DB::transaction` | **confirmed T2: `DepartmentBulkDataUpdateController.php:41-52` (F8)** |

## 4. Risk shortlist (feeds T7 Top-5)
1. RF=1 auto-created topics: a single broker loss means data loss or outage.
2. Department events lost on a broker outage: no fallback, no DLQ, and `DepartmentSync` is manual only (F1). Bulk `upsert` writes never publish at all (F2).
3. `$timeout=0` jobs vs `retry_after=9000` can double-run long reports.
4. No `afterCommit`, so jobs and Kafka events can fire before the commit.
5. The swallowed handler failure path is at-most-once, there is no DLQ, and `event_id` is never deduplicated.
6. No `onOneServer()`. Safe only while exactly one box has `RUN_SCHEDULER=true`.
7. Ignored job properties (`$retry_after`, `$retries`) give a false sense of config.
8. `DepartmentMessageHandler` has no tests.
9. `SecondaryOrderSummaryJob` uniqueness defeated by `rand()` (F3): doubled work, but the data stays correct.
10. Producer acks=0 (F5): silent loss behind a 202. Cheapest high-value fix: `setAcks(1)`. **Candidate for the T7 Top-5.**
11. Out-of-range offset jumps to latest (F6): a long consumer outage silently skips data.
12. Library offset counting vs batch base (F7, **[LAB] T9**): duplicates after a mid-batch restart, then the F25 replay loop (#29).
13. Heartbeat starvation during slow flushes (F9) → replays → tracking duplicates (tracking is not idempotent).
14. Delayed approvals can run 2.5 h late after a worker crash (`retry_after=9000`); primary orders on `default` with `$timeout=0` (F10). Fix: `onQueue('order-approved')`, real timeout, short-`retry_after` connection.
15. F11 bulk stock import chunks/tenants silently dropped by a global no-TTL unique lock. **Candidate for the T7 Top-5** (silent data loss, a one-line fix).
16. F14 feature analytics never flushed if prod is phpredis (depends on A7).
17. F12 prefix split: request↔worker keys miss (429 export guard, stale Org `active`, unique locks).
18. F13 stock lost update (Redis lock released before commit).
19. One Redis for queues and cache: shared `maxmemory`, a restart loses delayed approvals (no sweeper), eviction policy unknown (A9).
20. F16 tenant `User` models restored from the previous job's tenant DB: wrong audit names, silent bulk-op failures, cross-tenant failure email. **Candidate for the T7 Top-5** (cross-tenant, cheap fix).
21. Worker-global state leaks between jobs (auth, `app('tenant')`, tenant conn) and no test can see cross-tenant bugs (single tenant, reconnect no-op, sync queue).
22. F18 deactivated tenant still consumed by Kafka handlers ≤6 h.
23. F19 stock import silently no-ops when a different VM pops the job (local-disk handoff) [INFERENCE, needs A10].
24. F20 Python cache in Redis DB 0 competes with the queues for memory/eviction.
25. F22 SQS migration blocker (60-min delays > 900 s cap) — design note, not a live bug.
26. F23 unpinned `ssh-action@master` with prod SSH secrets; password SSH on prod; PVM on the prod VM.
27. No alerting on consumer lag, queue age, failed_jobs, Redis memory, scheduler heartbeat (T6 §6.9).
28. F24 global export lane stuck behind a dead `processing` row; one-at-a-time across all tenants (noisy neighbor).
29. F25 phpkafka replay loop after a mid-batch restart (`[LAB]`): the last batch is re-delivered every poll until a 1-record batch arrives → duplicate `trackings` rows. Idempotent writes (L5) neutralise it.

## 5. Decisions log
| Date | Decision |
|---|---|
| 2026-10-29 | T12 final QA. Secrets scan is clean: 0 IPs, 0 credentials or keys, and the only hostnames are wildcard patterns (`*.cache.amazonaws.com`). All 1,038 refs checked automatically: 828 repo refs in range at `d14c0ebb2`, 1 off-by-one fixed (`SecondaryOrderSummaryJob.php:52-87` → `52-85`), 133 vendor/monorepo refs in range, 76 ambiguous basenames left alone. 10 random refs checked by eye, all match. Master moved to `75c787a2c`: refs stay pinned to the snapshot, with a drift table added as `00` §0.14 plus update notes at F12/F13 in `04`. The HTML was rebuilt (757 KB) and re-verified headless: 25/25 diagrams, 106 cards, 0 console errors |
| 2026-10-28 | T11: `build/build_html.py` (36 lines) + `build/template.html` (580) → `messaging-deep-dive.html` (753 KB, 16 sections). Client-side render: markdown embedded as JSON, `marked@12.0.2` + `mermaid@10.9.1` from jsDelivr (pinned). 106 Q cards × 5 collapsible parts, 894 tag badges, 1040 `path:line` chips, 121 🟢🟡🔴 chips. localStorage keys `mdd-known` / `mdd-theme`. Verified headlessly (Playwright + system Chrome, Node 22 from nvm; the Chrome extension was not connected): 25/25 diagrams, clean console, no horizontal scroll at 390 px. **8 Mermaid blocks had syntax errors and were fixed in the sections, diagram source only:** `;` in sequence messages → `,` (01, 06 §6.4, 09); `-.x` → `-.-x` (00); unquoted `()`/`{}`/`[]` labels quoted (04 §4.7, 05 §5.1, 06 §6.10); `:` in stateDiagram labels → `#58;` (04 §4.2, renders as `:`) |
| 2026-10-26 | T10: `sections/GLOSSARY.md` (369 lines), H1 `# 10 · Glossary` (sorts after `09-…` in `sections/*.md`, so T11 reads it last). `##` = §10.1 tags, §10.2 general A–Z (`### A`… letter subheads), §10.3 Sokrio names, §10.4 ids. Only terms that appear in 00–09 (checked by grep; KEDA/MirrorMaker dropped). New id families documented: P1–P5 / C1–C2 (00 §0.4–0.5 tables), B1–B8 (01 §1.2) |
| 2026-10-26 | T9: one file (09) + a reusable `labs/` harness inside this RnD folder (scratchpad is per-session). Labs L1–L9 actually run; L10/L11 reuse T4/T5 results; L13 (LocalStack SQS) written but not run. Study plan = 5 weeks + 1 buffer, a lab day + `Quiz me` checkpoint each week. Wrong "tested" claims get patched in place with a dated note (D21), unlike D19/D20, which were only corrected in the new file |
| 2026-10-26 | Output goes into this RnD folder (`sections/`), not `sokrio-server/docs/messaging-knowledge/` |
| 2026-10-26 | Markdown sections first, then one HTML page built by `build/build_html.py` |
| 2026-10-26 | English, full depth, all 81 + 20 new questions |
| 2026-10-26 | Q&A split into T8a–T8e by question range |
| 2026-10-26 | T8e: one file (937 lines). `## 8.13` Q82–Q106 (25 new Sokrio-derived Qs, one per finding: F5, F6, F7, F9, D1, F2/F8, F11/F3, F12, F14, F16, F18/F17, F19, F24, F15, F21, R23, R24, 6 h recycle, dropped `event_id`, sync fallback, tracking natural key, scheduler/`onOneServer`, ignored job props, auto-created topics, first five alerts). `## 8.14` STAR from verified commit dates (`dcc8984e8` 2025-10-16 … `9d902b7e8`/`94791dabd` 2026-09-15); metrics and the shadow-comparison method are **placeholders for Komol to fill**, never invent them. `## 8.15` three designs (order pipeline, multi-tenant reporting, notifications), each today → target Mermaid → reversible steps mapped to finding ids. T8 total = Q1–Q106 across 08a–08e |
| 2026-10-26 | T8d: one file (980 lines, 24 Qs, `## 8.9` patterns / `## 8.10` Laravel / `## 8.11` design / `## 8.12` incidents). No new findings or conflicts. New `[LIB]` refs: `Worker.php` daemon :128, timeout handler :206, stopIfNecessary :295, getNextJob walks `--queue` in order :339-352 (priority), restart key :653-666, SIGTERM/SIGUSR2 :675-681; `RedisQueue.php` pushRaw :153, pop :224; redis block `config/queue.php:61-66` (`block_for` null → `--sleep` polling). `[CODE]` `SendApprovalNotificationJob` (`tries=3`) catches per recipient + per FCM push (`:44-68`), so its retries never resend (used in Q70/Q77). Framings: "a lock released before the commit protects nothing" (Q73, F13); "Sokrio has CQRS without event sourcing" (Q59); departments = ECST without version/tombstones (Q60); for jobs the migration target is SQS/managed Redis, not Kafka (Q75) |
| 2026-10-26 | T8c: one file (786 lines, 20 Qs, `## 8.6` Redis / `## 8.7` comparisons / `## 8.8` stream processing). Stream Qs say plainly Sokrio is batch (hourly + daily resync = Lambda batch layer with no speed layer) and mark streaming designs `[INFERENCE]`. New `[LIB]` facts: `Cache::remember` never stores `null` (`Cache/Repository.php:386-397`) → unknown-key penetration on every `remember` returning null; D20. Framings: "exactly-once starts at the producer" (F5 + dropped `event_id`); departments topic = KTable, Org = GlobalKTable candidate (fixes F18); phpkafka crc32 breaks co-partitioning with Java producers |
| 2026-10-26 | T8b: one file (649 lines, 18 Qs, `## 8.4` Kafka ops / `## 8.5` RabbitMQ). RabbitMQ Qs answer the textbook part, then the Laravel-on-Redis analog (ack=delete, release=nack+delay, failed_jobs=DLX, crash redelivery = `retry_after` lease 9000 s vs AMQP's immediate requeue). New framings: phpkafka `crc32` ≠ Java murmur2 (cross-language partition mismatch risk); "effective poll budget = 30 s session timeout, not 5 min" (F9); a fresh replay group starts at offset 0, so set offsets with the CLI before first start (F6). D19 logged |
| 2026-10-26 | T8a: one file (630 lines, 19 Qs). Each section `## 8.x` groups questions for the TOC; Sokrio examples reuse existing refs only (no new code reads, no new findings). Version-dependent Kafka facts (KRaft 3.3/3.5/4.0, idempotence default 3.0, ELR KIP-966) tagged `[GENERAL]`; Sokrio broker version stays unknown (A4). Key framing reused across T8: "consumer at-least-once, pipeline best-effort", "Kafka partitions = 3 but real parallelism = 1 (numprocs=1 + static id \"\")", "departments = ideal compacted topic (needs tombstones on delete)" |
| 2026-10-26 | T7: split into 07a (Kafka) / 07b (queues, Redis, AWS + Top 5); 35 runbooks in the exact 8-field template (labels bolded). Overlaps folded: `$timeout=0` double run → R13, Redis restart losing `:delayed` → R12. R19 RabbitMQ = not applicable + Redis analog. New finding F24. Top 5 ranked by blast radius (cross-tenant > loss > latency), then by fix cost |
| 2026-10-26 | T6: one file (379 lines). A3–A5 left `[ASSUMPTION]` with an evidence table (leans self-hosted). Recommendations: stay on EC2+Supervisor; split queue/cache Redis (cluster mode disabled); MSK only with TLS/mTLS (F21) after F5/F6; EventBridge Scheduler for delayed approvals (F22); S3 handoff (F19). New tag `[HIST]` for deleted files |
| 2026-10-26 | T5: one file (375 lines). F16 reproduced with a throwaway SQLite + real Laravel `SerializesModels` lab in the docker `memo-phptest:jpeg` image (scratchpad, app code untouched). Recommended root fix = provider-level `JobProcessing` tenant restore; per-site `afterCommit` over global `after_commit` |
| 2026-10-26 | T4: one file (331 lines), no 04a/04b split. F11–F15 + D12 recorded; F11/F14/F12 reproduced in a throwaway redis-server lab (scratchpad, port 6390, app code untouched). `.env` read is blocked by permissions, so prod driver facts stay A6/A7/A9 |
| 2026-10-26 | T3: RabbitMQ not recommended. Delays/retries/priority → Laravel queues (`backoff`, multi-queue priority, per-connection `retry_after`); ERP request/reply is the only real broker case and it is cross-team (compare with Kafka/webhook/SQS in T6). F10 recorded |
| 2026-10-26 | T2: F5–F9 recorded; F7 and fetch maxBytes=0 are `[INFERENCE]` and become T9 labs; proposals = acks=1, outbox (afterCommit observer as stopgap), DLQ per stream, unique `(user_id, created_at)`, schedule DepartmentSync |
| 2026-10-26 | T1: new conflicts D9–D11 and findings F1–F4 are recorded here; T2/T7 should reuse them (F2 is a dual-write gap, F1 feeds the T7 Top-5) |

## 6. Style rules for every section
- H1 `# NN · Title`, then a snapshot line (branch + HEAD).
- Tags inline at the start of a bullet, e.g. `[CODE]`. Refs in backticks, `path:line`.
- Tables for inventories, Mermaid for flows, ≤ 15-line code snippets.
- End with the `### ✅ Quality check` list.
- The HTML renderer relies on: `## ` headings for the TOC, `### Q<n>.` for Q&A cards, and `**Short answer**`-style labels for the collapsible parts. Keep these exact.
