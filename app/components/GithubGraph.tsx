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

