> Tracker ID: FN-02 · Generated: 2026-09-28 · Source: `00-research/backend-system-design-study-plan.md` Phase 2 (JS core) + `_memory/story-bank.md`

# JavaScript / ES6 — ১০ প্রশ্ন

> Post-এ "strong understanding of JavaScript, ES6" লেখা — এটা প্রায় নিশ্চিত লাইভ কোডিংসহ জিজ্ঞেস হবে।

---

## Q1. Event loop — microtask vs macrotask, `process.nextTick` কোথায় বসে?

**Order:** `process.nextTick` queue → microtask queue (`Promise.then`, `queueMicrotask`) → macrotask queue (`setTimeout`, `setImmediate`, I/O callbacks)। প্রতিটা macrotask-এর পরে **পুরো** microtask queue খালি করা হয়, তারপর পরের macrotask।

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
process.nextTick(() => console.log('4'));
console.log('5');
// আউটপুট: 1, 5, 4, 3, 2
```

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই এভাবে ফ্রেম করা — এভাবে বলো: "I reason about this the same way I reason about Laravel's queue vs immediate response — synchronous code finishes first, then microtasks (Promises) drain, then the event loop moves to the next macrotask."

---

## Q2. Closure কী, কীভাবে কাজ করে?

একটা function তার lexical scope মনে রাখে, এমনকি বাইরের function রিটার্ন হয়ে গেলেও। Counter/memoize/private-state প্যাটার্নের ভিত্তি।

```js
function makeCounter() {
  let count = 0;
  return () => ++count;
}
const counter = makeCounter();
counter(); counter(); // 2 — count বাইরে থেকে access করা যায় না
```

🔗 Sokrio link: S8 — এই ধরনের encapsulation প্যাটার্ন Node/NestJS service লেয়ারে ব্যবহার হয়, যেখানে Claude Code দিয়ে backend কাজ করি।

---

## Q3. `this` কীভাবে bind হয় — regular function vs arrow function

- **Regular function:** call-site নির্ধারণ করে (`obj.method()` → `this = obj`; standalone call → `undefined`/`globalThis`)
- **Arrow function:** নিজের `this` নেই, lexical scope থেকে inherit করে — callback-এ (যেমন `setTimeout`, array method) `this` হারানো ঠেকাতে সবচেয়ে বেশি ব্যবহৃত হয়।

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "In our React/TS codebase we default to arrow functions for exactly this reason — no `this` rebinding surprises in event handlers."

---

## Q4. Hoisting ও Temporal Dead Zone (TDZ)

`var` hoist হয় এবং `undefined`-এ initialize হয় (declaration-এর আগে access করলে error না)। `let`/`const` hoist হয় কিন্তু initialize হয় না — declaration-এর আগে access করলে **ReferenceError** (এই gap-টাই TDZ)। `function` declaration পুরোটাই hoist হয় (আগে কল করা যায়), `function expression`/arrow ফাংশন হয় না।

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "We enforce `let`/`const` only via ESLint in the frontend codebase specifically to avoid these hoisting bugs."

---

## Q5. `Promise.all` vs `allSettled` vs `race`

- **`Promise.all`** — সব resolve হলে result array, **প্রথম reject-এই পুরোটা reject** (fail-fast)
- **`Promise.allSettled`** — সব শেষ হওয়া পর্যন্ত অপেক্ষা, প্রতিটার `{status, value|reason}` — কোনোটাই bail out করে না
- **`Promise.race`** — যেটা প্রথমে settle হয় (resolve বা reject) সেটাই জেতে — timeout প্যাটার্নে ব্যবহার হয়

```js
// timeout প্যাটার্ন
Promise.race([
  fetchData(),
  new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
]);
```

🔗 Sokrio link: S1 — মাইগ্রেশনের সময় parallel সিস্টেম চালানোর মতো জায়গায় multiple async call-এর ফলাফল একসাথে সামলাতে হয়েছিল।

---

## Q6. Prototypal inheritance — Object.create, prototype chain

প্রতিটা object-এর একটা internal `[[Prototype]]` লিংক আছে (`__proto__` দিয়ে exposed)। Property lookup না পেলে prototype chain বেয়ে ওপরে যায়, `null` পর্যন্ত। ES6 `class` এটার উপর syntactic sugar মাত্র — আসলে `Object.create`/`function.prototype`-ই কাজ করছে ভেতরে।

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "Day to day I work in TypeScript classes/interfaces, but I know they compile down to this prototype chain."

---

## Q7. Destructuring + spread/rest

```js
const { id, ...rest } = workOrder;          // rest params
const merged = { ...defaults, ...overrides }; // shallow merge, পরের key জেতে
const [first, ...others] = providers;
```

🔗 Sokrio link: S6 — React/TS রিরাইটে props/state handle করতে এই প্যাটার্নগুলো রোজ ব্যবহার হয়।

---

## Q8. `debounce` স্ক্র্যাচ থেকে লেখো

```ts
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

শেষ কলের `delay` ms পরে একবার execute হয় — search-input, resize handler-এ ব্যবহার হয়।

🔗 Sokrio link: S6 — filterable list/search UI-তে (React frontend) এই প্যাটার্ন সরাসরি দরকার হয়।

---

## Q9. `throttle` স্ক্র্যাচ থেকে লেখো

```ts
function throttle<T extends (...args: any[]) => void>(fn: T, limit: number) {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (inThrottle) return;
    fn(...args);
    inThrottle = true;
    setTimeout(() => (inThrottle = false), limit);
  };
}
```

প্রতি `limit` ms-এ সর্বোচ্চ একবার execute হয় — scroll/GPS-ping handler-এ ব্যবহার হয়।

🔗 Sokrio link: S9 — GPS check-in ping-এর মতো high-frequency ইভেন্টে throttling দরকার হয়, যদিও exact implementation `[Komol পূরণ করবে]`।

---

## Q10. async/await error handling — unhandled rejection কীভাবে ঠেকাবে?

```js
async function fetchWO(id) {
  try {
    const res = await api.get(`/work-orders/${id}`);
    return res.data;
  } catch (err) {
    logger.error(err); // handled, unhandled rejection হবে না
    throw err; // caller-কে জানাও, silently swallow না
  }
}
```

Node-এ un-caught rejection process crash করাতে পারে (`unhandledRejection` event)। প্রতিটা `await`-কে `try/catch`-এ মোড়ানো, অথবা caller পর্যন্ত propagate হতে দেওয়া — silently swallow করা যাবে না।

🔗 Sokrio link: S2 — queue job-এ retry/dead-letter queue ঠিক এই কারণেই দরকার হয়েছিল: unhandled failure যেন silently হারিয়ে না যায়।

---

## দ্রুত রিভিশন চেকলিস্ট
- [ ] Event loop অর্ডার পাজল ৩টা ভুল ছাড়া সমাধান করতে পারি
- [ ] `debounce`/`throttle` স্ক্র্যাচ থেকে টাইপ করতে পারি, না দেখে
- [ ] Closure ব্যাখ্যা করে একটা কোড উদাহরণ লিখতে পারি
