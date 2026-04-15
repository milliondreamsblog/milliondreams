import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Projects — Akshat Darshi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FEATURED = [
  { title: "Bawarchie", label: "Live Product", color: "#c8410a" },
  { title: "RoboRumble", label: "Event Platform", color: "#3a2a0a" },
  { title: "Talk2PDF", label: "AI / GenAI", color: "#2d4a3e" },
  { title: "ResumeAI", label: "AI / GenAI", color: "#2d4a3e" },
];

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

        {/* Header */}
        <div
          style={{
            color: "#4b5563",
            fontSize: "13px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginBottom: "12px",
            fontFamily: "monospace",
          }}
        >
          akshat darshi
        </div>
        <div
          style={{
            color: "white",
            fontSize: "68px",
            fontWeight: "700",
            lineHeight: "1",
            marginBottom: "52px",
            fontFamily: "sans-serif",
          }}
        >
          Projects
        </div>

        {/* Project cards */}
        <div style={{ display: "flex", gap: "16px" }}>
          {FEATURED.map((p) => (
            <div
              key={p.title}
              style={{
                background: "#111",
                border: "1px solid #222",
                padding: "22px 28px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                flex: "1",
              }}
            >
              <span
                style={{
                  color: p.color,
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontFamily: "monospace",
                }}
              >
                {p.label}
              </span>
              <span
                style={{
                  color: "white",
                  fontSize: "22px",
                  fontWeight: "600",
                  fontFamily: "sans-serif",
                }}
              >
                {p.title}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom count */}
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            right: "80px",
            color: "#374151",
            fontSize: "13px",
            fontFamily: "monospace",
            letterSpacing: "0.1em",
          }}
        >
          8 projects
        </div>
      </div>
    ),
    { ...size }
  );
}
