# TRACKER

Legend: ⬜ not started · 🟨 in progress · ✅ done · ⏸ blocked

| Task | Phase | Output | Status | Lines | Date | Notes |
|---|---|---|---|---|---|---|
| T0 | Inventory | `sections/00-inventory.md` | ✅ | 315 | 2026-10-26 | Surveyed `master` @ `d14c0ebb2`; 8 notes-vs-code conflicts (D1–D8) |
| T1 | Architecture overview | `sections/01-architecture-overview.md` | ✅ | 269 | 2026-10-26 | B1–B8 mapped; 3 sequence diagrams; D9–D11 + 4 new findings (F1–F4) |
| T2 | Kafka deep dive | `sections/02-kafka-in-sokrio.md` | ✅ | 290 | 2026-10-26 | A1/A2/A8 resolved; F5 acks=0, F6 offset reset, F7 offset counting, F8 txn phantom events, F9 heartbeat-on-fetch |
| T3 | RabbitMQ | `sections/03-rabbitmq-in-sokrio.md` | ✅ | 186 | 2026-10-26 | Not used (search re-run); 4 fits assessed → don't add; F10 primary-order delayed approval on `default`, timeout 0 |
| T4 | Redis | `sections/04-redis-in-sokrio.md` | ✅ | 331 | 2026-10-26 | No split needed; F11 unique-lock chunk drop, F12 prefix split, F13 lock-before-commit, F14 phpredis SCAN, F15 no-op lockForUpdate; D12 Org TTL 2.8 h; 3 `[LAB]` repros |
| T5 | Laravel implementation | `sections/05-laravel-implementation.md` | ✅ | 375 | 2026-10-26 | Corrected topic+consumer checklist; job rules 1–11; afterCommit site table; 13 test files; F16 tenant-model restore (`[LAB]`), F17 dead tenant_id payload, F18 process Org cache; D13–D16 |
| T6 | AWS infra | `sections/06-aws-infrastructure.md` | ✅ | 379 | 2026-10-26 | A3–A5 still `[ASSUMPTION]` (evidence leans self-hosted); F19 local-disk handoff, F20 Python on Redis DB0, F21 client blocks MSK IAM/SCRAM/Serverless, F22 SQS 15-min cap vs 60-min approvals, F23 deploy hygiene; D17–D18; new A10/A11 |
| T7 | Failure modes & runbooks | `sections/07a-failure-modes-kafka.md` + `07b-failure-modes-queues-redis.md` | ✅ | 253+255 | 2026-10-26 | Split 07a (Kafka R1–R10, R21–R28) / 07b (queues/Redis/AWS R11–R20, R29–R35 + Top 5); 35 runbooks, 8-field template; F24 export lane stuck (new) |
| T8a | Q&A Q1–Q19 | `sections/08a-interview-qa.md` | ✅ | 630 | 2026-10-26 | 19 Qs × 5 labels; reuses F5–F9, F1/F2/F8, D1/D4/D9, R1–R5/R15/R21–R27; no new findings |
| T8b | Q&A Q20–Q37 | `sections/08b-interview-qa.md` | ✅ | 649 | 2026-10-26 | 18 Qs × 5 labels; RabbitMQ answered with Laravel analogs (T3); D19 binlog per server (corrects T2 §2.2) |
| T8c | Q&A Q38–Q57 | `sections/08c-interview-qa.md` | ✅ | 786 | 2026-10-26 | 20 Qs × 5 labels; stream processing framed as "Sokrio is batch" + `[INFERENCE]` streaming designs; D20 Laravel limiters are fixed-window (corrects T4 §4.6); `remember()` never caches null |
| T8d | Q&A Q58–Q81 | `sections/08d-interview-qa.md` | ✅ | 980 | 2026-10-26 | 24 Qs × 5 labels; patterns say plainly Sokrio has no saga/ES/CDC; designs in the 7-step frame; incidents mapped to R1–R5/R11–R13/R19/R21–R27; new `[LIB]` Worker/RedisQueue line refs; no new findings |
| T8e | New Qs + STAR + 3 designs | `sections/08e-interview-qa.md` | ✅ | 937 | 2026-10-26 | 25 new Qs (Q82–Q106) × 5 labels from F2–F24/D1/R23/R24; STAR from git history with metric placeholders; 3 Sokrio designs (today → target → migration steps); no new findings. **T8 complete (Q1–Q106)** |
| T9 | Study plan + labs + cheat sheet | `sections/09-study-plan-and-labs.md` + `labs/` | ✅ | 473 | 2026-10-26 | 5-week plan + buffer; 14 labs (L0–L13), L1–L9 **run** on real Kafka 3.7 / Redis 7 / MySQL 8 with Sokrio's vendor (phpkafka 1.2.5, Laravel 9.52.22) read-only; F5/F7/F9 → `[LAB]`; **F25** replay loop (new); **D21** SCAN fix corrected in 04/07b/08e; cheat sheet |
| T10 | Glossary | `sections/GLOSSARY.md` | ✅ | 369 | 2026-10-26 | H1 `# 10 · Glossary`; §10.1 tags · §10.2 ~150 general terms A–Z · §10.3 Sokrio components/config · §10.4 every id family (F/D/R/AL/A/L/B/P/C/Q/T) with home section; no new code reads, no new findings |
| T11 | Render HTML | `build/build_html.py` + `build/template.html` → `messaging-deep-dive.html` | ✅ | 36+580 | 2026-10-28 | 753 KB; TOC/scrollspy, search, 106 Q cards, quiz, known tracker, dark mode, phone layout; verified in headless Chrome (25/25 diagrams, clean console); fixed 8 Mermaid syntax errors in 00/01/04/05/06/09 |
| T12 | Final QA | `00` §0.14 + notes in `01`/`04` | ✅ | +27 | 2026-10-29 | Secrets clean; 1,038 refs auto-checked (1 off-by-one fixed); 10/10 spot-check match; master `75c787a2c`: Kafka unchanged, **F13 fixed**, F12 partly mitigated, F10/R31 still hold; HTML rebuilt + re-verified |

**Progress:** 17 / 17 tasks ✅ · **Plan complete.**
