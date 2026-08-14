"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Pause, Play, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAsyncData } from "@/hooks/useAsyncData";
import {
  getTreatment,
  updateTreatment,
  setTreatmentStatus,
  deleteTreatment,
} from "@/lib/data/treatments";
import { listDoses } from "@/lib/data/doses";
import type { TreatmentInput } from "@/lib/validation/treatment";
import { formatAmount, formatClockTime, formatFullDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { StatCard } from "@/components/ui/StatCard";
import { TreatmentForm } from "@/components/features/TreatmentForm";
import { DoseCard } from "@/components/features/DoseCard";

export default function TreatmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, loading, refresh } = useAsyncData(async () => {
    const supabase = createClient();
    const [treatment, doses] = await Promise.all([
      getTreatment(supabase, id),
      listDoses(supabase, { treatmentId: id }),
    ]);
    return { treatment, doses };
  }, [id]);

  if (loading || !data) return <Spinner />;

  const { treatment, doses } = data;
  const completed = doses.filter((d) => d.status === "completed").length;
  const missed = doses.filter((d) => d.status === "missed").length;
  const pct = doses.length > 0 ? (completed / doses.length) * 100 : 0;
  const recent = doses.slice(0, 8);

  const onEdit = async (values: TreatmentInput) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in.");
    await updateTreatment(supabase, user.id, id, values);
    setEditOpen(false);
    await refresh();
  };

  const togglePause = async () => {
    const supabase = createClient();
    await setTreatmentStatus(
      supabase,
      id,
      treatment.status === "paused" ? "active" : "paused"
    );
    await refresh();
  };

  const onDelete = async () => {
    const supabase = createClient();
    await deleteTreatment(supabase, id);
    router.push("/treatments");
  };

  return (
    <div>
      <PageHeader
        title={treatment.name}
        subtitle={`${formatAmount(treatment.dose_amount)} ${treatment.dose_unit} at ${formatClockTime(
          treatment.scheduled_time
        )} · started ${formatFullDate(treatment.start_date)}`}
        action={
          <div className="flex items-center gap-2">
            <Badge tone={statusTone(treatment.status)}>{treatment.status}</Badge>
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="size-3.5" /> Edit
            </Button>
            <Button variant="secondary" size="sm" onClick={togglePause}>
              {treatment.status === "paused" ? (
                <>
                  <Play className="size-3.5" /> Resume
                </>
              ) : (
                <>
                  <Pause className="size-3.5" /> Pause
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="text-terracotta hover:bg-terracotta-soft"
            >
              <Trash2 className="size-3.5" /> Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        <StatCard label="Completed" value={completed} detail={`of ${doses.length} doses`} />
        <StatCard label="Missed" value={missed} />
        <StatCard label="Progress" value={`${Math.round(pct)}%`} />
      </div>

      <Card className="mb-4">
        <CardBody className="pt-5">
          <ProgressBar value={pct} label={`${treatment.name} progress`} />
        </CardBody>
      </Card>

      {treatment.notes && (
        <Card className="mb-4">
          <CardHeader title="Notes" />
          <CardBody>
            <p className="text-sm text-ink-soft whitespace-pre-wrap leading-relaxed">
              {treatment.notes}
            </p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Recent doses" />
        <CardBody className="space-y-2.5">
          {recent.map((dose) => (
            <DoseCard key={dose.id} dose={dose} />
          ))}
          {doses.length === 0 && (
            <p className="text-sm text-muted py-4">No doses generated.</p>
          )}
        </CardBody>
      </Card>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit treatment"
        className="sm:max-w-xl"
      >
        <p className="mb-4 text-xs text-muted leading-relaxed">
          Changing the schedule regenerates upcoming doses. Completed and past
          doses are never modified.
        </p>
        <TreatmentForm
          treatment={treatment}
          onSubmit={onEdit}
          submitLabel="Save changes"
        />
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onDelete}
        title="Delete treatment?"
        message={`This permanently removes “${treatment.name}” and its entire dose history. This cannot be undone.`}
        confirmLabel="Delete treatment"
        destructive
      />
    </div>
  );
}
