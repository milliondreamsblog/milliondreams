# Nivaran

Reviewed 18 September 2026 against the project repository.

## Overview

Nivaran explores how a citizen can prepare a grievance by describing the problem in Hindi or English. Built for Build What Moves India, it has a Next.js web prototype and an Expo app for Android and the browser. The newer app focuses on PF transfer preparation: collect a story, reconcile facts with sample evidence, and review a draft. Voice and model responses can propose facts, but the citizen confirms them. Government filing and receipts are simulated, and the project does not claim measured improvements from a completed user study.

## Architecture

The Expo app keeps case rules in a platform-independent TypeScript core. Typed input, guided questions, voice, and document proposals all update the same revisioned case. Native drafts persist in SQLite and web drafts in localStorage. Next.js routes handle chat, sample-document extraction, and short-lived voice tokens. The voice client then connects to Gemini Live over WebSocket. Draft generation and readiness checks remain local and deterministic.

```json
{
  "nodes": [
    {
      "id": "app",
      "label": "Expo app: Android + web",
      "kind": "client"
    },
    {
      "id": "core",
      "label": "TypeScript case rules + draft builder",
      "kind": "service"
    },
    {
      "id": "store",
      "label": "SQLite / localStorage",
      "kind": "db"
    },
    {
      "id": "api",
      "label": "Next.js chat, extraction + token routes",
      "kind": "service"
    },
    {
      "id": "model",
      "label": "Gemini chat + document extraction",
      "kind": "external"
    },
    {
      "id": "voice",
      "label": "Gemini Live voice session",
      "kind": "external"
    }
  ],
  "edges": [
    {
      "from": "app",
      "to": "core",
      "label": "facts, confirmations + review"
    },
    {
      "from": "app",
      "to": "store",
      "label": "save and restore case bundle"
    },
    {
      "from": "app",
      "to": "api",
      "label": "chat, sample documents + voice token"
    },
    {
      "from": "api",
      "to": "model",
      "label": "configured model requests"
    },
    {
      "from": "app",
      "to": "voice",
      "label": "audio + proposed facts"
    },
    {
      "from": "voice",
      "to": "core",
      "label": "validate proposals before applying"
    }
  ]
}
```

## Tech stack

- Expo + React Native: Android and browser app. Shared screens keep the interview, facts, and review steps consistent across both clients.
- TypeScript: Case state and preparation rules. The core models proposed, confirmed, unknown, and conflicting facts explicitly. It has no React Native or network dependency.
- Next.js + React: Web prototype and API routes. One server hosts the original demo, the separate research flow, and the mobile app's model endpoints.
- Gemini Live: Voice conversation. A WebSocket session carries audio, transcripts, and tool proposals. The server issues the session token.
- SQLite + localStorage: Draft persistence. Native and browser adapters save the same case bundle, including the current revision and review.

## Data model

This is a local case model, not a government records database. Each case owns facts, messages, evidence references, and a review of a particular revision. A changed fact invalidates the earlier review. Applied tool-call IDs persist with the case so replayed proposals cannot apply twice.

```json
{
  "entities": [
    {
      "name": "Case",
      "fields": [
        "id, language, service",
        "state, revision",
        "facts, appliedCallIds",
        "review"
      ]
    },
    {
      "name": "Fact",
      "fields": [
        "field, value, status",
        "source, sourceRef, quote",
        "alternatives, revision"
      ]
    },
    {
      "name": "Message",
      "fields": [
        "id, caseId, speaker",
        "text, mode, state"
      ]
    },
    {
      "name": "Evidence",
      "fields": [
        "id, caseId, name, mime",
        "path, purpose, check"
      ]
    },
    {
      "name": "Review",
      "fields": [
        "caseId, revision",
        "draftHash, receipt, reviewedAt"
      ]
    }
  ],
  "relations": [
    {
      "from": "Case",
      "to": "Fact",
      "label": "records field-level provenance"
    },
    {
      "from": "Case",
      "to": "Message",
      "label": "conversation"
    },
    {
      "from": "Case",
      "to": "Evidence",
      "label": "sample documents"
    },
    {
      "from": "Case",
      "to": "Review",
      "label": "exact revision reviewed"
    }
  ]
}
```

## Decisions

### Explicit fact confirmation

A model response becomes a proposal with a source and quote. Conflicting dates stay visible until the citizen resolves them. This adds a confirmation step, but prevents a plausible extraction from silently becoming an accepted fact.

### Deterministic draft generation

The draft builder uses confirmed facts and keeps uncertainty explicit. Readiness and review operate on the same case revision, so changing a fact cannot leave an old approval attached to new text.

### A focused PF transfer demo

The current core supports preparation for a transfer grievance and blocks unsupported services. Sample documents and simulated receipts make the demonstrated scope clear. The separate research prototype can be evaluated without presenting a demo as a government submission.

### Local draft storage

SQLite on Android and localStorage in the browser preserve the case between sessions. This makes the prototype usable without a hosted identity service, with the tradeoff that drafts do not sync between devices.

## Sources

- [Project repository](https://github.com/milliondreamsblog/nivaran)
- [README](https://github.com/milliondreamsblog/nivaran/blob/main/README.md)

- [Case types](https://github.com/milliondreamsblog/nivaran/blob/main/mobile/src/core/types.ts)
- [Core contracts and demo scope](https://github.com/milliondreamsblog/nivaran/blob/main/mobile/src/core/README.md)
- [Voice session](https://github.com/milliondreamsblog/nivaran/blob/main/mobile/src/voice/session.ts)
- [Native storage](https://github.com/milliondreamsblog/nivaran/blob/main/mobile/src/db/store.native.ts)
- [Web storage](https://github.com/milliondreamsblog/nivaran/blob/main/mobile/src/db/store.web.ts)

## Visuals

The repository's `public/shots/dashboard.png` is an existing capture of the original seeded web demo. Its caption distinguishes it from the newer PF preparation app.

## Gaps

No verified public deployment URL or completed participant-study results were found. The portfolio links to source and does not imply government integration, unrestricted document extraction, or measured user impact.
