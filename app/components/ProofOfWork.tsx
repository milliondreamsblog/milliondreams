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

