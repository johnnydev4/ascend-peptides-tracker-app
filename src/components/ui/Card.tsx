import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // min-w-0: as a grid/flex child the default `min-width:auto` resolves to
        // the card's min-content width, which on phones pushes the card wider
        // than its track and shoves the whole page off-centre.
        "min-w-0 bg-surface border border-line rounded-card shadow-soft",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  action,
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-5 pt-5 pb-3 sm:px-6",
        className
      )}
    >
      <h2 className="text-sm font-semibold tracking-wide text-ink">{title}</h2>
      {action}
    </div>
  );
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5 sm:px-6", className)} {...props} />;
}
