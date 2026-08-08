import type { CaseStudy } from "./types";
import { buildinfra } from "./buildinfra";
import { cadence } from "./cadence";
import { bawarchie } from "./bawarchie";
import { roborumble } from "./roborumble";
import { talk2pdf } from "./talk2pdf";
import { evolvesanga } from "./evolvesanga";
import { resumeai } from "./resumeai";

/**
 * Registry of case studies, keyed by Project.id. Add a new case study by
 * creating app/data/case-studies/<slug>.ts and importing it here.
 */
export const CASE_STUDIES: Record<string, CaseStudy> = {
  buildinfra,
  cadence,
  bawarchie,
  roborumble,
  talk2pdf,
  evolvesanga,
  resumeai,
};

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES[slug];
}
