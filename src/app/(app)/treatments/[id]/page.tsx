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
import {
  concentrationOf,
  doseInSyringeUnits,
  roundUnits,
  type SyringeType,
} from "@/lib/calculations/syringe";
import { roundVolume } from "@/lib/calculations/reconstitution";
import {
  cn,
  daysUntil,
  formatAmount,
  formatClockTime,
  formatFullDate,
} from "@/lib/utils";
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
import { useI18n } from "@/lib/i18n/context";
import { treatmentStatusLabel } from "@/lib/i18n/labels";

function Detail({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "warn";
}) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3.5 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={cn(
          "text-sm font-medium",
          tone === "warn" ? "text-terracotta" : "text-ink"
        )}
      >
        {value}
      </p>
      {detail && <p className="mt-0.5 text-xs text-muted">{detail}</p>}
    </div>
  );
}

export default function TreatmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useI18n();
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
  const concentration = concentrationOf(
    treatment.vial_quantity ?? 0,
    treatment.vial_unit,
    treatment.bac_water_ml ?? 0
  );
  const doseUnits = treatment.syringe_type
    ? doseInSyringeUnits({
        vialQuantity: treatment.vial_quantity,
        vialUnit: treatment.vial_unit,
        bacWaterMl: treatment.bac_water_ml,
        doseAmount: treatment.dose_amount,
        doseUnit: treatment.dose_unit,
        syringe: treatment.syringe_type as SyringeType,
      })
    : null;
  const expiryDaysLeft = treatment.vial_expires_at
    ? daysUntil(treatment.vial_expires_at)
    : null;
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
        subtitle={t("trd.summary", {
          amount: formatAmount(treatment.dose_amount),
          unit: treatment.dose_unit,
          time: formatClockTime(treatment.scheduled_time),
          date: formatFullDate(treatment.start_date),
        })}
        action={
          <div className="flex items-center gap-2">
            <Badge tone={statusTone(treatment.status)}>
              {treatmentStatusLabel(t, treatment.status)}
            </Badge>
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="size-3.5" /> {t("common.edit")}
            </Button>
            <Button variant="secondary" size="sm" onClick={togglePause}>
              {treatment.status === "paused" ? (
                <>
                  <Play className="size-3.5" /> {t("trd.resume")}
                </>
              ) : (
                <>
                  <Pause className="size-3.5" /> {t("trd.pause")}
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="text-terracotta hover:bg-terracotta-soft"
            >
              <Trash2 className="size-3.5" /> {t("common.delete")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        <StatCard
          label={t("trd.completedStat")}
          value={completed}
          detail={t("trd.ofDoses", { total: doses.length })}
        />
        <StatCard label={t("trd.missedStat")} value={missed} />
        <StatCard label={t("trd.progressStat")} value={`${Math.round(pct)}%`} />
      </div>

      <Card className="mb-4">
        <CardBody className="pt-5">
          <ProgressBar value={pct} label={treatment.name} />
        </CardBody>
      </Card>

      {(treatment.bac_water_ml || treatment.vial_expires_at) && (
        <Card className="mb-4">
          <CardHeader title={t("recon.section")} />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            {treatment.bac_water_ml && (
              <Detail
                label={t("recon.bacWater")}
                value={`${formatAmount(treatment.bac_water_ml)} mL`}
              />
            )}
            {concentration && (
              <Detail
                label={t("calc.concentration")}
                value={`${formatAmount(roundVolume(concentration))} mg/mL`}
              />
            )}
            {doseUnits !== null && treatment.syringe_type && (
              <Detail
                label={t("recon.doseInUnits")}
                value={`${formatAmount(roundUnits(doseUnits))} u · ${
                  treatment.syringe_type
                }`}
              />
            )}
            {treatment.reconstituted_at && (
              <Detail
                label={t("recon.reconstitutedAt")}
                value={formatFullDate(treatment.reconstituted_at)}
              />
            )}
            {treatment.vial_expires_at && (
              <Detail
                label={t("recon.expiresAt")}
                value={formatFullDate(treatment.vial_expires_at)}
                tone={
                  expiryDaysLeft !== null && expiryDaysLeft <= 3
                    ? "warn"
                    : undefined
                }
                detail={
                  expiryDaysLeft === null
                    ? undefined
                    : expiryDaysLeft < 0
                    ? t("vial.expiredAgo", { days: Math.abs(expiryDaysLeft) })
                    : expiryDaysLeft === 0
                    ? t("vial.expiresToday")
                    : t("vial.expiresInDays", { days: expiryDaysLeft })
                }
              />
            )}
          </CardBody>
        </Card>
      )}

      {treatment.notes && (
        <Card className="mb-4">
          <CardHeader title={t("trd.notes")} />
          <CardBody>
            <p className="text-sm text-ink-soft whitespace-pre-wrap leading-relaxed">
              {treatment.notes}
            </p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title={t("trd.recentDoses")} />
        <CardBody className="space-y-2.5">
          {recent.map((dose) => (
            <DoseCard key={dose.id} dose={dose} />
          ))}
          {doses.length === 0 && (
            <p className="text-sm text-muted py-4">{t("trd.noDoses")}</p>
          )}
        </CardBody>
      </Card>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={t("trd.editTreatment")}
        className="sm:max-w-xl"
      >
        <p className="mb-4 text-xs text-muted leading-relaxed">
          {t("trd.editHint")}
        </p>
        <TreatmentForm
          treatment={treatment}
          onSubmit={onEdit}
          submitLabel={t("common.saveChanges")}
        />
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onDelete}
        title={t("trd.deleteTitle")}
        message={t("trd.deleteMessage", { name: treatment.name })}
        confirmLabel={t("trd.deleteConfirm")}
        destructive
      />
    </div>
  );
}
