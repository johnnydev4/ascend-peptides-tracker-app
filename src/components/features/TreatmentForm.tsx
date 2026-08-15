"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format, parseISO } from "date-fns";
import {
  treatmentSchema,
  DOSE_UNITS,
  VIAL_UNITS,
  type TreatmentInput,
  type TreatmentFormValues,
} from "@/lib/validation/treatment";
import { generateSchedule } from "@/lib/calendar/generate";
import {
  SYRINGE_TYPES,
  SYRINGE_UNITS_PER_ML,
  concentrationOf,
  doseInSyringeUnits,
  roundUnits,
  type SyringeType,
} from "@/lib/calculations/syringe";
import { roundVolume } from "@/lib/calculations/reconstitution";
import type { Treatment } from "@/lib/types";
import { cn, formatAmount } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, FieldWrapper } from "@/components/ui/Field";
import { DateField, TimeField } from "@/components/ui/DateTimePicker";
import {
  PeptideNameField,
  PeptideInfoPanel,
} from "@/components/features/PeptideReference";
import { findPeptide, type Peptide } from "@/lib/peptides";

// Mon-first ordering of weekday values (0 = Sunday).
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** Typical fridge life of a reconstituted vial — offered as a shortcut. */
const DEFAULT_VIAL_DAYS = 28;

function toDefaults(treatment?: Treatment): Partial<TreatmentFormValues> {
  if (!treatment) {
    return {
      vialUnit: "mg",
      doseUnit: "mg",
      frequency: "daily",
      scheduledTime: "08:00",
      startDate: format(new Date(), "yyyy-MM-dd"),
      durationWeeks: 12,
      scheduledDays: [],
      syringeType: "U-100",
      reconstitutedAt: "",
      vialExpiresAt: "",
    };
  }
  return {
    name: treatment.name,
    vialQuantity: treatment.vial_quantity ?? undefined,
    vialUnit: (treatment.vial_unit as TreatmentInput["vialUnit"]) ?? "mg",
    startDate: treatment.start_date,
    durationWeeks: treatment.duration_weeks ?? 12,
    frequency: treatment.frequency,
    intervalDays: treatment.interval_days ?? undefined,
    scheduledDays: treatment.scheduled_days ?? [],
    scheduledTime: treatment.scheduled_time.slice(0, 5),
    doseAmount: treatment.dose_amount,
    doseUnit: (treatment.dose_unit as TreatmentInput["doseUnit"]) ?? "mg",
    bacWaterMl: treatment.bac_water_ml ?? undefined,
    syringeType: (treatment.syringe_type as SyringeType | null) ?? "U-100",
    reconstitutedAt: treatment.reconstituted_at ?? "",
    vialExpiresAt: treatment.vial_expires_at ?? "",
    notes: treatment.notes ?? "",
  };
}

export function TreatmentForm({
  treatment,
  onSubmit,
  submitLabel,
  onPeptideChange,
}: {
  treatment?: Treatment;
  onSubmit: (values: TreatmentInput) => Promise<void>;
  submitLabel: string;
  /**
   * Notified whenever the typed/selected peptide matches (or stops matching)
   * the reference catalog. When provided, the parent is responsible for
   * rendering the info panel (e.g. a desktop sidebar) and this form omits its
   * own inline panel to avoid duplicating it.
   */
  onPeptideChange?: (peptide: Peptide | null) => void;
}) {
  const { t } = useI18n();
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedPeptide, setSelectedPeptide] = useState<Peptide | null>(() =>
    findPeptide(treatment?.name ?? "")
  );

  const handlePeptideSelect = (peptide: Peptide | null) => {
    setSelectedPeptide(peptide);
    onPeptideChange?.(peptide);
  };

  // Surface any initial match (e.g. editing an existing treatment) to a parent
  // that owns the info panel. Runs once on mount.
  useEffect(() => {
    onPeptideChange?.(selectedPeptide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TreatmentFormValues, unknown, TreatmentInput>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: toDefaults(treatment),
  });

  const frequency = watch("frequency");
  const startDate = watch("startDate");
  const durationWeeks = watch("durationWeeks");
  const intervalDays = watch("intervalDays");
  const scheduledDays = watch("scheduledDays");
  const scheduledTime = watch("scheduledTime");

  // --- Live reconstitution preview -----------------------------------------
  const vialQuantity = watch("vialQuantity");
  const vialUnit = watch("vialUnit");
  const bacWaterMl = watch("bacWaterMl");
  const syringeType = watch("syringeType") as SyringeType | "" | undefined;
  const doseAmount = watch("doseAmount");
  const doseUnit = watch("doseUnit");
  const reconstitutedAt = watch("reconstitutedAt");

  const concentration = concentrationOf(
    Number(vialQuantity),
    vialUnit ?? "mg",
    Number(bacWaterMl)
  );
  const doseUnits =
    syringeType && doseAmount
      ? doseInSyringeUnits({
          vialQuantity: Number(vialQuantity) || null,
          vialUnit: vialUnit ?? "mg",
          bacWaterMl: Number(bacWaterMl) || null,
          doseAmount: Number(doseAmount),
          doseUnit: doseUnit ?? "mg",
          syringe: syringeType,
        })
      : null;

  const suggestExpiry = () => {
    const base = reconstitutedAt ? parseISO(reconstitutedAt) : new Date();
    setValue("vialExpiresAt", format(addDays(base, DEFAULT_VIAL_DAYS), "yyyy-MM-dd"), {
      shouldValidate: true,
    });
  };

  let totalDoses: number | null = null;
  try {
    if (startDate && durationWeeks && scheduledTime) {
      totalDoses = generateSchedule({
        startDate,
        durationWeeks: Number(durationWeeks),
        frequency,
        intervalDays: intervalDays ? Number(intervalDays) : undefined,
        scheduledDays,
        scheduledTime,
      }).length;
    }
  } catch {
    totalDoses = null;
  }

  const submit = async (values: TreatmentInput) => {
    setServerError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : t("common.somethingWrong")
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <PeptideNameField
            label={t("form.peptideName")}
            placeholder={t("form.peptideNamePh")}
            hint={t("form.peptideHint")}
            error={errors.name?.message}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            onSelect={handlePeptideSelect}
          />
        )}
      />

      {!onPeptideChange && selectedPeptide && (
        <PeptideInfoPanel peptide={selectedPeptide} />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={`${t("form.vialQuantity")} ${t("common.optional")}`}
          type="number"
          step="any"
          inputMode="decimal"
          placeholder="10"
          error={errors.vialQuantity?.message}
          {...register("vialQuantity")}
        />
        <Select label={t("form.vialUnit")} {...register("vialUnit")}>
          {VIAL_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t("form.doseAmount")}
          type="number"
          step="any"
          inputMode="decimal"
          placeholder="0.5"
          error={errors.doseAmount?.message}
          {...register("doseAmount")}
        />
        <Select label={t("form.doseUnit")} {...register("doseUnit")}>
          {DOSE_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </Select>
      </div>

      <fieldset className="space-y-3 rounded-2xl border border-line bg-cream-deep/40 p-4">
        <legend className="px-1 text-[13px] font-semibold text-ink-soft">
          {t("recon.section")}
        </legend>
        <p className="text-xs text-muted leading-relaxed">{t("recon.hint")}</p>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t("recon.bacWater")}
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="2"
            suffix="mL"
            error={errors.bacWaterMl?.message}
            {...register("bacWaterMl")}
          />
          <Select label={t("recon.syringe")} {...register("syringeType")}>
            <option value="">{t("recon.noSyringe")}</option>
            {SYRINGE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type} ({SYRINGE_UNITS_PER_ML[type]} u/mL)
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Controller
            control={control}
            name="reconstitutedAt"
            render={({ field }) => (
              <DateField
                label={t("recon.reconstitutedAt")}
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.reconstitutedAt?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="vialExpiresAt"
            render={({ field }) => (
              <DateField
                label={t("recon.expiresAt")}
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.vialExpiresAt?.message}
              />
            )}
          />
        </div>

        <button
          type="button"
          onClick={suggestExpiry}
          className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-line-strong transition-colors"
        >
          {t("recon.suggestExpiry", { days: DEFAULT_VIAL_DAYS })}
        </button>

        {concentration && (
          <div className="rounded-xl border border-tan-soft bg-tan-faint px-3.5 py-3 text-sm">
            <p className="text-ink">
              {t("recon.concentration", {
                value: formatAmount(roundVolume(concentration)),
              })}
            </p>
            {doseUnits !== null && (
              <p className="mt-0.5 text-muted">
                {t("recon.doseEquals", {
                  dose: `${formatAmount(Number(doseAmount))} ${doseUnit}`,
                  units: formatAmount(roundUnits(doseUnits)),
                  syringe: syringeType as string,
                })}
              </p>
            )}
          </div>
        )}
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <Controller
          control={control}
          name="startDate"
          render={({ field }) => (
            <DateField
              label={t("form.startDate")}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.startDate?.message}
            />
          )}
        />
        <Input
          label={t("form.durationWeeks")}
          type="number"
          inputMode="numeric"
          error={errors.durationWeeks?.message}
          {...register("durationWeeks")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label={t("form.frequency")}
          error={errors.frequency?.message}
          {...register("frequency")}
        >
          <option value="daily">{t("form.freqEveryDay")}</option>
          <option value="every_n_days">{t("form.freqEveryN")}</option>
          <option value="weekly_days">{t("form.freqWeekdays")}</option>
        </Select>
        <Controller
          control={control}
          name="scheduledTime"
          render={({ field }) => (
            <TimeField
              label={t("form.time")}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.scheduledTime?.message}
            />
          )}
        />
      </div>

      {frequency === "every_n_days" && (
        <Input
          label={t("form.intervalDays")}
          type="number"
          inputMode="numeric"
          placeholder="3"
          hint={t("form.intervalHint")}
          error={errors.intervalDays?.message}
          {...register("intervalDays")}
        />
      )}

      {frequency === "weekly_days" && (
        <Controller
          control={control}
          name="scheduledDays"
          render={({ field }) => (
            <FieldWrapper
              label={t("form.daysOfWeek")}
              error={errors.scheduledDays?.message as string | undefined}
            >
              <div className="flex flex-wrap gap-2">
                {WEEKDAY_ORDER.map((value) => {
                  const selected = (field.value ?? []).includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        const current = field.value ?? [];
                        field.onChange(
                          selected
                            ? current.filter((d) => d !== value)
                            : [...current, value]
                        );
                      }}
                      className={cn(
                        "h-10 w-12 rounded-xl border text-sm font-medium transition-colors",
                        selected
                          ? "border-ink bg-ink text-cream"
                          : "border-line bg-surface text-ink-soft hover:border-line-strong"
                      )}
                    >
                      {t(`weekday.${value}`)}
                    </button>
                  );
                })}
              </div>
            </FieldWrapper>
          )}
        />
      )}

      <Textarea
        label={`${t("form.notes")} ${t("common.optional")}`}
        placeholder={t("form.notesTreatmentPh")}
        error={errors.notes?.message}
        {...register("notes")}
      />

      {totalDoses !== null && totalDoses > 0 && (
        <p className="text-sm text-muted bg-tan-faint border border-tan-soft rounded-xl px-4 py-3">
          {t("form.schedulePreview", {
            n: totalDoses,
            weeks: String(durationWeeks),
          })}
        </p>
      )}

      {serverError && (
        <p role="alert" className="text-sm text-terracotta">
          {serverError}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
