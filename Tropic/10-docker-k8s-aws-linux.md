> Tracker ID: FN-12 · Generated: 2026-09-28 · Source: backend-system-design-study-plan.md Phase 8, weak-areas.md (self-rating অনুযায়ী এই টপিকে গভীরতা কম দাবি করা হয়েছে)

# Docker / Kubernetes / AWS / Linux / Git — Q&A

> সৎ নোট: weak-areas.md-এ K8s "familiar"=১, AWS ১–২ রেটিং করা আছে (CV-guess)। এই ডকে concept-level ব্যাখ্যা যথেষ্ট গভীরে যাবে, কিন্তু production-scale claim গুলো bracket করা থাকবে যতক্ষণ না Komol নিজে ভরাট করে।

## ১. Multi-stage Dockerfile কেন দরকার?

Build স্টেজে (compiler, dev dependency, build tool) অনেক ভারী ইমেজ লাগে, কিন্তু রানটাইমে এসবের দরকার নেই। Multi-stage-এ প্রথম স্টেজে বিল্ড করে, দ্বিতীয় (ছোট, যেমন `node:alpine`) স্টেজে শুধু বিল্ড আউটপুট কপি হয় — ফাইনাল ইমেজ ছোট, কম attack surface।

```dockerfile
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER node
HEALTHCHECK CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main.js"]
```

🔗 Sokrio link: CV-তে CI/CD প্রসঙ্গ আছে, কিন্তু নির্দিষ্ট Dockerfile ডিটেইল `[Komol পূরণ করবে]`।

## ২. docker-compose লোকাল ডেভেলপমেন্টে কী সমাধান করে?

একাধিক সার্ভিস (app + MySQL + Redis + RabbitMQ) একসাথে, একই কমান্ডে চালু/বন্ধ করা, নেটওয়ার্ক অটো তৈরি হয় (সার্ভিসের নাম দিয়ে একে অপরকে খুঁজে পায়), volume দিয়ে ডেটা persist করা। প্রোডাকশনে সাধারণত K8s ব্যবহার হয়, compose শুধু লোকাল/CI-তে।

## ৩. Pod, Deployment, Service, Ingress — সম্পর্ক কী?

- **Pod:** সবচেয়ে ছোট ইউনিট, এক বা একাধিক কন্টেইনার একসাথে (network/storage শেয়ার করে)।
- **Deployment:** কতগুলো Pod রাখবে (replica count), rolling update/rollback ম্যানেজ করে।
- **Service:** স্টেবল নেটওয়ার্ক এন্ডপয়েন্ট, Pod বদলালেও (IP বদলে গেলেও) একই নামে অ্যাক্সেস — `ClusterIP` (internal), `NodePort`, `LoadBalancer` (external)।
- **Ingress:** ক্লাস্টারের বাইরে থেকে HTTP(S) রুটিং, path/host-ভিত্তিক (যেমন `/api` → api-service, `/` → frontend-service), TLS টার্মিনেশন।

## ৪. Liveness vs Readiness vs Startup probe — গুলিয়ে ফেললে কী ভাঙে?

- **Liveness:** "এই কন্টেইনার কি বেঁচে আছে?" — ফেল করলে K8s কন্টেইনার রিস্টার্ট করে। ভুলভাবে সেট করলে (খুব স্ট্রিক্ট) সুস্থ কন্টেইনার বারবার রিস্টার্ট হবে (crash loop)।
- **Readiness:** "এই কন্টেইনার কি ট্রাফিক নেওয়ার জন্য রেডি?" — ফেল করলে Service থেকে সাময়িকভাবে সরিয়ে দেয় (রিস্টার্ট করে না)। এটা না থাকলে, স্টার্টআপ চলাকালীন অসম্পূর্ণ কন্টেইনারে ট্রাফিক চলে যাবে → error।
- **Startup:** ধীরে বুট হওয়া অ্যাপের জন্য — এটা পাস না হওয়া পর্যন্ত liveness/readiness চেক শুরু হয় না, যাতে ধীর বুটকে "ডেড" ভেবে রিস্টার্ট না করে।

## ৫. HPA (Horizontal Pod Autoscaler) কীভাবে কাজ করে?

CPU/memory utilization (বা custom metric, যেমন queue length) মনিটর করে — থ্রেশহোল্ড ছাড়ালে অটোমেটিক Pod সংখ্যা বাড়ায়/কমায়। উদাহরণ: `targetCPUUtilization: 70%` — গড় CPU এর ওপরে গেলে নতুন Pod স্পিন-আপ হয়।

## ৬. Rolling update বনাম rollback

Rolling update: নতুন ভার্সনের Pod একে একে আনা হয়, পুরনোটা একে একে সরানো হয় (ডাউনটাইম-ফ্রি), `maxSurge`/`maxUnavailable` দিয়ে গতি কন্ট্রোল হয়। কোনো সমস্যা ধরা পড়লে `kubectl rollout undo` দিয়ে আগের ReplicaSet-এ ফিরে যাওয়া যায় (K8s আগের রেভিশন হিস্ট্রি রাখে)।

## ৭. AWS — কোন সার্ভিস কী কাজে (concept-level)

- **EC2 / EKS/ECS:** ভার্চুয়াল মেশিন বনাম ম্যানেজড কন্টেইনার অর্কেস্ট্রেশন।
- **RDS MySQL:** ম্যানেজড DB, Multi-AZ (ফেইলওভার), read replica (রিড স্কেলিং)।
- **S3 + presigned URL:** ফাইল/ফটো আপলোড — ক্লায়েন্ট সরাসরি S3-তে আপলোড করে (presigned URL দিয়ে, সময়সীমাবদ্ধ, নির্দিষ্ট পারমিশন সহ), API সার্ভার দিয়ে বাইট পাস করাতে হয় না — ব্যান্ডউইথ/লোড বাঁচে।
- **SQS/SNS:** ম্যানেজড queue (SQS) আর pub/sub (SNS) — নিজে RabbitMQ/Kafka হোস্ট না করে ম্যানেজড অল্টারনেটিভ।
- **CloudWatch:** লগ, মেট্রিক, অ্যালার্ম।

🔗 Sokrio link: CV-তে CloudWatch ব্যবহারের উল্লেখ আছে (S4-এর on-call/SLO স্টোরিতে)। EKS/RDS/S3-এর গভীর প্রোডাকশন ডিটেইল `[Komol পূরণ করবে]`।

## ৮. Linux — দ্রুত রিভিশন

লগ টেইল করা (`tail -f`, `grep`, `awk` দিয়ে প্যাটার্ন বের করা), প্রসেস দেখা (`ps aux`, `top`/`htop`), পোর্ট/নেটওয়ার্ক (`netstat`/`ss`), ডিস্ক/মেমরি (`df -h`, `free -m`), permission (`chmod`/`chown`)। `grep -i "error" app.log | awk '{print $1, $2}'` টাইপ কম্বিনেশন প্রায়ই জিজ্ঞেস করা হয়।

## ৯. Git — rebase vs merge, conflict resolution

`merge` হিস্ট্রি প্রিজার্ভ করে (একটা merge commit তৈরি হয়, branch structure দেখা যায়)। `rebase` কমিটগুলো নতুন বেসের ওপর "রিপ্লে" করে — হিস্ট্রি লিনিয়ার/পরিষ্কার থাকে, কিন্তু shared/pushed branch-এ rebase করলে অন্যদের হিস্ট্রি ভেঙে যায় (golden rule: shared branch rebase করবে না)। Conflict এলে: কনফ্লিক্ট মার্কার (`<<<<<<<`) দেখে ম্যানুয়ালি রিজলভ করে `git add` + (`git rebase --continue` বা merge commit)।

## ১০. Pod বারবার রিস্টার্ট হচ্ছে — কীভাবে ডিবাগ করবে?

`kubectl describe pod <name>` (ইভেন্ট লগ, OOMKilled কিনা), `kubectl logs <name> --previous` (আগের ক্র্যাশের লগ), probe কনফিগ চেক (liveness খুব agressive কিনা), resource limit চেক (মেমরি লিমিট কম হলে OOMKill হবে)।
