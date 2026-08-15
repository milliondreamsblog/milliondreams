import type { CaseStudy } from "./types";
import { havenai } from "./havenai";
import { buildinfra } from "./buildinfra";
import { cadence } from "./cadence";
import { bawarchie } from "./bawarchie";
import { roborumble } from "./roborumble";
import { talk2pdf } from "./talk2pdf";
import { evolvesanga } from "./evolvesanga";
import { resumeai } from "./resumeai";
import { contractrisk } from "./contractrisk";
import { kirtanam } from "./kirtanam";
import { brandvoiceagent } from "./brandvoiceagent";
import { cmoagent } from "./cmoagent";
import { elvynchess } from "./elvynchess";
import { projectmanager } from "./projectmanager";
import { rbac } from "./rbac";
import { ehm } from "./ehm";
import { misinformation } from "./misinformation";
import { arthenic } from "./arthenic";

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
  contractrisk,
  kirtanam,
  havenai,
  brandvoiceagent,
  cmoagent,
  elvynchess,
  projectmanager,
  rbac,
  ehm,
  misinformation,
  arthenic,
};

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES[slug];
}
