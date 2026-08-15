"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { useI18n } from "@/lib/i18n/context";
import { siteName } from "@/lib/i18n/labels";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { DateTimeField } from "@/components/ui/DateTimePicker";
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
  const { t } = useI18n();
  const recommended = recommendNextSite(siteSummaries);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
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
        error instanceof Error ? error.message : t("common.somethingWrong")
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("rdd.title", { name: dose.treatment?.name ?? t("hist.treatment") })}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t("rdd.amount")}
            type="number"
            step="any"
            inputMode="decimal"
            error={errors.doseAmount?.message}
            {...register("doseAmount")}
          />
          <Select label={t("rdd.unit")} {...register("doseUnit")}>
            {DOSE_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </Select>
        </div>

        <Controller
          control={control}
          name="administeredAt"
          render={({ field }) => (
            <DateTimeField
              label={t("rdd.administeredAt")}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.administeredAt?.message}
            />
          )}
        />

        <div>
          <p className="text-[13px] font-medium text-ink-soft mb-2">
            {t("rdd.injectionSite")}
            {recommended && (
              <span className="ml-2 font-normal text-muted">
                {t("rdd.suggested", { name: siteName(t, recommended.site) })}
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
              aria-label={t("rdd.injectionSite")}
              value={selectedSiteId ?? ""}
              onChange={(e) => setValue("injectionSiteId", e.target.value)}
            >
              <option value="">{t("rdd.noSite")}</option>
              {enabledSites.map((s) => (
                <option key={s.site.id} value={s.site.id}>
                  {siteName(t, s.site)}
                  {s.injectionCount > 0 ? ` · ${s.injectionCount}×` : ""}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <Textarea
          label={`${t("form.notes")} ${t("common.optional")}`}
          placeholder={t("rdd.notesPh")}
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
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {t("rdd.markCompleted")}
            {dose.dose_amount ? ` · ${formatAmount(dose.dose_amount)} ${dose.dose_unit}` : ""}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
