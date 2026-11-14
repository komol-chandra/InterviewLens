---
id: health-report
title: Content Health Report
track: plan
type: note
status: good
updated: 2026-11-14
files: 233
words: 257103
stubs: 42
no_readme: 0
no_frontmatter: 0
broken_links: 0
spaces: 0
leak_files: 110
---

# Content Health Report

> `python3 scripts/health.py` দিয়ে তৈরি। হাতে এডিট করবে না, আবার চালাও (`/health-check`)।
> `.claude/`, `99-archive/`, `scripts/`, `tools/` গোনা হয় না (link check বাদে `99-archive/`)।

## Per folder

| Folder | md | words | stubs | no README | no FM | broken links | spaces | leak files | assets |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| (root) | 4 | 3,948 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| 00-start | 4 | 4,883 | **1** | 0 | 0 | 0 | 0 | 0 | 0 |
| 01-problem-solving | 77 | 14,500 | **37** | 0 | 0 | 0 | 0 | 0 | 7 |
| 02-cs-fundamentals-mcq | 2 | 1,174 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 03-system-design | 23 | 23,889 | 0 | 0 | 0 | 0 | 0 | **20** | 0 |
| 04-design-patterns-lld | 25 | 20,205 | 0 | 0 | 0 | 0 | 0 | **23** | 17 |
| 05-backend | 61 | 156,930 | 0 | 0 | 0 | 0 | 0 | **47** | 31 |
| 06-aws-devops | 4 | 3,014 | 0 | 0 | 0 | 0 | 0 | **2** | 0 |
| 07-ai-engineering | 1 | 42 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 08-frontend-nextjs | 12 | 6,002 | 0 | 0 | 0 | 0 | 0 | **6** | 0 |
| 09-real-world-cases | 1 | 46 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 10-behavioral-leadership | 5 | 3,264 | 0 | 0 | 0 | 0 | 0 | **3** | 0 |
| 11-mocks | 8 | 18,051 | **2** | 0 | 0 | 0 | 0 | **5** | 0 |
| 12-career | 6 | 1,155 | **2** | 0 | 0 | 0 | 0 | **4** | 18 |
| **Total** | **233** | **257,103** | **42** | **0** | **0** | **0** | **0** | **110** | **74** |

## Public-safe leaks (employer name) (110)

- [05-backend/messaging-streaming/messaging-deep-dive.html](../05-backend/messaging-streaming/messaging-deep-dive.html) — 516 hits
- [05-backend/messaging-streaming/sections/08d-interview-qa.md](../05-backend/messaging-streaming/sections/08d-interview-qa.md) — 64 hits
- [05-backend/messaging-streaming/sections/09-study-plan-and-labs.md](../05-backend/messaging-streaming/sections/09-study-plan-and-labs.md) — 55 hits
- [05-backend/messaging-streaming/sections/08e-interview-qa.md](../05-backend/messaging-streaming/sections/08e-interview-qa.md) — 50 hits
- [05-backend/messaging-streaming/README.md](../05-backend/messaging-streaming/README.md) — 46 hits
- [05-backend/messaging-streaming/sections/GLOSSARY.md](../05-backend/messaging-streaming/sections/GLOSSARY.md) — 42 hits
- [05-backend/messaging-streaming/sections/08b-interview-qa.md](../05-backend/messaging-streaming/sections/08b-interview-qa.md) — 41 hits
- [05-backend/messaging-streaming/sections/08a-interview-qa.md](../05-backend/messaging-streaming/sections/08a-interview-qa.md) — 39 hits
- [05-backend/messaging-streaming/sections/08c-interview-qa.md](../05-backend/messaging-streaming/sections/08c-interview-qa.md) — 36 hits
- [05-backend/messaging-streaming/sections/07a-failure-modes-kafka.md](../05-backend/messaging-streaming/sections/07a-failure-modes-kafka.md) — 35 hits
- [05-backend/messaging-streaming/sections/06-aws-infrastructure.md](../05-backend/messaging-streaming/sections/06-aws-infrastructure.md) — 33 hits
- [05-backend/messaging-streaming/sections/07b-failure-modes-queues-redis.md](../05-backend/messaging-streaming/sections/07b-failure-modes-queues-redis.md) — 30 hits
- [05-backend/messaging-streaming/sections/03-rabbitmq-in-sokrio.md](../05-backend/messaging-streaming/sections/03-rabbitmq-in-sokrio.md) — 29 hits
- [05-backend/messaging-streaming/_plan/MEMORY.md](../05-backend/messaging-streaming/_plan/MEMORY.md) — 26 hits
- [05-backend/messaging-streaming/sections/00-inventory.md](../05-backend/messaging-streaming/sections/00-inventory.md) — 25 hits
- [05-backend/messaging-streaming/sections/02-kafka-in-sokrio.md](../05-backend/messaging-streaming/sections/02-kafka-in-sokrio.md) — 17 hits
- [05-backend/messaging-streaming/sections/04-redis-in-sokrio.md](../05-backend/messaging-streaming/sections/04-redis-in-sokrio.md) — 14 hits
- [05-backend/messaging-streaming/_plan/PLAN.md](../05-backend/messaging-streaming/_plan/PLAN.md) — 13 hits
- [05-backend/messaging-streaming/sections/README.md](../05-backend/messaging-streaming/sections/README.md) — 13 hits
- [03-system-design/cases/23-multi-tenant-saas.md](../03-system-design/cases/23-multi-tenant-saas.md) — 12 hits
- [05-backend/10-nodejs/01-nodejs-nestjs.md](../05-backend/10-nodejs/01-nodejs-nestjs.md) — 12 hits
- [05-backend/messaging-streaming/old-resource/kafka-system-design-study-guide.bn.md](../05-backend/messaging-streaming/old-resource/kafka-system-design-study-guide.bn.md) — 12 hits
- [05-backend/messaging-streaming/old-resource/kafka-system-design-study-guide.md](../05-backend/messaging-streaming/old-resource/kafka-system-design-study-guide.md) — 12 hits
- [08-frontend-nextjs/02-typescript.md](../08-frontend-nextjs/02-typescript.md) — 12 hits
- [10-behavioral-leadership/hr-answers.md](../10-behavioral-leadership/hr-answers.md) — 12 hits
- [05-backend/00-plan.md](../05-backend/00-plan.md) — 11 hits
- [05-backend/04-os-web-api/03-rest-api-webhooks.md](../05-backend/04-os-web-api/03-rest-api-webhooks.md) — 11 hits
- [08-frontend-nextjs/01-javascript-es6.md](../08-frontend-nextjs/01-javascript-es6.md) — 10 hits
- [04-design-patterns-lld/02-sokrio-pattern-map.md](../04-design-patterns-lld/02-sokrio-pattern-map.md) — 8 hits
- [04-design-patterns-lld/creational/04-factory.md](../04-design-patterns-lld/creational/04-factory.md) — 8 hits
- [05-backend/01-relational-database/04-mysql-advanced.md](../05-backend/01-relational-database/04-mysql-advanced.md) — 8 hits
- [05-backend/messaging-streaming/_plan/TRACKER.md](../05-backend/messaging-streaming/_plan/TRACKER.md) — 8 hits
- [05-backend/messaging-streaming/old-resource/primary-order-delivery-kafka-plan.md](../05-backend/messaging-streaming/old-resource/primary-order-delivery-kafka-plan.md) — 8 hits
- [05-backend/messaging-streaming/sections/01-architecture-overview.md](../05-backend/messaging-streaming/sections/01-architecture-overview.md) — 8 hits
- [12-career/cv-by-role/build-cvs.js](../12-career/cv-by-role/build-cvs.js) — 8 hits
- [04-design-patterns-lld/architectural/14-repository.md](../04-design-patterns-lld/architectural/14-repository.md) — 7 hits
- [04-design-patterns-lld/behavioral/10-chain.md](../04-design-patterns-lld/behavioral/10-chain.md) — 7 hits
- [05-backend/messaging-streaming/old-resource/PR-5094-breakdown.md](../05-backend/messaging-streaming/old-resource/PR-5094-breakdown.md) — 7 hits
- [05-backend/messaging-streaming/sections/05-laravel-implementation.md](../05-backend/messaging-streaming/sections/05-laravel-implementation.md) — 7 hits
- [08-frontend-nextjs/react/02-react-redux-ts.md](../08-frontend-nextjs/react/02-react-redux-ts.md) — 7 hits
- [03-system-design/cases/13-dispatch.md](../03-system-design/cases/13-dispatch.md) — 6 hits
- [03-system-design/cases/15-reporting-pipeline.md](../03-system-design/cases/15-reporting-pipeline.md) — 6 hits
- [03-system-design/concepts/03-caching.md](../03-system-design/concepts/03-caching.md) — 6 hits
- [04-design-patterns-lld/behavioral/03-strategy.md](../04-design-patterns-lld/behavioral/03-strategy.md) — 6 hits
- [04-design-patterns-lld/structural/08-decorator-proxy.md](../04-design-patterns-lld/structural/08-decorator-proxy.md) — 6 hits
- [11-mocks/mock-01-cv-behavioral.md](../11-mocks/mock-01-cv-behavioral.md) — 6 hits
- [11-mocks/mock-01-part-c-deep-dive.md](../11-mocks/mock-01-part-c-deep-dive.md) — 6 hits
- [03-system-design/cases/12-order-inventory.md](../03-system-design/cases/12-order-inventory.md) — 5 hits
- [03-system-design/concepts/02-scaling.md](../03-system-design/concepts/02-scaling.md) — 5 hits
- [04-design-patterns-lld/architectural/15-distributed-patterns.md](../04-design-patterns-lld/architectural/15-distributed-patterns.md) — 5 hits
- [04-design-patterns-lld/behavioral/13-template-method.md](../04-design-patterns-lld/behavioral/13-template-method.md) — 5 hits
- [04-design-patterns-lld/machine-coding/README.md](../04-design-patterns-lld/machine-coding/README.md) — 5 hits
- [08-frontend-nextjs/react-native/01-react-native-basics.md](../08-frontend-nextjs/react-native/01-react-native-basics.md) — 5 hits
- [03-system-design/study-plan.md](../03-system-design/study-plan.md) — 4 hits
- [03-system-design/cases/fn-02-php-to-node-migration.md](../03-system-design/cases/fn-02-php-to-node-migration.md) — 4 hits
- [03-system-design/concepts/05-sql-vs-nosql.md](../03-system-design/concepts/05-sql-vs-nosql.md) — 4 hits
- [03-system-design/concepts/06-cap-consistency.md](../03-system-design/concepts/06-cap-consistency.md) — 4 hits
- [03-system-design/concepts/11-reliability.md](../03-system-design/concepts/11-reliability.md) — 4 hits
- [04-design-patterns-lld/creational/06-singleton.md](../04-design-patterns-lld/creational/06-singleton.md) — 4 hits
- [04-design-patterns-lld/structural/07-adapter.md](../04-design-patterns-lld/structural/07-adapter.md) — 4 hits
- [05-backend/01-question-list.md](../05-backend/01-question-list.md) — 4 hits
- [05-backend/07-laravel-backend/02-php-laravel-delta.md](../05-backend/07-laravel-backend/02-php-laravel-delta.md) — 4 hits
- [05-backend/08-python-fast-api/01-notes.md](../05-backend/08-python-fast-api/01-notes.md) — 4 hits
- [05-backend/messaging-streaming/microservices-event-driven.md](../05-backend/messaging-streaming/microservices-event-driven.md) — 4 hits
- [08-frontend-nextjs/html-css/01-notes.md](../08-frontend-nextjs/html-css/01-notes.md) — 4 hits
- [03-system-design/01-framework.md](../03-system-design/01-framework.md) — 3 hits
- [03-system-design/cases/09-rate-limiter.md](../03-system-design/cases/09-rate-limiter.md) — 3 hits
- [03-system-design/cases/10-notification.md](../03-system-design/cases/10-notification.md) — 3 hits
- [03-system-design/cases/11-payment.md](../03-system-design/cases/11-payment.md) — 3 hits
- [03-system-design/cases/fn-01-work-order-dispatch.md](../03-system-design/cases/fn-01-work-order-dispatch.md) — 3 hits
- [03-system-design/concepts/07-queues.md](../03-system-design/concepts/07-queues.md) — 3 hits
- [04-design-patterns-lld/01-principles.md](../04-design-patterns-lld/01-principles.md) — 3 hits
- [04-design-patterns-lld/README.md](../04-design-patterns-lld/README.md) — 3 hits
- [04-design-patterns-lld/behavioral/09-observer.md](../04-design-patterns-lld/behavioral/09-observer.md) — 3 hits
- [04-design-patterns-lld/behavioral/11-command.md](../04-design-patterns-lld/behavioral/11-command.md) — 3 hits
- [04-design-patterns-lld/behavioral/12-state.md](../04-design-patterns-lld/behavioral/12-state.md) — 3 hits
- [04-design-patterns-lld/code/chain.ts](../04-design-patterns-lld/code/chain.ts) — 3 hits
- [05-backend/messaging-streaming/labs/bin/php.sh](../05-backend/messaging-streaming/labs/bin/php.sh) — 3 hits
- [05-backend/messaging-streaming/labs/kafka/f7_control.php](../05-backend/messaging-streaming/labs/kafka/f7_control.php) — 3 hits
- [05-backend/messaging-streaming/labs/kafka/f7_offsets.php](../05-backend/messaging-streaming/labs/kafka/f7_offsets.php) — 3 hits
- [05-backend/messaging-streaming/labs/kafka/f9_heartbeat.php](../05-backend/messaging-streaming/labs/kafka/f9_heartbeat.php) — 3 hits
- [05-backend/messaging-streaming/old-resource/04-kafka-in-production-multi-tenant-laravel.md](../05-backend/messaging-streaming/old-resource/04-kafka-in-production-multi-tenant-laravel.md) — 3 hits
- [06-aws-devops/03-observability-sli-slo.md](../06-aws-devops/03-observability-sli-slo.md) — 3 hits
- [10-behavioral-leadership/story-bank.md](../10-behavioral-leadership/story-bank.md) — 3 hits
- [11-mocks/mock-02-system-design.md](../11-mocks/mock-02-system-design.md) — 3 hits
- [03-system-design/cases/08-url-shortener.md](../03-system-design/cases/08-url-shortener.md) — 2 hits
- [03-system-design/concepts/04-db-scaling.md](../03-system-design/concepts/04-db-scaling.md) — 2 hits
- [04-design-patterns-lld/creational/05-builder.md](../04-design-patterns-lld/creational/05-builder.md) — 2 hits
- [05-backend/07-laravel-backend/01-notes.md](../05-backend/07-laravel-backend/01-notes.md) — 2 hits
- [05-backend/messaging-streaming/_plan/HANDOFF.md](../05-backend/messaging-streaming/_plan/HANDOFF.md) — 2 hits
- [05-backend/messaging-streaming/labs/laravel/f14.php](../05-backend/messaging-streaming/labs/laravel/f14.php) — 2 hits
- [05-backend/messaging-streaming/old-resource/03-event-driven-systems-and-kafka.md](../05-backend/messaging-streaming/old-resource/03-event-driven-systems-and-kafka.md) — 2 hits
- [05-backend/messaging-streaming/old-resource/README.md](../05-backend/messaging-streaming/old-resource/README.md) — 2 hits
- [06-aws-devops/02-docker-k8s-aws-linux.md](../06-aws-devops/02-docker-k8s-aws-linux.md) — 2 hits
- [08-frontend-nextjs/react/01-notes.md](../08-frontend-nextjs/react/01-notes.md) — 2 hits
- [11-mocks/mock-04-db-api.md](../11-mocks/mock-04-db-api.md) — 2 hits
- [12-career/cv-by-role/build-cover-letter.js](../12-career/cv-by-role/build-cover-letter.js) — 2 hits
- [12-career/templates/email-template.txt](../12-career/templates/email-template.txt) — 2 hits
- [03-system-design/00-notes.md](../03-system-design/00-notes.md) — 1 hits
- [04-design-patterns-lld/code/adapter.ts](../04-design-patterns-lld/code/adapter.ts) — 1 hits
- [04-design-patterns-lld/code/command.ts](../04-design-patterns-lld/code/command.ts) — 1 hits
- [04-design-patterns-lld/code/factory.ts](../04-design-patterns-lld/code/factory.ts) — 1 hits
- [04-design-patterns-lld/machine-coding/rate-limiter.ts](../04-design-patterns-lld/machine-coding/rate-limiter.ts) — 1 hits
- [04-design-patterns-lld/machine-coding/work-order-lifecycle.ts](../04-design-patterns-lld/machine-coding/work-order-lifecycle.ts) — 1 hits
- [05-backend/01-relational-database/01-notes.md](../05-backend/01-relational-database/01-notes.md) — 1 hits
- [05-backend/messaging-streaming/build/template.html](../05-backend/messaging-streaming/build/template.html) — 1 hits
- [05-backend/messaging-streaming/labs/kafka/f5_acks.php](../05-backend/messaging-streaming/labs/kafka/f5_acks.php) — 1 hits
- [10-behavioral-leadership/README.md](../10-behavioral-leadership/README.md) — 1 hits
- [11-mocks/00-series-overview.md](../11-mocks/00-series-overview.md) — 1 hits
- [12-career/templates/generate-topics-prompt.txt](../12-career/templates/generate-topics-prompt.txt) — 1 hits

## Broken links (0)

✅ কিছু নেই।

## Missing README (0)

✅ কিছু নেই।

## Missing frontmatter (0)

✅ কিছু নেই।

## Paths with spaces (0)

✅ কিছু নেই।

## Stubs (< 150 words) (42)

- [00-start/tracker.md](../00-start/tracker.md) — 133 words
- [01-problem-solving/01-arrays/easy.md](../01-problem-solving/01-arrays/easy.md) — 120 words
- [01-problem-solving/01-arrays/hard.md](../01-problem-solving/01-arrays/hard.md) — 88 words
- [01-problem-solving/01-arrays/medium.md](../01-problem-solving/01-arrays/medium.md) — 131 words
- [01-problem-solving/02-strings/easy.md](../01-problem-solving/02-strings/easy.md) — 108 words
- [01-problem-solving/02-strings/hard.md](../01-problem-solving/02-strings/hard.md) — 66 words
- [01-problem-solving/02-strings/medium.md](../01-problem-solving/02-strings/medium.md) — 117 words
- [01-problem-solving/03-hashing/easy.md](../01-problem-solving/03-hashing/easy.md) — 104 words
- [01-problem-solving/03-hashing/hard.md](../01-problem-solving/03-hashing/hard.md) — 72 words
- [01-problem-solving/03-hashing/medium.md](../01-problem-solving/03-hashing/medium.md) — 134 words
- [01-problem-solving/04-two-pointers-sliding-window/easy.md](../01-problem-solving/04-two-pointers-sliding-window/easy.md) — 61 words
- [01-problem-solving/04-two-pointers-sliding-window/hard.md](../01-problem-solving/04-two-pointers-sliding-window/hard.md) — 76 words
- [01-problem-solving/05-stack-queue/easy.md](../01-problem-solving/05-stack-queue/easy.md) — 109 words
- [01-problem-solving/05-stack-queue/hard.md](../01-problem-solving/05-stack-queue/hard.md) — 34 words
- [01-problem-solving/05-stack-queue/medium.md](../01-problem-solving/05-stack-queue/medium.md) — 101 words
- [01-problem-solving/06-linked-list/easy.md](../01-problem-solving/06-linked-list/easy.md) — 135 words
- [01-problem-solving/06-linked-list/hard.md](../01-problem-solving/06-linked-list/hard.md) — 76 words
- [01-problem-solving/06-linked-list/medium.md](../01-problem-solving/06-linked-list/medium.md) — 108 words
- [01-problem-solving/07-recursion-backtracking/easy.md](../01-problem-solving/07-recursion-backtracking/easy.md) — 85 words
- [01-problem-solving/07-recursion-backtracking/hard.md](../01-problem-solving/07-recursion-backtracking/hard.md) — 33 words
- [01-problem-solving/07-recursion-backtracking/medium.md](../01-problem-solving/07-recursion-backtracking/medium.md) — 117 words
- [01-problem-solving/08-sorting-searching/easy.md](../01-problem-solving/08-sorting-searching/easy.md) — 71 words
- [01-problem-solving/08-sorting-searching/hard.md](../01-problem-solving/08-sorting-searching/hard.md) — 65 words
- [01-problem-solving/09-trees-bst/easy.md](../01-problem-solving/09-trees-bst/easy.md) — 98 words
- [01-problem-solving/09-trees-bst/hard.md](../01-problem-solving/09-trees-bst/hard.md) — 67 words
- [01-problem-solving/09-trees-bst/medium.md](../01-problem-solving/09-trees-bst/medium.md) — 146 words
- [01-problem-solving/10-graphs-bfs-dfs/easy.md](../01-problem-solving/10-graphs-bfs-dfs/easy.md) — 54 words
- [01-problem-solving/10-graphs-bfs-dfs/hard.md](../01-problem-solving/10-graphs-bfs-dfs/hard.md) — 36 words
- [01-problem-solving/11-greedy/easy.md](../01-problem-solving/11-greedy/easy.md) — 84 words
- [01-problem-solving/11-greedy/hard.md](../01-problem-solving/11-greedy/hard.md) — 50 words
- [01-problem-solving/11-greedy/medium.md](../01-problem-solving/11-greedy/medium.md) — 139 words
- [01-problem-solving/12-dp/easy.md](../01-problem-solving/12-dp/easy.md) — 72 words
- [01-problem-solving/12-dp/hard.md](../01-problem-solving/12-dp/hard.md) — 36 words
- [01-problem-solving/13-math-bit-manipulation/hard.md](../01-problem-solving/13-math-bit-manipulation/hard.md) — 54 words
- [01-problem-solving/13-math-bit-manipulation/medium.md](../01-problem-solving/13-math-bit-manipulation/medium.md) — 46 words
- [01-problem-solving/14-sql/easy.md](../01-problem-solving/14-sql/easy.md) — 98 words
- [01-problem-solving/14-sql/hard.md](../01-problem-solving/14-sql/hard.md) — 61 words
- [01-problem-solving/14-sql/medium.md](../01-problem-solving/14-sql/medium.md) — 100 words
- [11-mocks/mock-03-fullstack.md](../11-mocks/mock-03-fullstack.md) — 139 words
- [11-mocks/mock-05-rapid-fire.md](../11-mocks/mock-05-rapid-fire.md) — 120 words
- [12-career/applications.md](../12-career/applications.md) — 37 words
- [12-career/templates/FOLDER_STRUCTURE.md](../12-career/templates/FOLDER_STRUCTURE.md) — 107 words
