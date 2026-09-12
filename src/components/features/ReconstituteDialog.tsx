"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format, parseISO } from "date-fns";
import { Calculator, FlaskConical } from "lucide-react";
import {
  reconstituteSchema,
  VIAL_UNITS,
  type ReconstituteInput,
  type ReconstituteFormValues,
} from "@/lib/validation/treatment";
import {
  SYRINGE_TYPES,
  SYRINGE_UNITS_PER_ML,
  concentrationOf,
  doseInSyringeUnits,
  roundUnits,
} from "@/lib/calculations/syringe";
import { roundVolume } from "@/lib/calculations/reconstitution";
import type { Treatment } from "@/lib/types";
import { formatAmount } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { DateField } from "@/components/ui/DateTimePicker";
import { ReconstitutionCalculator } from "@/components/features/ReconstitutionCalculator";

/** Typical fridge life of a reconstituted vial — offered as a shortcut. */
const DEFAULT_VIAL_DAYS = 28;

export function ReconstituteDialog({
  open,
  onClose,
  onConfirm,
  treatment,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (values: ReconstituteInput) => Promise<void>;
  treatment: Treatment;
}) {
  const { t } = useI18n();
  const [showCalc, setShowCalc] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReconstituteFormValues, unknown, ReconstituteInput>({
    resolver: zodResolver(reconstituteSchema),
    defaultValues: {
      vialQuantity: treatment.vial_quantity ?? undefined,
      vialUnit: (treatment.vial_unit as (typeof VIAL_UNITS)[number]) ?? "mg",
      bacWaterMl: undefined,
      syringeType: (treatment.syringe_type as ReconstituteFormValues["syringeType"]) ?? "",
      reconstitutedAt: format(new Date(), "yyyy-MM-dd"),
      vialExpiresAt: "",
      note: "",
    },
  });

  const reconstitutedAt = watch("reconstitutedAt");
  const bacWaterMl = watch("bacWaterMl");
  const vialQuantity = watch("vialQuantity");
  const vialUnit = watch("vialUnit");
  const syringeType = watch("syringeType");

  const concentration = concentrationOf(
    Number(vialQuantity) || 0,
    vialUnit,
    Number(bacWaterMl) || 0
  );
  const doseUnits =
    syringeType && concentration
      ? doseInSyringeUnits({
          vialQuantity: Number(vialQuantity) || 0,
          vialUnit,
          bacWaterMl: Number(bacWaterMl) || 0,
          doseAmount: treatment.dose_amount,
          doseUnit: treatment.dose_unit,
          syringe: syringeType,
        })
      : null;

  const suggestExpiry = () => {
    const base = reconstitutedAt ? parseISO(reconstitutedAt) : new Date();
    setValue(
      "vialExpiresAt",
      format(addDays(base, DEFAULT_VIAL_DAYS), "yyyy-MM-dd"),
      { shouldValidate: true }
    );
  };

  const submit = async (values: ReconstituteInput) => {
    setError(null);
    try {
      await onConfirm(values);
      reset();
      setShowCalc(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.somethingWrong"));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("recon.reconstituteTitle")}
      className="sm:max-w-xl"
    >
      <p className="mb-4 text-xs text-muted leading-relaxed">
        {t("recon.reconstituteHint")}
      </p>

      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t("form.vialQuantity")}
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
                  dose: `${formatAmount(treatment.dose_amount)} ${treatment.dose_unit}`,
                  units: formatAmount(roundUnits(doseUnits)),
                  syringe: syringeType as string,
                })}
              </p>
            )}
          </div>
        )}

        <Textarea
          label={`${t("recon.note")} ${t("common.optional")}`}
          rows={2}
          error={errors.note?.message}
          {...register("note")}
        />

        <div className="rounded-2xl border border-line bg-cream-deep/40">
          <button
            type="button"
            onClick={() => setShowCalc((v) => !v)}
            className="flex w-full items-center gap-2 px-4 py-3 text-[13px] font-semibold text-ink-soft"
          >
            <Calculator className="size-4" />
            {t("recon.calcToggle")}
          </button>
          {showCalc && (
            <div className="border-t border-line px-4 py-4">
              <p className="mb-4 text-xs text-muted leading-relaxed">
                {t("recon.calcHint")}
              </p>
              <ReconstitutionCalculator
                onApply={(v) => {
                  setValue("vialQuantity", v.vialQuantity, {
                    shouldValidate: true,
                  });
                  setValue(
                    "vialUnit",
                    (VIAL_UNITS.includes(
                      v.vialUnit as (typeof VIAL_UNITS)[number]
                    )
                      ? v.vialUnit
                      : "mg") as (typeof VIAL_UNITS)[number]
                  );
                  setValue("bacWaterMl", v.bacWaterMl, {
                    shouldValidate: true,
                  });
                  if (v.syringeType) setValue("syringeType", v.syringeType);
                }}
              />
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-terracotta">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            <FlaskConical className="size-3.5" />
            {t("recon.reconstituteAction")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
