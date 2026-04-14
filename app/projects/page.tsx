"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useNav } from "../context/NavContext";
import { getMarkdownContent } from "../data/content";
import { PROJECTS } from "../data/projects.data";
import { ProjectCard } from "../components/ProjectCard";
import { PostCard } from "../components/PostCard";
import { useState, useEffect } from "react";

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

  const tier1 = PROJECTS.filter((p) => p.tier === "tier1");
  const tier2 = PROJECTS.filter((p) => p.tier === "tier2");

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
                    {PROJECTS.length.toString().padStart(2, "0")} entries
                  </p>
                  <p className="font-instrument-serif italic text-[14px] text-[#c8c3b8]">
                    2024 — 2026
                  </p>
                </div>
              </div>

              {/* Tier 1 — stacked, each card full-width */}
              <div className="divide-y divide-[rgba(10,10,10,0.05)]">
                {tier1.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>

              {/* Tier 2 — PostCard grid */}
              {tier2.length > 0 && (
                <>
                  <SectionRule
                    label="Supporting work"
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
                        actionLabel={p.liveUrl ? "View live" : "Source"}
                        actionUrl={p.liveUrl ?? p.githubUrl ?? "#"}
                        secondaryUrl={
                          p.liveUrl && p.githubUrl ? p.githubUrl : undefined
                        }
                        secondaryLabel="Source"
                      />
                    ))}
                  </div>
                </>
              )}

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
