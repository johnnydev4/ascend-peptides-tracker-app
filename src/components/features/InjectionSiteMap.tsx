"use client";

import { cn } from "@/lib/utils";
import { rotationStatus } from "@/lib/data/injection-sites";
import type { SiteUsageSummary } from "@/lib/types";

interface MarkerPosition {
  view: "front" | "back";
  x: number;
  y: number;
}

/** Marker coordinates per body region (viewBox 0 0 140 320). */
const REGION_POSITIONS: Record<string, MarkerPosition> = {
  abdomen_upper_right: { view: "front", x: 60, y: 98 },
  abdomen_upper_left: { view: "front", x: 80, y: 98 },
  abdomen_lower_right: { view: "front", x: 60, y: 116 },
  abdomen_lower_left: { view: "front", x: 80, y: 116 },
  arm_right: { view: "front", x: 35, y: 82 },
  arm_left: { view: "front", x: 105, y: 82 },
  thigh_right: { view: "front", x: 59, y: 192 },
  thigh_left: { view: "front", x: 81, y: 192 },
  glute_left: { view: "back", x: 60, y: 150 },
  glute_right: { view: "back", x: 80, y: 150 },
};

function BodySilhouette() {
  return (
    <g
      fill="none"
      stroke="var(--color-line-strong)"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="70" cy="26" r="15" />
      <path d="M64 41 v6 h12 v-6" />
      {/* torso */}
      <rect x="46" y="47" width="48" height="92" rx="21" />
      {/* arms */}
      <rect x="27" y="54" width="14" height="76" rx="7" />
      <rect x="99" y="54" width="14" height="76" rx="7" />
      {/* pelvis */}
      <rect x="48" y="134" width="44" height="30" rx="15" />
      {/* legs */}
      <rect x="50" y="160" width="18" height="132" rx="9" />
      <rect x="72" y="160" width="18" height="132" rx="9" />
    </g>
  );
}

function markerClass(status: "recent" | "used" | "unused", selected: boolean) {
  if (selected) return "fill-ink stroke-ink";
  switch (status) {
    case "recent":
      return "fill-ink stroke-ink";
    case "used":
      return "fill-tan stroke-tan";
    default:
      return "fill-surface stroke-line-strong";
  }
}

export function InjectionSiteMap({
  summaries,
  selectedId,
  onSelect,
  className,
}: {
  summaries: SiteUsageSummary[];
  selectedId?: string | null;
  onSelect?: (siteId: string) => void;
  className?: string;
}) {
  const renderView = (view: "front" | "back", label: string) => (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 140 320"
        className="w-full max-w-36"
        role="group"
        aria-label={`${label} of body — injection sites`}
      >
        <BodySilhouette />
        {summaries.map((summary) => {
          const pos = REGION_POSITIONS[summary.site.body_region];
          if (!pos || pos.view !== view || !summary.site.enabled) return null;
          const status = rotationStatus(summary);
          const selected = selectedId === summary.site.id;
          return (
            <circle
              key={summary.site.id}
              cx={pos.x}
              cy={pos.y}
              r={selected ? 8 : 6.5}
              strokeWidth="1.5"
              className={cn(
                "transition-all duration-150",
                markerClass(status, selected),
                onSelect && "cursor-pointer hover:opacity-80"
              )}
              role={onSelect ? "button" : undefined}
              aria-label={`${summary.site.name} — ${
                status === "recent"
                  ? "used recently"
                  : status === "used"
                  ? "used"
                  : "not used"
              }`}
              tabIndex={onSelect ? 0 : undefined}
              onClick={onSelect ? () => onSelect(summary.site.id) : undefined}
              onKeyDown={
                onSelect
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(summary.site.id);
                      }
                    }
                  : undefined
              }
            />
          );
        })}
      </svg>
      <span className="mt-1 text-xs text-muted">{label}</span>
    </div>
  );

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-4">
        {renderView("front", "Front")}
        {renderView("back", "Back")}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-ink inline-block" />
          Used recently
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-tan inline-block" />
          Used
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border border-line-strong bg-surface inline-block" />
          Not used
        </span>
      </div>
    </div>
  );
}
