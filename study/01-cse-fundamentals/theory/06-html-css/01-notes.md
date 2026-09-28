> Tracker ID: FN-09 · Generated: 2026-09-28 · Source: backend-system-design-study-plan.md (Phase reference) + generic front-end fundamentals

# HTML / CSS / SASS — Notes

> এই নোট জেনেরিক (যেকোনো কোম্পানির ইন্টারভিউতে কাজে লাগবে), তাই `01-cse-fundamentals/`-এ থাকছে — কোম্পানি-স্পেসিফিক কিছু নেই।

## ১. Semantic HTML

- Semantic ট্যাগের নামই তার কনটেন্টের অর্থ বহন করে: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`। সবজায়গায় `<div>` দিলে কাজ চলে, কিন্তু accessibility (screen reader) আর SEO ভেঙে যায়।
- `<article>` vs `<section>`: `<article>` স্বয়ংসম্পূর্ণ, আলাদা করে সরানো যায় (যেমন একটা ব্লগ পোস্ট)। `<section>` পেজের থিম্যাটিক ভাগ, একা দাঁড়াতে হবে না।
- Form accessibility: প্রতিটা `<input>`-এর সাথে `<label for="id">` জোড়া লাগানো, ভিজ্যুয়াল কিউ যথেষ্ট না হলে `aria-*` attribute।

**সম্ভাব্য প্রশ্ন:** "কেন `<div>` দিয়ে সব বানানো খারাপ প্র্যাকটিস?"
🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "আমি React কম্পোনেন্ট লেখার সময় semantic HTML মেনে চলি, বিশেষ করে ফর্ম আর ন্যাভিগেশনে, কারণ accessibility আর Lighthouse স্কোর দুটোই এতে ভালো থাকে।"

## ২. Flexbox vs Grid

| | Flexbox | Grid |
|---|---|---|
| Dimension | ১-ডাইমেনশনাল (row অথবা column) | ২-ডাইমেনশনাল (row + column একসাথে) |
| ব্যবহার | Nav bar, button group, card-এর ভেতরের alignment | পুরো পেজ লেআউট, dashboard grid, card গ্রিড |
| মূল প্রপার্টি | `justify-content`, `align-items`, `flex-grow/shrink/basis` | `grid-template-columns/rows`, `gap`, `grid-area` |

**নিয়ম:** ছোট, এক-দিকে সাজানো কম্পোনেন্ট হলে Flexbox। পুরো লেআউট বা ২-ডাইমেনশনাল বিন্যাস হলে Grid। দুটো একসাথেও চলে — Grid দিয়ে বড় লেআউট, ভেতরে Flexbox দিয়ে ছোট অংশ।

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "Sokrio-র React/Bootstrap UI-তে গ্রিড লেআউট আর ভেতরের কম্পোনেন্ট alignment-এ Flexbox — দুটোই ব্যবহার করেছি (S6)।"

## ৩. CSS Specificity

Specificity ক্যালকুলেট হয় এই ক্রমে: inline style (1,0,0,0) > ID (0,1,0,0) > class/attribute/pseudo-class (0,0,1,0) > element/pseudo-element (0,0,0,1)। সমান specificity হলে যেটা পরে লেখা হয়েছে সেটা জেতে। `!important` সব ছাড়িয়ে যায় — এড়িয়ে চলা ভালো, debug করা কঠিন হয়ে যায়।

**উদাহরণ:** `#nav .item.active` (0,1,2,0) বনাম `.item` (0,0,1,0) → প্রথমটা জেতে।

## ৪. BEM Naming

`Block__Element--Modifier` — যেমন `card__title--highlighted`। উদ্দেশ্য: বড় কোডবেসে class collision এড়ানো, নাম দেখেই বোঝা যাওয়া কোনটা কার অংশ। React-এ CSS Modules/styled-components থাকলে BEM-এর দরকার কমে, কিন্তু plain SASS/CSS-এ এখনও প্রাসঙ্গিক।

## ৫. SASS — Mixin, Nesting, Variable

```scss
$primary-color: #1a73e8;

@mixin flex-center($direction: row) {
  display: flex;
  flex-direction: $direction;
  align-items: center;
  justify-content: center;
}

.card {
  &__title {
    color: $primary-color;
  }
  &--highlighted {
    @include flex-center;
  }
}
```

- Nesting ৩ লেভেলের বেশি গভীর করলে generated CSS ভারী হয় আর specificity যুদ্ধ শুরু হয় — নিয়ম: ৩ লেভেলের বেশি না।
- আধুনিক `@use`/`@forward` বনাম পুরনো `@import` (deprecated) — নতুন প্রজেক্টে `@use` ব্যবহার করা উচিত।

🔗 Sokrio link: S6 — Vue থেকে React/Next.js/TypeScript রিরাইটে SASS ব্যবহার হয়েছে। মিক্সিন/ভ্যারিয়েবল স্ট্রাকচার ঠিক কীভাবে সাজানো হয়েছিল তার ডিটেইল `[Komol পূরণ করবে]`।
