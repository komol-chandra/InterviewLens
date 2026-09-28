# Doc Tracker — জেনারেটেড ডকের রেজিস্টার

প্রতিটা ডক (Claude-এর বানানো হোক বা তোমার) এখানে একটা সারি পায়। সব path `study/` থেকে relative, যদি না সেকশনে অন্য বেস বলা থাকে। নতুন ডক বানানোর **আগে** এখানে দেখো, ডুপ্লিকেট এড়াতে।

## Status লেজেন্ড

| Status | মানে | পরের ধাপ |
|--------|------|----------|
| ⬜ planned | ID দেওয়া আছে, ফাইল এখনো নেই | প্ল্যানের দিনে জেনারেট করো |
| 🟡 generated | ফাইল আছে, এখনো পড়া হয়নি | পড়ো + নিজের নোট যোগ করো |
| 🔵 studied | একবার পড়া/প্র্যাকটিস হয়েছে | ২–৩ দিন পর রিভিশন |
| ✅ mastered | জোরে বলতে/কোড করতে পারি, confidence ৩ | শুধু Day 14-এ চোখ বুলাও |
| 🔁 revise | আগে পড়েছি কিন্তু মক/ইন্টারভিউতে আটকেছি | `weak-areas.md` দেখো |

**Conf** = self-rating ০–৩ (`_memory/weak-areas.md`-এর সাথে মিল রাখো)। **Studied** = শেষ কবে পড়েছ।

---

## A. Field Nation SE — প্ল্যানের ডক

Path বেস: `03-roles/fieldnation-software-engineer/`

| ID | ডক | Path | Type | Day | Status | Generated | Studied | Conf |
|----|----|------|------|-----|--------|-----------|---------|------|
| FN-01 | Work-order ডোমেইন + lifecycle | `01-domain/01-work-order-domain.md` | notes | 1 | 🟡 | 2026-09-28 | | |
| FN-02 | JavaScript / ES6 (১০ Q) | `02-topics/01-javascript-es6.md` | qa | 2 | 🟡 | 2026-09-28 | | |
| FN-03 | TypeScript (১০ Q) | `02-topics/02-typescript.md` | qa | 3 | 🟡 | 2026-09-28 | | |
| FN-04 | Node.js + NestJS delta | `02-topics/03-nodejs-nestjs.md` | qa | 4 | 🟡 | 2026-09-28 | | |
| FN-05 | MySQL advanced | `02-topics/04-mysql-advanced.md` | qa | 5 | 🟡 | 2026-09-28 | | |
| FN-06 | REST API + webhooks + idempotency | `02-topics/05-rest-api-webhooks.md` | qa | 6 | 🟡 | 2026-09-28 | | |
| FN-07 | PHP/Laravel delta (FN প্রসঙ্গে) | `02-topics/06-php-laravel-delta.md` | qa | 6 | 🟡 | 2026-09-28 | | |
| FN-08 | React + Redux Toolkit + TS | `02-topics/07-react-redux-ts.md` | qa | 7 | 🟡 | 2026-09-28 | | |
| FN-09 | HTML / CSS / SASS *(জেনেরিক → 01-এ যায়)* | `../../01-cse-fundamentals/theory/06-html-css/01-notes.md` | notes | 8 | 🟡 | 2026-09-28 | | |
| FN-10 | React Native basics | `02-topics/08-react-native-basics.md` | qa | 8 | 🟡 | 2026-09-28 | | |
| FN-11 | Microservices + event-driven | `02-topics/09-microservices-event-driven.md` | qa | 9 | 🟡 | 2026-09-28 | | |
| FN-12 | Docker / K8s / AWS / Linux / Git | `02-topics/10-docker-k8s-aws-linux.md` | qa | 10 | 🟡 | 2026-09-28 | | |
| FN-13 | Observability — SLI/SLO/APM | `02-topics/11-observability-sli-slo.md` | qa | 11 | 🟡 | 2026-09-28 | | |
| FN-14 | Design: work-order dispatch | `03-system-design/01-work-order-dispatch.md` | design | 11 | 🟡 | 2026-09-28 | | |
| FN-15 | Design: PHP → Node migration | `03-system-design/02-php-to-node-migration.md` | design | 12 | 🟡 | 2026-09-28 | | |
| FN-16 | Pitch + "Why Field Nation" | `04-behavioral/01-pitch-why-fieldnation.md` | behavioral | 1 | 🟡 | 2026-09-28 | | |
| FN-17 | HR উত্তর (শিফট, স্যালারি, notice) | `04-behavioral/02-hr-answers.md` | behavioral | 13 | 🟡 | 2026-09-28 | | |
| FN-18 | Questions to ask them | `04-behavioral/03-questions-to-ask.md` | behavioral | 13 | 🟡 | 2026-09-28 | | |
| FN-19 | Mock 1 — technical | `05-mocks/mock-01-technical.md` | mock | 12 | 🟡 | 2026-09-28 | | |
| FN-20 | Mock 2 — full loop | `05-mocks/mock-02-full-loop.md` | mock | 13 | 🟡 | 2026-09-28 | | |
| FN-21 | Final cram sheet | `99-final-cram.md` | cheatsheet | 14 | 🟡 | 2026-09-28 | | |

---

## B. Field Nation SE — রিসার্চ (আগে থেকে আছে)

| ID | ডক | Path | Type | Status | Note |
|----|----|------|------|--------|------|
| FR-01 | Prep hub (ইন্টারঅ্যাক্টিভ HTML) | `03-roles/fieldnation-software-engineer/00-research/fieldnation-prep-hub.html` | research | 🟡 | ব্রাউজারে খোলো |
| FR-02 | Interview Desk PDF | `.../00-research/FieldNation_Interview_Desk.pdf` | research | 🟡 | |
| FR-03 | Backend + system design ৫-সপ্তাহ প্ল্যান | `.../00-research/backend-system-design-study-plan.md` | plan | 🟡 | ১৪-দিনের প্ল্যানের গভীর রেফারেন্স — প্রতিদিনের টপিক লিস্ট এখান থেকে নাও |
| FR-04 | টেইলর্ড CV (SE) | `.../00-research/Komol_CV_FieldNation_Software_Engineer.docx` | cv | ✅ | স্টোরি ব্যাংকের সোর্স |
| FR-05 | পুরনো ১৪-দিনের প্ল্যান (Senior+SE) | `../Interview Field Nation/job-post/FieldNation-Job-Prep-Plan.md` | plan | 🔵 | Senior-কেন্দ্রিক — `00-plan/01-...`-এ প্রতিস্থাপিত |

---

## C. জেনেরিক কনটেন্ট — `01-cse-fundamentals/` (আগে থেকে আছে)

| ID | টপিক | Path | ফাইল | Status | Studied | Conf |
|----|------|------|------|--------|---------|------|
| CS-01 | OOP & Design Pattern | `theory/01-oop-design-pattern/` | notes, cheatsheet, deep-dive | 🟡 | | |
| CS-02 | Relational DB / SQL | `theory/02-relational-database/` | notes, cheatsheet, deep-dive | 🟡 | | |
| CS-03 | Networking & Subnetting | `theory/03-networking-subnetting/` | cheatsheet, deep-dive | 🟡 | | |
| CS-04 | OS, Web & API | `theory/04-os-web-api/` | cheatsheet, deep-dive | 🟡 | | |
| CS-05 | SDLC, Security, Aptitude | `theory/05-sdlc-security-aptitude/` | cheatsheet, deep-dive | 🟡 | | |
| CS-06 | HTML/CSS | `theory/06-html-css/` | `01-notes.md` (FN-09 দিয়ে পূরণ, 2026-09-28) | 🟡 | | |
| CS-07 | System Design (BD) | `theory/07-system-design-bd/` | notes | 🟡 | | |
| CS-08 | Kafka / Redis / RabbitMQ | `theory/08-kafka-redis-rabbitmq/` | notes | 🟡 | | |
| CS-09 | Laravel Backend | `theory/09-laravel-backend/` | notes | 🟡 | | |
| CS-10 | AWS & Server Tools | `theory/10-aws-server-tools/` | notes | 🟡 | | |
| CS-11 | React.js | `theory/11-react-js/` | notes | 🟡 | | |
| CS-12 | Node.js | `theory/12-nodejs/` | notes | 🟡 | | |
| CS-13 | Python | `theory/13-python/` | notes | 🟡 | | |
| CS-14 | HR Questions | `theory/14-hr-questions/` | notes | 🟡 | | |
| CS-15 | Questions to Ask | `theory/15-questions-to-ask/` | notes | 🟡 | | |
| CS-P0 | DSA fundamentals | `practical/00-fundamentals/` | ৫টা ফাইল | 🟡 | | |
| CS-P1…P14 | DSA প্যাটার্ন (Arrays → SQL) | `practical/NN-*/` | overview + easy/medium/hard | 🟡 | প্রতিটার অগ্রগতি → `01-cse-fundamentals/practical/TODO.md` | |
| CS-X1 | Master cheatsheet | `00-master-cheatsheet.md` | ১ ফাইল | 🟡 | | |
| CS-X2 | MCQ bank (১০০) | `mcq-bank.md` | ১ ফাইল | 🟡 | | |
| PS-01…07 | DSA ৭-দিনের PDF সিরিজ | `../02-problem-solving/Day1…Day7` | ৭ PDF | 🟡 | | |

---

## নতুন সারি যোগ করার নিয়ম

- Field Nation ডক → `FN-22`, `FN-23`… (পরের নম্বর, কখনো রিইউজ না)
- জেনেরিক ডক → `CS-16`… · নতুন কোম্পানি → নতুন সেকশন + নতুন প্রিফিক্স (যেমন `XY-01`)
- জেনারেট হওয়ার দিনই `Generated` কলামে তারিখ বসাও, আর ফাইলের একদম উপরে `> Tracker ID: ...` লাইন দাও
