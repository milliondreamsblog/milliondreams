"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Project, BadgeVariant } from "../data/projects.data";

// ─── Badge ────────────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<BadgeVariant, string> = {
  live:     "bg-[#c8410a] text-[#f2efe8]",
  ai:       "bg-[#2d4a3e] text-[#a8d5c4]",
  work:     "bg-[#2a3a5c] text-[#a8bde8]",
  client:   "bg-[#0a0a0a] text-[#f2efe8]",
  event:    "bg-[#3a2a0a] text-[#e8c87a]",
  backend:  "bg-[#1a1a1a] text-[#888]",
  research: "bg-[#2a1a3a] text-[#c8a8e8]",
};

function Badge({ label, variant }: { label: string; variant: BadgeVariant }) {
  return (
    <span className={`inline-block font-mono text-[8px] tracking-[0.2em] uppercase px-[7px] py-[3px] ${BADGE_STYLES[variant]}`}>
      {label}
    </span>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const GithubIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const ExternalIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// ─── Shared sub-components ────────────────────────────────────────────────────

function EntryIndex({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="font-instrument-serif italic text-[11px] text-[#c8c3b8]">{value}</span>
      <span className="w-8 h-px bg-[rgba(10,10,10,0.12)] dark:bg-white/20" />
    </div>
  );
}

function StatBlock({ stats, vertical = false }: { stats: Project["stats"]; vertical?: boolean }) {
  return (
    <div className={`flex ${vertical ? "flex-col" : "flex-row"} border-t border-b border-[rgba(10,10,10,0.1)] dark:border-white/10 mb-5`}>
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={[
            "py-3",
            vertical  ? (i < stats.length - 1 ? "border-b border-[rgba(10,10,10,0.1)] dark:border-white/10" : "") : "flex-1",
            !vertical ? (i > 0 ? "pl-4 ml-4 border-l border-[rgba(10,10,10,0.1)] dark:border-white/10" : "") : "",
          ].join(" ")}
        >
          <div className="font-instrument-serif italic text-[24px] leading-none text-[#0a0a0a] dark:text-white">
            {s.value}
          </div>
          <div className="font-mono text-[8px] tracking-[0.12em] uppercase text-[#c8c3b8] mt-1">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function BulletList({ bullets }: { bullets: string[] }) {
  return (
    <ul className="mb-5">
      {bullets.map((b) => (
        <li key={b} className="flex gap-2 items-baseline py-[5px] border-t border-[rgba(10,10,10,0.08)] dark:border-white/10 text-[11.5px] text-[rgba(10,10,10,0.5)] dark:text-gray-400 leading-relaxed">
          <span className="font-instrument-serif italic text-[#c8c3b8] flex-shrink-0 text-[13px]">—</span>
          {b}
        </li>
      ))}
    </ul>
  );
}

function StackRow({ stack }: { stack: string[] }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4">
      {stack.map((s, i) => (
        <span key={s} className="font-mono text-[9px] tracking-[0.06em] text-[rgba(10,10,10,0.35)] dark:text-gray-500 border-b border-[rgba(10,10,10,0.12)] dark:border-white/10 pb-px">
          {s}{i < stack.length - 1 ? " /" : ""}
        </span>
      ))}
    </div>
  );
}

function LinkRow({ githubUrl, liveUrl }: Pick<Project, "githubUrl" | "liveUrl">) {
  const cls = "flex items-center gap-[6px] font-mono text-[9px] tracking-[0.12em] uppercase text-[#0a0a0a] dark:text-white border-b border-[#0a0a0a] dark:border-white pb-px hover:text-[#c8410a] hover:border-[#c8410a] transition-colors duration-150";
  return (
    <div className="flex gap-4 items-center">
      {githubUrl && <Link href={githubUrl} target="_blank" rel="noopener" className={cls}><GithubIcon /> Source</Link>}
      {liveUrl   && <Link href={liveUrl}   target="_blank" rel="noopener" className={cls}><ExternalIcon /> Live</Link>}
    </div>
  );
}

// ─── Layout: Hero (2-col, ghost number, large title) ─────────────────────────

function HeroLayout({ p }: { p: Project }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-start">
      <div>
        <EntryIndex value={p.index} />
        <Badge label={p.badge} variant={p.badgeVariant} />
        <div className="font-instrument-serif italic leading-[0.85] text-[#0a0a0a] dark:text-white select-none pointer-events-none mt-3 mb-[-20px]"
          style={{ fontSize: "clamp(72px,10vw,120px)", opacity: 0.05, letterSpacing: "-0.04em" }} aria-hidden>
          {p.stats[0]?.value}
        </div>
        <h2 className="font-instrument-serif font-normal text-[#0a0a0a] dark:text-white leading-[1.0] mt-2 mb-1"
          style={{ fontSize: "clamp(28px,4vw,42px)", letterSpacing: "-0.02em" }}>
          {p.title}
        </h2>
        <p className="font-mono text-[10px] tracking-[0.05em] text-[#c8c3b8] mb-5">{p.tagline}</p>
        <StatBlock stats={p.stats} />
      </div>
      <div className="pt-1">
        <p className="text-[13px] text-[rgba(10,10,10,0.55)] dark:text-gray-400 leading-[1.7] mb-5 max-w-[46ch]">{p.description}</p>
        <BulletList bullets={p.bullets} />
        <StackRow stack={p.stack} />
        <LinkRow githubUrl={p.githubUrl} liveUrl={p.liveUrl} />
      </div>
    </div>
  );
}

// ─── Layout: Sidebar (narrow left stats, wide right content) ─────────────────

function SidebarLayout({ p }: { p: Project }) {
  return (
    <div className="grid grid-cols-[160px_1fr] md:grid-cols-[200px_1fr] gap-10 md:gap-12 items-start">
      <div>
        <EntryIndex value={p.index} />
        <Badge label={p.badge} variant={p.badgeVariant} />
        <div className="font-instrument-serif italic text-[#0a0a0a] dark:text-white leading-[0.85] mt-3 select-none"
          style={{ fontSize: "72px", opacity: 0.06 }} aria-hidden>
          {p.title.slice(0, 2)}
        </div>
        <div className="flex flex-col mt-4 border-t border-[rgba(10,10,10,0.1)] dark:border-zinc-800">
          {p.stats.map((s, i) => (
            <div key={s.label} className={`py-3 ${i < p.stats.length - 1 ? "border-b border-[rgba(10,10,10,0.1)] dark:border-zinc-800" : ""}`}>
              <div className="font-instrument-serif italic text-[22px] leading-none text-[#0a0a0a] dark:text-white">{s.value}</div>
              <div className="font-mono text-[8px] tracking-[0.1em] uppercase text-[#c8c3b8] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="pt-1">
        <h2 className="font-instrument-serif font-normal text-[#0a0a0a] dark:text-white leading-[1.0] mb-1"
          style={{ fontSize: "clamp(24px,3vw,36px)", letterSpacing: "-0.02em" }}>
          {p.title}
        </h2>
        <p className="font-mono text-[10px] tracking-[0.05em] text-[#c8c3b8] mb-5">{p.tagline}</p>
        <p className="text-[13px] text-[rgba(10,10,10,0.55)] dark:text-gray-400 leading-[1.7] mb-5 max-w-[52ch]">{p.description}</p>
        <BulletList bullets={p.bullets} />
        <StackRow stack={p.stack} />
        <LinkRow githubUrl={p.githubUrl} liveUrl={p.liveUrl} />
      </div>
    </div>
  );
}

// ─── Layout: Standard (single col, compact — tier 2) ─────────────────────────

function StandardLayout({ p }: { p: Project }) {
  return (
    <div>
      <EntryIndex value={p.index} />
      <Badge label={p.badge} variant={p.badgeVariant} />
      <h2 className="font-instrument-serif font-normal text-[#0a0a0a] dark:text-white leading-[1.05] mt-2 mb-1"
        style={{ fontSize: "22px", letterSpacing: "-0.015em" }}>
        {p.title}
      </h2>
      <p className="font-mono text-[9px] tracking-[0.06em] text-[#c8c3b8] mb-4">{p.tagline}</p>
      <StatBlock stats={p.stats} />
      <p className="text-[12px] text-[rgba(10,10,10,0.5)] dark:text-gray-400 leading-[1.65] mb-4">{p.description}</p>
      <BulletList bullets={p.bullets} />
      <StackRow stack={p.stack} />
      <LinkRow githubUrl={p.githubUrl} liveUrl={p.liveUrl} />
    </div>
  );
}

// ─── ProjectCard — dispatches to layout, handles animation ───────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as any } 
  },
} as any;

export function ProjectCard({ project }: { project: Project }) {
  const layout = project.layout ?? "standard";
  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-48px" }}
      className="py-10 border-b border-[rgba(10,10,10,0.1)] dark:border-white/10"
    >
      {layout === "hero"     && <HeroLayout    p={project} />}
      {layout === "sidebar"  && <SidebarLayout p={project} />}
      {layout === "standard" && <StandardLayout p={project} />}
    </motion.article>
  );
}
