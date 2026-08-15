"use client";

export interface Bar {
  label: string;
  /** Stacked segments drawn bottom-up. */
  segments: { value: number; color: string }[];
}

/**
 * A small, dependency-free stacked bar chart (e.g. doses per week by status).
 * Scales responsively via viewBox and uses the app's design tokens.
 */
export function BarChart({
  bars,
  height = 220,
}: {
  bars: Bar[];
  height?: number;
}) {
  const W = 640;
  const H = height;
  const padL = 28;
  const padR = 12;
  const padT = 12;
  const padB = 28;

  const maxTotal = Math.max(
    1,
    ...bars.map((b) => b.segments.reduce((s, seg) => s + seg.value, 0))
  );
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const slot = innerW / Math.max(1, bars.length);
  const barW = Math.min(38, slot * 0.62);

  // Up to 4 y ticks (integers).
  const tickCount = Math.min(4, maxTotal);
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) =>
    Math.round((maxTotal * i) / tickCount)
  ).filter((v, i, arr) => arr.indexOf(v) === i);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      preserveAspectRatio="xMidYMid meet"
    >
      {ticks.map((v, i) => {
        const y = padT + (1 - v / maxTotal) * innerH;
        return (
          <g key={i}>
            <line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="var(--color-line)"
              strokeWidth="1"
            />
            <text
              x={padL - 6}
              y={y + 3.5}
              textAnchor="end"
              fontSize="10"
              fill="var(--color-muted)"
            >
              {v}
            </text>
          </g>
        );
      })}

      {bars.map((bar, i) => {
        const cx = padL + slot * i + slot / 2;
        const x = cx - barW / 2;
        let cursorY = padT + innerH;
        return (
          <g key={i}>
            {bar.segments.map((seg, j) => {
              const h = (seg.value / maxTotal) * innerH;
              cursorY -= h;
              if (seg.value === 0) return null;
              return (
                <rect
                  key={j}
                  x={x}
                  y={cursorY}
                  width={barW}
                  height={h}
                  rx={j === bar.segments.length - 1 ? 3 : 0}
                  fill={seg.color}
                >
                  <title>
                    {bar.label}: {seg.value}
                  </title>
                </rect>
              );
            })}
            <text
              x={cx}
              y={H - 8}
              textAnchor="middle"
              fontSize="9.5"
              fill="var(--color-muted)"
            >
              {bar.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
