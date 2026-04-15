import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Akshat Darshi — Software Engineer";
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
        {/* Top-right tech badges */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "80px",
            display: "flex",
            gap: "10px",
          }}
        >
          {["Next.js", "TypeScript", "Golang", "GenAI"].map((tech) => (
            <span
              key={tech}
              style={{
                background: "#151515",
                color: "#6b7280",
                padding: "6px 14px",
                fontSize: "12px",
                fontFamily: "monospace",
                letterSpacing: "0.05em",
                border: "1px solid #2a2a2a",
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Subtle grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Accent line */}
        <div
          style={{
            width: "40px",
            height: "2px",
            background: "#3b82f6",
            marginBottom: "20px",
          }}
        />

        {/* Label */}
        <div
          style={{
            color: "#4b5563",
            fontSize: "13px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginBottom: "16px",
            fontFamily: "monospace",
          }}
        >
          software engineer · india
        </div>

        {/* Name */}
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
          Akshat Darshi
        </div>

        {/* Tagline */}
        <div
          style={{
            color: "#6b7280",
            fontSize: "22px",
            lineHeight: "1.5",
            maxWidth: "640px",
            fontFamily: "sans-serif",
          }}
        >
          Production-grade SaaS &amp; GenAI systems. Backend-heavy full-stack
          engineer.
        </div>
      </div>
    ),
    { ...size }
  );
}
