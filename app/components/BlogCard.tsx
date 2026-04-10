"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { BlogPost } from "../data/blog.data";

// ─── Per-letter colorful title ────────────────────────────────────────────────

const LETTER_COLORS = [
  "#e63946",
  "#457b9d",
  "#e9c46a",
  "#2a9d8f",
  "#f4a261",
  "#6a4c93",
];

function ColorfulTitle({ text }: { text: string }) {
  let colorIndex = 0;
  return (
    <span>
      {text.split("").map((char, i) => {
        if (char === " ") {
          return <span key={i}>&nbsp;</span>;
        }
        const color = LETTER_COLORS[colorIndex % LETTER_COLORS.length];
        colorIndex++;
        return (
          <span key={i} style={{ color }}>
            {char}
          </span>
        );
      })}
    </span>
  );
}

// ─── Oval image ───────────────────────────────────────────────────────────────

function OvalImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="relative mx-auto mb-6 overflow-hidden"
      style={{
        width: "160px",
        height: "200px",
        borderRadius: "50% 50% 50% 50% / 38% 38% 62% 62%",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover grayscale"
        sizes="160px"
      />
    </div>
  );
}

// ─── BlogCard ─────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as any },
  },
};

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="flex flex-col items-center text-center group cursor-pointer"
      onClick={() => window.open(post.url, "_blank", "noopener,noreferrer")}
    >
      {/* Oval image */}
      <OvalImage src={post.image} alt={post.title} />

      {/* Date + Category */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-gray-400 dark:text-gray-500">
          {post.date}
        </span>
        <span
          className="font-mono text-[9px] tracking-[0.18em] uppercase"
          style={{ color: post.categoryColor }}
        >
          • {post.category}
        </span>
      </div>

      {/* Colorful title */}
      <h3
        className="font-instrument-serif italic leading-snug mb-3 px-2"
        style={{ fontSize: "clamp(17px, 2.2vw, 22px)" }}
      >
        <ColorfulTitle text={post.title} />
      </h3>

      {/* Description */}
      <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed mb-5 max-w-[22ch] px-1">
        {post.description}
      </p>

      {/* Read fragment link */}
      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#2b9eb3] underline underline-offset-4 decoration-[#2b9eb3]/40 hover:decoration-[#2b9eb3] transition-all duration-200"
      >
        Read fragment
      </a>
    </motion.article>
  );
}
