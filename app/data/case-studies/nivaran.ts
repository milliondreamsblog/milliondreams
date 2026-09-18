import type { CaseStudy } from "./types";

export const nivaran: CaseStudy = {
  slug: "nivaran",
  tldr: "Nivaran explores how a citizen can prepare a grievance by describing the problem in Hindi or English. Built for Build What Moves India, it has a Next.js web prototype and an Expo app for Android and the browser. The newer app focuses on PF transfer preparation: collect a story, reconcile facts with sample evidence, and review a draft. Voice and model responses can propose facts, but the citizen confirms them. Government filing and receipts are simulated, and the project does not claim measured improvements from a completed user study.",
  architecture: {
    intro: "The Expo app keeps case rules in a platform-independent TypeScript core. Typed input, guided questions, voice, and document proposals all update the same revisioned case. Native drafts persist in SQLite and web drafts in localStorage. Next.js routes handle chat, sample-document extraction, and short-lived voice tokens. The voice client then connects to Gemini Live over WebSocket. Draft generation and readiness checks remain local and deterministic.",
    diagram: {
      nodes: [
        {
          id: "app",
          label: "Expo: Android + web",
          kind: "client"
        },
        {
          id: "core",
          label: "Case rules + drafts",
          kind: "service"
        },
        {
          id: "store",
          label: "SQLite / localStorage",
          kind: "db"
        },
        {
          id: "api",
          label: "Next.js API routes",
          kind: "service"
        },
        {
          id: "model",
          label: "Gemini chat + docs",
          kind: "external"
        },
        {
          id: "voice",
          label: "Gemini Live voice",
          kind: "external"
        }
      ],
      edges: [
        {
          from: "app",
          to: "core",
          label: "review facts"
        },
        {
          from: "app",
          to: "store",
          label: "save / restore"
        },
        {
          from: "app",
          to: "api",
          label: "chat / docs / token"
        },
        {
          from: "api",
          to: "model",
          label: "model request"
        },
        {
          from: "app",
          to: "voice",
          label: "audio + proposed facts"
        },
        {
          from: "voice",
          to: "core",
          label: "validate proposals"
        }
      ]
    }
  },
  stack: [],
  decisions: [],
  funFacts: []
};
