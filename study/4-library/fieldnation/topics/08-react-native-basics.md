> Tracker ID: FN-10 · Generated: 2026-09-28 · Source: backend-system-design-study-plan.md + generic RN knowledge (কোনো সরাসরি Sokrio RN অভিজ্ঞতা story-bank-এ নেই)

# React Native — Basics (delta vs Web React)

> সৎ নোট: story-bank-এ RN-স্পেসিফিক কোনো স্টোরি নেই। S9 (field-force GPS মডিউল) সম্ভবত মোবাইল অ্যাপ হিসেবে ব্যবহৃত হতো, কিন্তু Komol নিজে RN লেয়ারে হাত দিয়েছিলেন কিনা অজানা। `[Komol পূরণ করবে: field-force অ্যাপ কি React Native/Flutter/native ছিল, তুমি কি সেই কোডে কাজ করেছিলে?]`

## ১. RN বনাম Web React — মূল পার্থক্য কী?

DOM নেই — `<div>`/`<span>`-এর বদলে `<View>`/`<Text>`; CSS ফাইল নেই, স্টাইল `StyleSheet.create()`-এ (JS অবজেক্ট, Flexbox ডিফল্ট layout)। Rendering ইঞ্জিন আলাদা: web-এ browser DOM, RN-এ native UI component (bridge/JSI দিয়ে JS↔native কমিউনিকেশন)। Navigation ব্রাউজার URL-ভিত্তিক না, স্ট্যাক-ভিত্তিক (React Navigation)।

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "আমার হাতে-কলমে RN কাজ নেই, কিন্তু আমাদের field-force মোবাইল অ্যাপের GPS check-in/check-out ফিচারের ব্যাকএন্ড ও ডেটা মডেল আমি ডিজাইন করেছি (S9), তাই মোবাইল-ব্যাকএন্ড কনট্র্যাক্ট আর অফলাইন sync-এর সমস্যাগুলো আমার পরিচিত।"

## ২. React Navigation বেসিক

Stack Navigator (push/pop, ব্রাউজার হিস্ট্রির মতো), Tab Navigator (bottom tabs), Drawer Navigator। Deep linking, params passing between screens।

## ৩. FlatList বনাম ScrollView

`ScrollView` পুরো কনটেন্ট একসাথে রেন্ডার করে — ছোট, ফিক্সড লিস্টে ঠিক আছে। `FlatList` virtualized — শুধু ভিউপোর্টে যা দেখা যাচ্ছে (+buffer) তাই রেন্ডার করে, বড় লিস্টে (যেমন শত শত work order) পারফরম্যান্সের জন্য জরুরি। `keyExtractor`, ফিক্সড হাইট হলে `getItemLayout` পারফরম্যান্স আরও বাড়ায়।

## ৪. Offline Handling

`AsyncStorage` (key-value, সাধারণ cache/queue) বা SQLite/WatermelonDB (structured, বড় ডেটাসেট)। প্যাটার্ন: local queue-এ একশন জমা রাখা (যেমন একটা check-in ইভেন্ট) → নেটওয়ার্ক ফিরলে sync → conflict resolution (last-write-wins বা server-side merge)।

🔗 Sokrio link: S9-এর GPS check-in ফিচারে ফিল্ড টেকনিশিয়ানরা প্রায়ই দুর্বল নেটওয়ার্কে থাকেন — অফলাইন queue + sync ডিজাইন থাকার সম্ভাবনা বেশি, কিন্তু নির্দিষ্ট ইমপ্লিমেন্টেশন ডিটেইল `[Komol পূরণ করবে]`।

## ৫. Native Module — উচ্চ স্তরে কী

জাভাস্ক্রিপ্ট থেকে platform-specific native কোড (Java/Kotlin, Swift/Obj-C) কল করার ব্রিজ — যেমন camera, GPS, push notification। নতুন আর্কিটেকচারে (JSI/TurboModules/Fabric) bridge সিরিয়ালাইজেশন ছাড়াই সরাসরি কল হয়, পুরনোটার চেয়ে দ্রুত।

## ৬. GPS-Spoofing ধরার প্রসঙ্গে RN

Mock location detection RN-এ platform API-র ওপর নির্ভর করে (Android-এ mock-provider সিগন্যাল); বাকি ভেরিফিকেশন (speed/distance jump ইত্যাদি) সাধারণত ব্যাকএন্ডে হয়, যা S9-এর মূল অংশ।

🔗 Sokrio link: S9 — spoofing ধরার নির্দিষ্ট মেথড (mock-location flag, speed/distance jump) `[Komol পূরণ করবে]` (story-bank-এই এই গ্যাপ চিহ্নিত আছে)।

## ৭. সৎ সারাংশ যদি ইন্টারভিউয়ার সরাসরি জিজ্ঞেস করে "RN experience?"

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "React Native-এ হাতে-কলমে বিল্ড করিনি, কিন্তু React-এর mental model (component, hooks, state management) একই, আর মোবাইল-ব্যাকএন্ড ইন্টিগ্রেশনের (GPS, offline sync, push) দিকটা S9-এর মাধ্যমে ভালো বুঝি। শেখার কার্ভ কম হবে।"
