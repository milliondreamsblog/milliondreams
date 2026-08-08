import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PROJECTS, type Project } from "../../data/projects.data";
import { CASE_STUDIES } from "../../data/case-studies";
import type { CaseStudy } from "../../data/case-studies/types";
import { ArchDiagram } from "../../components/case-study/ArchDiagram";
import { DbDiagram } from "../../components/case-study/DbDiagram";
import { Comments } from "../../components/case-study/Comments";

// ─── Shared building blocks ───────────────────────────────────────────────────

function SectionHeader({ no, label, title }: { no: string; label: string; title: string }) {
  return (
    <div className="pt-16 pb-6">
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#c8c3b8] mb-2">
        {no} — {label}
      </p>
      <h2
        className="font-instrument-serif font-normal text-[#0a0a0a] dark:text-white leading-[1.0]"
        style={{ fontSize: "clamp(26px,3.4vw,38px)", letterSpacing: "-0.02em" }}
      >
        {title}
      </h2>
    </div>
  );
}

function Rule() {
  return <div className="h-px bg-[rgba(10,10,10,0.1)] dark:bg-white/10" />;
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ study, project }: { study: CaseStudy; project: Project }) {
  if (study.heroImage) {
    return (
      <figure className="mt-10">
        <div className="relative border border-[rgba(10,10,10,0.15)] dark:border-white/15 overflow-hidden bg-[#f2efe8] dark:bg-zinc-900">
          <Image
            src={study.heroImage}
            alt={`${project.title} — home screen`}
            width={2400}
            height={1500}
            priority
            className="w-full h-auto"
          />
        </div>
        <figcaption className="font-mono text-[9px] tracking-[0.14em] uppercase text-[#c8c3b8] mt-2 text-right">
          {study.heroCaption ?? `${project.title} — home`}
        </figcaption>
      </figure>
    );
  }
  return (
    <div className="mt-10 border border-[rgba(10,10,10,0.15)] dark:border-white/15 bg-[#f2efe8] dark:bg-zinc-900 px-8 py-20 sm:py-28 text-center overflow-hidden">
      <div
        className="font-instrument-serif italic leading-none text-[#0a0a0a] dark:text-white select-none"
        style={{ fontSize: "clamp(80px,14vw,160px)", opacity: 0.08, letterSpacing: "-0.04em" }}
        aria-hidden
      >
        {project.title.slice(0, 2)}
      </div>
      <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#8a857a] mt-6">
        screenshot en route — {project.tagline}
      </p>
    </div>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function StackTable({ study }: { study: CaseStudy }) {
  return (
    <div className="border-t border-[rgba(10,10,10,0.1)] dark:border-white/10">
      <div className="hidden sm:grid grid-cols-[140px_170px_1fr] gap-6 py-3 border-b border-[rgba(10,10,10,0.08)] dark:border-white/10">
        {["Tech", "Role", "Why this choice"].map((h) => (
          <span key={h} className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#c8c3b8]">
            {h}
          </span>
        ))}
      </div>
      {study.stack.map((s) => (
        <div
          key={s.tech}
          className="grid grid-cols-1 sm:grid-cols-[140px_170px_1fr] gap-1 sm:gap-6 py-4 border-b border-[rgba(10,10,10,0.08)] dark:border-white/10"
        >
          <span className="font-mono text-[11px] text-[#0a0a0a] dark:text-white">{s.tech}</span>
          <span className="text-[11.5px] text-[rgba(10,10,10,0.45)] dark:text-gray-500">{s.role}</span>
          <span className="text-[12.5px] text-[rgba(10,10,10,0.6)] dark:text-gray-400 leading-relaxed">
            {s.why}
          </span>
        </div>
      ))}
    </div>
  );
}

function DecisionCards({ study }: { study: CaseStudy }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {study.decisions.map((d) => (
        <div
          key={d.chose}
          className="border border-[rgba(10,10,10,0.12)] dark:border-white/15 p-6 hover:border-[#c8410a] dark:hover:border-[#c8410a] transition-colors duration-200"
        >
          <div className="flex items-baseline gap-3 flex-wrap mb-1">
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#3e8e6e]">
              ✓ {d.chose}
            </span>
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#c8c3b8] line-through decoration-[#c8410a]/60">
              {d.over}
            </span>
          </div>
          <h3
            className="font-instrument-serif font-normal text-[#0a0a0a] dark:text-white leading-tight mt-2 mb-3"
            style={{ fontSize: "19px", letterSpacing: "-0.01em" }}
          >
            Why {d.chose}, not {d.over}?
          </h3>
          <p className="text-[12.5px] text-[rgba(10,10,10,0.55)] dark:text-gray-400 leading-[1.7]">
            {d.body}
          </p>
        </div>
      ))}
    </div>
  );
}

function FunFacts({ study }: { study: CaseStudy }) {
  return (
    <ol className="border-t border-[rgba(10,10,10,0.1)] dark:border-white/10">
      {study.funFacts.map((f, i) => (
        <li
          key={i}
          className="flex gap-6 items-baseline py-5 border-b border-[rgba(10,10,10,0.08)] dark:border-white/10"
        >
          <span
            className="font-instrument-serif italic text-[#c8410a] leading-none flex-shrink-0 w-10"
            style={{ fontSize: "28px" }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <p className="text-[13px] text-[rgba(10,10,10,0.6)] dark:text-gray-300 leading-[1.7]">{f}</p>
        </li>
      ))}
    </ol>
  );
}

function Gallery({ study }: { study: CaseStudy }) {
  if (!study.gallery?.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
      {study.gallery.map((g) => (
        <figure key={g.src}>
          <div className="border border-[rgba(10,10,10,0.15)] dark:border-white/15 overflow-hidden bg-[#f2efe8] dark:bg-zinc-900">
            <Image src={g.src} alt={g.caption} width={1600} height={1000} className="w-full h-auto" />
          </div>
          <figcaption className="font-mono text-[9px] tracking-[0.14em] uppercase text-[#c8c3b8] mt-2">
            {g.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return Object.keys(CASE_STUDIES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.id === slug);
  if (!project || !CASE_STUDIES[slug]) return {};
  return {
    title: `${project.title} — Case Study`,
    description: project.description,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.id === slug);
  const study = CASE_STUDIES[slug];
  if (!project || !study) notFound();

  let section = 0;
  const no = () => String(++section).padStart(2, "0");

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-white dark:bg-black px-4 pt-20 sm:pt-24 pb-32 text-black dark:text-white transition-colors duration-300">
      <main className="w-full max-w-4xl">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-[#c8c3b8] hover:text-[#c8410a] transition-colors mb-10"
        >
          <ArrowLeft size={12} />
          All projects
        </Link>

        {/* Masthead */}
        <header className="border-t border-b border-[rgba(10,10,10,0.1)] dark:border-white/10 py-10">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#c8c3b8] mb-3">
            case study — entry {project.index}
          </p>
          <h1
            className="font-instrument-serif font-normal text-[#0a0a0a] dark:text-white leading-[0.95]"
            style={{ fontSize: "clamp(44px,7vw,76px)", letterSpacing: "-0.025em" }}
          >
            {project.title}
          </h1>
          <p className="font-mono text-[11px] tracking-[0.05em] text-[#8a857a] mt-4">
            {project.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-8">
            {project.stats.map((s) => (
              <div key={s.label}>
                <span className="font-instrument-serif italic text-[22px] leading-none text-[#0a0a0a] dark:text-white">
                  {s.value}
                </span>
                <span className="font-mono text-[8px] tracking-[0.12em] uppercase text-[#c8c3b8] ml-2">
                  {s.label}
                </span>
              </div>
            ))}
            <div className="flex-1" />
            <div className="flex gap-5">
              {project.liveUrl && (
                <Link
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener"
                  className="font-mono text-[9px] tracking-[0.14em] uppercase border-b border-current pb-px text-[#0a0a0a] dark:text-white hover:text-[#c8410a] transition-colors"
                >
                  Live ↗
                </Link>
              )}
              {project.githubUrl && (
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener"
                  className="font-mono text-[9px] tracking-[0.14em] uppercase border-b border-current pb-px text-[#0a0a0a] dark:text-white hover:text-[#c8410a] transition-colors"
                >
                  Source ↗
                </Link>
              )}
            </div>
          </div>
        </header>

        <Hero study={study} project={project} />

        {/* TL;DR */}
        <SectionHeader no={no()} label="the gist" title="TL;DR" />
        <p
          className="text-[17px] leading-[1.75] text-[rgba(10,10,10,0.7)] dark:text-stone-300 max-w-[62ch]"
          style={{ fontFamily: "var(--font-reading-serif)" }}
        >
          {study.tldr}
        </p>

        <div className="mt-14">
          <Rule />
        </div>

        {/* Architecture */}
        <SectionHeader no={no()} label="how it's wired" title="The system" />
        <p className="text-[13px] text-[rgba(10,10,10,0.55)] dark:text-gray-400 leading-[1.7] max-w-[68ch] mb-8">
          {study.architecture.intro}
        </p>
        <div className="border border-[rgba(10,10,10,0.12)] dark:border-white/15 p-5 sm:p-8">
          <ArchDiagram spec={study.architecture.diagram} />
        </div>

        <div className="mt-14">
          <Rule />
        </div>

        {/* Stack */}
        <SectionHeader no={no()} label="tools of the trade" title="The stack" />
        <StackTable study={study} />

        {/* Data model */}
        {study.dataModel && (
          <>
            <SectionHeader no={no()} label="what it remembers" title="The data" />
            <p className="text-[13px] text-[rgba(10,10,10,0.55)] dark:text-gray-400 leading-[1.7] max-w-[68ch] mb-8">
              {study.dataModel.intro}
            </p>
            <div className="border border-[rgba(10,10,10,0.12)] dark:border-white/15 p-5 sm:p-8">
              <DbDiagram spec={study.dataModel.diagram} />
            </div>
          </>
        )}

        <div className="mt-14">
          <Rule />
        </div>

        {/* Decisions */}
        <SectionHeader no={no()} label="the fork in the road" title="Why this, not that" />
        <DecisionCards study={study} />

        <div className="mt-14">
          <Rule />
        </div>

        {/* Fun facts */}
        <SectionHeader no={no()} label="behind the scenes" title="Fun facts" />
        <FunFacts study={study} />

        {/* Gallery */}
        {study.gallery && study.gallery.length > 0 && (
          <>
            <SectionHeader no={no()} label="more pixels" title="Gallery" />
            <Gallery study={study} />
          </>
        )}

        <div className="mt-14">
          <Rule />
        </div>

        {/* Comments */}
        <SectionHeader no={no()} label="your turn" title="Leave a comment" />
        <p className="text-[13px] text-[rgba(10,10,10,0.55)] dark:text-gray-400 leading-[1.7] max-w-[68ch] mb-8">
          Disagree with a decision? Built something similar? Found a bug? Sign
          in with GitHub and say it below — hot takes welcome.
        </p>
        <Comments />

        {/* Footer */}
        <div className="flex justify-between items-center mt-20 py-8 border-t border-[rgba(10,10,10,0.1)] dark:border-white/10">
          <span className="font-instrument-serif italic text-[14px] text-[#c8c3b8]">
            Akshat Darshi · Full Stack & AI Engineer
          </span>
          <Link
            href="/projects"
            className="font-mono text-[10px] tracking-widest uppercase text-[#c8c3b8] hover:text-[#c8410a] transition-colors"
          >
            ← back to index
          </Link>
        </div>
      </main>
    </div>
  );
}
