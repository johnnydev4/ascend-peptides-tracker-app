"use client";

import { useId, useMemo } from "react";
import { formatWith, formatAmount } from "@/lib/utils";

export interface LinePoint {
  /** X position as a timestamp (ms). */
  t: number;
  /** Y value. */
  y: number;
}

/**
 * A small, dependency-free SVG line chart for a single metric over time.
 * Uses the app's design tokens and scales responsively via viewBox.
 */
export function LineChart({
  points,
  color = "var(--color-sage)",
  unit = "",
  height = 260,
}: {
  points: LinePoint[];
  color?: string;
  unit?: string;
  height?: number;
}) {
  const gradId = useId();
  const W = 640;
  const H = height;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 28;

  const chart = useMemo(() => {
    const sorted = [...points].sort((a, b) => a.t - b.t);
    if (sorted.length === 0) return null;

    const ys = sorted.map((p) => p.y);
    let minY = Math.min(...ys);
    let maxY = Math.max(...ys);
    if (minY === maxY) {
      // Give a flat series some vertical room.
      minY -= 1;
      maxY += 1;
    }
    const padY = (maxY - minY) * 0.12;
    minY -= padY;
    maxY += padY;

    const minT = sorted[0].t;
    const maxT = sorted[sorted.length - 1].t;
    const spanT = maxT - minT || 1;

    const sx = (t: number) => padL + ((t - minT) / spanT) * (W - padL - padR);
    const sy = (y: number) =>
      padT + (1 - (y - minY) / (maxY - minY)) * (H - padT - padB);

    const coords = sorted.map((p) => ({ x: sx(p.t), y: sy(p.y), raw: p }));
    const linePath = coords
      .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
      .join(" ");
    const areaPath =
      coords.length > 1
        ? `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${(
            H - padB
          ).toFixed(1)} L${coords[0].x.toFixed(1)},${(H - padB).toFixed(1)} Z`
        : "";

    // Four horizontal gridlines / y ticks.
    const ticks = Array.from({ length: 4 }, (_, i) => {
      const value = minY + ((maxY - minY) * i) / 3;
      return { value, y: sy(value) };
    });

    return { coords, linePath, areaPath, ticks, minT, maxT };
  }, [points, H]);

  if (!chart) return null;

  // useId() can contain ":" which is unsafe inside url(#…); strip it.
  const gridId = `grad-${gradId.replace(/:/g, "")}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gridId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y gridlines + labels */}
      {chart.ticks.map((tick, i) => (
        <g key={i}>
          <line
            x1={padL}
            y1={tick.y}
            x2={W - padR}
            y2={tick.y}
            stroke="var(--color-line)"
            strokeWidth="1"
          />
          <text
            x={padL - 8}
            y={tick.y + 3.5}
            textAnchor="end"
            fontSize="10"
            fill="var(--color-muted)"
          >
            {formatAmount(Number(tick.value.toFixed(1)))}
          </text>
        </g>
      ))}

      {/* Area + line */}
      {chart.areaPath && <path d={chart.areaPath} fill={`url(#${gridId})`} />}
      <path
        d={chart.linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Points */}
      {chart.coords.map((c, i) => (
        <circle
          key={i}
          cx={c.x}
          cy={c.y}
          r="3"
          fill="var(--color-surface)"
          stroke={color}
          strokeWidth="2"
        >
          <title>
            {formatWith(new Date(c.raw.t), "d MMM yyyy")}:{" "}
            {formatAmount(c.raw.y)} {unit}
          </title>
        </circle>
      ))}

      {/* X axis labels: first, middle, last */}
      {[chart.minT, (chart.minT + chart.maxT) / 2, chart.maxT].map((t, i) => {
        const x =
          padL +
          ((t - chart.minT) / (chart.maxT - chart.minT || 1)) *
            (W - padL - padR);
        return (
          <text
            key={i}
            x={Math.min(Math.max(x, padL), W - padR)}
            y={H - 8}
            textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
            fontSize="10"
            fill="var(--color-muted)"
          >
            {formatWith(new Date(t), "d MMM")}
          </text>
        );
      })}
    </svg>
  );
}
