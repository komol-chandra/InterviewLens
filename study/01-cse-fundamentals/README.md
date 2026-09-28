# 01-cse-fundamentals — CS Global Study Dir

এটা **শেয়ারড, রিইউজেবল CS স্টাডি এরিয়া** — সব কোম্পানির প্রেপে কমন। কোনো কোম্পানি-স্পেসিফিক কনটেন্ট এখানে থাকবে না (সেগুলো `../../02-companies/<company>/`-এ থাকে)। স্ট্রাকচারটা মূলত হাতে লেখা প্ল্যান থেকে এসেছে (`handwritten-notes/note-5.jpeg`, `note-6.jpeg`): **theory/** আর **practical/** — দুইটা আলাদা পার্ট, একই "এক টপিক = এক ফোল্ডার, ফোল্ডারে ১-৩টা ফাইল" শেপ মেনে।

```
01-cse-fundamentals/
├── README.md                  ← এই ফাইল
├── 00-master-cheatsheet.md    ← সব টপিকের ওয়ান-পেজ ক্র্যাম, exam/test-day morning-এ পড়ার জন্য
├── mcq-bank.md                ← ১০০টা মিক্সড self-test MCQ + answer key, cross-topic
├── VISUAL-PLAN.md             ← ভিজ্যুয়াল ডায়াগ্রাম প্ল্যানিং নোট
├── handwritten-notes/         ← আসল হাতে-লেখা প্ল্যানিং নোটবুকের ছবি (এই পুরো স্ট্রাকচারের অরিজিন)
├── theory/                    ← কনসেপ্ট নোটস — ১৫টা টপিক, নম্বর দিয়ে অর্ডার করা
└── practical/                 ← DSA প্র্যাকটিস — প্যাটার্ন-ভিত্তিক, easy/medium/hard গ্রেডেড
```

## `theory/` — ১৫টা টপিক

প্রতিটা `theory/NN-topic-name/` ফোল্ডারে যতগুলো সোর্স আছে ততগুলো ফাইল থাকে — `01-notes.md` (মেইন নোট), `02-cheatsheet.md` (কুইক রিভিশন), `03-deep-dive.md` (বাংলা-ইংরেজি মিশ্র, ২০টা প্রশ্নের গভীর আলোচনা)। যেসব টপিকে সোর্স কম, সেখানে কম ফাইল থাকবে — জোর করে ৩টা বানানো হয়নি।

| # | টপিক | ফাইল |
|---|------|------|
| 01 | OOP & Design Pattern | notes + cheatsheet + deep-dive |
| 02 | Relational Database / SQL | notes + cheatsheet + deep-dive |
| 03 | Networking & Subnetting | cheatsheet + deep-dive |
| 04 | OS, Web & API | cheatsheet + deep-dive |
| 05 | SDLC, Security & Aptitude | cheatsheet + deep-dive |
| 06 | HTML/CSS | *(খালি — এখনো লেখা হয়নি, দেখো `06-html-css/README.md`)* |
| 07 | System Design (BD context) | notes |
| 08 | Kafka / Redis / RabbitMQ | notes |
| 09 | Laravel Backend | notes |
| 10 | AWS & Server Tools | notes |
| 11 | React.js | notes |
| 12 | Node.js | notes |
| 13 | Python | notes |
| 14 | HR Questions | notes |
| 15 | Questions to Ask (interviewer-কে) | notes |

## `practical/` — DSA প্যাটার্ন + ডিফিকাল্টি

`00-fundamentals/` — DSA-র জেনারেল ইন্ট্রো (overview, arrays/strings/stack/queue/linked-list বেসিক, trees/hashing/recursion/Big-O + দুটোরই deep-dive কম্প্যানিয়ন)।

তারপর ১৪টা প্যাটার্ন-ফোল্ডার (`01-arrays/` … `14-sql/`), প্রতিটাতে:
- `00-pattern-overview.md` — প্যাটার্ন এক্সপ্লেনেশন, ডায়াগ্রাম, রিইউজেবল টেমপ্লেট, Big-O চিট টেবিল, কমন ট্র্যাপস (এগুলো ডিফিকাল্টি-নিরপেক্ষ, তাই শেয়ার্ড একটা ফাইলে)
- `easy.md`, `medium.md`, `hard.md` — প্রবলেমগুলো ডিফিকাল্টি অনুযায়ী ভাগ করা, যেখানে ⭐ মার্ক থাকলে সেটা মানে ওই প্রবলেমটা আসল WellDev ইন্টারভিউতে জিজ্ঞেস করা হয়েছিল (রেফারেন্স হিসেবে রাখা, কোম্পানি-নির্দিষ্ট নয় — জেনেরিক প্রবলেম, শুধু ট্যাগ)

01 Arrays · 02 Strings · 03 Hashing · 04 Two Pointers/Sliding Window · 05 Stack/Queue · 06 Linked List · 07 Recursion/Backtracking · 08 Sorting/Searching · 09 Trees/BST · 10 Graphs (BFS/DFS) · 11 Greedy · 12 DP · 13 Math/Bit Manipulation · 14 SQL

## নামকরণের নিয়ম

- `theory/` আর `practical/` দুটোরই ভেতরের ফোল্ডার নম্বর দিয়ে অর্ডার করা (`01-`, `02-`, …)
- প্রতিটা টপিক/প্যাটার্ন-ফোল্ডারের ভেতরের ফাইলও নম্বর দিয়ে অর্ডার করা, যেখানে একাধিক ফাইল আছে
- নতুন টপিক/প্যাটার্ন যোগ করতে হলে পরের নম্বর দিয়ে নতুন সাবফোল্ডার বানাও — বিদ্যমান নম্বর কখনো রিইউজ/শিফট করবে না
