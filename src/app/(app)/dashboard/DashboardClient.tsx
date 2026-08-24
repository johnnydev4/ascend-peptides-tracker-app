"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Syringe,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { differenceInCalendarWeeks, isSameDay } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useAsyncData } from "@/hooks/useAsyncData";
import { listTreatments } from "@/lib/data/treatments";
import {
  getNextScheduledDose,
  listDoses,
  sweepMissedDoses,
} from "@/lib/data/doses";
import {
  ensureDefaultSites,
  getSiteUsageSummaries,
  recommendNextSite,
} from "@/lib/data/injection-sites";
import { listSideEffects } from "@/lib/data/side-effects";
import type { DoseWithRelations, SideEffectWithTreatment } from "@/lib/types";
import {
  formatAmount,
  formatCountdown,
  formatDateTime,
  formatFullDate,
  isDoseCompletable,
} from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { RecordDoseDialog } from "@/components/features/RecordDoseDialog";
import { SideEffectDialog } from "@/components/features/SideEffectDialog";
import { SideEffectCard } from "@/components/features/SideEffectCard";
import { DoseCard } from "@/components/features/DoseCard";
import { InjectionSiteMap } from "@/components/features/InjectionSiteMap";
import { doseDrawUnits } from "@/lib/calculations/syringe";
import { useI18n } from "@/lib/i18n/context";
import { siteName } from "@/lib/i18n/labels";

export function DashboardClient({
  userId,
  displayName,
}: {
  userId: string;
  displayName: string;
}) {
  const { t } = useI18n();
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("dash.morning");
    if (hour < 18) return t("dash.afternoon");
    return t("dash.evening");
  };
  const [recordOpen, setRecordOpen] = useState(false);
  const [sideEffectOpen, setSideEffectOpen] = useState(false);
  const [sideEffectToEdit, setSideEffectToEdit] =
    useState<SideEffectWithTreatment | null>(null);
  const [doseToRecord, setDoseToRecord] = useState<DoseWithRelations | null>(
    null
  );

  const [doseIndex, setDoseIndex] = useState(0);

  const { data, loading, refresh } = useAsyncData(async () => {
    const supabase = createClient();
    await Promise.all([
      ensureDefaultSites(supabase, userId),
      sweepMissedDoses(supabase),
    ]);
    const [
      nextDose,
      treatments,
      allDoses,
      siteSummaries,
      sideEffects,
      upcoming,
      headerDoses,
    ] = await Promise.all([
      getNextScheduledDose(supabase),
      listTreatments(supabase),
      supabase
        .from("doses")
        .select("id, status, scheduled_at, treatment_id")
        .then(({ data: rows, error }) => {
          if (error) throw error;
          return rows ?? [];
        }),
      getSiteUsageSummaries(supabase),
      listSideEffects(supabase, { limit: 3 }),
      listDoses(supabase, {
        status: "scheduled",
        from: new Date().toISOString(),
        limit: 4,
        ascending: true,
      }),
      listDoses(supabase, {
        status: "scheduled",
        from: new Date(Date.now() - 12 * 3600_000).toISOString(),
        limit: 30,
        ascending: true,
      }),
    ]);
    return {
      nextDose,
      treatments,
      allDoses,
      siteSummaries,
      sideEffects,
      upcoming,
      headerDoses,
    };
  }, [userId]);

  // All scheduled doses sharing the day of the next upcoming dose — the header
  // rotates through these (handles multiple doses on the same day).
  const dayDoses = useMemo(() => {
    const list = data?.headerDoses ?? [];
    if (list.length === 0) return [];
    const firstDay = new Date(list[0].scheduled_at);
    return list.filter((d) => isSameDay(new Date(d.scheduled_at), firstDay));
  }, [data]);

  // Keep the selected index valid when the dose list changes.
  useEffect(() => {
    setDoseIndex((i) => (dayDoses.length > 0 ? i % dayDoses.length : 0));
  }, [dayDoses.length]);

  const stats = useMemo(() => {
    if (!data) return null;
    const completed = data.allDoses.filter((d) => d.status === "completed").length;
    const missed = data.allDoses.filter((d) => d.status === "missed").length;
    const remaining = data.allDoses.filter((d) => d.status === "scheduled").length;
    const past = completed + missed;
    return {
      completed,
      remaining,
      adherence: past > 0 ? Math.round((completed / past) * 100) : null,
      sitesUsed: data.siteSummaries.filter((s) => s.injectionCount > 0).length,
      sitesTotal: data.siteSummaries.filter((s) => s.site.enabled).length,
      sideEffectCount: data.sideEffects.length,
    };
  }, [data]);

  if (loading || !data || !stats) return <Spinner />;

  // Header rotates through the next day's doses; falls back to the next one.
  const displayDose =
    dayDoses.length > 0 ? dayDoses[doseIndex % dayDoses.length] : data.nextDose;

  // Every treatment currently in progress (paused/completed/archived excluded).
  const activeTreatments = data.treatments
    .filter((tr) => tr.status === "active")
    .map((tr) => {
      const doses = data.allDoses.filter((d) => d.treatment_id === tr.id);
      const completed = doses.filter((d) => d.status === "completed").length;
      const progressPct = doses.length > 0 ? (completed / doses.length) * 100 : 0;
      const currentWeek = Math.min(
        differenceInCalendarWeeks(new Date(), new Date(tr.start_date)) + 1,
        tr.duration_weeks ?? Infinity
      );
      return { treatment: tr, doses, completed, progressPct, currentWeek };
    });
  const recommended = recommendNextSite(data.siteSummaries);

  if (data.treatments.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink mb-6">
          {greeting()}, {displayName}
        </h1>
        <Card>
          <EmptyState
            icon={Syringe}
            title={t("dash.noTreatmentsTitle")}
            description={t("dash.noTreatmentsDesc")}
            action={
              <Link href="/treatments/new">
                <Button>
                  <Plus className="size-4" /> {t("dash.createTreatment")}
                </Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink mb-6">
        {greeting()}, {displayName}
      </h1>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Next dose */}
        <Card className="flex flex-col lg:col-span-2">
          <CardHeader title={t("dash.nextDose")} />
          <CardBody className="flex flex-1 flex-col">
            {displayDose ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                  <p className="text-2xl font-semibold tracking-tight text-ink">
                    {formatDateTime(displayDose.scheduled_at)}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {displayDose.treatment?.name} ·{" "}
                    {formatAmount(
                      displayDose.dose_amount ??
                        displayDose.treatment?.dose_amount ??
                        0
                    )}{" "}
                    {displayDose.dose_unit ??
                      displayDose.treatment?.dose_unit}{" "}
                    · {formatCountdown(displayDose.scheduled_at)}
                  </p>
                  {(() => {
                    const draw = doseDrawUnits(
                      displayDose.treatment,
                      displayDose.dose_amount ??
                        displayDose.treatment?.dose_amount,
                      displayDose.dose_unit ??
                        displayDose.treatment?.dose_unit
                    );
                    return draw ? (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-tan-faint border border-tan-soft px-2.5 py-1 text-sm font-medium text-ink-soft">
                        <Syringe className="size-3.5 text-muted" />
                        {t("dash.drawUnits", {
                          units: formatAmount(draw.units),
                          syringe: draw.syringe,
                        })}
                      </p>
                    ) : null;
                  })()}
                  </div>
                {isDoseCompletable(displayDose.scheduled_at) ? (
                  <Button
                    onClick={() => {
                      setDoseToRecord(displayDose);
                      setRecordOpen(true);
                    }}
                  >
                    {t("dash.markCompleted")}
                  </Button>
                ) : (
                  <p className="text-xs text-muted max-w-40 text-right">
                    {t("dose.notYetAvailable")}
                  </p>
                )}
                </div>
                {dayDoses.length > 1 && (
                  <div className="mt-auto flex items-center gap-3 pt-6">
                    <button
                      type="button"
                      aria-label={t("common.prev")}
                      onClick={() =>
                        setDoseIndex(
                          (i) => (i - 1 + dayDoses.length) % dayDoses.length
                        )
                      }
                      className="flex size-8 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-tan-soft hover:text-ink"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="text-xs font-medium tabular-nums text-muted">
                      {(doseIndex % dayDoses.length) + 1} / {dayDoses.length}
                    </span>
                    <button
                      type="button"
                      aria-label={t("common.next")}
                      onClick={() =>
                        setDoseIndex((i) => (i + 1) % dayDoses.length)
                      }
                      className="flex size-8 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-tan-soft hover:text-ink"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted py-2">
                {t("dash.noUpcoming")}{" "}
                <Link
                  href="/treatments"
                  className="text-ink font-medium hover:underline underline-offset-4"
                >
                  {t("dash.reviewTreatments")}
                </Link>
              </p>
            )}
          </CardBody>
        </Card>

        {/* Treatment progress */}
        <Card>
          <CardHeader title={t("dash.treatmentProgress")} />
          <CardBody>
            {activeTreatments.length > 0 ? (
              <div className="space-y-5">
                {activeTreatments.map(
                  ({ treatment, completed, doses, progressPct, currentWeek }) => (
                    <div key={treatment.id}>
                      <div className="flex items-baseline justify-between">
                        <p className="text-sm font-medium text-ink">
                          {treatment.name}
                        </p>
                        {currentWeek && treatment.duration_weeks ? (
                          <p className="text-xs text-muted">
                            {t("dash.weekOf", {
                              n: Math.max(1, currentWeek),
                              total: treatment.duration_weeks,
                            })}
                          </p>
                        ) : null}
                      </div>
                      <div className="mt-3">
                        <ProgressBar value={progressPct} />
                        <div className="mt-2 flex items-center justify-between text-xs text-muted">
                          <span>
                            {t("dash.dosesOf", {
                              completed,
                              total: doses.length,
                            })}
                          </span>
                          <span>{Math.round(progressPct)}%</span>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted">
                        {formatFullDate(treatment.start_date)}
                        {treatment.end_date
                          ? ` → ${formatFullDate(treatment.end_date)}`
                          : ""}
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">{t("dash.noActive")}</p>
            )}
          </CardBody>
        </Card>

        {/* Site rotation */}
        <Card>
          <CardHeader
            title={t("dash.injectionSites")}
            action={
              <Link
                href="/injection-sites"
                className="text-xs font-medium text-muted hover:text-ink transition-colors flex items-center gap-1"
              >
                {t("common.viewAll")} <ArrowRight className="size-3" />
              </Link>
            }
          />
          <CardBody>
            <InjectionSiteMap summaries={data.siteSummaries} />
            {recommended && (
              <p className="mt-4 text-sm text-ink-soft bg-tan-faint border border-tan-soft rounded-xl px-3.5 py-2.5">
                {t("dash.nextSuggested", {
                  name: siteName(t, recommended.site),
                })}
              </p>
            )}
          </CardBody>
        </Card>

        {/* Upcoming doses */}
        <Card>
          <CardHeader
            title={t("dash.upcomingDoses")}
            action={
              <Link
                href="/calendar"
                className="text-xs font-medium text-muted hover:text-ink transition-colors flex items-center gap-1"
              >
                {t("nav.calendar")} <ArrowRight className="size-3" />
              </Link>
            }
          />
          <CardBody className="space-y-2.5">
            {data.upcoming.length > 0 ? (
              data.upcoming.map((dose) => (
                <DoseCard
                  key={dose.id}
                  dose={dose}
                  onComplete={(d) => {
                    setDoseToRecord(d);
                    setRecordOpen(true);
                  }}
                />
              ))
            ) : (
              <EmptyState
                icon={CalendarDays}
                title={t("dash.nothingScheduled")}
                className="py-6"
              />
            )}
          </CardBody>
        </Card>

        {/* Side effects */}
        <Card>
          <CardHeader
            title={t("dash.sideEffects")}
            action={
              <button
                type="button"
                onClick={() => {
                  setSideEffectToEdit(null);
                  setSideEffectOpen(true);
                }}
                className="text-xs font-medium text-muted hover:text-ink transition-colors flex items-center gap-1"
              >
                <Plus className="size-3" /> {t("common.record")}
              </button>
            }
          />
          <CardBody className="space-y-2.5">
            {data.sideEffects.length > 0 ? (
              data.sideEffects.map((se) => (
                <SideEffectCard
                  key={se.id}
                  sideEffect={se}
                  onEdit={(record) => {
                    setSideEffectToEdit(record);
                    setSideEffectOpen(true);
                  }}
                />
              ))
            ) : (
              <EmptyState
                icon={Sparkles}
                title={t("dash.noSideEffects")}
                className="py-6"
              />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Quick statistics */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label={t("dash.stat.completed")} value={stats.completed} />
        <StatCard label={t("dash.stat.remaining")} value={stats.remaining} />
        <StatCard
          label={t("dash.stat.adherence")}
          value={stats.adherence !== null ? `${stats.adherence}%` : "—"}
        />
        <StatCard
          label={t("dash.stat.sitesUsed")}
          value={t("dash.sitesUsedValue", {
            used: stats.sitesUsed,
            total: stats.sitesTotal,
          })}
        />
        <StatCard
          label={t("dash.stat.sideEffects")}
          value={stats.sideEffectCount}
        />
      </div>

      {doseToRecord && (
        <RecordDoseDialog
          dose={doseToRecord}
          siteSummaries={data.siteSummaries}
          userId={userId}
          open={recordOpen}
          onClose={() => setRecordOpen(false)}
          onRecorded={refresh}
        />
      )}
      <SideEffectDialog
        open={sideEffectOpen}
        onClose={() => {
          setSideEffectOpen(false);
          setSideEffectToEdit(null);
        }}
        onSaved={refresh}
        userId={userId}
        treatments={data.treatments}
        sideEffect={sideEffectToEdit}
      />
    </div>
  );
}
