"use client";

import Image from "next/image";
import { Github, Linkedin, Bot, User, QrCode, X, ArrowRight, Music, Pause, Link } from "lucide-react";
import { ExperienceItem } from "./components/ExperienceItem";
import { GithubGraph } from "./components/GithubGraph";
import { TechStack } from "./components/TechStack";
import { useState, useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import { QRCodeSVG } from "qrcode.react";
import { ThemeToggle } from "./components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

import { PomodoroTimer } from "./components/PomodoroTimer";
import { NeuralNetworkSim } from "./components/NeuralNetworkSim";

import { getMarkdownContent } from "./data/content";

export default function Home() {
  const [time, setTime] = useState<string>("");
  const [showQR, setShowQR] = useState(false);
  const [mode, setMode] = useState<"human" | "agent">("human");

  const { setTheme, resolvedTheme } = useTheme();

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

  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [isLofiPlaying, setIsLofiPlaying] = useState(false);
  const [lofiVolume, setLofiVolume] = useState(1);
  const lofiRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (lofiRef.current) {
      lofiRef.current.volume = lofiVolume;
    }
  }, [lofiVolume]);

  useEffect(() => {
    return () => {
      if (lofiRef.current) {
        lofiRef.current.pause();
        lofiRef.current = null;
      }
    };
  }, []);

  const toggleLofi = () => {
    if (!lofiRef.current) {
      lofiRef.current = new Audio("/lofi.mp3");
      lofiRef.current.loop = true;
      lofiRef.current.volume = lofiVolume;
    }

    if (isLofiPlaying) {
      lofiRef.current.pause();
    } else {
      lofiRef.current.play().catch(e => console.error("Lofi play failed:", e));
    }
    setIsLofiPlaying(!isLofiPlaying);
  };

  const starPositions = useMemo(() => {
    return [...Array(50)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className={`relative flex min-h-screen flex-col items-center bg-white dark:bg-black px-3 pt-16 text-black dark:text-white selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black pb-32 sm:px-4 sm:pt-24 sm:pb-40 overflow-x-hidden transition-colors duration-300`}>
      {/* Easter Egg Effects */}
      <AnimatePresence>
        {showEasterEgg && (
          <>
            {/* Bluish Aura Edge Effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] pointer-events-none shadow-[inset_0_0_150px_rgba(29,78,216,0.5)] dark:shadow-[inset_0_0_150px_rgba(59,130,246,0.4)] transition-opacity duration-1000"
            />
            {/* Twinkling Stars Background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
            >
              {starPositions.map((pos, i) => (
                <motion.div
                  key={i}
                  className="absolute h-[2px] w-[2px] bg-blue-500 dark:bg-white rounded-full shadow-[0_0_4px_rgba(59,130,246,0.8)] dark:shadow-[0_0_3px_white]"
                  style={{
                    top: pos.top,
                    left: pos.left,
                  }}
                  animate={{
                    opacity: [0.2, 1, 0.2],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: pos.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: pos.delay,
                  }}
                />
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Theme Toggle in Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <AnimatePresence mode="wait">
        {mode === "agent" ? (
          /* Agent Mode - Markdown View */
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
          /* Human Mode - Original View */
          <motion.main
            key="human"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex w-full max-w-2xl flex-col items-center text-center"
          >
            {/* Profile Image - Easter Egg Trigger */}
            <button
              onClick={() => setShowEasterEgg(!showEasterEgg)}
              className="group relative mb-2 h-40 w-40 grayscale filter sm:h-56 sm:w-56 overflow-hidden cursor-pointer transition-all duration-500 hover:grayscale-0 active:scale-95"
              aria-label="Toggle Aura Mode"
            >
              <Image
                src="/me2.png" // User's photo
                alt="Profile"
                fill
                className={`object-contain transition-all duration-700 ${showEasterEgg ? 'grayscale-0 scale-105' : 'grayscale'}`}
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/60 to-transparent dark:from-black dark:via-black/60 backdrop-blur-[1px]" />

              {/* Subtle Glow on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_20px_rgba(59,130,246,0.3)] rounded-full pointer-events-none" />
            </button>

            {/* Hero Text */}
            <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-7xl">
              Akshat Darshi
            </h1>

            {/* Phonetic Pronunciation (Aesthetic touch often found in minimal portfolios) */}
            <div className="mb-8 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 sm:text-sm">
              <span>/ˈəkʃət ˈdɑːrʃi/</span>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <span>noun</span>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="tabular-nums text-xs sm:text-sm">{time || "00:00:00"}</span>
                  <span className="text-[10px] uppercase tracking-wider sm:text-xs">IST</span>
                </div>

                <span className="text-gray-300 dark:text-gray-700">•</span>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-tight text-gray-400">lofi</span>
                  <button
                    onClick={toggleLofi}
                    className="flex h-5 w-5 items-center justify-center rounded-full transition-all hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-black dark:hover:text-white"
                    aria-label={isLofiPlaying ? "Pause Lofi" : "Play Lofi"}
                  >
                    {isLofiPlaying ? <Pause size={10} fill="currentColor" /> : <Music size={10} />}
                  </button>
                  <AnimatePresence>
                    {isLofiPlaying && (
                      <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 40, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="flex h-5 items-center overflow-hidden"
                      >
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={lofiVolume}
                          onChange={(e) => setLofiVolume(parseFloat(e.target.value))}
                          className="h-[2px] w-8 cursor-pointer appearance-none rounded-full bg-gray-200 dark:bg-zinc-800 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-400 dark:[&::-webkit-slider-thumb]:bg-zinc-500 hover:[&::-webkit-slider-thumb]:bg-black dark:hover:[&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-400 dark:[&::-moz-range-thumb]:bg-zinc-500 hover:[&::-moz-range-thumb]:bg-black dark:hover:[&::-moz-range-thumb]:bg-white transition-all"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="w-full space-y-4 text-left text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg md:text-xl">
              <p>
                a <a href="https://en.wikipedia.org/wiki/Software_engineering" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-black dark:hover:text-white transition-colors">software engineer</a> delivering production-grade SaaS platforms and GenAI systems with backend-heavy full-stack expertise.
              </p>
              <p>
                building <a href="https://en.wikipedia.org/wiki/Enterprise_software" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-black dark:hover:text-white transition-colors">enterprise-grade</a> applications, APIs, and dashboards — familiar with Agile workflows, CI/CD pipelines, and AWS deployments.
              </p>
            </div>

            <NeuralNetworkSim />

            {/* Experience Section */}
            <div className="mb-16 w-full text-left">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Experience
              </h2>
              <div className="space-y-12">
                <ExperienceItem
                  title="Tracks & Towers Infratech"
                  role="Software Engineer | Next.js, Golang, TypeScript, AI Tooling, Docker, AWS | Hyderabad"
                  collapsible={true}
                >
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 dark:text-gray-500">Jan 2026 -- Present</p>
                    <p>Architecting an internal operations management platform supporting a real-estate portfolio valued at $1B+.</p>
                    <p>Built modular backend services and a React Native mobile app used by 120+ users for construction operations.</p>
                    <p>Productionized a background job system generating 700+ payroll PDFs/month using Puppeteer and Resend.</p>
                    <p>Implemented real-time approval and project status workflows across 120+ users, reducing coordination delays by 40%.</p>
                  </div>
                </ExperienceItem>

                <ExperienceItem
                  title="ClimAgro Analytics (IIT Kanpur-Funded Climate Tech Startup)"
                  role="ML & Full-Stack Developer | Spring Boot, REST APIs, React, PostgreSQL | Kanpur"
                  collapsible={true}
                >
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 dark:text-gray-500">Apr 2025 -- Jan 2026</p>
                    <p>Shipped climate-risk dashboards powering decision-making across 50+ regions using ML-backed scoring models.</p>
                    <p>Collaborated with cross-functional teams to integrate internal tools across 5+ enterprise workflows, supporting 3+ departments via backend APIs and data reporting layers.</p>
                    <p>Owned model deployment and monitoring, ensuring consistent performance under growing data volumes.</p>
                  </div>
                </ExperienceItem>

                <ExperienceItem
                  title="Maulana Azad National Institute of Technology"
                  role="Machine Learning Research Intern | Transformers, Transfer Learning, Python | Hybrid"
                  collapsible={true}
                >
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 dark:text-gray-500">Jun 2024 -- Aug 2024</p>
                    <p>Improved deep CNN inference latency by 40%, enabling faster experimentation on limited compute budgets.</p>
                    <p>Refactored inefficient training pipelines, directly reducing compute spend by $50,000/year.</p>
                  </div>
                </ExperienceItem>
              </div>
            </div>


            {/* Projects Section */}
            <div className="mb-16 w-full text-left">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Projects
              </h2>
              <div className="space-y-12">
                <ExperienceItem
                  title="Bawarchie - AI-Powered QR Restaurant Ordering System"
                  role="Next.js, Razorpay, PostgreSQL"
                  collapsible={true}
                  link="https://www.bawarchie.com/"
                >
                  <div className="space-y-2">
                    <div className="flex gap-3 mb-2">
                      <a href="https://github.com/milliondreamsblog/orderbyqr" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-black dark:text-white underline underline-offset-4">GitHub</a>
                      <a href="https://www.bawarchie.com/" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-black dark:text-white underline underline-offset-4">Live</a>
                    </div>
                    <p>Shipped a live QR-based restaurant ordering system handling real customer traffic end-to-end.</p>
                    <p>Designed the complete order lifecycle, from menu discovery to verified online payments.</p>
                    <p>Enabling an AI-powered recommendation layer adapting suggestions based on budget and dietary constraints.</p>
                    <p>Focused on UX performance, enabling instant cart recovery and seamless table-based ordering.</p>
                  </div>
                </ExperienceItem>

                <ExperienceItem
                  title="Talk2Pdf"
                  role="Agentic AI Tooling, PDF Parsing"
                  collapsible={true}
                  link="https://github.com/milliondreamsblog/AskyourPDF"
                >
                  <div className="space-y-2">
                    <div className="flex gap-3 mb-2">
                      <a href="https://github.com/milliondreamsblog/AskyourPDF" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-black dark:text-white underline underline-offset-4">GitHub</a>
                    </div>
                    <p>Created an agentic document Q&A tool used by 500+ users weekly to query large PDFs.</p>
                    <p>Architected a modular retrieval layer supporting multiple LLMs and vector stores without code changes.</p>
                    <p>Reduced AI integration effort by 60% for downstream developers.</p>
                  </div>
                </ExperienceItem>

                <ExperienceItem
                  title="ResumeAI - Intelligent Resume Optimizer"
                  role="Next.js 15, TypeScript, Tailwind, GenAI"
                  collapsible={true}
                  link="https://resume-ai-sigma-lime.vercel.app/"
                >
                  <div className="space-y-2">
                    <div className="flex gap-3 mb-2">
                      <a href="https://github.com/milliondreamsblog/Resume_AI" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-black dark:text-white underline underline-offset-4">GitHub</a>
                      <a href="https://resume-ai-sigma-lime.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-black dark:text-white underline underline-offset-4">Live</a>
                    </div>
                    <p>Built a GenAI resume coach that analyzes 50+ data points from resumes and job descriptions.</p>
                    <p>Deployed a custom LLM pipeline with 40% faster responses and 100% data privacy.</p>
                    <p>Created a responsive UI using Next.js 15, Framer Motion, and TailwindCSS, boosting engagement by 35%.</p>
                    <p>Engineered a resume parser with 98% accuracy, handling PDF/DOCX files up to 10MB.</p>
                  </div>
                </ExperienceItem>
              </div>
            </div>


            {/* Education Section */}
            <div className="mb-16 w-full text-left">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Education
              </h2>
              <div className="space-y-12">
                <ExperienceItem
                  title="University Institute of Engineering and Technology, CSJM University"
                  role="B.Tech in Computer Science (AI Specialization)"
                >
                  <p>Oct 2022 -- Oct 2026 

                  </p>
                </ExperienceItem>
              </div>
            </div>

            {/* Contributions Section */}
            <div className="mb-16 w-full text-left">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                GitHub Contributions
              </h2>
              <GithubGraph />
            </div>

            {/* Publications & Awards Section */}
            <div className="mb-16 w-full text-left">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Publications & Awards
              </h2>
              <div className="space-y-12">
                <ExperienceItem
                  title="Optimized Traffic Sign Recognition using Transfer Learning"
                  role=""
                  collapsible={true}
                  collapsedHeight="max-h-40"
                >
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                        IEEE Publication (2024) -- IEEE GIEST
                      </p>
                      <a
                        href="https://www.researchgate.net/publication/390783919_Traffic_Sign_Recognition_using_Transfer_Learning_and_Deep_Convolutional_Neural_Networks"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs font-medium text-black dark:text-white underline underline-offset-4 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        View Publication
                      </a>
                    </div>
                  </div>
                </ExperienceItem>

                <ExperienceItem
                  title="Top 5% -- E-Yantra IIT Bombay"
                  role=""
                >
                  <div className="space-y-2">
                    <p>Ranked 73 / 1475 in national robotics competition.</p>
                    <a
                      href="https://www.linkedin.com/feed/update/urn:li:activity:7163477746843676672/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-medium text-black dark:text-white underline underline-offset-4 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      View on LinkedIn
                    </a>
                  </div>
                </ExperienceItem>

                <ExperienceItem
                  title="Innovation Awards"
                  role=""
                >
                  <div className="space-y-2">
                    <p>2nd / 3rd Place, CSJM Innovation Robotics Contest; 3rd Place, Women Innovation.</p>
                    <a
                      href="https://www.linkedin.com/feed/update/urn:li:activity:7163477746843676672/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-medium text-black dark:text-white underline underline-offset-4 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      View on LinkedIn
                    </a>
                  </div>
                </ExperienceItem>
              </div>
            </div>

            {/* Tech Stack Section */}
            <div className="mb-16 w-full text-left">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Tech Stack
              </h2>
              <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
                I&apos;m a generalist at heart who can build with anything, but here&apos;s the core stack I&apos;ve spent the most time with:
              </p>
              <TechStack />
            </div>

            {/* Recommendations by Clients Section */}
            <div className="mb-16 w-full text-left">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Recommendations by Clients
              </h2>
              <div className="space-y-8">
                {/* Roy Feldman Recommendation */}
                <div className="group border-l-2 border-gray-200 dark:border-gray-800 pl-6 transition-all hover:border-black dark:hover:border-white">
                  <div className="mb-3">
                    <a
                      href="https://www.linkedin.com/in/harshitcese/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-black dark:text-white underline underline-offset-4 decoration-gray-300 dark:decoration-gray-700 hover:decoration-black dark:hover:decoration-white transition-colors"
                    >
                      Harshit Mishra
                    </a>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    I&apos;ve had the privilege to work with Aditya on several highly technical cybersecurity R&D projects involving design and implementation of defensive network components in Golang, network protocol research and analysis. He is a bright young engineer, extremely talented in hacking and cybersecurity, with a natural curiosity and passion for hacking, and a gift understanding how systems work, how to design and break them. I am certain that he will succeed in any endeavor he puts his mind to, in the realms of cybersecurity, engineering and beyond! :)
                  </p>
                </div>

                {/* Tom Granot Recommendation */}
                <div className="group border-l-2 border-gray-200 dark:border-gray-800 pl-6 transition-all hover:border-black dark:hover:border-white">
                  <div className="mb-3">
                    <a
                      href="https://www.linkedin.com/in/neha-shukla-307b0b5b/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-black dark:text-white underline underline-offset-4 decoration-gray-300 dark:decoration-gray-700 hover:decoration-black dark:hover:decoration-white transition-colors"
                    >
                      Neha Shukla
                    </a>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    It&apos;s not often that you get to talk to a person who is not only hungry for mentorship, but comes out of the gate with the attitude that enables him to learn so, so quickly on his feet.
                    <br /><br />
                    Aditya did research for highly technical content for me and independently navigated difficult situations without a lot of guidance. If you&apos;re looking for someone to research a technical topic for your content work, Aditya is disciplined, thorough and insistent on understanding things in depth before giving a final output.
                    <br /><br />
                    Keep on keeping on brother!
                  </p>
                </div>
              </div>
            </div>

            {/* Videos Section */}
            {/* <div className="mb-16 w-full text-left">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Explainer Videos
              </h2>
              <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
                Here is how I explain complex systems on my {" "}
                <a
                  href="https://www.youtube.com/@theracecondition"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black dark:text-white underline underline-offset-4 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  YouTube Channel
                </a>
              </p>
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 shadow-sm transition-all hover:shadow-md grayscale hover:grayscale-0 duration-500">
                <iframe
                  src="https://www.youtube.com/embed/m84tBP_4DWE"
                  title="Explaining Complex Systems"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </div> */}

            {/* Writings & Blogs Section */}
            <div className="mb-16 w-full text-left">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Writings & Blogs
              </h2>
              <p className="w-full text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                I host my thoughts on{" "}{" "}
                <a
                  href="https://substack.com/@akshatdarshi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black dark:text-white underline underline-offset-4 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                >
                    Blogs
                </a>{" "}
                rather than building a custom site. Instead of overengineering and reinventing the wheel, I prefer leveraging a mature platform that lets me focus on what matters: sharing insights on AI systems, product strategy, and technical architecture.
              </p>
            </div>

            {/* Library Section */}
            <div className="mb-16 w-full text-left">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Library
              </h2>

              {/* Dev Subsection */}
              <div className="mb-8">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-600">
                  Dev
                </h3>
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                  {[
                    { title: "Linux Kernel Development", author: "Robert Love" },
                    { title: "Hacking: The Art of Exploitation", author: "Jon Erickson" },
                    { title: "Linux in a Nutshell", author: "Ellen Siever, Stephen Figgins, Robert Love, and Arnold Robbins" },
                    { title: "Linux Kernel in a Nutshell", author: "Greg Kroah-Hartman" },
                    { title: "The Art of Electronics", author: "Paul Horowitz and Winfield Hill" },
                    { title: "Nmap Cookbook", author: "Nicholas Marsh" }
                  ].map((book) => (
                    <div key={book.title} className="group flex flex-col gap-1 transition-all">
                      <span className="text-sm font-medium text-black dark:text-white group-hover:underline underline-offset-4 decoration-gray-200 dark:decoration-gray-800 transition-all">
                        {book.title}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {book.author}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Casual Reads Subsection */}
              <div className="mb-4">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-600">
                  Casual Reads
                </h3>
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                  {[
                    { title: "Hooked: How to Build Habit-Forming Products", author: "Nir Eyal" },
                    { title: "The Lean Startup", author: "Eric Ries" },
                    { title: "Zero to One", author: "Peter Thiel" },
                    { title: "The Almanack of Naval Ravikant", author: "Eric Jorgenson" },
                    { title: "Deep Work", author: "Cal Newport" },
                    { title: "The Anthology of Balaji Srinivasan", author: "Eric Jorgenson" }
                  ].map((book) => (
                    <div key={book.title} className="group flex flex-col gap-1 transition-all">
                      <span className="text-sm font-medium text-black dark:text-white group-hover:underline underline-offset-4 decoration-gray-200 dark:decoration-gray-800 transition-all">
                        {book.title}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {book.author}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note */}
              <p className="mt-6 text-xs italic text-gray-400 dark:text-gray-500">
                *and many more, these are just one of my best reads
              </p>
            </div>

            {/* Thing about me Section */}
            <div className="mb-16 w-full text-left">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Thing about me
              </h2>
              <div className="space-y-6">
                <p className="w-full text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                  Beyond engineering and build systems, I find balance in the tactile and the thoughtful. Whether it&apos;s exploring the nuances of complex architectures or spending time in the real world, my approach to life is driven by curiosity and a desire to understand how things work at their core.
                </p>

                <div className="flex justify-center">
                  <div className="relative h-[250px] w-full max-w-sm grayscale hover:grayscale-0 transition-all duration-700 sm:h-[350px]" style={{ maskImage: "radial-gradient(circle, black 40%, transparent 95%)", WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 95%)" }}>
                    <Image
                      src="/casual1.png"
                      alt="Casual photo"
                      fill
                      className="object-contain object-center"
                    />
                  </div>
                </div>

                <p className="w-full text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                  I believe that the best products are built by people who have a diverse range of interests. It&apos;s the unique combination of technical depth and human perspective that allows us to create technology that actually resonates.
                </p>
              </div>
            </div>

            {/* Get in Touch Section */}
            <div className="mb-16 w-full text-left">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-400">
                Get in Touch
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Connect with me on{" "}
                  <a
                    href="https://www.linkedin.com/in/aditya-patil-260a631b2/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black dark:text-white underline underline-offset-4 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    LinkedIn
                  </a>{" "}
                  or{" "} shoot an {" "}
                  <a
                    href="mailto:adityapatil24680@gmail.com"
                    className="text-black dark:text-white underline underline-offset-4 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    email
                  </a>
                </p>
              </div>
            </div>

            {/* Pomodoro Timer Section */}
            <PomodoroTimer />



          </motion.main>
        )}
      </AnimatePresence>

      {/* Glass Island Navbar */}
      <nav className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-gray-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/80 px-4 py-3 shadow-sm backdrop-blur-md transition-all hover:bg-white/90 dark:hover:bg-zinc-900 sm:gap-6 sm:px-6">
        {/* Mode Toggle Switch */}
        <div className="flex items-center">
          <button
            onClick={() => setMode(mode === "human" ? "agent" : "human")}
            className="group relative flex h-7 w-12 cursor-pointer rounded-full bg-gray-200 dark:bg-zinc-700 p-1 transition-colors duration-200 ease-in-out hover:bg-gray-300 dark:hover:bg-zinc-600 focus:outline-none"
            role="switch"
            aria-checked={mode === "agent"}
            title={`Switch to ${mode === "human" ? "agent" : "human"} mode`}
          >
            <div
              className={`flex h-5 w-5 transform items-center justify-center rounded-full bg-white dark:bg-white shadow-sm transition duration-200 ease-in-out ${mode === "agent" ? "translate-x-5" : "translate-x-0"
                }`}
            >
              {mode === "human" ? (
                <User className="h-3 w-3 text-black" />
              ) : (
                <Bot className="h-3 w-3 text-black" />
              )}
            </div>
          </button>
        </div>
        <button
          onClick={() => setShowQR(true)}
          className="text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors hover:scale-110"
          aria-label="Show QR Code"
        >
          <QrCode className="h-5 w-5" />
        </button>
        <div className="h-6 w-px bg-gray-200 dark:bg-zinc-700" />
        <a
          href="https://github.com/milliondreamsblog"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors hover:scale-110"
        >
          <Github className="h-5 w-5" />
        </a>
        <a
          href="https://www.linkedin.com/in/akshat-darshi/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors hover:scale-110"
        >
          <Linkedin className="h-5 w-5" />
        </a>
        <a
          href="https://codolio.com/profile/milliondreamsblog"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors hover:scale-110"
        >
          <Link className="h-5 w-5" />
        </a>
      </nav>

      {/* QR Code Modal */}
      {
        showQR && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 dark:bg-white/5 backdrop-blur-sm"
            onClick={() => setShowQR(false)}
          >
            <div
              className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute -right-3 -top-3 rounded-full bg-black dark:bg-white p-2 text-white dark:text-black transition-transform hover:scale-110"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="rounded-lg bg-white p-2">
                <QRCodeSVG
                  value="https://www.linkedin.com/in/akshat-darshi/"
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

