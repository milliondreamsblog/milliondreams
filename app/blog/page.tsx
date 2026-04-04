"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useNav } from "../context/NavContext";
import { getMarkdownContent } from "../data/content";
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
                })
            );
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const markdownContent = getMarkdownContent(time);

    return (
        <div className={`relative flex min-h-screen flex-col items-center bg-white dark:bg-black px-3 pt-16 text-black dark:text-white selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black pb-32 sm:px-4 sm:pt-24 sm:pb-40 overflow-x-hidden transition-colors duration-300`}>
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
                            style={{ fontFamily: '"Courier New", Courier, "Lucida Sans Typewriter", "Lucida Console", monospace' }}
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
                        className="flex w-full max-w-2xl flex-col items-center text-center"
                    >
                        <div className="mb-16 w-full text-left">
                            <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-6xl">
                                Writings & Blogs
                            </h1>
                            <p className="w-full text-lg leading-relaxed text-gray-600 dark:text-gray-400 sm:text-xl">
                                I host my thoughts on{" "}
                                <a
                                    href="https://substack.com/@akshatdarshi"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-black dark:text-white underline underline-offset-4 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    Substack
                                </a>{" "}
                                rather than building a custom site. Instead of overengineering and reinventing the wheel, I prefer leveraging a mature platform that lets me focus on what matters: sharing insights on AI systems, product strategy, and technical architecture.
                            </p>
                            
                            <div className="mt-12 space-y-8">
                                <div className="group border-l-2 border-gray-200 dark:border-gray-800 pl-6 transition-all hover:border-black dark:hover:border-white">
                                    <h3 className="text-xl font-bold mb-2">Check out my latest posts</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        I write about engineering, technology, and life. You can find all my articles over at Substack.
                                    </p>
                                    <a 
                                        href="https://substack.com/@akshatdarshi" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-block mt-4 text-sm font-bold uppercase tracking-widest underline underline-offset-4"
                                    >
                                        Visit Substack
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.main>
                )}
            </AnimatePresence>
        </div>
    );
}
