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

