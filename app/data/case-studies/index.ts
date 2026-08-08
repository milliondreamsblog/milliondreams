import type { CaseStudy } from "./types";

/**
 * Registry of case studies, keyed by Project.id. Add a new case study by
 * creating app/data/case-studies/<slug>.ts and importing it here.
 */
export const CASE_STUDIES: Record<string, CaseStudy> = {};

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES[slug];
}
