"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Globe, Github, ArrowRight } from "lucide-react";
import { PROJECTS, type Project } from "../data/projects.data";

// ─── Tech badge icons (Simple Icons CDN, same source as TechStack) ────────────

const TECH_SLUGS: Record<string, string> = {
  "Next.js": "nextdotjs",
  "Next.js 15": "nextdotjs",
  React: "react",
  "React Native": "react",
  TypeScript: "typescript",
  JavaScript: "javascript",
  Tailwind: "tailwindcss",
  "Tailwind CSS": "tailwindcss",
  PostgreSQL: "postgresql",
  Prisma: "prisma",
  Razorpay: "razorpay",
  Golang: "go",
  Go: "go",
  AWS: "amazonwebservices",
  "Spring Boot": "springboot",
  Python: "python",
  LangChain: "langchain",
  FastAPI: "fastapi",
  OpenAI: "openai",
  "Node.js": "nodedotjs",
  Express: "express",
  MongoDB: "mongodb",
  Mongoose: "mongoose",
  PyTorch: "pytorch",
  Vercel: "vercel",
  "Framer Motion": "framer",
  JWT: "jsonwebtokens",
};

function TechBadge({ label }: { label: string }) {
  const slug = TECH_SLUGS[label];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300">
      {slug && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://cdn.simpleicons.org/${slug}`}
          alt=""
          width={13}
          height={13}
          loading="lazy"
          className="h-3.5 w-3.5 object-contain opacity-80 brightness-0 dark:brightness-0 dark:invert"
        />
      )}
      {label}
    </span>
  );
}

// ─── Thumbnail (real image, else typographic placeholder) ─────────────────────

function Thumbnail({ project }: { project: Project }) {
  if (project.image) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-gray-200 dark:border-white/10">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="200px"
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 px-3 text-center dark:border-white/10 dark:bg-zinc-900">
      <span className="font-instrument-serif italic text-xl leading-tight text-gray-300 dark:text-zinc-600">
        {project.title}
      </span>
    </div>
  );
}

