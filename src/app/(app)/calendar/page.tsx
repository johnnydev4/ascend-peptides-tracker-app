"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays, FlaskConical } from "lucide-react";
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
import { listVialExpirations } from "@/lib/data/treatments";
import type { DoseWithRelations, Treatment } from "@/lib/types";
import { cn, daysUntil, formatDay, formatMonthYear, toDate } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { DoseCard } from "@/components/features/DoseCard";
import { RecordDoseDialog } from "@/components/features/RecordDoseDialog";
import { EditDoseDialog } from "@/components/features/EditDoseDialog";

/** A vial expiring on the selected day, shown above that day's doses. */
function VialExpiryRow({ treatment }: { treatment: Treatment }) {
  const { t } = useI18n();
  const left = daysUntil(treatment.vial_expires_at as string);
  return (
    <Link
      href={`/treatments/${treatment.id}`}
      className="flex items-center gap-3 rounded-2xl border border-terracotta/40 bg-terracotta-soft px-4 py-3 transition-colors hover:border-terracotta"
    >
      <FlaskConical className="size-4 shrink-0 text-terracotta" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">
          {t("vial.expiresOn", { name: treatment.name })}
        </p>
        <p className="text-xs text-muted">
          {left < 0
            ? t("vial.expiredAgo", { days: Math.abs(left) })
            : left === 0
            ? t("vial.expiresToday")
            : t("vial.expiresInDays", { days: left })}
        </p>
      </div>
    </Link>
  );
}

const statusDot: Record<string, string> = {
  scheduled: "bg-line-strong",
  completed: "bg-sage",
  missed: "bg-terracotta",
  skipped: "bg-amber",
};

export default function CalendarPage() {
  const { user } = useUser();
  const { t } = useI18n();
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [doseToRecord, setDoseToRecord] = useState<DoseWithRelations | null>(null);
  const [doseToEdit, setDoseToEdit] = useState<DoseWithRelations | null>(null);

  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });

  const { data, loading, refresh } = useAsyncData(async () => {
    const supabase = createClient();
    const [doses, siteSummaries, vialExpirations] = await Promise.all([
      listDosesBetween(supabase, gridStart, gridEnd),
      getSiteUsageSummaries(supabase),
      listVialExpirations(supabase),
    ]);
    return { doses, siteSummaries, vialExpirations };
  }, [month.toISOString()]);

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const dosesOn = (day: Date) =>
    (data?.doses ?? []).filter((d) => isSameDay(toDate(d.scheduled_at), day));
  const expiriesOn = (day: Date) =>
    (data?.vialExpirations ?? []).filter((tr) =>
      isSameDay(toDate(tr.vial_expires_at as string), day)
    );
  const selectedDoses = dosesOn(selectedDay);
  const selectedExpiries = expiriesOn(selectedDay);

  return (
    <div>
      <PageHeader title={t("cal.title")} subtitle={t("cal.subtitle")} />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader
            title={formatMonthYear(month)}
            action={
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMonth(addMonths(month, -1))}
                  aria-label={t("cal.prevMonth")}
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
                  {t("cal.today")}
                </button>
                <button
                  type="button"
                  onClick={() => setMonth(addMonths(month, 1))}
                  aria-label={t("cal.nextMonth")}
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
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                    <span key={d}>{t(`weekday.${d}`)}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day) => {
                    const dayDoses = dosesOn(day);
                    const dayExpiries = expiriesOn(day);
                    const selected = isSameDay(day, selectedDay);
                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        aria-label={
                          dayExpiries.length > 0
                            ? `${formatDay(day)} — ${t("vial.expiresLabel")}`
                            : formatDay(day)
                        }
                        aria-pressed={selected}
                        className={cn(
                          "relative flex flex-col items-center gap-1 rounded-xl py-2 text-sm transition-colors min-h-12",
                          !isSameMonth(day, month) && "text-muted/40",
                          selected
                            ? "bg-ink text-cream"
                            : isToday(day)
                            ? "bg-tan-faint text-ink font-semibold"
                            : "hover:bg-cream-deep text-ink-soft"
                        )}
                      >
                        {dayExpiries.length > 0 && (
                          <FlaskConical
                            className={cn(
                              "absolute right-1 top-1 size-3",
                              selected ? "text-cream/80" : "text-terracotta"
                            )}
                            aria-hidden
                          />
                        )}
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
                  {[
                    ["statusOpt.scheduled", "bg-line-strong"],
                    ["statusOpt.completed", "bg-sage"],
                    ["statusOpt.missed", "bg-terracotta"],
                    ["statusOpt.skipped", "bg-amber"],
                  ].map(([labelKey, color]) => (
                    <span key={labelKey} className="flex items-center gap-1.5">
                      <span className={cn("size-2 rounded-full", color)} />
                      {t(labelKey)}
                    </span>
                  ))}
                  <span className="flex items-center gap-1.5">
                    <FlaskConical className="size-3 text-terracotta" />
                    {t("vial.expiresLabel")}
                  </span>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        <Card className="h-fit">
          <CardHeader title={formatDay(selectedDay)} />
          <CardBody className="space-y-2.5">
            {selectedExpiries.map((tr) => (
              <VialExpiryRow key={tr.id} treatment={tr} />
            ))}
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
              selectedExpiries.length === 0 && (
                <EmptyState
                  icon={CalendarDays}
                  title={t("cal.noDosesDay")}
                  className="py-8"
                />
              )
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
