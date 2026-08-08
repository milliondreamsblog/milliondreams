# RBAC Authentication

## Overview
RBAC_Authentication is a compact Node.js/Express/MongoDB authentication backend demonstrating role-based access control on a course-marketplace domain: users register, log in, and purchase courses, while admins create and manage course listings. The repo is a learning-scale distillation of the auth patterns used at full size in the author's ProjectManager platform — role-gated routes, JWT-signed sessions, and separate trust domains for users vs. admins. The domain model (users, courses, purchases) exists so the RBAC actually protects something concrete: course creation is admin-only, purchasing is user-facing. As published, the repo contains the server entry point, schemas, and config; the route/middleware implementations referenced by `index.js` are not present in the repository (see Gaps).

## Architecture
`index.js` boots an Express app, connects Mongoose to MongoDB Atlas via `MONGO_URL`, and mounts four versioned routers: `/api/v1/user`, `/api/v1/purchase`, `/api/v1/course`, and `/api/v1/admin` (imported from a `Routes/` directory). All three Mongoose schemas live in a single `db.js`: `user` (with a `role` enum of `user`/`admin` baked into the schema), `course` (with a `createrId` reference back to the creating user), and `purchase` (a join document linking `userId` to `courseId`). `config.js` exports two distinct JWT secrets — `JWT_SECRET` for regular users and `JWT_SERECT_ADMIN` for admins — meaning admin tokens are signed and verified in a separate trust domain: a stolen user token can never validate against an admin-guarded route, even if the payload were forged to claim `role: admin`. Dependencies in `package.json` (bcrypt, jsonwebtoken, zod) indicate the standard flow: zod-validated signup → bcrypt-hashed password → JWT issuance on login → role-checked middleware in front of admin routes. There is no refresh-token store or session collection in the committed code; auth is stateless JWT.

### Diagram spec
```json
{
  "nodes": [
    {"id": "client", "label": "API client (Postman / frontend)", "kind": "client"},
    {"id": "express", "label": "Express app (index.js, port 3000)", "kind": "service"},
    {"id": "userRoutes", "label": "/api/v1/user + /purchase (user JWT)", "kind": "service"},
    {"id": "adminRoutes", "label": "/api/v1/admin (admin JWT)", "kind": "service"},
    {"id": "courseRoutes", "label": "/api/v1/course (public catalog)", "kind": "service"},
    {"id": "mongo", "label": "MongoDB Atlas (users, courses, purchases)", "kind": "db"}
  ],
  "edges": [
    {"from": "client", "to": "express", "label": "JSON + Bearer token"},
    {"from": "express", "to": "userRoutes", "label": "verify with JWT_SECRET"},
    {"from": "express", "to": "adminRoutes", "label": "verify with JWT_SERECT_ADMIN"},
    {"from": "express", "to": "courseRoutes", "label": "browse courses"},
    {"from": "userRoutes", "to": "mongo", "label": "bcrypt users, purchases"},
    {"from": "adminRoutes", "to": "mongo", "label": "CRUD courses (createrId)"},
    {"from": "courseRoutes", "to": "mongo", "label": "read course catalog"}
  ]
}
```

## Tech stack
| Tech | Role | Why this choice |
|---|---|---|
| Node.js + Express 4 | HTTP server and routing (`index.js`) | Minimal framework; versioned router mounting keeps user/admin surfaces separated |
| MongoDB + Mongoose 8 | Datastore and schemas (`db.js`) | Schema-level `role` enum and `ref`-based relations without SQL migrations |
| jsonwebtoken | Stateless auth tokens | No session store needed; two secrets create separate user/admin trust domains |
| bcrypt | Password hashing | Salted adaptive hashing — passwords are never stored or compared in plaintext |
| zod | Request body validation | Declarative schema validation of signup/login payloads before they touch the DB |
| dotenv | Config loading (`config.js`, `.env`) | Keeps `MONGO_URL` and both JWT secrets out of source code |

## Data model
Three collections defined in `db.js`. `user` holds identity (`email` unique, `firstname`, `lastname`), a bcrypt-hashed `password`, and a required `role` field constrained by a Mongoose enum to `user` or `admin` — the role is intrinsic to the account, not granted per-session. `course` is the protected resource: title, description, price, image URL, and a `createrId` ObjectId referencing the admin who created it, enabling "only edit your own courses" checks. `purchase` is a pure join collection — `userId` + `courseId`, both required refs — so "my courses" is a two-step query: find purchases by user, then populate courses. Notably, the RBAC design differs from the author's ProjectManager: here roles are a fixed schema enum with per-secret trust separation, whereas ProjectManager stores editable permission lists in a `RoleConfig` collection.

### DB diagram spec
```json
{
  "entities": [
    {"name": "user", "fields": ["email (unique)", "password (bcrypt)", "firstname / lastname", "role: user|admin (enum)"]},
    {"name": "course", "fields": ["title", "description", "price", "imageURL", "createrId → user"]},
    {"name": "purchase", "fields": ["userId → user", "courseId → course"]}
  ],
  "relations": [
    {"from": "course", "to": "user", "label": "createrId (admin who created it)"},
    {"from": "purchase", "to": "user", "label": "buyer"},
    {"from": "purchase", "to": "course", "label": "purchased course"}
  ]
}
```

## Why this, not that
### Why two JWT secrets, not one secret with a role claim
`config.js` exports `JWT_SECRET` for users and `JWT_SERECT_ADMIN` for admins, so admin routes verify against an entirely different signing key. With a single secret, an authorization bug that forgets to check the `role` claim silently grants users admin access; with split secrets, a user token cryptographically cannot pass admin verification. The cost is duplicated signing logic and a second secret to rotate.

### Why a role enum on the user document, not a permissions collection
The `role: {enum: ["user","admin"]}` field in `db.js` makes authorization a one-field read with schema-level integrity — invalid roles are rejected at write time. This is the right call for a two-role system; the author's larger ProjectManager project shows the other end of the tradeoff, moving to a runtime-editable `RoleConfig` collection once roles needed configurable permission lists.

### Why a purchase join collection, not an array of course IDs on the user
Purchases live in their own collection (`purchase` in `db.js`) rather than embedding `courses: []` on the user. A join document scales without unbounded array growth, lets purchases carry their own metadata later (price paid, timestamp), and makes "who bought this course" as cheap as "what did this user buy" — the classic both-directions query the embedded array can't do.

### Why stateless JWT, not server-side sessions
With `jsonwebtoken` and no session store anywhere in the dependency list, auth state lives entirely in the signed token — no session lookup per request and no shared store to operate. The tradeoff accepted here is the standard one: tokens can't be revoked before expiry, which is exactly the gap a refresh-token-rotation layer would close (see Gaps).

## Fun facts
- The `package.json` name is `week-7` — this repo began life as a weekly cohort assignment (Week 7: authentication) and was promoted to a standalone portfolio piece.
- The admin secret's env var name carries a typo preserved forever in the API: `JWT_SERECT_ADMIN` (config.js and .env.example both spell it "SERECT").
- `db.js` registers models with trailing spaces in their names — `mongoose.model("course ", …)` and `mongoose.model("purchase ", …)` — so the actual MongoDB collections get named from `"course "` and `"purchase "`; Mongoose tolerates it, but it's a great spot-the-bug interview question.
- A real `.env` file is committed to the repository alongside `.env.example`, and `db.js` contains a commented-out hardcoded Atlas connection string with credentials — the repo doubles as a cautionary tale about secret hygiene (the `.gitignore` is empty).
- The example JWT secret in `.env.example` is `"Hare Krishna"` — used for both the user and admin secrets.

## Screenshot targets
- This is a headless backend — no UI. Best "screenshots" are Postman/Thunder Client shots of: `POST /api/v1/user/signup`, `POST /api/v1/user/signin` (returning a JWT), an admin-only course-creation call succeeding with an admin token and failing (403) with a user token, and `GET /api/v1/course` listing the catalog.
- Cannot currently run from a fresh clone: `index.js` requires `./Routes/user`, `./Routes/purchase`, `./Routes/admin`, and `./Routes/course`, but no `Routes/` directory exists in the repository, so `node index.js` crashes at import time even before needing secrets.
- Intended run (once routes exist): `npm install`, create `.env` with `MONGO_URL`, `JWT_SECRET`, `JWT_SERECT_ADMIN`, then `node index.js` (listens on port 3000). Requires a MongoDB Atlas URI — no in-memory fallback here.
- No live URL.

## Gaps
- The `Routes/` directory (user, purchase, admin, course routers) and any middleware files are missing from the published repo — the actual RBAC middleware, zod schemas, and JWT issuance code cannot be verified. The author should push these files; they are the heart of the project.
- The project brief claims JWT refresh-token rotation, but no refresh-token logic, token model, or rotation code exists in the committed files — confirm whether it lives in the missing routes or in another branch/repo.
- A committed `.env` and a commented-out Atlas connection string with credentials in `db.js` should be scrubbed and the credentials rotated before this repo is showcased.
- README is two sentences; endpoint documentation, example requests, and the admin-vs-user flow need to be written up.
- Whether the trailing-space model names (`"course "`, `"purchase "`) were intentional or a latent bug worth fixing.
