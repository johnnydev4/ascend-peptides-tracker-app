"use client";

import { Trash2 } from "lucide-react";
import type { SideEffectWithTreatment } from "@/lib/types";
import { formatDateTime, cn } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/Badge";

export function SideEffectCard({
  sideEffect,
  onDelete,
  className,
}: {
  sideEffect: SideEffectWithTreatment;
  onDelete?: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-2xl border border-line bg-surface px-4 py-3.5",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-ink">{sideEffect.name}</p>
          <Badge tone={statusTone(sideEffect.severity)}>
            {sideEffect.severity}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted">
          {formatDateTime(sideEffect.started_at)}
          {sideEffect.treatment ? ` · ${sideEffect.treatment.name}` : ""}
        </p>
        {sideEffect.notes && (
          <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">
            {sideEffect.notes}
          </p>
        )}
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(sideEffect.id)}
          aria-label={`Delete ${sideEffect.name} record`}
          className="rounded-lg p-2 text-muted hover:bg-terracotta-soft hover:text-terracotta transition-colors"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}
