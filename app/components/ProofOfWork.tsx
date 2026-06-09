"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { PROJECTS, type BadgeVariant, type Project } from "../data/projects.data";

// ─── Badge palette (mirrors ProjectCard, tuned for light + dark) ──────────────

const BADGE_STYLES: Record<BadgeVariant, string> = {
  live: "bg-[#c8410a] text-[#f2efe8]",
  ai: "bg-[#2d4a3e] text-[#a8d5c4]",
  work: "bg-[#2a3a5c] text-[#a8bde8]",
  client: "bg-[#0a0a0a] text-[#f2efe8] dark:bg-white dark:text-black",
  event: "bg-[#3a2a0a] text-[#e8c87a]",
  backend: "bg-[#1a1a1a] text-[#bbb]",
  research: "bg-[#2a1a3a] text-[#c8a8e8]",
};

// ─── Card ─────────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function ProofCard({ project }: { project: Project }) {
  const primaryUrl = project.liveUrl ?? project.githubUrl;

  return (
    <motion.article
      variants={fadeUp}
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/40 p-5 transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20 dark:hover:bg-white/[0.04] sm:p-6"
    >
      {/* Ghost index, top-right */}
      <span
        className="pointer-events-none absolute right-4 top-2 select-none font-instrument-serif italic leading-none text-black/[0.04] dark:text-white/[0.06]"
        style={{ fontSize: "64px" }}
        aria-hidden
      >
        {project.index}
      </span>

      <div className="relative flex flex-col gap-3">
        <span
          className={`inline-block w-fit font-mono text-[8px] uppercase tracking-[0.2em] px-[7px] py-[3px] ${BADGE_STYLES[project.badgeVariant]}`}
        >
          {project.badge}
        </span>

        <div>
          <h3
            className="font-instrument-serif font-normal leading-[1.05] text-[#0a0a0a] dark:text-white"
            style={{ fontSize: "clamp(22px,4vw,28px)", letterSpacing: "-0.015em" }}
          >
            {project.title}
          </h3>
          <p className="mt-0.5 font-mono text-[10px] tracking-[0.04em] text-gray-400 dark:text-gray-500">
            {project.tagline}
          </p>
        </div>

        <p className="max-w-[60ch] text-[13px] leading-[1.65] text-gray-600 dark:text-gray-400">
          {project.description}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1">
          {project.stats.map((s) => (
            <div key={s.label} className="flex items-baseline gap-1.5">
              <span className="font-instrument-serif italic text-[18px] leading-none text-[#0a0a0a] dark:text-white">
                {s.value}
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Stack */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
          {project.stack.map((s, i) => (
            <span
              key={s}
              className="font-mono text-[9px] tracking-[0.04em] text-gray-400 dark:text-gray-500"
            >
              {s}
              {i < project.stack.length - 1 && (
                <span className="ml-3 text-gray-300 dark:text-gray-700">/</span>
              )}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 pt-2">
          {project.liveUrl && (
            <Link
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 border-b border-[#0a0a0a] pb-px font-mono text-[9px] uppercase tracking-[0.12em] text-[#0a0a0a] transition-colors hover:border-[#c8410a] hover:text-[#c8410a] dark:border-white dark:text-white"
            >
              Live <ArrowUpRight className="h-2.5 w-2.5" />
            </Link>
          )}
          {project.githubUrl && (
            <Link
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 border-b border-gray-300 pb-px font-mono text-[9px] uppercase tracking-[0.12em] text-gray-500 transition-colors hover:border-[#c8410a] hover:text-[#c8410a] dark:border-white/30 dark:text-gray-400"
            >
              Source
            </Link>
          )}
        </div>
      </div>

      {/* Whole-card affordance — covers the card, sits under explicit links */}
      {primaryUrl && (
        <Link
          href={primaryUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${project.title}`}
          className="absolute inset-0 z-0"
        />
      )}
    </motion.article>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function ProofOfWork() {
  const featured = PROJECTS.slice(0, 3);

  return (
    <section className="mb-16 w-full text-left">
      {/* Heading */}
      <div className="mb-8">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
          Proof of Work
        </p>
        <h2
          className="font-instrument-serif font-normal leading-[0.95] text-[#0a0a0a] dark:text-white"
          style={{ fontSize: "clamp(34px,6vw,52px)", letterSpacing: "-0.02em" }}
        >
          Check out my latest{" "}
          <em className="italic text-[#c8410a]">work</em>
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
          A range of projects — from full-stack SaaS platforms to AI agents.
        </p>
      </div>

      {/* Top 3 cards */}
      <motion.div
        className="relative z-10 space-y-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-48px" }}
        transition={{ staggerChildren: 0.08 }}
      >
        {featured.map((project) => (
          <ProofCard key={project.id} project={project} />
        ))}
      </motion.div>

      {/* Show more */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/projects"
          className="group inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-black transition-all hover:bg-black hover:text-white dark:border-white/15 dark:text-white dark:hover:bg-white dark:hover:text-black"
        >
          Show more
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
