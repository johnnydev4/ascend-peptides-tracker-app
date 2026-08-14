"use client";

import { useMemo, useState } from "react";
import { Plus, Sparkles, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useUser } from "@/hooks/useUser";
import { listSideEffects, deleteSideEffect } from "@/lib/data/side-effects";
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

export default function SideEffectsPage() {
  const { user } = useUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

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
        title="Side effects"
        subtitle="Everything you've recorded, in relation to your doses."
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" /> Record side effect
          </Button>
        }
      />

      <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-amber-soft bg-amber-soft/50 px-4 py-3 text-sm text-ink-soft">
        <AlertTriangle className="size-4 mt-0.5 shrink-0 text-amber" />
        <p>
          This is a personal record, not a diagnosis. Severe or concerning
          symptoms should be discussed with a qualified healthcare professional.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="All records" />
          <CardBody className="space-y-2.5">
            {data.sideEffects.length > 0 ? (
              data.sideEffects.map((se) => (
                <SideEffectCard
                  key={se.id}
                  sideEffect={se}
                  onDelete={(id) => setToDelete(id)}
                />
              ))
            ) : (
              <EmptyState
                icon={Sparkles}
                title="No side effects recorded"
                description="Records you add appear here with their severity and timing."
                className="py-8"
              />
            )}
          </CardBody>
        </Card>

        <Card className="h-fit">
          <CardHeader title="Timeline vs. doses" />
          <CardBody>
            {timeline.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No timeline yet"
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
                          💉 {dose.treatment?.name} dose at{" "}
                          {formatTime(dose.administered_at ?? dose.scheduled_at)}
                        </p>
                      ))}
                      {day.effects.map((se) => (
                        <div
                          key={se.id}
                          className="flex items-center gap-2 text-sm text-ink"
                        >
                          {se.name}
                          <Badge tone={statusTone(se.severity)}>
                            {se.severity}
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
          onClose={() => setDialogOpen(false)}
          onSaved={refresh}
          userId={user.id}
          treatments={data.treatments}
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
        title="Delete record?"
        message="This removes the side effect record permanently."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
