"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pixelify_Sans } from "next/font/google";

const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400"],
});

/**
 * 7-row pixel glyphs for the giant footer wordmark. Rows use "#" for a lit
 * cell; glyph widths vary so narrow letters (i, l) keep the wordmark's rhythm.
 */
const GLYPHS: Record<string, string[]> = {
  m: [".....", ".....", "##.#.", "#.#.#", "#.#.#", "#.#.#", "#.#.#"],
  i: [".#.", "...", "##.", ".#.", ".#.", ".#.", "###"],
  l: ["##.", ".#.", ".#.", ".#.", ".#.", ".#.", "###"],
  o: [".....", ".....", ".###.", "#...#", "#...#", "#...#", ".###."],
  n: [".....", ".....", "#.##.", "##..#", "#...#", "#...#", "#...#"],
  d: ["....#", "....#", ".####", "#...#", "#...#", "#...#", ".####"],
  r: [".....", ".....", "#.##.", "##..#", "#....", "#....", "#...."],
  e: [".....", ".....", ".###.", "#...#", "#####", "#....", ".###."],
  a: [".....", ".....", ".###.", "....#", ".####", "#...#", ".####"],
  s: [".....", ".....", ".####", "#....", ".###.", "....#", "####."],
};

const WORDMARK = "milliondreams";
const ROWS = 7;

function buildGrid(word: string): { cells: boolean[]; cols: number } {
  const glyphs = word.split("").map((ch) => GLYPHS[ch] ?? GLYPHS.o);
  const cols =
    glyphs.reduce((sum, g) => sum + g[0].length, 0) + (glyphs.length - 1);
  const cells: boolean[] = new Array(ROWS * cols).fill(false);
  let offset = 0;
  for (const glyph of glyphs) {
    const width = glyph[0].length;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < width; c++) {
        if (glyph[r][c] === "#") cells[r * cols + offset + c] = true;
      }
    }
    offset += width + 1;
  }
  return { cells, cols };
}

const FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] =
  [
    {
      title: "Explore",
      links: [
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Case Studies",
      links: [
        { label: "Bawarchie", href: "/projects/bawarchie" },
        { label: "RoboRumble", href: "/projects/roborumble" },
        { label: "Haven AI", href: "/projects/havenai" },
        { label: "BuildInfra", href: "/projects/buildinfra" },
        { label: "CMO Agent", href: "/projects/cmoagent" },
        { label: "Elvyn Chess", href: "/projects/elvynchess" },
      ],
    },
  ];

const CONNECT_LINKS = [
  { label: "Email", href: "mailto:akshatsan23@gmail.com" },
  { label: "GitHub", href: "https://github.com/milliondreamsblog" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/akshat-darshi/" },
  { label: "Codolio", href: "https://codolio.com/profile/milliondreamsblog" },
];

const LIVE_LINKS = [
  { label: "bawarchie.com", href: "https://www.bawarchie.com" },
  { label: "roborumble.in", href: "https://roborumble.in" },
];

type Brick = { x: number; y: number; alive: boolean };
type Phase = "ready" | "running" | "over" | "won";

/**
 * Breakout played against the pixel wordmark: every lit cell is a brick.
 * Physics live in refs and a rAF loop; React state only drives the HUD.
 */
function BreakoutGame({
  cells,
  cols,
  onClose,
}: {
  cells: boolean[];
  cols: number;
  onClose: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [shared, setShared] = useState(false);
  const [awaitingLaunch, setAwaitingLaunch] = useState(true);

  const world = useRef({
    w: 0,
    h: 0,
    cs: 0,
    bricks: [] as Brick[],
    paddleX: 0,
    paddleW: 120,
    ballX: 0,
    ballY: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    launched: false,
    lives: 3,
    score: 0,
    phase: "ready" as Phase,
    raf: 0,
    last: 0,
  });









  return (
    <div className={`${pixelify.className} select-none`}>

      <div
        ref={wrapRef}
        className="relative h-[440px] w-full cursor-none touch-none"
      >
        <canvas ref={canvasRef} className="h-full w-full" />

      </div>
    </div>
  );
}

export function Footer() {
  const { cells, cols } = useMemo(() => buildGrid(WORDMARK), []);
  const [playing, setPlaying] = useState(false);

  return (
    <footer className="border-t border-gray-200 bg-white px-6 pb-32 pt-14 dark:border-white/10 dark:bg-black sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
        {/* Brand + big invite */}
        <div className="flex flex-col justify-between gap-10 lg:min-h-[240px]">
          <Link href="/" className="flex w-fit items-center gap-2">
            <span className="grid grid-cols-2 gap-[2px]">
              <span className="h-[7px] w-[10px] rounded-[2px] bg-black dark:bg-white" />
              <span className="h-[7px] w-[5px] rounded-[2px] bg-black dark:bg-white" />
              <span className="h-[7px] w-[5px] rounded-[2px] bg-black dark:bg-white" />
              <span className="h-[7px] w-[10px] rounded-[2px] bg-black dark:bg-white" />
            </span>
            <span className="text-xl font-semibold text-black dark:text-white">
              Akshat Darshi
            </span>
          </Link>
          <div className="text-3xl leading-[1.08] tracking-[-0.04em] text-black/60 dark:text-white/60 sm:text-4xl">
            <p>Let&apos;s build together</p>
            <a
              href="mailto:akshatsan23@gmail.com"
              className="transition-colors hover:text-black dark:hover:text-white"
            >
              akshatsan23@gmail.com
            </a>
          </div>
        </div>

        {/* Link columns */}
        <div className="flex flex-wrap gap-x-16 gap-y-10 lg:gap-x-20">
          {FOOTER_LINKS.map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              <p className="text-sm font-medium text-black dark:text-white">
                {column.title}
              </p>
              <div className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-[#666] transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium text-black dark:text-white">
                Connect
              </p>
              <div className="flex flex-col gap-3">
                {CONNECT_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="text-sm text-[#666] transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium text-black dark:text-white">
                Live
              </p>
              <div className="flex flex-col gap-3">
                {LIVE_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#666] transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Giant pixel wordmark that becomes a Breakout game */}
      <div className="relative mx-auto mt-16 max-w-6xl">
        {playing ? (
          <BreakoutGame
            cells={cells}
            cols={cols}
            onClose={() => setPlaying(false)}
          />
        ) : (
          <>
            <div
              className="grid w-full gap-[2px]"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              aria-label={WORDMARK}
              role="img"
            >
              {cells.map((on, i) => (
                <div
                  key={i}
                  className={`aspect-square w-full rounded-[2px] ${
                    on ? "bg-[#f6f6f6] dark:bg-zinc-900" : "opacity-0"
                  }`}
                />
              ))}
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => setPlaying(true)}
                className={`${pixelify.className} pointer-events-auto rounded-[8px] border border-black bg-black/15 pb-[4px] dark:border-white dark:bg-white/25`}
              >
                <span className="flex h-9 items-center justify-center rounded-[7px] bg-white px-4 text-[16px] tracking-[-0.02em] text-[#222020] dark:bg-black dark:text-gray-100">
                  Click to Play
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </footer>
  );
}
