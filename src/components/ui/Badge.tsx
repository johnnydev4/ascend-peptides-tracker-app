import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "tan" | "sage" | "amber" | "terracotta";

const tones: Record<Tone, string> = {
  neutral: "bg-cream-deep text-ink-soft",
  tan: "bg-tan-soft text-ink-soft",
  sage: "bg-sage-soft text-sage",
  amber: "bg-amber-soft text-amber",
  terracotta: "bg-terracotta-soft text-terracotta",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): Tone {
  switch (status) {
    case "completed":
      return "sage";
    case "missed":
      return "terracotta";
    case "skipped":
      return "amber";
    case "active":
      return "sage";
    case "paused":
      return "amber";
    case "severe":
      return "terracotta";
    case "moderate":
      return "amber";
    case "mild":
      return "sage";
    default:
      return "neutral";
  }
}
