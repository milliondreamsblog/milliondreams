"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";

function useIsClient() {
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );
}

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const isClient = useIsClient();

    if (!isClient) {
        return (
            <div className="h-7 w-12 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        );
    }

    const isDark = resolvedTheme === "dark";

    const toggleTheme = () => {
        const next = isDark ? "light" : "dark";
        const doc = document as Document & {
            startViewTransition?: (cb: () => void) => void;
        };
        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (!doc.startViewTransition || reduceMotion) {
            setTheme(next);
            return;
        }
        doc.startViewTransition(() => {
            flushSync(() => setTheme(next));
        });
    };

    return (
        <button
            onClick={toggleTheme}
            className="group relative flex h-7 w-12 cursor-pointer items-center rounded-full bg-gray-100 dark:bg-white p-1 transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-50"
            aria-label="Toggle Theme"
        >
            <div
                className={`flex h-5 w-5 transform items-center justify-center rounded-full bg-white dark:bg-black shadow-md transition-all duration-500 ease-in-out ${isDark ? "translate-x-5" : "translate-x-0"
                    }`}
            >
                {isDark ? (
                    <Moon className="h-3 w-3 text-white fill-white" />
                ) : (
                    <Sun className="h-3 w-3 text-orange-400 fill-orange-400" />
                )}
            </div>
        </button>
    );
}
