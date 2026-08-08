"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useNav } from "../context/NavContext";
import { getMarkdownContent } from "../data/content";
import {
  PROJECTS,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  type ProjectCategory,
} from "../data/projects.data";
import { ProjectCard } from "../components/ProjectCard";
import { PostCard } from "../components/PostCard";
import { useState, useEffect, useMemo } from "react";

type Filter = ProjectCategory | "all";

// ─── Section divider ──────────────────────────────────────────────────────────

function SectionRule({ label, count }: { label: string; count: string }) {
  return (
    <div className="flex items-center gap-4 py-8 border-b border-[rgba(10,10,10,0.1)] dark:border-white/10">
      <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#c8c3b8] whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-[rgba(10,10,10,0.08)]" />
      <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#c8c3b8] whitespace-nowrap">
        {count}
      </span>
    </div>
  );
}

// ─── Category tabs ────────────────────────────────────────────────────────────

function CategoryTabs({
  active,
  counts,
  onChange,
}: {
  active: Filter;
  counts: Record<Filter, number>;
  onChange: (f: Filter) => void;
}) {
  const tabs: Filter[] = ["all", ...CATEGORY_ORDER];

  return (
    <div
      role="tablist"
      aria-label="Filter projects by category"
      className="flex flex-wrap items-center gap-x-6 gap-y-3 py-5 border-b border-[rgba(10,10,10,0.1)] dark:border-white/10"
    >
      {tabs.map((t) => {
        const isActive = t === active;
        const label = t === "all" ? "All" : CATEGORY_LABELS[t];
        return (
          <button
            key={t}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t)}
            className={`relative font-mono text-[10px] tracking-[0.18em] uppercase pb-1.5 transition-colors ${
              isActive
                ? "text-[#c8410a]"
                : "text-[#c8c3b8] hover:text-[#0a0a0a] dark:hover:text-white"
            }`}
          >
            {label}
            <sup className="ml-1 text-[8px] tabular-nums opacity-70">
              {counts[t]}
            </sup>
            {isActive && (
              <motion.span
                layoutId="category-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-px bg-[#c8410a]"
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Grid wrappers ────────────────────────────────────────────────────────────

const BADGE_AVATAR_COLORS: Record<string, string> = {
  live: "#c8410a",
  ai: "#2d4a3e",
  work: "#2a3a5c",
  client: "#0a0a0a",
  event: "#3a2a0a",
  backend: "#333333",
  research: "#2a1a3a",
};

export default function Projects() {
  const { mode } = useNav();
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const markdownContent = getMarkdownContent(time);

  const [filter, setFilter] = useState<Filter>("all");

  // A project counts once per category it belongs to, so these sum above
  // PROJECTS.length — that's expected with multi-category membership.
  const counts = useMemo(() => {
    const c = { all: PROJECTS.length } as Record<Filter, number>;
    for (const key of CATEGORY_ORDER) c[key] = 0;
    for (const p of PROJECTS) for (const key of p.categories) c[key] += 1;
    return c;
  }, []);

  const visible = useMemo(
    () =>
      filter === "all"
        ? PROJECTS
        : PROJECTS.filter((p) => p.categories.includes(filter)),
    [filter],
  );

  const tier1 = visible.filter((p) => p.tier === "tier1");
  const tier2 = visible.filter((p) => p.tier === "tier2");

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center bg-white dark:bg-black px-3 pt-16 text-black dark:text-white selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black pb-32 sm:px-4 sm:pt-24 sm:pb-40 overflow-x-hidden transition-colors duration-300`}
    >
      <AnimatePresence mode="wait">
        {mode === "agent" ? (
          <motion.main
            key="agent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex w-full max-w-2xl flex-col items-start text-left px-4 sm:px-0"
          >
            <pre
              className="w-full whitespace-pre-wrap font-mono text-sm leading-relaxed text-black dark:text-gray-300 selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black antialiased"
              style={{
                fontFamily:
                  '"Courier New", Courier, "Lucida Sans Typewriter", "Lucida Console", monospace',
              }}
            >
              {markdownContent}
            </pre>
          </motion.main>
        ) : (
          <motion.main
            key="human"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex w-full max-w-5xl flex-col items-center"
          >
            <section className="w-full border-t border-[rgba(10,10,10,0.1)] dark:border-white/10">
              {/* Masthead */}
              <div className="flex items-end justify-between py-8 border-b border-[rgba(10,10,10,0.1)] dark:border-white/10">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#c8c3b8] mb-2">
                    selected work
                  </p>
                  <h2
                    className="font-instrument-serif font-normal text-[#0a0a0a] dark:text-white leading-[0.95]"
                    style={{
                      fontSize: "clamp(42px,6vw,64px)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Pro<em className="italic text-[#c8410a]">jects</em>
                  </h2>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] text-[#c8c3b8]">
                    {visible.length.toString().padStart(2, "0")} entries
                  </p>
                  <p className="font-instrument-serif italic text-[14px] text-[#c8c3b8]">
                    2024 — 2026
                  </p>
                </div>
              </div>

              <CategoryTabs
                active={filter}
                counts={counts}
                onChange={setFilter}
              />

              <motion.div
                key={filter}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {/* Tier 1 — stacked, each card full-width */}
                {tier1.length > 0 && (
                  <div className="divide-y divide-[rgba(10,10,10,0.05)]">
                    {tier1.map((p) => (
                      <ProjectCard key={p.id} project={p} />
                    ))}
                  </div>
                )}

                {/* Tier 2 — PostCard grid */}
                {tier2.length > 0 && (
                  <>
                    <SectionRule
                      label={tier1.length > 0 ? "Supporting work" : "Entries"}
                      count={`${tier2.length.toString().padStart(2, "0")} entries`}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 py-4">
                      {tier2.map((p) => (
                        <PostCard
                          key={p.id}
                          avatarFallback={p.title.slice(0, 2).toUpperCase()}
                          avatarColor={
                            BADGE_AVATAR_COLORS[p.badgeVariant] ?? "#333"
                          }
                          title={`${p.title} · ${p.tagline}`}
                          tags={p.stack
                            .slice(0, 4)
                            .map(
                              (s) => `#${s.toLowerCase().replace(/[\s.]/g, "")}`,
                            )}
                          date={`Entry ${p.index}`}
                          readTime={p.badge}
                          actionLabel="Case study"
                          actionUrl={`/projects/${p.id}`}
                          secondaryUrl={p.liveUrl ?? p.githubUrl}
                          secondaryLabel={p.liveUrl ? "View live" : "Source"}
                        />
                      ))}
                    </div>
                  </>
                )}
              </motion.div>

              {/* Footer note */}
              <div className="flex justify-between items-center mt-12 py-8 border-t border-[rgba(10,10,10,0.1)] dark:border-white/10">
                <span className="font-instrument-serif italic text-[14px] text-[#c8c3b8]">
                  Akshat Darshi · Full Stack & AI Engineer
                </span>
                <span className="font-mono text-[10px] tracking-widest text-[#c8c3b8]">
                  2024 — 2026
                </span>
              </div>
            </section>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
