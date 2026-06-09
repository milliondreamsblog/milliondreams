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

