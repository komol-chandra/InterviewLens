# ফোল্ডার স্ট্রাকচার — Software Engineer Interview Prep System

```
interview-prep-system/
├── README.md                          ← প্রজেক্টের নিয়ম ও Answer Pattern (Claude Code এটা পড়ে বুঝবে)
├── TODO.md                            ← ১১টা টপিকের চেকলিস্ট + প্রোগ্রেস ট্র্যাকার
│
└── topics/
    ├── 01-oop-design-pattern.md       ← OOP ও Design Pattern, SOLID (১০টা প্রশ্ন)
    ├── 02-problem-solving.md          ← Problem Solving (টপ ৫টা, কোড + ব্যাখ্যা সহ)
    ├── 03-laravel-backend.md          ← Laravel ও Backend Infrastructure (১০টা প্রশ্ন)
    ├── 04-aws-server-tools.md         ← AWS ও Server Tools (১০টা প্রশ্ন)
    ├── 05-relational-database.md      ← Relational Database (১০টা প্রশ্ন)
    ├── 06-system-design-bd.md         ← System Design — বাংলাদেশ মার্কেট কনটেক্সট (টপ ৫টা)
    ├── 07-kafka-redis-rabbitmq.md     ← Kafka, Redis, RabbitMQ (১০টা প্রশ্ন)
    ├── 08-react-js.md                 ← React JS (১০টা প্রশ্ন)
    ├── 09-nodejs.md                   ← Node.js (১০টা প্রশ্ন)
    ├── 10-python.md                   ← Python (১০টা প্রশ্ন)
    └── 11-hr-questions.md             ← HR প্রশ্ন প্রস্তুতি
```

## নামকরণের নিয়ম
- প্রতিটা ফাইল নম্বর দিয়ে শুরু (01, 02, ...) — অগ্রাধিকার/অর্ডার বোঝার জন্য
- ফাইলগুলো এখন খালি থাকবে; Claude Code দিয়ে যখন যে টপিক পড়তে চাও, তখন সেই ফাইলের কনটেন্ট জেনারেট করবে
- `README.md`-এর "Answer Pattern" অংশটাই Claude Code-এর জন্য একমাত্র নিয়ম — প্রতিবার নতুন করে ফরম্যাট বলার দরকার নেই

## ভবিষ্যতে নতুন জব প্রেপের জন্য পুনরায় ব্যবহার
- নতুন কোনো ইন্টারভিউর আগে শুধু `topics/` ফোল্ডারে প্রাসঙ্গিক টপিকগুলোর জন্য নতুন ফাইল যোগ করো (যেমন `12-graphql.md`) — বাকি স্ট্রাকচার ও README অপরিবর্তিত থাকবে
- `TODO.md`-এ প্রতিটা নতুন ইন্টারভিউর জন্য একটা নতুন "Round" সেকশন যোগ করে আগেরটা history হিসেবে রেখে দিতে পারো
