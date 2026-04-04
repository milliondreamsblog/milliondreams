"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
    {
        name: "Languages",
        skills: [
            { name: "Java", slug: "openjdk" },
            { name: "Python", slug: "python" },
            { name: "TypeScript", slug: "typescript" },
            { name: "JavaScript", slug: "javascript" },
            { name: "Go", slug: "go" },
        ]
    },
    {
        name: "Frontend",
        skills: [
            { name: "React", slug: "react" },
            { name: "Next.js", slug: "nextdotjs" },
            { name: "Tailwind CSS", slug: "tailwindcss" },
            { name: "Redux", slug: "redux" },
            { name: "Framer Motion", slug: "framer" },
        ]
    },
    {
        name: "Backend & DB",
        skills: [
            { name: "Node.js", slug: "nodedotjs" },
            { name: "Express", slug: "express" },
            { name: "Spring Boot", slug: "springboot" },
            { name: "PostgreSQL", slug: "postgresql" },
            { name: "MySQL", slug: "mysql" },
        ]
    },
    {
        name: "Infra & Tools",
        skills: [
            { name: "Docker", slug: "docker" },
            { name: "AWS", slug: "amazonwebservices" },
            { name: "Vercel", slug: "vercel" },
            { name: "Git", slug: "git" },
            { name: "GitHub", slug: "github" },
        ]
    },
    {
        name: "AI & ML",
        skills: [
            { name: "LangChain", slug: "langchain" },
            { name: "OpenAI", slug: "openai" },
            { name: "PyTorch", slug: "pytorch" },
            { name: "TensorFlow", slug: "tensorflow" },
        ]
    }
];

const marqueeSkills = categories.flatMap(c => c.skills);

export function TechStack() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="w-full space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black dark:hover:text-white transition-all duration-300"
                >
                    {isExpanded ? "Show Less" : "View Full Stack"}
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {!isExpanded ? (
                    <motion.div
                        key="marquee"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
                    >
                        <div className="flex w-max animate-infinite-scroll">
                            <div className="flex gap-12 py-4 pr-12">
                                {marqueeSkills.map((tech, index) => (
                                    <div key={index} className="flex flex-col items-center justify-center gap-2">
                                        <div className="h-10 w-10 transition-all duration-300">
                                            <img
                                                src={`https://cdn.simpleicons.org/${tech.slug}`}
                                                alt={tech.name}
                                                className="h-full w-full object-contain opacity-80 hover:opacity-100 transition-all duration-300 brightness-0 hover:brightness-100 dark:brightness-0 dark:invert dark:hover:invert-0 dark:hover:brightness-100"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-12 py-4 pr-12">
                                {marqueeSkills.map((tech, index) => (
                                    <div key={index + marqueeSkills.length} className="flex flex-col items-center justify-center gap-2">
                                        <div className="h-10 w-10 transition-all duration-300">
                                            <img
                                                src={`https://cdn.simpleicons.org/${tech.slug}`}
                                                alt={tech.name}
                                                className="h-full w-full object-contain opacity-80 hover:opacity-100 transition-all duration-300 brightness-0 hover:brightness-100 dark:brightness-0 dark:invert dark:hover:invert-0 dark:hover:brightness-100"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 pt-4">
                            {categories.map((category) => (
                                <div key={category.name} className="space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-zinc-800 pb-2">
                                        {category.name}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {category.skills.map((skill) => (
                                            <div
                                                key={skill.name}
                                                className="group flex items-center gap-3 rounded-lg border border-transparent p-2 transition-all hover:border-gray-100 dark:hover:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-900/50"
                                            >
                                                <div className="h-5 w-5 shrink-0 transition-all duration-300">
                                                    <img
                                                        src={`https://cdn.simpleicons.org/${skill.slug}`}
                                                        alt={skill.name}
                                                        className="h-full w-full object-contain opacity-50 group-hover:opacity-100 transition-all duration-300 brightness-0 group-hover:brightness-100 dark:brightness-0 dark:invert dark:group-hover:invert-0 dark:group-hover:brightness-100"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                                                    {skill.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
