"use client";

import { useMemo, useState } from "react";
import { LineChart as LineChartIcon, Activity } from "lucide-react";
import {
  startOfWeek,
  startOfMonth,
  addWeeks,
  addMonths,
  isBefore,
  subDays,
} from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useAsyncData } from "@/hooks/useAsyncData";
import { listMeasurements } from "@/lib/data/measurements";
import {
  MEASUREMENT_METRICS,
  type MeasurementMetric,
  type BodyMeasurement,
} from "@/lib/types";
import { formatWith, toDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Field";
import { LineChart, type LinePoint } from "@/components/ui/LineChart";
import { BarChart, type Bar } from "@/components/ui/BarChart";
import { useI18n } from "@/lib/i18n/context";
import { metricLabel } from "@/lib/i18n/labels";

type Range = "30" | "90" | "365" | "all";

interface DoseRow {
  id: string;
  status: string;
  scheduled_at: string;
}

const metricUnit = (metric: MeasurementMetric, m: BodyMeasurement | undefined) => {
  if (!m) return "";
  if (metric === "body_fat") return "%";
  if (metric === "weight" || metric === "muscle_mass") return m.weight_unit;
  return m.length_unit;
};

export default function StatsPage() {
  const { t } = useI18n();
  const [range, setRange] = useState<Range>("90");
  const [metric, setMetric] = useState<MeasurementMetric>("weight");

  const { data, loading } = useAsyncData(async () => {
    const supabase = createClient();
    const [measurements, doseRes] = await Promise.all([
      listMeasurements(supabase),
      supabase
        .from("doses")
        .select("id, status, scheduled_at")
        .order("scheduled_at", { ascending: true })
        .then(({ data: rows, error }) => {
          if (error) throw error;
          return (rows ?? []) as DoseRow[];
        }),
    ]);
    return { measurements, doses: doseRes };
  });

  const rangeStart = useMemo(() => {
    if (range === "all") return null;
    return subDays(new Date(), Number(range));
  }, [range]);

  // Line series for the selected body metric.
  const linePoints: LinePoint[] = useMemo(() => {
    if (!data) return [];
    return data.measurements
      .filter((m) => m[metric] != null)
      .filter((m) => !rangeStart || !isBefore(toDate(m.measured_at), rangeStart))
      .map((m) => ({ t: toDate(m.measured_at).getTime(), y: m[metric] as number }))
      .sort((a, b) => a.t - b.t);
  }, [data, metric, rangeStart]);

  const latestMeasurement = data?.measurements[0];

  // Dose activity, bucketed weekly (short ranges) or monthly (long ranges).
  const activity = useMemo(() => {
    if (!data) return { bars: [] as Bar[], completed: 0, missed: 0 };
    const now = new Date();
    const start =
      rangeStart ??
      (data.doses.length > 0 ? toDate(data.doses[0].scheduled_at) : subDays(now, 30));
    const monthly = range === "365" || range === "all";

    const bucketStart = monthly
      ? startOfMonth(start)
      : startOfWeek(start, { weekStartsOn: 1 });

    // Build ordered buckets from start to now.
    const buckets: { start: Date; label: string; completed: number; missed: number; skipped: number }[] = [];
    let cursor = bucketStart;
    let guard = 0;
    while (!isBefore(now, cursor) && guard < 400) {
      buckets.push({
        start: cursor,
        label: monthly ? formatWith(cursor, "MMM") : formatWith(cursor, "d MMM"),
        completed: 0,
        missed: 0,
        skipped: 0,
      });
      cursor = monthly ? addMonths(cursor, 1) : addWeeks(cursor, 1);
      guard++;
    }
    if (buckets.length === 0) return { bars: [], completed: 0, missed: 0 };

    const indexFor = (d: Date) => {
      for (let i = buckets.length - 1; i >= 0; i--) {
        if (!isBefore(d, buckets[i].start)) return i;
      }
      return -1;
    };

    let completed = 0;
    let missed = 0;
    for (const dose of data.doses) {
      const d = toDate(dose.scheduled_at);
      if (isBefore(d, buckets[0].start) || isBefore(now, d)) continue;
      const idx = indexFor(d);
      if (idx < 0) continue;
      if (dose.status === "completed") {
        buckets[idx].completed++;
        completed++;
      } else if (dose.status === "missed") {
        buckets[idx].missed++;
        missed++;
      } else if (dose.status === "skipped") {
        buckets[idx].skipped++;
      }
    }

    const bars: Bar[] = buckets.map((b) => ({
      label: b.label,
      segments: [
        { value: b.missed, color: "var(--color-terracotta)" },
        { value: b.skipped, color: "var(--color-amber)" },
        { value: b.completed, color: "var(--color-sage)" },
      ],
    }));

    return { bars, completed, missed };
  }, [data, range, rangeStart]);

  const adherence =
    activity.completed + activity.missed > 0
      ? Math.round(
          (activity.completed / (activity.completed + activity.missed)) * 100
        )
      : null;

  if (loading || !data) return <Spinner />;

  const hasAnyMeasurement = data.measurements.length > 0;

  return (
    <div>
      <PageHeader title={t("stats.title")} subtitle={t("stats.subtitle")} />

      {/* Range filter */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Select
            label={t("stats.range")}
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
          >
            <option value="30">{t("stats.range30")}</option>
            <option value="90">{t("stats.range90")}</option>
            <option value="365">{t("stats.range365")}</option>
            <option value="all">{t("stats.rangeAll")}</option>
          </Select>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label={t("stats.dosesCompleted")} value={activity.completed} />
        <StatCard label={t("stats.dosesMissed")} value={activity.missed} />
        <StatCard
          label={t("dash.stat.adherence")}
          value={adherence !== null ? `${adherence}%` : "—"}
        />
      </div>

      <div className="grid gap-4">
        {/* Metric trend */}
        <Card>
          <CardHeader
            title={t("stats.metricTrend")}
            action={
              <div className="w-44">
                <Select
                  aria-label={t("stats.metric")}
                  value={metric}
                  onChange={(e) => setMetric(e.target.value as MeasurementMetric)}
                >
                  {MEASUREMENT_METRICS.map((m) => (
                    <option key={m} value={m}>
                      {metricLabel(t, m)}
                    </option>
                  ))}
                </Select>
              </div>
            }
          />
          <CardBody>
            {linePoints.length > 0 ? (
              <>
                <LineChart
                  points={linePoints}
                  unit={metricUnit(metric, latestMeasurement)}
                  color="var(--color-sage)"
                />
                <p className="mt-2 text-xs text-muted">
                  {t("stats.dataPoints", { n: linePoints.length })}
                </p>
              </>
            ) : (
              <EmptyState
                icon={LineChartIcon}
                title={t("stats.noMetricData")}
                description={t("stats.noMetricDesc")}
                className="py-10"
              />
            )}
          </CardBody>
        </Card>

        {/* Dose activity */}
        <Card>
          <CardHeader title={t("stats.doseActivity")} />
          <CardBody>
            {activity.bars.some((b) =>
              b.segments.some((s) => s.value > 0)
            ) ? (
              <>
                <BarChart bars={activity.bars} />
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
                  {[
                    ["statusOpt.completed", "bg-sage"],
                    ["statusOpt.skipped", "bg-amber"],
                    ["statusOpt.missed", "bg-terracotta"],
                  ].map(([labelKey, color]) => (
                    <span key={labelKey} className="flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${color}`} />
                      {t(labelKey)}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={Activity}
                title={t("stats.noDoseData")}
                className="py-10"
              />
            )}
          </CardBody>
        </Card>
      </div>

      {!hasAnyMeasurement && (
        <p className="mt-4 text-center text-sm text-muted">
          {t("stats.addMeasurementsHint")}
        </p>
      )}
    </div>
  );
}
