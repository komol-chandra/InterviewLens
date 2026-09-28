> Tracker ID: FN-18 · Generated: 2026-09-28 · Source: job post signals + `00-research/backend-system-design-study-plan.md`

# Questions to Ask Them — Field Nation Delta

> জেনেরিক প্রশ্নের লিস্ট `01-cse-fundamentals/theory/15-questions-to-ask/`-এ আছে। এখানে শুধু Field Nation-নির্দিষ্ট প্রশ্ন — JD-র নিজের সিগন্যাল থেকে তৈরি, যাতে ইন্টারভিউয়ার বোঝে তুমি পোস্টটা মন দিয়ে পড়েছ।

## HR রাউন্ড-এ জিজ্ঞেস করার মতো

1. "How many rounds are in the process after this, and roughly what does each one focus on?" — প্রসেস বোঝার জন্য, প্ল্যান অ্যাডজাস্ট করতে কাজে লাগবে।
2. "What does the team's day-to-day look like during the 1 PM–10 PM shift — is there real-time overlap with a US or European team, or is it mostly async handoff?" — শিফটের আসল কারণ বুঝলে "why this shift" উত্তর আরও শক্ত হবে।

## টেকনিক্যাল রাউন্ড-এ জিজ্ঘেস করার মতো

3. "The post mentions the backend is increasingly transitioning to Node.js microservices from PHP — how far along is that migration, and is it strangler-fig style (piece by piece behind a gateway) or something else?" — সরাসরি S1/FN-15 ডিজাইন ডকের সাথে কথোপকথন তৈরি করবে।
4. "How do you currently define and track your SLI/SLOs — is that formalized already, or something the team is still building out?" — JD-তে "maintenance of SLI/SLO" লেখা আছে, এটা Komol-এর সবচেয়ে শক্ত টপিক (S4), তাই এই প্রশ্ন নিজের শক্তির জায়গায় কথোপকথন নিয়ে যায়।
5. "For the work-order lifecycle, what's currently the trickiest part to keep consistent — is it the routing/matching step, the check-in/payment handoff, or something else?" — ডোমেইন-নলেজ দেখায় (FN-01), এবং আসল পেইন পয়েন্ট জানা গেলে সিস্টেম-ডিজাইন রাউন্ডে কাজে লাগবে।
6. "How is the team split between the legacy PHP core and the new Node services — same engineers working across both, or separate ownership?" — টিম স্ট্রাকচার + কোথায় Komol ফিট করবে বোঝার জন্য।

## হায়ারিং ম্যানেজার / কালচার রাউন্ড-এ জিজ্ঘেস করার মতো

7. "The post also lists React Native as a plus — is there an active mobile app for technicians, and is backend work expected to touch that at all, or is it a separate team?" — নিজের gap (RN, FN-10) সম্পর্কে সৎভাবে খোঁজ নেওয়া, লুকানোর বদলে।
8. "What does success look like for this role in the first 3 months?" — জেনেরিক কিন্তু জরুরি, ম্যানেজারের প্রত্যাশা বুঝতে সাহায্য করে।
9. "How does the team currently use AI tools like Copilot/Claude in the engineering workflow, if at all?" — Komol-এর নিজের S8 (AI-assisted engineering) স্টোরির সাথে স্বাভাবিক সেতু তৈরি করে, বলার সুযোগ দেয়।
10. "What's the biggest technical risk the team is watching right now — reliability, scale, or something else?" — সিনিয়র-লেভেল ইঙ্গিত দেয় যে তুমি শুধু কোড না, রিস্কও ভাবো।

## ব্যবহারের নিয়ম

- প্রতি রাউন্ডে ২-৩টার বেশি জিজ্ঘেস কোরো না — বেছে নাও যেটা ওই ইন্টারভিউয়ারের রোলের সাথে সবচেয়ে বেশি প্রাসঙ্গিক।
- উত্তর শোনার পর একটা ফলো-আপ মন্তব্য রেডি রাখো (যেমন প্রশ্ন ৩-এর উত্তরে migration কঠিন হলে, নিজের S1 গল্পের এক লাইন যোগ করো) — এটা প্রশ্নকে কথোপকথনে বদলে দেয়, ইন্টারভিউ-এর মতো লাগে না।

🔗 Sokrio link: প্রশ্ন ৩→S1, প্রশ্ন ৪→S4, প্রশ্ন ৯→S8, প্রশ্ন ৭→সরাসরি অভিজ্ঞতা নেই (honest gap acknowledgment)
