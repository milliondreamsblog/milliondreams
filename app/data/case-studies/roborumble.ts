import type { CaseStudy } from "./types";

export const roborumble: CaseStudy = {
  slug: "roborumble",
  heroImage: "/case-studies/roborumble/hero.png",
  heroCaption: "roborumble.in — the terminal boot screen before // SYSTEM_ONLINE",
  tldr: "Robo Rumble (roborumble.in) is the official platform for ROBO RUMBLE 3.0 — Kanpur's largest student tech event at CSJMU, three days, 14 events, a ₹1,50,000+ prize pool. The site is both marketing front and transactional backbone: events catalog, cart-based paid registration at ₹400 an entry, and an authenticated dashboard surface hidden behind robots.txt. It has served 30k+ visits, 1k+ registrations, and ₹1L+ in payments (author-reported), with live team lobbies and competition rooms in the logged-in app. The whole thing commits hard to a terminal aesthetic — the page literally boots with 'LOADING THE RUMBLE… TERMINAL INACTIVE' before flipping to '// SYSTEM_ONLINE'.",
  architecture: {
    intro:
      "This is a closed-source live deployment, so the architecture is what the site itself reveals. Verified on the wire: it's Next.js built with Turbopack (a turbopack-*.js runtime chunk ships to production), with marketing routes fully server-rendered and /login and /register shipping as thin client shells. robots.txt disallows /admin/, /dashboard/, /api/, and /onboarding/ — a map of the private surface — and an Ably reference in a JS bundle fits the claimed real-time lobbies and competition rooms. The datastore and payment provider behind /api/ are not externally observable.",
    diagram: {
      nodes: [
        { id: "visitor", label: "Public visitor (marketing pages)", kind: "client" },
        { id: "participant", label: "Registered participant (dashboard)", kind: "client" },
        { id: "admin", label: "Organizer admin panel (/admin)", kind: "client" },
        { id: "next", label: "Next.js app (Turbopack, SSR + client shell)", kind: "service" },
        { id: "api", label: "API routes (/api/*, robots-hidden)", kind: "service" },
        { id: "db", label: "Datastore (users, teams, registrations) — unverified", kind: "db" },
        { id: "ably", label: "Ably realtime (lobbies, rooms)", kind: "external" },
        { id: "pay", label: "Payment gateway — provider unverified", kind: "external" },
      ],
      edges: [
        { from: "visitor", to: "next", label: "/home /events /gallery (SSR)" },
        { from: "participant", to: "next", label: "/login /register /onboarding /dashboard" },
        { from: "admin", to: "next", label: "/admin" },
        { from: "next", to: "api", label: "auth, cart, registration calls" },
        { from: "api", to: "db", label: "persist users / teams / orders" },
        { from: "api", to: "pay", label: "create + verify payment" },
        { from: "participant", to: "ably", label: "live lobby / room presence" },
        { from: "api", to: "ably", label: "publish room events" },
      ],
    },
  },
  stack: [
    {
      tech: "Next.js 15+ (Turbopack)",
      role: "Full-stack framework",
      why: "One deployable serves SEO-critical event pages, the authenticated portal, and the API — verified via /_next/static and a production turbopack-*.js chunk.",
    },
    {
      tech: "React",
      role: "UI layer",
      why: "Component reuse across a 14-event catalog, a cart flow, and a dashboard.",
    },
    {
      tech: "Framer Motion",
      role: "Animation",
      why: "Powers the terminal boot sequence, marquee banners, and countdown that define the site's personality — present in the shipped bundles.",
    },
    {
      tech: "Ably",
      role: "Real-time pub/sub",
      why: "Managed channels for live team lobbies and competition rooms without operating a socket server; referenced in a site JS bundle.",
    },
    {
      tech: "Terminal-aesthetic design system",
      role: "Brand and UX",
      why: "Monospace type, // SYSTEM_ONLINE status lines, and Register_Now snake_case CTAs make an event site memorable to an engineering-student audience.",
    },
    {
      tech: "Payment gateway (provider unverified)",
      role: "In-app event-fee collection",
      why: "Indian-market UPI/card rails for ₹400-per-event fees, with ₹1L+ processed per the author; the exact provider isn't externally observable.",
    },
  ],
  dataModel: {
    intro:
      "No code is public, so this model is inferred from the site's observable flows and the author's feature list — treat it as a sketch, not a schema dump. Registration is commerce-shaped ('₹400 — GO TO CART'), team events like Robo War imply a Team entity with invite and find-a-teammate mechanics, and live competition rooms imply a Room binding teams to an Ably presence channel.",
    diagram: {
      entities: [
        {
          name: "User",
          fields: ["name / email / phone", "college", "onboarding_complete", "role: participant|admin"],
        },
        {
          name: "Event",
          fields: ["name (Robo War, Line Follower…)", "category", "fee (₹400)", "prize_pool (₹15k-30k)", "team_size"],
        },
        {
          name: "Team",
          fields: ["name", "event → Event", "members[] → User", "looking_for_members flag"],
        },
        {
          name: "Registration",
          fields: ["user → User", "event → Event", "team → Team", "status: cart|paid|confirmed"],
        },
        {
          name: "Payment",
          fields: ["registration → Registration", "amount", "gateway_ref", "status"],
        },
        {
          name: "Room",
          fields: ["event → Event", "teams[] → Team", "ably_channel", "live_state"],
        },
      ],
      relations: [
        { from: "Registration", to: "User", label: "registrant" },
        { from: "Registration", to: "Event", label: "for event" },
        { from: "Team", to: "User", label: "members / find-a-teammate" },
        { from: "Payment", to: "Registration", label: "confirms" },
        { from: "Room", to: "Team", label: "hosts live lobby" },
      ],
    },
  },
  decisions: [],
  funFacts: [],
};
