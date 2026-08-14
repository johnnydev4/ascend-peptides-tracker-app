"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  treatmentSchema,
  DOSE_UNITS,
  VIAL_UNITS,
  type TreatmentInput,
  type TreatmentFormValues,
} from "@/lib/validation/treatment";
import { WEEKDAY_LABELS, generateSchedule } from "@/lib/calendar/generate";
import type { Treatment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, FieldWrapper } from "@/components/ui/Field";

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
    notes: treatment.notes ?? "",
  };
}

export function TreatmentForm({
  treatment,
  onSubmit,
  submitLabel,
}: {
  treatment?: Treatment;
  onSubmit: (values: TreatmentInput) => Promise<void>;
  submitLabel: string;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
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
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      <Input
        label="Peptide name"
        placeholder="e.g. Retatrutide"
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Vial quantity (optional)"
          type="number"
          step="any"
          inputMode="decimal"
          placeholder="10"
          error={errors.vialQuantity?.message}
          {...register("vialQuantity")}
        />
        <Select label="Vial unit" {...register("vialUnit")}>
          {VIAL_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Dose amount"
          type="number"
          step="any"
          inputMode="decimal"
          placeholder="0.5"
          error={errors.doseAmount?.message}
          {...register("doseAmount")}
        />
        <Select label="Dose unit" {...register("doseUnit")}>
          {DOSE_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start date"
          type="date"
          error={errors.startDate?.message}
          {...register("startDate")}
        />
        <Input
          label="Duration (weeks)"
          type="number"
          inputMode="numeric"
          error={errors.durationWeeks?.message}
          {...register("durationWeeks")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Frequency"
          error={errors.frequency?.message}
          {...register("frequency")}
        >
          <option value="daily">Every day</option>
          <option value="every_n_days">Every N days</option>
          <option value="weekly_days">Specific weekdays</option>
        </Select>
        <Input
          label="Time"
          type="time"
          error={errors.scheduledTime?.message}
          {...register("scheduledTime")}
        />
      </div>

      {frequency === "every_n_days" && (
        <Input
          label="Interval (days)"
          type="number"
          inputMode="numeric"
          placeholder="3"
          hint="A dose every this many days, starting on the start date."
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
              label="Days of the week"
              error={errors.scheduledDays?.message as string | undefined}
            >
              <div className="flex flex-wrap gap-2">
                {WEEKDAY_LABELS.map((day) => {
                  const selected = (field.value ?? []).includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        const current = field.value ?? [];
                        field.onChange(
                          selected
                            ? current.filter((d) => d !== day.value)
                            : [...current, day.value]
                        );
                      }}
                      className={cn(
                        "h-10 w-12 rounded-xl border text-sm font-medium transition-colors",
                        selected
                          ? "border-ink bg-ink text-cream"
                          : "border-line bg-surface text-ink-soft hover:border-line-strong"
                      )}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </FieldWrapper>
          )}
        />
      )}

      <Textarea
        label="Notes (optional)"
        placeholder="Protocol details, supplier, batch, anything useful…"
        error={errors.notes?.message}
        {...register("notes")}
      />

      {totalDoses !== null && totalDoses > 0 && (
        <p className="text-sm text-muted bg-tan-faint border border-tan-soft rounded-xl px-4 py-3">
          This schedule generates{" "}
          <span className="font-semibold text-ink">{totalDoses} doses</span>{" "}
          over {String(durationWeeks)} weeks.
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
