"use client";

import { Check, Pencil } from "lucide-react";
import type { DoseWithRelations } from "@/lib/types";
import { formatAmount, formatDateTime, cn } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/Badge";

export function DoseCard({
  dose,
  onComplete,
  onEdit,
  className,
}: {
  dose: DoseWithRelations;
  onComplete?: (dose: DoseWithRelations) => void;
  onEdit?: (dose: DoseWithRelations) => void;
  className?: string;
}) {
  const amount = dose.dose_amount ?? dose.treatment?.dose_amount;
  const unit = dose.dose_unit ?? dose.treatment?.dose_unit ?? "";

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-line bg-surface px-4 py-3.5",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink truncate">
          {dose.treatment?.name ?? "Treatment"}
          {amount ? (
            <span className="ml-2 text-muted font-normal">
              {formatAmount(amount)} {unit}
            </span>
          ) : null}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {formatDateTime(dose.scheduled_at)}
          {dose.injection_site ? ` · ${dose.injection_site.name}` : ""}
        </p>
      </div>

      <Badge tone={statusTone(dose.status)}>{dose.status}</Badge>

      {onEdit && dose.status !== "completed" && (
        <button
          type="button"
          onClick={() => onEdit(dose)}
          aria-label="Edit dose"
          className="rounded-lg p-2 text-muted hover:bg-cream-deep hover:text-ink transition-colors"
        >
          <Pencil className="size-4" />
        </button>
      )}

      {onComplete && dose.status === "scheduled" && (
        <button
          type="button"
          onClick={() => onComplete(dose)}
          aria-label="Mark as completed"
          className="flex size-9 items-center justify-center rounded-full border border-line text-muted hover:border-sage hover:bg-sage-soft hover:text-sage transition-colors"
        >
          <Check className="size-4" />
        </button>
      )}
    </div>
  );
}
