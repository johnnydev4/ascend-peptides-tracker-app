"use client";

import { Check, Lock, Pencil } from "lucide-react";
import type { DoseWithRelations } from "@/lib/types";
import { formatAmount, formatDateTime, isDoseCompletable, cn } from "@/lib/utils";
import { doseDrawUnits } from "@/lib/calculations/syringe";
import { Badge, statusTone } from "@/components/ui/Badge";
import { useI18n } from "@/lib/i18n/context";
import { statusLabel, siteName } from "@/lib/i18n/labels";

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
  const { t } = useI18n();
  const amount = dose.dose_amount ?? dose.treatment?.dose_amount;
  const unit = dose.dose_unit ?? dose.treatment?.dose_unit ?? "";
  const completable = isDoseCompletable(dose.scheduled_at);
  // A dose can be recorded once its day has arrived — this includes past
  // "missed" or "skipped" doses the user forgot to complete on the day.
  const canComplete = dose.status !== "completed" && completable;
  const draw = doseDrawUnits(dose.treatment, amount, unit);

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-line bg-surface px-4 py-3.5",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink truncate">
          {dose.treatment?.name ?? t("hist.treatment")}
          {amount ? (
            <span className="ml-2 text-muted font-normal">
              {formatAmount(amount)} {unit}
            </span>
          ) : null}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {formatDateTime(dose.scheduled_at)}
          {dose.injection_site ? ` · ${siteName(t, dose.injection_site)}` : ""}
        </p>
        {draw && (
          <p className="mt-0.5 text-xs font-medium text-ink-soft">
            {t("dose.inUnits", {
              units: formatAmount(draw.units),
              syringe: draw.syringe,
            })}
          </p>
        )}
      </div>

      <Badge tone={statusTone(dose.status)}>{statusLabel(t, dose.status)}</Badge>

      {onEdit && dose.status !== "completed" && (
        <button
          type="button"
          onClick={() => onEdit(dose)}
          aria-label={t("common.edit")}
          className="rounded-lg p-2 text-muted hover:bg-cream-deep hover:text-ink transition-colors"
        >
          <Pencil className="size-4" />
        </button>
      )}

      {onComplete && canComplete && (
        <button
          type="button"
          onClick={() => onComplete(dose)}
          aria-label={
            dose.status === "scheduled"
              ? t("dash.markCompleted")
              : t("dose.completePast")
          }
          title={
            dose.status === "scheduled"
              ? t("dash.markCompleted")
              : t("dose.completePast")
          }
          className="flex size-9 items-center justify-center rounded-full border border-line text-muted hover:border-sage hover:bg-sage-soft hover:text-sage transition-colors"
        >
          <Check className="size-4" />
        </button>
      )}

      {onComplete && dose.status === "scheduled" && !completable && (
        <span
          aria-label={t("dose.notYetAvailable")}
          title={t("dose.notYetAvailable")}
          className="flex size-9 items-center justify-center rounded-full border border-dashed border-line text-muted/50"
        >
          <Lock className="size-3.5" />
        </span>
      )}
    </div>
  );
}
