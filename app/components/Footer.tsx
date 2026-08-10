"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";





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




export function Footer() {

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
        </div>
      </div>

    </footer>
  );
}
