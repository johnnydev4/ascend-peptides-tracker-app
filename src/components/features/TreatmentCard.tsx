"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Treatment } from "@/lib/types";
import { formatAmount, formatClockTime, formatFullDate } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useI18n } from "@/lib/i18n/context";
import { treatmentStatusLabel } from "@/lib/i18n/labels";

export function TreatmentCard({
  treatment,
  completed,
  total,
}: {
  treatment: Treatment;
  completed?: number;
  total?: number;
}) {
  const { t } = useI18n();

  function frequencyLabel(): string {
    switch (treatment.frequency) {
      case "daily":
        return t("tr.freq.daily");
      case "every_n_days":
        return t("tr.freq.everyN", { n: treatment.interval_days ?? 0 });
      case "weekly_days":
        return (treatment.scheduled_days ?? [])
          .map((d) => t(`weekday.${d}`))
          .join(", ");
    }
  }

  const pct =
    total && total > 0 && completed !== undefined
      ? (completed / total) * 100
      : null;

  return (
    <Link href={`/treatments/${treatment.id}`} className="block group">
      <Card className="p-5 transition-shadow group-hover:shadow-raised">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-ink">
              {treatment.name}
            </h3>
            <p className="mt-0.5 text-sm text-muted">
              {formatAmount(treatment.dose_amount)} {treatment.dose_unit} ·{" "}
              {frequencyLabel()} · {formatClockTime(treatment.scheduled_time)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={statusTone(treatment.status)}>
              {treatmentStatusLabel(t, treatment.status)}
            </Badge>
            <ChevronRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {pct !== null && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted mb-1.5">
              <span>
                {t("tr.dosesOf", { completed: completed ?? 0, total: total ?? 0 })}
              </span>
              <span>{Math.round(pct)}%</span>
            </div>
            <ProgressBar value={pct} label={treatment.name} />
          </div>
        )}

        <p className="mt-3 text-xs text-muted">
          {treatment.end_date
            ? t("tr.startedEnds", {
                start: formatFullDate(treatment.start_date),
                end: formatFullDate(treatment.end_date),
              })
            : t("tr.started", { date: formatFullDate(treatment.start_date) })}
        </p>
      </Card>
    </Link>
  );
}
