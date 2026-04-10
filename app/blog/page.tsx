"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useNav } from "../context/NavContext";
import { getMarkdownContent } from "../data/content";
import { BLOG_POSTS } from "../data/blog.data";
import { BlogCard } from "../components/BlogCard";
import { useState, useEffect } from "react";

export default function Blog() {
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

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-white dark:bg-black px-3 pt-16 text-black dark:text-white selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black pb-32 sm:px-4 sm:pt-24 sm:pb-40 overflow-x-hidden transition-colors duration-300">
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
            className="flex w-full max-w-5xl flex-col items-start"
          >
            {/* Header */}
            <div className="mb-16 w-full">
              <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
                Writings & Blogs
              </h1>
              <p className="text-sm font-mono tracking-widest text-gray-400 dark:text-gray-500 uppercase">
                Fragments from{" "}
                <a
                  href="https://substack.com/@akshatdarshi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2b9eb3] hover:underline underline-offset-4 transition-colors"
                >
                  Substack
                </a>
              </p>
            </div>

            {/* Card grid — centred when fewer than 3 posts */}
            <div className="w-full flex flex-wrap justify-start gap-12">
              {BLOG_POSTS.map((post) => (
                <div key={post.id} className="w-full sm:w-[260px]">
                  <BlogCard post={post} />
                </div>
              ))}
            </div>

            {/* Footer CTA */}
            <div className="mt-20 w-full border-t border-[rgba(10,10,10,0.1)] dark:border-white/10 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-[13px] text-gray-500 dark:text-gray-400 max-w-[40ch] leading-relaxed">
                More essays, notes, and long-form thoughts live on Substack. New
                pieces drop irregularly — worth subscribing.
              </p>
              <a
                href="https://substack.com/@akshatdarshi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 font-mono text-[10px] tracking-[0.18em] uppercase border border-black dark:border-white px-5 py-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200"
              >
                View all on Substack →
              </a>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
