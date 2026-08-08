/**
 * Case-study content model.
 *
 * One CaseStudy per Project (keyed by Project.id). Content lives in
 * app/data/case-studies/<slug>.ts and is registered in index.ts; the page at
 * app/projects/[slug] renders whatever sections are present, so partial case
 * studies are fine while content is being written.
 */

// ─── Architecture diagram ─────────────────────────────────────────────────────

export type NodeKind =
  | "client"
  | "service"
  | "db"
  | "cache"
  | "external"
  | "queue";

export interface DiagramNode {
  id: string;
  label: string;
  kind: NodeKind;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
}

export interface ArchDiagramSpec {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

// ─── Data-model diagram ───────────────────────────────────────────────────────

export interface DbEntity {
  name: string;
  fields: string[];
}

export interface DbRelation {
  from: string;
  to: string;
  label?: string;
}

export interface DbDiagramSpec {
  entities: DbEntity[];
  relations: DbRelation[];
}

// ─── Sections ─────────────────────────────────────────────────────────────────

export interface StackItem {
  tech: string;
  role: string;
  why: string;
}

/** A "Why this, not that" decision card. */
export interface Decision {
  /** What was chosen, e.g. "Shadow DOM" */
  chose: string;
  /** The road not taken, e.g. "an iframe" */
  over: string;
  /** The real tradeoff, 2-4 sentences. */
  body: string;
}

export interface Screenshot {
  /** Path under /public, e.g. "/case-studies/havenai/dashboard.png" */
  src: string;
  caption: string;
}

export interface CaseStudy {
  /** Must match Project.id in projects.data.ts */
  slug: string;
  /** Hero screenshot (path under /public). Omit for a typographic placeholder. */
  heroImage?: string;
  heroCaption?: string;
  /** 3-5 sentence overview, rendered as large serif prose. */
  tldr: string;
  architecture: {
    intro: string;
    diagram: ArchDiagramSpec;
  };
  stack: StackItem[];
  dataModel?: {
    intro: string;
    diagram: DbDiagramSpec;
  };
  decisions: Decision[];
  funFacts: string[];
  /** Extra screenshots below the fold. */
  gallery?: Screenshot[];
}
