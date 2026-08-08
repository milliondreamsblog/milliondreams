# Bawarchie (orderbyqr)

## Overview
Bawarchie is a multi-tenant QR-based restaurant ordering SaaS: diners scan a per-table QR code, land on that restaurant's live menu at `/r/[restaurantSlug]/t/[tableSlug]`, filter by dietary tags, chat with an AI waiter that can add dishes straight to the cart from natural language ("I'll have 2 paneer tikka"), and pay through Razorpay — no waiter involved. Restaurant owners get a full admin panel (menu, tables with generated QR codes, inventory, analytics, feedback with AI sentiment analysis) and a real-time Kitchen Display System fed by Server-Sent Events, while a platform-level super admin approves and oversees restaurants. The business model is baked into the code: every order carries a GST snapshot plus a 2% platform fee, split into `restaurantEarnings` and `myEarnings` per order. It's installable as a PWA with offline caching and Web Push notifications for new orders, and is live at https://www.bawarchie.com.

## Architecture
The whole platform is a single Next.js 16 App Router app backed by MongoDB Atlas via Mongoose (`lib/db.js`, models in `lib/models/`). Tenancy is enforced by convention: every model carries a `restaurantId` and every admin API route calls `requireAuth()` / `requireSuperAdmin()` (`lib/utils/apiAuth.ts`), which read the NextAuth v5 JWT session and check a `restaurant` or `super-admin` role. The customer flow resolves restaurant + table from slugs, holds the cart in a Zustand store persisted to localStorage (`lib/store/useCartStore.ts`), then hits `/api/payments/create-order` (Razorpay Orders API with the billing breakdown from `lib/utils/billing.ts`) and `/api/payments/verify`, which recomputes the HMAC-SHA256 signature using the restaurant's own Razorpay secret (each tenant can bring their own keys, falling back to platform keys). Order creation triggers a fire-and-forget Web Push (`lib/utils/sendPushNotification.ts`, VAPID keys) to every subscribed admin device. The KDS (`app/admin/[slug]/kitchen/page.tsx`) subscribes to `/api/orders/stream`, an SSE route pinned to the Node runtime that polls MongoDB every 3 seconds for pending/preparing orders and pushes them down a `ReadableStream`. The AI layer (`app/api/ai/chat`, `app/api/ai/recommend`) loads the tenant's live menu into the prompt and calls GPT-4o-mini with `response_format: json_object`, returning both a reply and a `cartActions` array the client enriches and applies to the cart; the same model scores feedback sentiment. Images and QR codes go to Cloudinary; analytics pages run parallel MongoDB aggregation pipelines rendered with Recharts.

### Diagram spec
```json
{
  "nodes": [
    {"id": "customer", "label": "Customer PWA (/r/[rest]/t/[table])", "kind": "client"},
    {"id": "admin", "label": "Admin panel + Kitchen Display (SSE)", "kind": "client"},
    {"id": "api", "label": "Next.js API routes (orders, menu, payments, ai)", "kind": "service"},
    {"id": "auth", "label": "NextAuth v5 (JWT, roles: restaurant / super-admin)", "kind": "service"},
    {"id": "mongo", "label": "MongoDB Atlas (Mongoose, per-restaurant tenancy)", "kind": "db"},
    {"id": "razorpay", "label": "Razorpay (Orders API + HMAC verify)", "kind": "external"},
    {"id": "openai", "label": "OpenAI GPT-4o-mini (AI waiter, sentiment)", "kind": "external"},
    {"id": "cloudinary", "label": "Cloudinary (item images, QR codes)", "kind": "external"},
    {"id": "push", "label": "Web Push (VAPID) to admin devices", "kind": "external"}
  ],
  "edges": [
    {"from": "customer", "to": "api", "label": "menu, cart, chat, checkout"},
    {"from": "admin", "to": "api", "label": "CRUD + SSE order stream (3s poll)"},
    {"from": "api", "to": "auth", "label": "requireAuth / requireSuperAdmin"},
    {"from": "api", "to": "mongo", "label": "reads/writes + aggregations"},
    {"from": "customer", "to": "razorpay", "label": "checkout modal"},
    {"from": "api", "to": "razorpay", "label": "create order / verify signature"},
    {"from": "api", "to": "openai", "label": "menu-grounded chat → cartActions JSON"},
    {"from": "api", "to": "push", "label": "new-order notification"},
    {"from": "api", "to": "cloudinary", "label": "image upload"}
  ]
}
```

## Tech stack
| Tech | Role | Why this choice |
|---|---|---|
| Next.js 16 (App Router) + React 19 + TypeScript | Full-stack framework | One deployable serves three frontends (customer, admin, super admin) plus all APIs |
| MongoDB + Mongoose | Primary datastore | Flexible schemas for menus/orders; multi-tenancy via indexed `restaurantId` on every collection; aggregation pipelines power analytics |
| NextAuth v5 (beta) + bcryptjs | Authentication | JWT sessions with custom roles; restaurants sign up, super admin approves; passwords hashed with bcrypt |
| Razorpay | Payments | Indian market standard; per-restaurant API keys supported, HMAC-SHA256 verification in `app/api/payments/verify/route.ts` |
| OpenAI GPT-4o-mini | AI waiter, recommendations, feedback sentiment | Cheap, fast model; `response_format: json_object` makes cart actions machine-parseable |
| Server-Sent Events (native ReadableStream) | Real-time kitchen display | One-directional order feed without a WebSocket server; works on plain Node hosting |
| Zustand (persist middleware) | Cart + theme state | Cart survives refreshes via localStorage; simpler than Redux for a per-table session |
| Cloudinary | Image + QR hosting | Offloads media storage/transforms from the app server |
| web-push (VAPID) | Admin order notifications | Native browser push to the PWA even when the tab is closed |
| Tailwind CSS 4 + Recharts | UI and analytics charts | Utility styling across three UIs; AreaChart/BarChart over aggregation output |
| PWA (manifest + custom `public/sw.js`) | Installability + offline | "Add to Home Screen" for both diners and kitchen tablets; cache-first service worker |

## Data model
Seven Mongoose models, all scoped by `restaurantId` (the tenancy key, indexed everywhere). `Restaurant` is the tenant root: slug, credentials, approval `status` (pending/approved/blocked), optional per-tenant Razorpay keys, and a `gstPercentage` locked to India's real GST slabs (0/5/12/18). `Table` holds a per-restaurant-unique slug, the Cloudinary `qrUrl`, occupancy status, and `currentOrderId`. `Item` carries price, image, dietary tags (isVeg/isVegan/isGlutenFree, spiceLevel enum) and inventory (`stock: -1` = unlimited, `lowStockThreshold`); `Menu` groups item refs into named sections. `Order` is the richest document: line items, a full immutable billing snapshot (baseTotal, gstPercentage/gstAmount at order time, 2% platformFee, finalAmount, restaurantEarnings, myEarnings), a status lifecycle (pending → preparing → served, plus cancelled/refunded with who/why/refund tracking), and Razorpay order/payment IDs. `Feedback` stores a 1-5 rating plus an AI-generated `sentiment` subdocument (score, label, topic tags, one-line summary). `PushSubscription` stores per-device Web Push endpoints with a unique index on the endpoint.

### DB diagram spec
```json
{
  "entities": [
    {"name": "Restaurant", "fields": ["slug (unique)", "email / password (bcrypt)", "status: pending|approved|blocked", "razorpayKeyId/Secret (per-tenant)", "gstPercentage: 0|5|12|18"]},
    {"name": "Table", "fields": ["tableNumber", "slug (unique per restaurant)", "qrUrl (Cloudinary)", "status: free|occupied", "currentOrderId"]},
    {"name": "Item", "fields": ["name / price / image", "isVeg / isVegan / isGlutenFree", "spiceLevel enum", "stock (-1 = unlimited)", "restaurantId"]},
    {"name": "Menu", "fields": ["title", "sections[]: name + item refs", "restaurantId"]},
    {"name": "Order", "fields": ["items[]: itemId + qty", "status: pending|preparing|served|cancelled|refunded", "gstAmount / platformFee / finalAmount", "restaurantEarnings / myEarnings", "razorpayOrderId / razorpayPaymentId"]},
    {"name": "Feedback", "fields": ["rating 1-5", "text", "sentiment.score / label / tags / summary (AI)", "orderId?"]}
  ],
  "relations": [
    {"from": "Table", "to": "Restaurant", "label": "belongs to"},
    {"from": "Item", "to": "Restaurant", "label": "belongs to"},
    {"from": "Menu", "to": "Item", "label": "sections reference"},
    {"from": "Order", "to": "Item", "label": "line items"},
    {"from": "Order", "to": "Restaurant", "label": "tenant + earnings split"},
    {"from": "Feedback", "to": "Order", "label": "optional post-order review"}
  ]
}
```

## Why this, not that

### Why SSE-over-polling, not WebSockets
The kitchen display's `/api/orders/stream/route.ts` opens a long-lived `ReadableStream`, forces `runtime = "nodejs"` ("SSE requires persistent connections, not edge"), and inside it polls MongoDB every 3 seconds, pushing active orders to the client. A WebSocket server would need separate infrastructure and can't run in a standard Next.js route; SSE gives the kitchen a live-feeling Kanban with reconnect-for-free semantics, and the DB-poll loop deliberately swallows transient errors so a Mongo hiccup doesn't kill the stream.

### Why structured JSON cart actions, not an LLM chat that just talks
The AI waiter (`app/api/ai/chat/route.ts`) doesn't merely converse — it's prompted to emit `{ reply, cartActions: [{itemId, name, qty, action}] }` with `response_format: { type: "json_object" }`, using exact item IDs from the tenant's live menu injected into the prompt. The server then re-validates each action against the database and enriches it with real item data before the client touches the cart, so the LLM can never invent an item or a price.

### Why per-restaurant Razorpay keys, not one platform account
`payments/verify` looks up the restaurant and uses `restaurant.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET` for HMAC verification. Letting each tenant bring their own Razorpay account means money settles directly to the restaurant (no marketplace/escrow licensing headaches for a student-built SaaS), while the platform's 2% fee is tracked in the order document (`myEarnings`) rather than split at the gateway — simpler, at the cost of fee collection being bookkeeping rather than automatic.

### Why an immutable billing snapshot on the Order, not computed-on-read
`lib/utils/billing.ts` computes GST (validated against real Indian slabs 0/5/12/18) and the 2% platform fee at order time, and `Order` persists every intermediate number: baseTotal, gstPercentage, gstAmount, platformFee, finalAmount, restaurantEarnings, myEarnings. If a restaurant later changes its GST rate or the platform changes its fee, historical orders and revenue analytics stay correct — a classic financial-data lesson applied properly.

### Why MongoDB, not PostgreSQL
Menus are nested (sections of item refs), orders embed line items and a billing subdocument, and feedback embeds an AI sentiment subdocument — document shapes that map 1:1 to Mongoose schemas without join tables. Analytics needs are served by aggregation pipelines (the README cites 5 parallel aggregations for the dashboard), and multi-tenancy is a `restaurantId` index on every collection instead of foreign-key ceremony. The tradeoff is no cross-document transactions around order + inventory updates.

## Fun facts
- The platform's revenue field is literally named `myEarnings` in the Order schema (`lib/models/Order.js`) — the 2% cut, tracked per order next to `restaurantEarnings`.
- The default super admin in `ENV_TEMPLATE.md` is `papa@Bawarchie.com` / `papa123`, and the template ships `NEXT_PUBLIC_SUPER_ADMIN_PASSWORD` — a client-exposed password env var — with all-caps warnings to remove it in production.
- The kitchen's new-order sound alert is synthesized from scratch with the Web Audio API (`OscillatorNode` + `GainNode` triple-beep) — zero audio files, zero dependencies.
- "Bawarchie" is Hindi/Urdu for "chef"; the README banner calls it a Final Year Engineering Project, yet it ships GST slab validation, refund state machines, and a super-admin approval workflow.
- `lib/utils/sendPushNotification.ts` imports `web-push`, but `web-push` appears in neither `package.json` nor `package-lock.json` — the push feature seems to depend on a package that was never committed as a dependency.
- The SSE stream sorts orders oldest-first with the comment "oldest first so kitchen sees them in order" — a tiny detail that shows real thought about how kitchens actually work.

## Screenshot targets
- Live site: https://www.bawarchie.com (landing page with pricing, FAQ, testimonials).
- Customer flow: `/r/[restaurantSlug]/t/[tableSlug]` — menu with dietary filter bar, the AI waiter chat adding items to cart, Razorpay checkout, and `/order-success` with the print-to-PDF receipt.
- Admin: `/admin/[slug]/kitchen` (the SSE Kanban KDS — best screenshot in the app), `/admin/[slug]/analytics` (Recharts revenue/peak-hours), `/admin/[slug]/tables` (QR generation), `/admin/[slug]/feedback` (sentiment dashboard).
- Super admin: `/super-admin/restaurants` (approval queue).
- Local run requires secrets: `MONGO_URI` (Atlas), `NEXTAUTH_SECRET`, Razorpay test keys, `OPENAI_API_KEY`, Cloudinary keys per `ENV_TEMPLATE.md`. Commands: `npm install`, copy `ENV_TEMPLATE.md` values into `.env`, `npm run seed` (seed script at `scripts/seed.mjs`), then `npm run dev`. AI chat and payments degrade without their keys; core menu browsing works with just MongoDB + NextAuth vars.

## Gaps
- `web-push` is imported but not a declared dependency — confirm how push notifications work in the deployed build (missing commit? removed feature?).
- Whether www.bawarchie.com runs this exact codebase and on what host (Vercel is implied by `@vercel/analytics`; but SSE + 3s DB polling on serverless has function-duration implications worth confirming).
- Payment verify confirms the HMAC but the order-creation/payment linkage (does an unpaid order ever reach the kitchen?) wasn't fully traced — author should describe the order-state flow around payment.
- Razorpay refund execution: `Order` has refund fields (`refundId`, `refundStatus`) and a cancel route exists, but whether refunds call the Razorpay API or are manual wasn't verified.
- Real usage numbers (restaurants onboarded, orders processed) — nothing in the repo indicates production traction.
- VAPID keys (`VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`) are used in code but absent from `ENV_TEMPLATE.md`.
