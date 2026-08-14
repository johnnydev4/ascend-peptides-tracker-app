import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  label,
}: {
  /** 0–100 */
  value: number;
  className?: string;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
      className={cn("h-2 w-full rounded-full bg-cream-deep overflow-hidden", className)}
    >
      <div
        className="h-full rounded-full bg-tan transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
