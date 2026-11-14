---
title: "InterviewLens"
order: 0
status: draft
tags: [hub]
updated: 2026-11-14
---

# InterviewLens

Software Engineer ইন্টারভিউ প্রস্তুতির রিপো: Laravel / Node / Python / AI রোল, ২–৩ বছরে Senior/Lead। পুরো পরিকল্পনা [`MASTER-PLAN.md`](MASTER-PLAN.md)-এ, কাজের নিয়ম [`CLAUDE.md`](CLAUDE.md)-এ।

**প্রতিদিন:** `/study-start` → পড়া/প্র্যাকটিস → `/study-end`। রোডম্যাপ: [`00-start/roadmap.md`](00-start/roadmap.md) · অগ্রগতি: [`DASHBOARD.md`](DASHBOARD.md) · কনটেন্ট-হেলথ: [`00-start/health-report.md`](00-start/health-report.md) (`python3 scripts/health.py`)।

**অ্যাপে পড়া ও ট্র্যাকিং:** MyLens → InterviewLens ট্যাব। ফোল্ডার থেকে Supabase-এ কপি হয় `lens sync` দিয়ে (MyLens রিপোর `scripts/lens/`)। এই ফোল্ডারই source of truth; অ্যাপ শুধু পড়ে, আর স্টাডি স্টেট (status, conf, রিভিশন) অ্যাপে থাকে।

## ফোল্ডার

| ফোল্ডার | বিষয় | md ফাইল |
|---|---|---|
| [00-start/](00-start/README.md) | শুরু | 3 |
| [01-problem-solving/](01-problem-solving/README.md) | Problem Solving | 61 |
| [02-cs-fundamentals-mcq/](02-cs-fundamentals-mcq/README.md) | CS Fundamentals MCQ | 1 |
| [03-system-design/](03-system-design/README.md) | System Design | 20 |
| [04-design-patterns-lld/](04-design-patterns-lld/README.md) | Design Patterns & LLD | 18 |
| [05-backend/](05-backend/README.md) | Backend | 46 |
| [06-aws-devops/](06-aws-devops/README.md) | AWS & DevOps | 3 |
| [07-ai-engineering/](07-ai-engineering/README.md) | AI Engineering | 0 |
| [08-frontend-nextjs/](08-frontend-nextjs/README.md) | Frontend & Next.js | 7 |
| [09-real-world-cases/](09-real-world-cases/README.md) | Real-World Cases | 0 |
| [10-behavioral-leadership/](10-behavioral-leadership/README.md) | Behavioral & Leadership | 4 |
| [11-mocks/](11-mocks/README.md) | Mocks | 7 |
| [12-career/](12-career/README.md) | Career | 4 |
| [99-archive/](99-archive/README.md) | Archive (শুধু পড়া) | 47 |

## নিয়ম (সংক্ষেপে)

- ফোল্ডার = বিষয়; প্রতিটা ফোল্ডারে `README.md`। বাইনারি (pdf/docx/ছবি) `assets/`-এ।
- প্রতিটা স্টাডি ফাইলে frontmatter: `id, title, track, type, status, conf, tier, tags, updated` ([CLAUDE.md → Frontmatter Spec](CLAUDE.md))। `id` বদলাবে না: অ্যাপের progress এতে বাঁধা।
- Public-safe (D7): `.claude/` আর `99-archive/`-এর বাইরে "DistroSaaS", আসল কোম্পানির নাম না।
- পুরনো কোম্পানি-ভিত্তিক প্রস্তুতি আর git-ইতিহাস থেকে ফেরত আনা ফাইল: [`99-archive/`](99-archive/)।
