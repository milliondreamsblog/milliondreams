"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { GISCUS } from "../../data/giscus.config";

/**
 * Giscus comments (GitHub Discussions). Each case study maps to one
 * discussion via pathname. Theme follows the site theme, including live
 * toggles, via postMessage to the giscus iframe.
 */
export function Comments() {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const giscusTheme = resolvedTheme === "dark" ? "dark" : "light";

  const enabled = Boolean(GISCUS.repoId && GISCUS.categoryId);

  useEffect(() => {
    if (!enabled || !ref.current || ref.current.hasChildNodes()) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", GISCUS.repo);
    script.setAttribute("data-repo-id", GISCUS.repoId);
    script.setAttribute("data-category", GISCUS.category);
    script.setAttribute("data-category-id", GISCUS.categoryId);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", giscusTheme);
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");
    ref.current.appendChild(script);
    // giscusTheme intentionally omitted from deps — initial load only; theme
    // changes are pushed to the existing iframe below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const iframe = document.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame",
    );
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: giscusTheme } } },
      "https://giscus.app",
    );
  }, [giscusTheme, enabled]);

  if (!enabled) {
    return (
      <div className="border border-dashed border-[rgba(10,10,10,0.2)] dark:border-white/20 px-5 py-6">
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#8a857a]">
          Comments are warming up
        </p>
        <p className="text-[12px] text-[rgba(10,10,10,0.5)] dark:text-gray-400 mt-2 leading-relaxed">
          Discussion opens soon — sign in with GitHub and leave your take on
          the decisions above. Meanwhile, thoughts are welcome via the contact
          page.
        </p>
      </div>
    );
  }

  return <div ref={ref} />;
}
