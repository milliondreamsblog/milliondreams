"use client";

import { motion } from "framer-motion";
import type {
  ArchDiagramSpec,
  DiagramNode,
  NodeKind,
} from "../../data/case-studies/types";

/**
 * Generic architecture diagram. Nodes are laid out in columns by kind
 * (clients → services → queues → stores → external), edges are drawn as
 * beziers with draw-on animation. Purely derived from the spec, so every
 * case study gets a consistent diagram for free.
 */

const KIND_COLOR: Record<NodeKind, string> = {
  client: "#c8410a",
  service: "#4a6fa5",
  queue: "#9a6fc0",
  cache: "#d9a441",
  db: "#3e8e6e",
  external: "#8a857a",
};

const KIND_LABEL: Record<NodeKind, string> = {
  client: "client",
  service: "service",
  queue: "queue",
  cache: "cache",
  db: "database",
  external: "external",
};

const KIND_COLUMN: Record<NodeKind, number> = {
  client: 0,
  service: 1,
  queue: 2,
  cache: 3,
  db: 3,
  external: 4,
};

const NODE_H = 46;
const ROW_GAP = 30;
const COL_GAP = 84;
const PAD = 12;

interface Placed extends DiagramNode {
  x: number;
  y: number;
  w: number;
}

function wrapLabel(label: string): string[] {
  if (label.length <= 18) return [label];
  const words = label.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 18 && cur) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur.trim());
  return lines.slice(0, 2);
}

function layout(spec: ArchDiagramSpec) {
  // Group nodes into columns by kind, compressing unused columns.
  const usedCols = Array.from(
    new Set(spec.nodes.map((n) => KIND_COLUMN[n.kind])),
  ).sort((a, b) => a - b);
  const colIndex = new Map(usedCols.map((c, i) => [c, i]));

  const columns: DiagramNode[][] = usedCols.map(() => []);
  for (const n of spec.nodes) {
    columns[colIndex.get(KIND_COLUMN[n.kind])!].push(n);
  }

  const colWidths = columns.map((col) =>
    Math.max(
      ...col.map((n) =>
        Math.min(Math.max(120, wrapLabel(n.label).reduce((m, l) => Math.max(m, l.length), 0) * 7 + 30), 190),
      ),
    ),
  );

  const totalH =
    Math.max(...columns.map((c) => c.length)) * (NODE_H + ROW_GAP) - ROW_GAP;

  const placed = new Map<string, Placed>();
  let x = PAD;
  columns.forEach((col, ci) => {
    const colH = col.length * (NODE_H + ROW_GAP) - ROW_GAP;
    let y = PAD + (totalH - colH) / 2;
    for (const n of col) {
      placed.set(n.id, { ...n, x, y, w: colWidths[ci] });
      y += NODE_H + ROW_GAP;
    }
    x += colWidths[ci] + COL_GAP;
  });

  return {
    placed,
    width: x - COL_GAP + PAD,
    height: totalH + PAD * 2,
  };
}

function edgePath(a: Placed, b: Placed): { d: string; mx: number; my: number } {
  let x1: number, y1: number, x2: number, y2: number;
  if (b.x >= a.x + a.w || b.x >= a.x) {
    // forward (left → right)
    x1 = a.x + a.w;
    y1 = a.y + NODE_H / 2;
    x2 = b.x;
    y2 = b.y + NODE_H / 2;
  } else {
    // backward (right → left)
    x1 = a.x;
    y1 = a.y + NODE_H / 2;
    x2 = b.x + b.w;
    y2 = b.y + NODE_H / 2;
  }
  const dx = (x2 - x1) / 2;
  const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  return { d, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 };
}

export function ArchDiagram({ spec }: { spec: ArchDiagramSpec }) {
  const { placed, width, height } = layout(spec);
  const kinds = Array.from(new Set(spec.nodes.map((n) => n.kind)));

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ minWidth: Math.min(width, 640) }}
          role="img"
          aria-label="Architecture diagram"
        >
          <defs>
            <marker
              id="arch-arrow"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 8 4 L 0 8 z" fill="#8a857a" />
            </marker>
          </defs>

          {/* Edges */}
          {spec.edges.map((e, i) => {
            const a = placed.get(e.from);
            const b = placed.get(e.to);
            if (!a || !b) return null;
            const { d, mx, my } = edgePath(a, b);
            return (
              <g key={`${e.from}-${e.to}-${i}`}>
                <motion.path
                  d={d}
                  fill="none"
                  stroke="#8a857a"
                  strokeWidth="1"
                  strokeOpacity="0.6"
                  markerEnd="url(#arch-arrow)"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.25 + i * 0.06 }}
                />
                {e.label && (
                  <text
                    x={mx}
                    y={my - 5}
                    textAnchor="middle"
                    className="font-mono fill-[#8a857a]"
                    fontSize="8"
                    letterSpacing="0.06em"
                  >
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {Array.from(placed.values()).map((n, i) => {
            const lines = wrapLabel(n.label);
            return (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <rect
                  x={n.x}
                  y={n.y}
                  width={n.w}
                  height={NODE_H}
                  className="fill-white dark:fill-zinc-900 stroke-[rgba(10,10,10,0.2)] dark:stroke-[rgba(255,255,255,0.2)]"
                  strokeWidth="1"
                />
                <rect x={n.x} y={n.y} width="3" height={NODE_H} fill={KIND_COLOR[n.kind]} />
                {lines.map((line, li) => (
                  <text
                    key={li}
                    x={n.x + 14}
                    y={n.y + (lines.length === 1 ? 27 : 21 + li * 13)}
                    className="font-mono fill-[#0a0a0a] dark:fill-white"
                    fontSize="10"
                    letterSpacing="0.02em"
                  >
                    {line}
                  </text>
                ))}
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 pt-3 border-t border-[rgba(10,10,10,0.08)] dark:border-white/10">
        {kinds.map((k) => (
          <span key={k} className="flex items-center gap-2 font-mono text-[9px] tracking-[0.14em] uppercase text-[#8a857a]">
            <span className="w-2 h-2 inline-block" style={{ backgroundColor: KIND_COLOR[k] }} />
            {KIND_LABEL[k]}
          </span>
        ))}
      </div>
    </div>
  );
}
