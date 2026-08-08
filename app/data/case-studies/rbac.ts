import type { CaseStudy } from "./types";

export const rbac: CaseStudy = {
  slug: "rbac",
  tldr: "RBAC_Authentication is a compact Node/Express/MongoDB auth backend that demonstrates role-based access control on a course-marketplace domain: users register, log in, and buy courses; admins create and manage listings. Its one genuinely interesting idea is cryptographic role separation — user tokens and admin tokens are signed with two different JWT secrets, so a forged role claim can never smuggle a user into an admin route. It's a deliberate learning-scale distillation of the auth patterns used at full size in ProjectManager, and the published repo is honestly partial: the entry point, schemas, and config are committed, while the router implementations index.js mounts are not.",
  architecture: {
    intro:
      "index.js boots Express, connects Mongoose to Atlas, and mounts four versioned routers: /api/v1/user, /purchase, /course, and /admin. The load-bearing design is in config.js, which exports two distinct JWT secrets — one for users, one for admins — so admin routes verify against an entirely separate trust domain. All three schemas live in a single db.js, with the role enum baked into the user document; auth is stateless JWT with bcrypt-hashed passwords and zod-validated inputs, and there is no refresh-token store in the committed code.",
    diagram: {
      nodes: [
        { id: "client", label: "API client (Postman / frontend)", kind: "client" },
        { id: "express", label: "Express app (index.js, port 3000)", kind: "service" },
        { id: "userRoutes", label: "/api/v1/user + /purchase (user JWT)", kind: "service" },
        { id: "adminRoutes", label: "/api/v1/admin (admin JWT)", kind: "service" },
        { id: "courseRoutes", label: "/api/v1/course (public catalog)", kind: "service" },
        { id: "mongo", label: "MongoDB Atlas (users, courses, purchases)", kind: "db" },
      ],
      edges: [
        { from: "client", to: "express", label: "JSON + Bearer token" },
        { from: "express", to: "userRoutes", label: "verify with JWT_SECRET" },
        { from: "express", to: "adminRoutes", label: "verify with admin secret" },
        { from: "express", to: "courseRoutes", label: "browse courses" },
        { from: "userRoutes", to: "mongo", label: "bcrypt users, purchases" },
        { from: "adminRoutes", to: "mongo", label: "CRUD courses (createrId)" },
        { from: "courseRoutes", to: "mongo", label: "read course catalog" },
      ],
    },
  },
  stack: [
    {
      tech: "Node.js + Express 4",
      role: "HTTP server and routing",
      why: "Minimal framework where versioned router mounting keeps the user and admin surfaces physically separated.",
    },
    {
      tech: "MongoDB + Mongoose 8",
      role: "Datastore and schemas",
      why: "A schema-level role enum and ref-based relations without SQL migrations — invalid roles are rejected at write time.",
    },
    {
      tech: "jsonwebtoken",
      role: "Stateless auth tokens",
      why: "No session store to run, and two signing secrets turn user and admin into separate cryptographic trust domains.",
    },
    {
      tech: "bcrypt",
      role: "Password hashing",
      why: "Salted adaptive hashing — passwords are never stored or compared in plaintext.",
    },
    {
      tech: "zod",
      role: "Request validation",
      why: "Declarative schemas vet signup and login payloads before they ever touch the database.",
    },
    {
      tech: "dotenv",
      role: "Config loading",
      why: "Keeps MONGO_URL and both JWT secrets in the environment rather than in source.",
    },
  ],
  dataModel: {
    intro:
      "Three collections in one db.js. The user document carries a required role field constrained by a Mongoose enum to user or admin — the role is intrinsic to the account, not granted per-session. course is the protected resource, with a createrId back-reference enabling 'only edit your own courses' checks, and purchase is a pure join document. It's the deliberate opposite of ProjectManager's design: a fixed two-value enum with per-secret trust separation, instead of a runtime-editable permissions collection.",
    diagram: {
      entities: [
        {
          name: "user",
          fields: ["email (unique)", "password (bcrypt)", "firstname / lastname", "role: user|admin (enum)"],
        },
        {
          name: "course",
          fields: ["title", "description", "price", "imageURL", "createrId → user"],
        },
        {
          name: "purchase",
          fields: ["userId → user", "courseId → course"],
        },
      ],
      relations: [
        { from: "course", to: "user", label: "createrId (creating admin)" },
        { from: "purchase", to: "user", label: "buyer" },
        { from: "purchase", to: "course", label: "purchased course" },
      ],
    },
  },
  decisions: [
    {
      chose: "two JWT secrets",
      over: "one secret with a role claim",
      body: "Admin routes verify against a completely different signing key than user routes. With a single secret, an authorization bug that forgets to check the role claim silently grants users admin access; with split secrets, a user token cryptographically cannot pass admin verification no matter what its payload says. The cost is duplicated signing logic and a second secret to rotate.",
    },
    {
      chose: "a role enum on the user document",
      over: "a permissions collection",
      body: "role: {enum: ['user','admin']} makes authorization a one-field read with schema-level integrity — invalid roles are rejected at write time. For a two-role system that's the right call; the author's larger ProjectManager shows the other end of the tradeoff, moving to a runtime-editable RoleConfig collection once permission lists needed to change without redeploys.",
    },
    {
      chose: "a purchase join collection",
      over: "an array of course IDs on the user",
      body: "A join document scales without unbounded array growth, can carry its own metadata later (price paid, timestamp), and makes 'who bought this course' exactly as cheap as 'what did this user buy' — the both-directions query an embedded array can't do.",
    },
    {
      chose: "stateless JWT",
      over: "server-side sessions",
      body: "With jsonwebtoken and no session store anywhere in the dependency list, auth state lives entirely in the signed token — no per-request session lookup and no shared store to operate. The accepted tradeoff is the standard one: tokens can't be revoked before expiry, which is exactly the gap a refresh-token-rotation layer would close — a layer this repo does not (yet) contain.",
    },
  ],
  funFacts: [
    "The package.json name is 'week-7' — this repo began life as a weekly cohort assignment (Week 7: authentication) and got promoted to a standalone portfolio piece.",
    "The admin secret's env var name carries a typo preserved forever in the config surface: JWT_SERECT_ADMIN — 'SERECT' in config.js and .env.example alike.",
    "db.js registers models with trailing spaces in their names — mongoose.model('course ', …) and mongoose.model('purchase ', …). Mongoose tolerates it, and it makes a great spot-the-bug interview question.",
    "The example JWT secret in .env.example is 'Hare Krishna' — for both the user and admin secrets, which slightly undermines the two-trust-domain design in dev.",
    "index.js imports four routers from a Routes/ directory that isn't in the published repo — the schemas and the two-secret design are committed, but the middleware that enforces them lives off-camera for now.",
  ],
};
