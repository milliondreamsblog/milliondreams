"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノAKSHATDARSHI010110";

export function KonamiEasterEgg() {
  const [active, setActive] = useState(false);
  const bufferRef = useRef<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Sequence detector
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActive(false);
        return;
      }
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      bufferRef.current = [...bufferRef.current, key].slice(-SEQUENCE.length);
      if (bufferRef.current.join(",") === SEQUENCE.join(",")) {
        setActive(true);
        bufferRef.current = [];
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Matrix rain effect
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drops: number[] = Array(Math.floor(window.innerWidth / 16)).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff41";
      ctx.font = "14px monospace";

      for (let i = 0; i < drops.length; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(ch, i * 16, drops[i] * 16);
        if (drops[i] * 16 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[999] cursor-pointer"
          onClick={() => setActive(false)}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 flex items-end justify-center pb-16 pointer-events-none">
            <span className="font-mono text-[#00ff41] text-[10px] tracking-[0.4em] uppercase opacity-60 animate-pulse">
              ↑↑↓↓←→←→BA · click or esc to exit
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
