"use client";

import React, { useState, useSyncExternalStore } from "react";
import { GitHubCalendar, type Activity } from "react-github-calendar";
import { useTheme } from "next-themes";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// GitHub's official light / dark intensity scales — familiar, and they read
// cleanly against both the white and black backgrounds of the site.
const THEME = {
  light: ["#eceff1", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
  dark: ["#1a1a1a", "#0e4429", "#006d32", "#26a641", "#39d353"],
};

const USERNAME = "milliondreamsblog";

export function GithubGraph() {
  const { resolvedTheme } = useTheme();
  const isClient = useIsClient();
  const [total, setTotal] = useState<number | null>(null);

  if (!isClient) return null;

  const isDark = resolvedTheme === "dark";
  const scale = isDark ? THEME.dark : THEME.light;

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50/40 p-5 transition-colors dark:border-white/10 dark:bg-white/[0.02] sm:p-6">
      {/* Header — prominent total + legend */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <p className="text-sm leading-none text-gray-500 dark:text-gray-400 sm:text-base">
          {total !== null ? (
            <>
              <span className="font-semibold tabular-nums text-black dark:text-white">
                {total.toLocaleString()}
              </span>{" "}
              contributions in the last year
            </>
          ) : (
            <span className="inline-block h-3.5 w-52 animate-pulse rounded bg-gray-200 align-middle dark:bg-zinc-800" />
          )}
        </p>

        <div className="hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500 sm:flex">
          <span>Less</span>
          {scale.map((c) => (
            <span
              key={c}
              className="h-2.5 w-2.5 rounded-[2px]"
              style={{ backgroundColor: c }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="w-full overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex min-w-max justify-start">
          <GitHubCalendar
            username={USERNAME}
            colorScheme={isDark ? "dark" : "light"}
            theme={THEME}
            blockSize={11}
            blockMargin={3}
            blockRadius={2}
            fontSize={11}
            showColorLegend={false}
            showTotalCount={false}
            transformData={(data: Activity[]) => {
              const sum = data.reduce((acc, d) => acc + d.count, 0);
              setTotal((prev) => (prev === sum ? prev : sum));
              return data;
            }}
            renderBlock={(block, activity) =>
              React.cloneElement(
                block,
                {},
                <title>{`${activity.count} contribution${
                  activity.count === 1 ? "" : "s"
                } on ${activity.date}`}</title>,
              )
            }
            errorMessage="Couldn't load GitHub contributions right now."
          />
        </div>
      </div>
    </div>
  );
}
