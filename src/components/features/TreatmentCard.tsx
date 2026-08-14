import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Treatment } from "@/lib/types";
import { formatAmount, formatClockTime, formatFullDate } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

function frequencyLabel(treatment: Treatment): string {
  switch (treatment.frequency) {
    case "daily":
      return "Daily";
    case "every_n_days":
      return `Every ${treatment.interval_days} days`;
    case "weekly_days": {
      const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return (treatment.scheduled_days ?? [])
        .map((d) => names[d])
        .join(", ");
    }
  }
}

export function TreatmentCard({
  treatment,
  completed,
  total,
}: {
  treatment: Treatment;
  completed?: number;
  total?: number;
}) {
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
              {frequencyLabel(treatment)} ·{" "}
              {formatClockTime(treatment.scheduled_time)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={statusTone(treatment.status)}>{treatment.status}</Badge>
            <ChevronRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {pct !== null && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted mb-1.5">
              <span>
                {completed} of {total} doses
              </span>
              <span>{Math.round(pct)}%</span>
            </div>
            <ProgressBar value={pct} label={`${treatment.name} progress`} />
          </div>
        )}

        <p className="mt-3 text-xs text-muted">
          Started {formatFullDate(treatment.start_date)}
          {treatment.end_date ? ` · ends ${formatFullDate(treatment.end_date)}` : ""}
        </p>
      </Card>
    </Link>
  );
}
