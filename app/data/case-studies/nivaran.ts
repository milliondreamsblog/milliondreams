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
  stack: [
    {
      tech: "Expo + React Native",
      role: "Android and browser app",
      why: "Shared screens keep the interview, facts, and review steps consistent across both clients."
    },
    {
      tech: "TypeScript",
      role: "Case state and preparation rules",
      why: "The core models proposed, confirmed, unknown, and conflicting facts explicitly. It has no React Native or network dependency."
    },
    {
      tech: "Next.js + React",
      role: "Web prototype and API routes",
      why: "One server hosts the original demo, the separate research flow, and the mobile app's model endpoints."
    },
    {
      tech: "Gemini Live",
      role: "Voice conversation",
      why: "A WebSocket session carries audio, transcripts, and tool proposals. The server issues the session token."
    },
    {
      tech: "SQLite + localStorage",
      role: "Draft persistence",
      why: "Native and browser adapters save the same case bundle, including the current revision and review."
    }
  ],
  dataModel: {
    intro: "This is a local case model, not a government records database. Each case owns facts, messages, evidence references, and a review of a particular revision. A changed fact invalidates the earlier review. Applied tool-call IDs persist with the case so replayed proposals cannot apply twice.",
    diagram: {
      entities: [
        {
          name: "Case",
          fields: [
            "id, language, service",
            "state, revision",
            "facts, appliedCallIds",
            "review"
          ]
        },
        {
          name: "Fact",
          fields: [
            "field, value, status",
            "source, sourceRef, quote",
            "alternatives, revision"
          ]
        },
        {
          name: "Message",
          fields: [
            "id, caseId, speaker",
            "text, mode, state"
          ]
        },
        {
          name: "Evidence",
          fields: [
            "id, caseId, name, mime",
            "path, purpose, check"
          ]
        },
        {
          name: "Review",
          fields: [
            "caseId, revision",
            "draftHash, receipt, reviewedAt"
          ]
        }
      ],
      relations: [
        {
          from: "Case",
          to: "Fact",
          label: "records field-level provenance"
        },
        {
          from: "Case",
          to: "Message",
          label: "conversation"
        },
        {
          from: "Case",
          to: "Evidence",
          label: "sample documents"
        },
        {
          from: "Case",
          to: "Review",
          label: "exact revision reviewed"
        }
      ]
    }
  },
  decisions: [],
  funFacts: []
};
