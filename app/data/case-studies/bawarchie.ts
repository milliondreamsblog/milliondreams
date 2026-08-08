import type { CaseStudy } from "./types";

export const bawarchie: CaseStudy = {
  slug: "bawarchie",
  heroImage: "/case-studies/bawarchie/hero.png",
  tldr: "Bawarchie is a multi-tenant QR-based restaurant ordering SaaS, live at bawarchie.com: diners scan a per-table QR code, browse that restaurant's live menu, chat with an AI waiter that adds dishes to the cart from natural language ('I'll have 2 paneer tikka'), and pay through Razorpay — no waiter involved. Owners get a full admin panel plus a real-time Kitchen Display System fed by Server-Sent Events, and a platform super admin approves restaurants. The business model is baked into the code: every order carries a GST snapshot and a 2% platform fee, split into restaurantEarnings and myEarnings per order. It also installs as a PWA with Web Push notifications for new orders.",
  architecture: {
    intro:
      "One Next.js 16 App Router app backed by MongoDB Atlas via Mongoose, with tenancy enforced by convention: every model carries an indexed restaurantId and every admin route checks a NextAuth v5 JWT role. The customer flow resolves restaurant and table from slugs, holds the cart in a localStorage-persisted Zustand store, and pays via Razorpay with HMAC-SHA256 verification against the restaurant's own keys. The kitchen display subscribes to an SSE route that polls MongoDB every 3 seconds; the AI waiter injects the tenant's live menu into a GPT-4o-mini prompt and gets back JSON cart actions the server re-validates against the database before the cart ever changes.",
    diagram: {
      nodes: [
        { id: "customer", label: "Customer PWA (/r/[rest]/t/[table])", kind: "client" },
        { id: "admin", label: "Admin panel + Kitchen Display (SSE)", kind: "client" },
        { id: "api", label: "Next.js API routes (orders, menu, payments, ai)", kind: "service" },
        { id: "auth", label: "NextAuth v5 (JWT, restaurant / super-admin roles)", kind: "service" },
        { id: "mongo", label: "MongoDB Atlas (Mongoose, per-restaurant tenancy)", kind: "db" },
        { id: "razorpay", label: "Razorpay (Orders API + HMAC verify)", kind: "external" },
        { id: "openai", label: "OpenAI GPT-4o-mini (AI waiter, sentiment)", kind: "external" },
        { id: "cloudinary", label: "Cloudinary (item images, QR codes)", kind: "external" },
        { id: "push", label: "Web Push (VAPID) to admin devices", kind: "external" },
      ],
      edges: [
        { from: "customer", to: "api", label: "menu, cart, chat, checkout" },
        { from: "admin", to: "api", label: "CRUD + SSE order stream (3s poll)" },
        { from: "api", to: "auth", label: "requireAuth / requireSuperAdmin" },
        { from: "api", to: "mongo", label: "reads/writes + aggregations" },
        { from: "customer", to: "razorpay", label: "checkout modal" },
        { from: "api", to: "razorpay", label: "create order / verify signature" },
        { from: "api", to: "openai", label: "menu-grounded chat → cartActions JSON" },
        { from: "api", to: "push", label: "new-order notification" },
      ],
    },
  },
  stack: [
    {
      tech: "Next.js 16 + React 19 + TypeScript",
      role: "Full-stack framework",
      why: "One deployable serves three frontends — customer, admin, super admin — plus every API.",
    },
    {
      tech: "MongoDB + Mongoose",
      role: "Primary datastore",
      why: "Nested menus and embedded billing subdocuments map 1:1 to schemas; aggregation pipelines power analytics.",
    },
    {
      tech: "NextAuth v5 + bcryptjs",
      role: "Authentication",
      why: "JWT sessions with custom roles: restaurants sign up, the super admin approves, passwords get bcrypt.",
    },
    {
      tech: "Razorpay",
      role: "Payments",
      why: "The Indian market standard, with per-restaurant API keys and server-side HMAC-SHA256 verification.",
    },
    {
      tech: "OpenAI GPT-4o-mini",
      role: "AI waiter + feedback sentiment",
      why: "Cheap and fast, and response_format: json_object makes cart actions machine-parseable.",
    },
    {
      tech: "Server-Sent Events",
      role: "Real-time kitchen display",
      why: "A one-directional order feed from a native ReadableStream — no WebSocket server to run.",
    },
    {
      tech: "Zustand (persist)",
      role: "Cart + theme state",
      why: "The cart survives refreshes via localStorage; far simpler than Redux for a per-table session.",
    },
    {
      tech: "Cloudinary",
      role: "Image + QR hosting",
      why: "Offloads media storage and transforms from the app server entirely.",
    },
    {
      tech: "PWA (manifest + custom sw.js)",
      role: "Installability + offline",
      why: "Add-to-home-screen for both diners and kitchen tablets, with a cache-first service worker.",
    },
  ],
  dataModel: {
    intro:
      "Seven Mongoose models, all scoped by an indexed restaurantId. Restaurant is the tenant root — slug, credentials, an approval status, optional per-tenant Razorpay keys, and a gstPercentage locked to India's real GST slabs. Order is the richest document: line items plus a full immutable billing snapshot (GST at order time, the 2% platform fee, and the earnings split) and a status lifecycle running pending → preparing → served with cancellation and refund tracking. Feedback stores a 1-5 rating with an AI-generated sentiment subdocument.",
    diagram: {
      entities: [
        {
          name: "Restaurant",
          fields: ["slug (unique)", "email / password (bcrypt)", "status: pending | approved | blocked", "razorpay keys (per-tenant)", "gstPercentage: 0|5|12|18"],
        },
        {
          name: "Table",
          fields: ["tableNumber", "slug (unique per restaurant)", "qrUrl (Cloudinary)", "status: free | occupied"],
        },
        {
          name: "Item",
          fields: ["name / price / image", "isVeg / isVegan / isGlutenFree", "spiceLevel enum", "stock (-1 = unlimited)"],
        },
        {
          name: "Menu",
          fields: ["title", "sections[]: name + item refs", "restaurantId"],
        },
        {
          name: "Order",
          fields: ["items[]: itemId + qty", "status lifecycle incl. cancelled/refunded", "gstAmount / platformFee / finalAmount", "restaurantEarnings / myEarnings", "razorpay order + payment IDs"],
        },
        {
          name: "Feedback",
          fields: ["rating 1-5", "text", "sentiment: score / label / tags / summary (AI)"],
        },
      ],
      relations: [
        { from: "Table", to: "Restaurant", label: "belongs to" },
        { from: "Item", to: "Restaurant", label: "belongs to" },
        { from: "Menu", to: "Item", label: "sections reference" },
        { from: "Order", to: "Item", label: "line items" },
        { from: "Order", to: "Restaurant", label: "tenant + earnings split" },
        { from: "Feedback", to: "Order", label: "optional post-order review" },
      ],
    },
  },
  decisions: [],
  funFacts: [],
};
