"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px] animate-[fade-in_0.2s_ease-out]"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        className={cn(
          "relative w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto",
          "bg-surface border border-line shadow-raised",
          "rounded-t-3xl sm:rounded-card animate-rise",
          className
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-surface/95 backdrop-blur px-5 pt-5 pb-3 sm:px-6 border-b border-line/60">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-cream-deep hover:text-ink transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
