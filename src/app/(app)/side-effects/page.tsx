"use client";

import { useMemo, useState } from "react";
import { Plus, Sparkles, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useUser } from "@/hooks/useUser";
import { listSideEffects, deleteSideEffect } from "@/lib/data/side-effects";
import type { SideEffectWithTreatment } from "@/lib/types";
import { listTreatments } from "@/lib/data/treatments";
import { listDoses } from "@/lib/data/doses";
import { formatDay, formatTime, toDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge, statusTone } from "@/components/ui/Badge";
import { SideEffectDialog } from "@/components/features/SideEffectDialog";
import { SideEffectCard } from "@/components/features/SideEffectCard";
import { useI18n } from "@/lib/i18n/context";
import { severityLabel } from "@/lib/i18n/labels";

export default function SideEffectsPage() {
  const { user } = useUser();
  const { t } = useI18n();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SideEffectWithTreatment | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const { data, loading, refresh } = useAsyncData(async () => {
    const supabase = createClient();
    const [sideEffects, treatments, completedDoses] = await Promise.all([
      listSideEffects(supabase),
      listTreatments(supabase),
      listDoses(supabase, { status: "completed", limit: 60 }),
    ]);
    return { sideEffects, treatments, completedDoses };
  });

  /** Timeline: merge side effects and completed doses by day, newest first. */
  const timeline = useMemo(() => {
    if (!data) return [];
    const days = new Map<
      string,
      { date: Date; effects: typeof data.sideEffects; doses: typeof data.completedDoses }
    >();
    const dayKey = (d: Date) => d.toDateString();
    for (const se of data.sideEffects) {
      const date = toDate(se.started_at);
      const key = dayKey(date);
      if (!days.has(key)) days.set(key, { date, effects: [], doses: [] });
      days.get(key)!.effects.push(se);
    }
    for (const dose of data.completedDoses) {
      const date = toDate(dose.administered_at ?? dose.scheduled_at);
      const key = dayKey(date);
      if (days.has(key)) days.get(key)!.doses.push(dose);
    }
    return [...days.values()].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }, [data]);

  if (loading || !data) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={t("se.title")}
        subtitle={t("se.subtitle")}
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" /> {t("se.record")}
          </Button>
        }
      />

      <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-amber-soft bg-amber-soft/50 px-4 py-3 text-sm text-ink-soft">
        <AlertTriangle className="size-4 mt-0.5 shrink-0 text-amber" />
        <p>{t("se.disclaimer")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={t("se.allRecords")} />
          <CardBody className="space-y-2.5">
            {data.sideEffects.length > 0 ? (
              data.sideEffects.map((se) => (
                <SideEffectCard
                  key={se.id}
                  sideEffect={se}
                  onEdit={(record) => {
                    setEditing(record);
                    setDialogOpen(true);
                  }}
                  onDelete={(id) => setToDelete(id)}
                />
              ))
            ) : (
              <EmptyState
                icon={Sparkles}
                title={t("dash.noSideEffects")}
                description={t("se.emptyDesc")}
                className="py-8"
              />
            )}
          </CardBody>
        </Card>

        <Card className="h-fit">
          <CardHeader title={t("se.timeline")} />
          <CardBody>
            {timeline.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title={t("se.noTimeline")}
                className="py-8"
              />
            ) : (
              <ol className="relative border-l border-line ml-2 space-y-5">
                {timeline.map((day) => (
                  <li key={day.date.toISOString()} className="ml-4">
                    <span
                      className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full bg-tan"
                      aria-hidden
                    />
                    <p className="text-xs font-semibold text-muted">
                      {formatDay(day.date)}
                    </p>
                    <div className="mt-1.5 space-y-1.5">
                      {day.doses.map((dose) => (
                        <p key={dose.id} className="text-xs text-muted">
                          {t("se.doseAt", {
                            name: dose.treatment?.name ?? "",
                            time: formatTime(
                              dose.administered_at ?? dose.scheduled_at
                            ),
                          })}
                        </p>
                      ))}
                      {day.effects.map((se) => (
                        <div
                          key={se.id}
                          className="flex items-center gap-2 text-sm text-ink"
                        >
                          {se.name}
                          <Badge tone={statusTone(se.severity)}>
                            {severityLabel(t, se.severity)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>
      </div>

      {user && (
        <SideEffectDialog
          open={dialogOpen}
          onClose={closeDialog}
          onSaved={refresh}
          userId={user.id}
          treatments={data.treatments}
          sideEffect={editing}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          const supabase = createClient();
          await deleteSideEffect(supabase, toDelete);
          await refresh();
        }}
        title={t("se.deleteTitle")}
        message={t("se.deleteMessage")}
        confirmLabel={t("common.delete")}
        destructive
      />
    </div>
  );
}
