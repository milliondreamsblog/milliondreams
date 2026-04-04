"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="h-9 w-16 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="group relative flex h-8 w-14 cursor-pointer items-center rounded-full bg-gray-100 dark:bg-white p-1 transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-50"
            aria-label="Toggle Theme"
        >
            <div
                className={`flex h-6 w-6 transform items-center justify-center rounded-full bg-white dark:bg-black shadow-md transition-all duration-500 ease-in-out ${isDark ? "translate-x-6" : "translate-x-0"
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
