"use client";

import { GitHubCalendar } from "react-github-calendar";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

function useIsClient() {
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );
}

export function GithubGraph() {
    const { theme } = useTheme();
    const isClient = useIsClient();

    if (!isClient) return null;

    return (
        <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex min-w-max justify-center text-xs px-4">
                <GitHubCalendar
                    username="milliondreamsblog"
                    colorScheme={theme === "dark" ? "dark" : "light"}
                    blockSize={10}
                    blockMargin={4}
                    fontSize={12}
                />
            </div>
        </div>
    );
}
