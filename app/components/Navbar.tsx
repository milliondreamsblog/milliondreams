"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Github,
  Linkedin,
  Bot,
  User,
  QrCode,
  X,
  Link as LinkIcon,
  LayoutGrid,
  BookOpen,
  Home,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useNav } from "../context/NavContext";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const { mode, toggleMode, showQR, setShowQR } = useNav();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/projects", icon: LayoutGrid, label: "Projects" },
    { href: "/blog", icon: BookOpen, label: "Blog" },
  ] as any;

  return (
    <>
      {/* Glass Island Navbar — scrollable on mobile */}
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[calc(100vw-2rem)] sm:w-auto">
        <nav className="flex items-center gap-3 rounded-full border border-gray-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/80 px-4 py-3 shadow-sm backdrop-blur-md transition-all hover:bg-white/90 dark:hover:bg-zinc-900 overflow-x-auto scrollbar-hide sm:gap-5 sm:px-6">
          {/* Internal Navigation */}
          <div className="flex items-center gap-3 shrink-0 sm:gap-4">
            {navLinks.map((link: any) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-all hover:scale-110 ${
                    isActive
                      ? "text-black dark:text-white"
                      : "text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white"
                  }`}
                  aria-label={link.label}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-zinc-700 shrink-0" />

          {/* Mode Toggle Switch */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleMode}
              className="group relative flex h-7 w-12 cursor-pointer rounded-full bg-gray-200 dark:bg-zinc-700 p-1 transition-colors duration-200 ease-in-out hover:bg-gray-300 dark:hover:bg-zinc-600 focus:outline-none"
              role="switch"
              aria-checked={mode === "agent"}
              title={`Switch to ${mode === "human" ? "agent" : "human"} mode`}
            >
              <div
                className={`flex h-5 w-5 transform items-center justify-center rounded-full bg-white dark:bg-white shadow-sm transition duration-200 ease-in-out ${
                  mode === "agent" ? "translate-x-5" : "translate-x-0"
                }`}
              >
                {mode === "human" ? (
                  <User className="h-3 w-3 text-black" />
                ) : (
                  <Bot className="h-3 w-3 text-black" />
                )}
              </div>
            </button>
            <ThemeToggle />
          </div>

          <button
            onClick={() => setShowQR(true)}
            className="text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors hover:scale-110 shrink-0"
            aria-label="Show QR Code"
          >
            <QrCode className="h-5 w-5" />
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-zinc-700 shrink-0" />

          <a
            href="https://github.com/milliondreamsblog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors hover:scale-110 shrink-0"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/akshat-darshi/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors hover:scale-110 shrink-0"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a
            href="https://codolio.com/profile/milliondreamsblog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors hover:scale-110 shrink-0"
          >
            <LinkIcon className="h-5 w-5" />
          </a>
        </nav>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/20 dark:bg-white/5 backdrop-blur-sm"
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
      )}
    </>
  );
}
