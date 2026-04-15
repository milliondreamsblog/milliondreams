import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Writings & Blogs — Akshat Darshi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Top-right label */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "80px",
            color: "#374151",
            fontSize: "13px",
            fontFamily: "monospace",
            letterSpacing: "0.1em",
          }}
        >
          akshatdarshi.dev/blog
        </div>

        {/* Accent line */}
        <div
          style={{
            width: "40px",
            height: "2px",
            background: "#2b9eb3",
            marginBottom: "20px",
          }}
        />

        {/* Substack label */}
        <div
          style={{
            color: "#2b9eb3",
            fontSize: "13px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginBottom: "16px",
            fontFamily: "monospace",
          }}
        >
          fragments from substack
        </div>

        {/* Title */}
        <div
          style={{
            color: "white",
            fontSize: "80px",
            fontWeight: "700",
            lineHeight: "1",
            marginBottom: "24px",
            fontFamily: "sans-serif",
          }}
        >
          Writings &amp; Blogs
        </div>

        {/* Author */}
        <div
          style={{
            color: "#6b7280",
            fontSize: "20px",
            fontFamily: "sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          Akshat Darshi · software engineer
        </div>
      </div>
    ),
    { ...size }
  );
}
