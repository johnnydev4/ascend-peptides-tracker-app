"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useUser } from "@/hooks/useUser";
import { listDosesBetween } from "@/lib/data/doses";
import { getSiteUsageSummaries } from "@/lib/data/injection-sites";
import type { DoseWithRelations } from "@/lib/types";
import { cn, formatDay, toDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { DoseCard } from "@/components/features/DoseCard";
import { RecordDoseDialog } from "@/components/features/RecordDoseDialog";
import { EditDoseDialog } from "@/components/features/EditDoseDialog";

const statusDot: Record<string, string> = {
  scheduled: "bg-line-strong",
  completed: "bg-sage",
  missed: "bg-terracotta",
  skipped: "bg-amber",
};

export default function CalendarPage() {
  const { user } = useUser();
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [doseToRecord, setDoseToRecord] = useState<DoseWithRelations | null>(null);
  const [doseToEdit, setDoseToEdit] = useState<DoseWithRelations | null>(null);

  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });

  const { data, loading, refresh } = useAsyncData(async () => {
    const supabase = createClient();
    const [doses, siteSummaries] = await Promise.all([
      listDosesBetween(supabase, gridStart, gridEnd),
      getSiteUsageSummaries(supabase),
    ]);
    return { doses, siteSummaries };
  }, [month.toISOString()]);

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const dosesOn = (day: Date) =>
    (data?.doses ?? []).filter((d) => isSameDay(toDate(d.scheduled_at), day));
  const selectedDoses = dosesOn(selectedDay);

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Scheduled doses, generated from your treatments."
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader
            title={format(month, "MMMM yyyy")}
            action={
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMonth(addMonths(month, -1))}
                  aria-label="Previous month"
                  className="rounded-lg p-1.5 text-muted hover:bg-cream-deep hover:text-ink transition-colors"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMonth(startOfMonth(new Date()));
                    setSelectedDay(new Date());
                  }}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium text-muted hover:bg-cream-deep hover:text-ink transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setMonth(addMonths(month, 1))}
                  aria-label="Next month"
                  className="rounded-lg p-1.5 text-muted hover:bg-cream-deep hover:text-ink transition-colors"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            }
          />
          <CardBody>
            {loading && !data ? (
              <Spinner className="py-24" />
            ) : (
              <>
                <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted mb-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day) => {
                    const dayDoses = dosesOn(day);
                    const selected = isSameDay(day, selectedDay);
                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        aria-label={format(day, "MMMM d")}
                        aria-pressed={selected}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl py-2 text-sm transition-colors min-h-12",
                          !isSameMonth(day, month) && "text-muted/40",
                          selected
                            ? "bg-ink text-cream"
                            : isToday(day)
                            ? "bg-tan-faint text-ink font-semibold"
                            : "hover:bg-cream-deep text-ink-soft"
                        )}
                      >
                        {format(day, "d")}
                        <span className="flex gap-0.5 h-1.5">
                          {dayDoses.slice(0, 3).map((d) => (
                            <span
                              key={d.id}
                              className={cn(
                                "size-1.5 rounded-full",
                                selected ? "bg-cream/80" : statusDot[d.status]
                              )}
                            />
                          ))}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
                  {Object.entries({
                    Scheduled: "bg-line-strong",
                    Completed: "bg-sage",
                    Missed: "bg-terracotta",
                    Skipped: "bg-amber",
                  }).map(([label, color]) => (
                    <span key={label} className="flex items-center gap-1.5">
                      <span className={cn("size-2 rounded-full", color)} />
                      {label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </CardBody>
        </Card>

        <Card className="h-fit">
          <CardHeader title={formatDay(selectedDay)} />
          <CardBody className="space-y-2.5">
            {selectedDoses.length > 0 ? (
              selectedDoses.map((dose) => (
                <DoseCard
                  key={dose.id}
                  dose={dose}
                  onComplete={setDoseToRecord}
                  onEdit={setDoseToEdit}
                />
              ))
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No doses this day"
                className="py-8"
              />
            )}
          </CardBody>
        </Card>
      </div>

      {doseToRecord && user && data && (
        <RecordDoseDialog
          dose={doseToRecord}
          siteSummaries={data.siteSummaries}
          userId={user.id}
          open={!!doseToRecord}
          onClose={() => setDoseToRecord(null)}
          onRecorded={refresh}
        />
      )}
      {doseToEdit && (
        <EditDoseDialog
          dose={doseToEdit}
          open={!!doseToEdit}
          onClose={() => setDoseToEdit(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
