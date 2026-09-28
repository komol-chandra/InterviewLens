> Tracker ID: FN-08 · Generated: 2026-09-28 · Source: `00-research/backend-system-design-study-plan.md` + `_memory/story-bank.md` S6

# React + Redux Toolkit + TypeScript — Interview Q&A

JD-তে "strong TypeScript/ES6" আর React লিস্টেড — লাইভ কোডিং রাউন্ডে প্রায় নিশ্চিত এটাই আসবে।

---

## Q1. Reconciliation আর `key` prop-এর ভূমিকা কী?

React প্রতিটা রেন্ডারে পুরনো ও নতুন virtual DOM tree তুলনা করে (diffing) নূন্যতম DOM আপডেট বের করে — এটাই reconciliation। লিস্টে `key` না দিলে বা index দিলে, item পুনর্বিন্যাস/insert/delete হলে React ভুল element-কে re-use করে ফেলতে পারে (state bug, animation glitch)। `key` হতে হবে stable, unique, list-এর ভেতর — data-র id ব্যবহার করো, index না।

🔗 Sokrio link: S6 — Vue থেকে React রিরাইটের সময় এই ধরনের list-rendering bug সবচেয়ে বেশি ধরা পড়ে।

---

## Q2. `memo`, `useMemo`, `useCallback` — কখন কোনটা?

- **`React.memo`** — component-কে wrap করে, props না বদলালে re-render স্কিপ করে
- **`useMemo`** — expensive calculation-এর result cache করে (dependency না বদলালে recompute না)
- **`useCallback`** — function reference cache করে, যাতে child component-এ prop হিসেবে পাঠালে unnecessary re-render না হয়

**সতর্কতা:** এগুলো premature optimization হতে পারে — শুধু profiler দিয়ে প্রমাণিত bottleneck-এ ব্যবহার করো, সব জায়গায় না (extra memoization নিজেই ওভারহেড)।

🔗 Sokrio link: S6 — component standard সেট করার সময় টিমকে কখন memoize করতে হবে তার guideline দেওয়া।

---

## Q3. Custom hook কীভাবে ডিজাইন করবে?

Logic reuse-এর জন্য (state + effect + subscription একসাথে বান্ডল করে)। নিয়ম: নামের শুরুতে `use`, hook rules মেনে চলে (top-level-এ কল, condition-এর ভেতরে না)। উদাহরণ: `useWorkOrders(filters)` — internally RTK Query hook wrap করে, loading/error/data রিটার্ন করে, component-কে raw API call থেকে আলাদা রাখে।

🔗 Sokrio link: S6 — folder structure ও component standard সেট করার গল্পে custom hook pattern প্রাসঙ্গিক।

---

## Q4. RTK Query — endpoint, cache tag, invalidation কীভাবে কাজ করে?

```ts
const workOrderApi = createApi({
  reducerPath: 'workOrderApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['WorkOrder'],
  endpoints: (builder) => ({
    getWorkOrders: builder.query<WorkOrder[], { status?: string }>({
      query: (filters) => ({ url: '/work-orders', params: filters }),
      providesTags: ['WorkOrder'],
    }),
    assignWorkOrder: builder.mutation<WorkOrder, { id: string; providerId: string }>({
      query: ({ id, ...body }) => ({ url: `/work-orders/${id}/assign`, method: 'POST', body }),
      invalidatesTags: ['WorkOrder'],
    }),
  }),
});
```

`providesTags`/`invalidatesTags` দিয়ে automatic re-fetch হয় — mutation সফল হলে সংশ্লিষ্ট query নিজে থেকেই stale হয়ে refetch হয়, manual cache management লাগে না।

🔗 Sokrio link: S6 — Redux Toolkit-এ রিরাইটের সরাসরি প্রমাণ CV-তে আছে, RTK Query-র নির্দিষ্ট প্রোডাকশন উদাহরণ `[Komol পূরণ করবে]`।

---

## Q5. Typed props/generics with hooks

```ts
interface WorkOrderListProps {
  filters: WorkOrderFilters;
  onSelect: (wo: WorkOrder) => void;
}

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
```

Generic hook দিয়ে যেকোনো টাইপের ভ্যালু re-use করা যায় (উদাহরণ: search input debounce)।

🔗 Sokrio link: S6 — TypeScript রিরাইটের মূল কাজ ছিল সব component/hook-এ typed props চালু করা।

---

## লাইভ প্র্যাকটিস (Day 7, ৪৫ মিনিট): Filterable Work-Order List

**লক্ষ্য:** RTK Query + TypeScript দিয়ে একটা filterable list বানানো, লাইভ ইন্টারভিউ কন্ডিশনে।

আউটলাইন (কোড না, কাঠামো — লাইভে নিজে লিখতে হবে):
1. `WorkOrder` টাইপ ডিফাইন করো (id, status, buyerName, scheduledAt)
2. RTK Query slice: `getWorkOrders({ status, cursor })` endpoint
3. `useState`/URL-এ filter state (status dropdown)
4. `WorkOrderList` component — loading/error/empty state হ্যান্ডল
5. `WorkOrderRow` — memoized child, key=id
6. Debounced search input (Q5-এর hook ব্যবহার করে)

**Done when:** টাইপ এরর ছাড়া কম্পাইল হয়, filter বদলালে RTK Query নিজে থেকে re-fetch করে।

🔗 Sokrio link: S6 — ঠিক এই ধরনের filterable list Sokrio-র React রিরাইটে বহুবার বানানো হয়েছে।

---

## দ্রুত রিভিশন চেকলিস্ট
- [ ] Reconciliation + key-এর গুরুত্ব উদাহরণ দিয়ে ব্যাখ্যা করতে পারি
- [ ] memo/useMemo/useCallback-এর পার্থক্য এবং কখন **ব্যবহার করব না** সেটাও বলতে পারি
- [ ] RTK Query-র tag-based invalidation ডায়াগ্রাম এঁকে বোঝাতে পারি
- [ ] filterable list exercise ৪৫ মিনিটে টাইমার দিয়ে একবার করেছি
