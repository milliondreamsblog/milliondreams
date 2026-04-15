"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const scaleX = useSpring(progress, { stiffness: 300, damping: 40, mass: 0.5 });

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[200] h-[2px] bg-black dark:bg-white origin-left"
      style={{ scaleX }}
    />
  );
}
