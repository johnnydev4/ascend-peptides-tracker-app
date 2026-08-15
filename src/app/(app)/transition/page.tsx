"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, LineChart, Ruler, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useUser } from "@/hooks/useUser";
import { listMeasurements, deleteMeasurement } from "@/lib/data/measurements";
import type { BodyMeasurement } from "@/lib/types";
import { formatAmount } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MeasurementCard } from "@/components/features/MeasurementCard";
import { MeasurementDialog } from "@/components/features/MeasurementDialog";
import { MeasurementReminderCard } from "@/components/features/MeasurementReminderCard";
import { useI18n } from "@/lib/i18n/context";

export default function TransitionPage() {
  const { user } = useUser();
  const { t } = useI18n();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BodyMeasurement | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const { data, loading, refresh } = useAsyncData(async () => {
    const supabase = createClient();
    const measurements = await listMeasurements(supabase);
    return { measurements };
  });

  // measurements come newest-first; summarise weight/body-fat change over time.
  const summary = useMemo(() => {
    if (!data || data.measurements.length === 0) return null;
    const list = data.measurements;
    const latest = list[0];
    const withWeight = list.filter((m) => m.weight != null);
    const firstWeight = withWeight[withWeight.length - 1];
    const weightDelta =
      latest.weight != null && firstWeight && firstWeight.id !== latest.id
        ? latest.weight - (firstWeight.weight as number)
        : null;
    return {
      latest,
      weightDelta,
      count: list.length,
    };
  }, [data]);

  if (loading || !data) return <Spinner />;

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (m: BodyMeasurement) => {
    setEditing(m);
    setDialogOpen(true);
  };

  return (
    <div>
      <PageHeader
        title={t("trans.title")}
        subtitle={t("trans.subtitle")}
        action={
          <div className="flex items-center gap-2">
            <Link href="/stats">
              <Button variant="secondary">
                <LineChart className="size-4" /> {t("nav.stats")}
              </Button>
            </Link>
            <Button onClick={openNew}>
              <Plus className="size-4" /> {t("trans.add")}
            </Button>
          </div>
        }
      />

      {summary && (
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label={t("trans.currentWeight")}
            value={
              summary.latest.weight != null
                ? `${formatAmount(summary.latest.weight)} ${summary.latest.weight_unit}`
                : "—"
            }
          />
          <StatCard
            label={t("trans.weightChange")}
            value={
              summary.weightDelta != null
                ? `${summary.weightDelta > 0 ? "+" : ""}${formatAmount(
                    summary.weightDelta
                  )} ${summary.latest.weight_unit}`
                : "—"
            }
          />
          <StatCard
            label={t("metric.body_fat")}
            value={
              summary.latest.body_fat != null
                ? `${formatAmount(summary.latest.body_fat)}%`
                : "—"
            }
          />
          <StatCard label={t("trans.entries")} value={summary.count} />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title={t("trans.records")} />
          <CardBody className="space-y-3">
            {data.measurements.length > 0 ? (
              data.measurements.map((m) => (
                <MeasurementCard
                  key={m.id}
                  measurement={m}
                  onEdit={openEdit}
                  onDelete={setToDelete}
                  onViewPhoto={setLightbox}
                />
              ))
            ) : (
              <EmptyState
                icon={Ruler}
                title={t("trans.emptyTitle")}
                description={t("trans.emptyDesc")}
                action={
                  <Button onClick={openNew}>
                    <Plus className="size-4" /> {t("trans.add")}
                  </Button>
                }
                className="py-10"
              />
            )}
          </CardBody>
        </Card>

        <div className="h-fit">
          <MeasurementReminderCard />
        </div>
      </div>

      {user && (
        <MeasurementDialog
          key={editing?.id ?? "new"}
          measurement={editing}
          userId={user.id}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSaved={refresh}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          const supabase = createClient();
          await deleteMeasurement(supabase, toDelete);
          await refresh();
        }}
        title={t("trans.deleteTitle")}
        message={t("trans.deleteMessage")}
        confirmLabel={t("common.delete")}
        destructive
      />

      {lightbox && (
        <button
          type="button"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
          aria-label={t("common.cancel")}
        >
          <span className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-surface/20 text-cream">
            <X className="size-5" />
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt=""
            className="max-h-[85dvh] max-w-full rounded-2xl object-contain"
          />
        </button>
      )}
    </div>
  );
}
