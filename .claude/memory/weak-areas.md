---
type: gap
updated: 2026-11-14
---

# Weak Areas — Self-Rating (০–৩)

**০** = জানি না · **১** = নাম জানি, ব্যাখ্যা পারি না · **২** = ব্যাখ্যা পারি, গভীর প্রশ্নে আটকাই · **৩** = deep-dive ডিফেন্ড / লাইভ কোড করতে পারি

**নিয়ম:**
- প্রতিটা স্টাডি সেশন বা মকের পর `Now` আপডেট করো, পুরনো মান `History`-তে সরাও (`১১-১৪:১ → ১১-২০:২`)।
- `Guess` = Claude-এর অনুমান (প্রোফাইল আর আগের স্ক্যান থেকে)। **প্রথম `/study-start`-এ নিজের রেটিং দিয়ে `Now` ভরো।**
- `/study-start` সবচেয়ে কম `Now` (আর 🔴 প্রায়োরিটি) থেকে দিনের ব্লক বাছে। `DASHBOARD.md`-এর heat table এখান থেকে তৈরি হয়।
- প্রায়োরিটি: 🔴 এখনই (Starter) · 🟠 Starter-এর পরে · 🟡 Product টিয়ার

## ১. Problem Solving + CS Fundamentals

| টপিক | প্রায়োরিটি | Guess | Now | History | ফোল্ডার |
|------|------------|-------|-----|---------|---------|
| লাইভ কোডিং (clarify → brute → optimize → code → test), freeze না করা | 🔴 | ১ | | | 01-problem-solving |
| Arrays, strings, hashing | 🔴 | ২ | | | 01-problem-solving |
| Two pointers / sliding window | 🔴 | ১ | | | 01-problem-solving |
| Stack, queue, monotonic stack | 🔴 | ১ | | | 01-problem-solving |
| Binary search (+ on answer) | 🔴 | ১ | | | 01-problem-solving |
| Linked list | 🔴 | ১ | | | 01-problem-solving |
| Trees, BST, traversal | 🔴 | ১ | | | 01-problem-solving |
| Heap / priority queue, intervals, prefix sum | 🔴 | ১ | | | 01-problem-solving |
| Graphs (BFS/DFS, topo sort, union-find) | 🔴 | ০ | | | 01-problem-solving |
| Recursion, backtracking | 🔴 | ১ | | | 01-problem-solving |
| Dynamic programming | 🔴 | ০ | | | 01-problem-solving |
| Big-O / complexity | 🔴 | ২ | | | 02-cs-fundamentals-mcq |
| OS (process, thread, scheduling, memory, deadlock) | 🔴 | ১ | | | 02-cs-fundamentals-mcq |
| Networking (TCP/IP, HTTP, DNS, TLS) | 🔴 | ২ | | | 02-cs-fundamentals-mcq |
| DBMS theory (normalization, ACID, isolation, index) | 🔴 | ২ | | | 02-cs-fundamentals-mcq |
| OOP + SOLID | 🔴 | ২ | | | 02-cs-fundamentals-mcq |
| Code-output MCQ (PHP / JS / Python traps) | 🔴 | ১ | | | 02-cs-fundamentals-mcq |
| Aptitude + logic (সময় মেপে) | 🔴 | ১ | | | 02-cs-fundamentals-mcq |

## ২. System Design + LLD

| টপিক | প্রায়োরিটি | Guess | Now | History | ফোল্ডার |
|------|------------|-------|-----|---------|---------|
| SD framework মুখে বলা (৩৫–৪৫ মিনিট, ইংরেজিতে) | 🔴 | ১ | | | 03-system-design |
| Back-of-envelope estimation | 🔴 | ১ | | | 03-system-design |
| Caching (strategy, invalidation, stampede) | 🔴 | ২ | | | 03-system-design |
| DB scaling (replica, sharding, partitioning) | 🔴 | ১ | | | 03-system-design |
| API design + rate limiting | 🔴 | ২ | | | 03-system-design |
| Consistent hashing, ID generation | 🔴 | ১ | | | 03-system-design |
| Message queues + event-driven (outbox, saga, idempotency) | 🔴 | ১ | | | 05-backend |
| Design patterns (GoF) | 🟠 | ২ | | | 04-design-patterns-lld |
| LLD / machine coding (৪৫ মিনিট) | 🟠 | ১ | | | 04-design-patterns-lld |
| Staff-level SD (multi-region, migration, cost) | 🟡 | ০ | | | 03-system-design |

## ৩. Backend + Data

| টপিক | প্রায়োরিটি | Guess | Now | History | ফোল্ডার |
|------|------------|-------|-----|---------|---------|
| PHP / Laravel internals (container, queue, Eloquent) | 🔴 | ৩ | | | 05-backend |
| MySQL advanced (EXPLAIN, index, locking, isolation) | 🔴 | ২ | | | 05-backend |
| Redis | 🟠 | ২ | | | 05-backend |
| MongoDB (aggregation, index) | 🟠 | ২ | | | 05-backend |
| Kafka (concepts, consumer group, ordering) | 🟠 | ১ | | | 05-backend |
| Node.js core (event loop, streams) + NestJS | 🟠 | ১ | | | 05-backend |
| Python + FastAPI (async, Pydantic) | 🟠 | ২ | | | 05-backend |
| Django + DRF, Celery | 🟡 | ০ | | | 05-backend |
| Testing (unit, feature, TDD) | 🟠 | ২ | | | 05-backend |

## ৪. Cloud + DevOps

| টপিক | প্রায়োরিটি | Guess | Now | History | ফোল্ডার |
|------|------------|-------|-----|---------|---------|
| Cloud basics + AWS global infra | 🔴 | ০ | | | 06-aws-devops |
| IAM | 🔴 | ০ | | | 06-aws-devops |
| VPC + networking | 🔴 | ০ | | | 06-aws-devops |
| EC2, ALB, Auto Scaling | 🔴 | ১ | | | 06-aws-devops |
| S3, EBS, CloudFront | 🔴 | ১ | | | 06-aws-devops |
| RDS + replicas | 🔴 | ১ | | | 06-aws-devops |
| SQS / SNS / EventBridge / MSK | 🟠 | ০ | | | 06-aws-devops |
| Docker | 🟠 | ২ | | | 06-aws-devops |
| Kubernetes | 🟡 | ১ | | | 06-aws-devops |
| CI/CD + Terraform | 🟡 | ১ | | | 06-aws-devops |
| Observability (logs, metrics, traces, SLO) | 🟠 | ২ | | | 06-aws-devops |
| Linux + Git | 🟠 | ২ | | | 06-aws-devops |

## ৫. AI Engineering

| টপিক | প্রায়োরিটি | Guess | Now | History | ফোল্ডার |
|------|------------|-------|-----|---------|---------|
| LLM API, prompting, tool use | 🟠 | ২ | | | 07-ai-engineering |
| Embeddings, vector DB, RAG | 🟠 | ১ | | | 07-ai-engineering |
| Agents, MCP, evals, guardrails | 🟡 | ১ | | | 07-ai-engineering |
| ML foundations (math, scikit-learn, neural nets) | 🟡 | ০ | | | 07-ai-engineering |
| PyTorch, transformers, fine-tuning (LoRA) | 🟡 | ০ | | | 07-ai-engineering |

## ৬. Frontend

| টপিক | প্রায়োরিটি | Guess | Now | History | ফোল্ডার |
|------|------------|-------|-----|---------|---------|
| JavaScript / ES6 core | 🟠 | ২ | | | 08-frontend-nextjs |
| TypeScript | 🟠 | ২ | | | 08-frontend-nextjs |
| React + hooks + Redux Toolkit | 🟠 | ৩ | | | 08-frontend-nextjs |
| Next.js (App Router, RSC, SSR/ISR) | 🟡 | ০ | | | 08-frontend-nextjs |

## ৭. Behavioral + Career

| টপিক | প্রায়োরিটি | Guess | Now | History | ফোল্ডার |
|------|------------|-------|-----|---------|---------|
| STAR স্টোরি ইংরেজিতে বলা | 🔴 | ১ | | | 10-behavioral-leadership |
| রোল-অনুযায়ী pitch (Laravel / Node / Python / AI) | 🔴 | ১ | | | 10-behavioral-leadership |
| Leadership: design doc, prioritization, mentoring | 🟡 | ১ | | | 10-behavioral-leadership |

## মক / ইন্টারভিউ থেকে পাওয়া নির্দিষ্ট দুর্বলতা

প্রতিটা মক আর রাউন্ডের পর এখানে যোগ করো।

| তারিখ | কোথা থেকে | কোন প্রশ্নে আটকেছি | ফিক্স অ্যাকশন | বন্ধ? |
|-------|-----------|--------------------|---------------|-------|
| ২০২৬-১০-১৪ | কোড স্ক্যান | CV-র RabbitMQ দাবি, কোডে নেই | CV লাইন ঠিক করো বা সরাও | ⬜ |
| ২০২৬-১০-১৪ | কোড স্ক্যান | Node/Express দাবি, DistroSaaS-এ নেই | পোর্টফোলিও Node প্রজেক্ট বানাও (Product টিয়ার) | ⬜ |
| ২০২৬-১০-১৪ | কোড স্ক্যান | CV-র সংখ্যার (%, latency) কোনো মাপার পদ্ধতি লেখা নেই | প্রতিটা সংখ্যার জন্য একটা "receipt card" | ⬜ |
| ২০২৬-১১-১৪ | নিজের মূল্যায়ন | লাইভ কোডিং-এ freeze, MCQ-তে দুর্বল | Starter ①: দৈনিক ২–৩ প্রবলেম PHP-তে + ২০টা সময়-মাপা MCQ | ⬜ |
