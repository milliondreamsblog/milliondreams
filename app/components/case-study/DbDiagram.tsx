"use client";

import { motion } from "framer-motion";
import type { DbDiagramSpec, DbEntity } from "../../data/case-studies/types";

/**
 * Entity-relationship diagram. Entities render as boxes (name bar + field
 * rows) arranged in a grid; relations are beziers between box edges with
 * small mono labels.
 */

const BOX_W = 172;
const TITLE_H = 26;
const FIELD_H = 15;
const COL_GAP = 96;
const ROW_GAP = 44;
const PAD = 12;

interface PlacedEntity extends DbEntity {
  x: number;
  y: number;
  h: number;
}

function layout(spec: DbDiagramSpec) {
  const n = spec.entities.length;
  const cols = n <= 2 ? n : n <= 6 ? 3 : 4;

  const placed = new Map<string, PlacedEntity>();
  const colHeights = Array.from({ length: cols }, () => PAD);

  spec.entities.forEach((e, i) => {
    const c = i % cols;
    const h = TITLE_H + e.fields.length * FIELD_H + 8;
    placed.set(e.name, {
      ...e,
      x: PAD + c * (BOX_W + COL_GAP),
      y: colHeights[c],
      h,
    });
    colHeights[c] += h + ROW_GAP;
  });

  return {
    placed,
    width: PAD * 2 + cols * BOX_W + (cols - 1) * COL_GAP,
    height: Math.max(...colHeights) - ROW_GAP + PAD,
  };
}

function relationPath(a: PlacedEntity, b: PlacedEntity) {
  const aRight = a.x + BOX_W;
  const bRight = b.x + BOX_W;
  const ay = a.y + a.h / 2;
  const by = b.y + b.h / 2;

  let x1: number, x2: number;
  if (bRight < a.x) {
    x1 = a.x;
    x2 = bRight;
  } else if (b.x > aRight) {
    x1 = aRight;
    x2 = b.x;
  } else {
    // vertically stacked — connect bottom to top
    const y1 = by > ay ? a.y + a.h : a.y;
    const y2 = by > ay ? b.y : b.y + b.h;
    const cx = a.x + BOX_W / 2 + 20;
    return {
      d: `M ${a.x + BOX_W / 2} ${y1} C ${cx} ${(y1 + y2) / 2}, ${cx} ${(y1 + y2) / 2}, ${b.x + BOX_W / 2} ${y2}`,
      mx: cx + 4,
      my: (y1 + y2) / 2,
    };
  }
  const dx = (x2 - x1) / 2;
  return {
    d: `M ${x1} ${ay} C ${x1 + dx} ${ay}, ${x2 - dx} ${by}, ${x2} ${by}`,
    mx: (x1 + x2) / 2,
    my: (ay + by) / 2 - 5,
  };
}

export function DbDiagram({ spec }: { spec: DbDiagramSpec }) {
  const { placed, width, height } = layout(spec);

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ minWidth: Math.min(width, 600), maxWidth: width * 1.4 }}
        role="img"
        aria-label="Data model diagram"
      >
        <defs>
          <marker
            id="db-arrow"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 8 4 L 0 8 z" fill="#8a857a" />
          </marker>
        </defs>

        {/* Relations */}
        {spec.relations.map((r, i) => {
          const a = placed.get(r.from);
          const b = placed.get(r.to);
          if (!a || !b) return null;
          const { d, mx, my } = relationPath(a, b);
          return (
            <g key={`${r.from}-${r.to}-${i}`}>
              <motion.path
                d={d}
                fill="none"
                stroke="#8a857a"
                strokeWidth="1"
                strokeOpacity="0.55"
                strokeDasharray="3 3"
                markerEnd="url(#db-arrow)"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
              />
              {r.label && (
                <text
                  x={mx}
                  y={my}
                  textAnchor="middle"
                  className="font-mono fill-[#8a857a]"
                  fontSize="8"
                  letterSpacing="0.05em"
                >
                  {r.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Entities */}
        {Array.from(placed.values()).map((e, i) => (
          <motion.g
            key={e.name}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <rect
              x={e.x}
              y={e.y}
              width={BOX_W}
              height={e.h}
              className="fill-white dark:fill-zinc-900 stroke-[rgba(10,10,10,0.2)] dark:stroke-[rgba(255,255,255,0.2)]"
              strokeWidth="1"
            />
            <rect x={e.x} y={e.y} width={BOX_W} height={TITLE_H} fill="#2d4a3e" />
            <text
              x={e.x + 10}
              y={e.y + 17}
              className="font-mono"
              fontSize="10"
              letterSpacing="0.08em"
              fill="#a8d5c4"
            >
              {e.name}
            </text>
            {e.fields.map((f, fi) => (
              <text
                key={f}
                x={e.x + 10}
                y={e.y + TITLE_H + 14 + fi * FIELD_H}
                className="font-mono fill-[rgba(10,10,10,0.55)] dark:fill-[rgba(255,255,255,0.55)]"
                fontSize="9"
              >
                {f}
              </text>
            ))}
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
