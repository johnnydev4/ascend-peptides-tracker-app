"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { completeDose } from "@/lib/data/doses";
import { recommendNextSite } from "@/lib/data/injection-sites";
import {
  recordDoseSchema,
  type RecordDoseInput,
  type RecordDoseFormValues,
} from "@/lib/validation/dose";
import { DOSE_UNITS } from "@/lib/validation/treatment";
import type { DoseWithRelations, SiteUsageSummary } from "@/lib/types";
import { formatAmount } from "@/lib/utils";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { InjectionSiteMap } from "./InjectionSiteMap";

export function RecordDoseDialog({
  dose,
  siteSummaries,
  userId,
  open,
  onClose,
  onRecorded,
}: {
  dose: DoseWithRelations;
  siteSummaries: SiteUsageSummary[];
  userId: string;
  open: boolean;
  onClose: () => void;
  onRecorded: () => void;
}) {
  const recommended = recommendNextSite(siteSummaries);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RecordDoseFormValues, unknown, RecordDoseInput>({
    resolver: zodResolver(recordDoseSchema),
    defaultValues: {
      administeredAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      doseAmount: dose.dose_amount ?? dose.treatment?.dose_amount ?? undefined,
      doseUnit: dose.dose_unit ?? dose.treatment?.dose_unit ?? "mg",
      injectionSiteId: recommended?.site.id ?? "",
      notes: "",
    },
  });

  const selectedSiteId = watch("injectionSiteId");
  const enabledSites = siteSummaries.filter((s) => s.site.enabled);

  const onSubmit = async (values: RecordDoseInput) => {
    setServerError(null);
    try {
      const supabase = createClient();
      await completeDose(supabase, userId, dose.id, {
        administeredAt: new Date(values.administeredAt).toISOString(),
        doseAmount: values.doseAmount,
        doseUnit: values.doseUnit,
        injectionSiteId: values.injectionSiteId || null,
        notes: values.notes || null,
      });
      onRecorded();
      onClose();
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Record dose — ${dose.treatment?.name ?? "Treatment"}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount"
            type="number"
            step="any"
            inputMode="decimal"
            error={errors.doseAmount?.message}
            {...register("doseAmount")}
          />
          <Select label="Unit" {...register("doseUnit")}>
            {DOSE_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Administered at"
          type="datetime-local"
          error={errors.administeredAt?.message}
          {...register("administeredAt")}
        />

        <div>
          <p className="text-[13px] font-medium text-ink-soft mb-2">
            Injection site
            {recommended && (
              <span className="ml-2 font-normal text-muted">
                Suggested: {recommended.site.name}
              </span>
            )}
          </p>
          <InjectionSiteMap
            summaries={siteSummaries}
            selectedId={selectedSiteId || null}
            onSelect={(id) =>
              setValue("injectionSiteId", id === selectedSiteId ? "" : id, {
                shouldValidate: true,
              })
            }
          />
          <div className="mt-3">
            <Select
              aria-label="Injection site"
              value={selectedSiteId ?? ""}
              onChange={(e) => setValue("injectionSiteId", e.target.value)}
            >
              <option value="">No site recorded</option>
              {enabledSites.map((s) => (
                <option key={s.site.id} value={s.site.id}>
                  {s.site.name}
                  {s.injectionCount > 0 ? ` · ${s.injectionCount}×` : ""}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <Textarea
          label="Notes (optional)"
          placeholder="Anything worth remembering about this dose…"
          error={errors.notes?.message}
          {...register("notes")}
        />

        {serverError && (
          <p role="alert" className="text-sm text-terracotta">
            {serverError}
          </p>
        )}

        <div className="flex gap-3 justify-end pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Mark as completed
            {dose.dose_amount ? ` · ${formatAmount(dose.dose_amount)} ${dose.dose_unit}` : ""}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
