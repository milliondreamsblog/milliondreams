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

