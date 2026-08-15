"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { createSideEffect, updateSideEffect } from "@/lib/data/side-effects";
import {
  sideEffectSchema,
  COMMON_SIDE_EFFECT_KEYS,
  type SideEffectInput,
} from "@/lib/validation/side-effect";
import type { SideEffect, Treatment } from "@/lib/types";
import { cn, toDate } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, FieldWrapper } from "@/components/ui/Field";
import { DateTimeField } from "@/components/ui/DateTimePicker";

const SEVERITIES = [
  { value: "mild", labelKey: "severityOpt.mild" },
  { value: "moderate", labelKey: "severityOpt.moderate" },
  { value: "severe", labelKey: "severityOpt.severe" },
] as const;

const LOCAL_DATETIME = "yyyy-MM-dd'T'HH:mm";

export function SideEffectDialog({
  open,
  onClose,
  onSaved,
  userId,
  treatments,
  sideEffect,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId: string;
  treatments: Treatment[];
  /** When given, the dialog edits this record instead of creating a new one. */
  sideEffect?: SideEffect | null;
}) {
  const { t } = useI18n();
  const [serverError, setServerError] = useState<string | null>(null);
  const [customName, setCustomName] = useState(false);

  const blankValues = (): SideEffectInput => ({
    name: "",
    severity: "mild",
    startedAt: format(new Date(), LOCAL_DATETIME),
    endedAt: "",
    treatmentId: treatments.find((tr) => tr.status === "active")?.id ?? "",
    notes: "",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SideEffectInput>({
    resolver: zodResolver(sideEffectSchema),
    defaultValues: blankValues(),
  });

  // Load the record being edited (or reset to a blank form) every time the
  // dialog opens, since it stays mounted between records.
  useEffect(() => {
    if (!open) return;
    setServerError(null);
    if (!sideEffect) {
      setCustomName(false);
      reset(blankValues());
      return;
    }
    // A name that isn't one of the presets has to be typed by hand.
    const isPreset = COMMON_SIDE_EFFECT_KEYS.some(
      (key) => t(key) === sideEffect.name
    );
    setCustomName(!isPreset);
    reset({
      name: sideEffect.name,
      severity: sideEffect.severity,
      startedAt: format(toDate(sideEffect.started_at), LOCAL_DATETIME),
      endedAt: sideEffect.ended_at
        ? format(toDate(sideEffect.ended_at), LOCAL_DATETIME)
        : "",
      treatmentId: sideEffect.treatment_id ?? "",
      notes: sideEffect.notes ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sideEffect?.id]);

  const severity = watch("severity");

  const onSubmit = async (values: SideEffectInput) => {
    setServerError(null);
    try {
      const supabase = createClient();
      if (sideEffect) {
        await updateSideEffect(supabase, sideEffect.id, values);
      } else {
        await createSideEffect(supabase, userId, values);
      }
      reset(blankValues());
      onSaved();
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
      title={sideEffect ? t("se.editTitle") : t("se.dialogTitle")}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {customName ? (
          <Input
            label={t("se.field")}
            placeholder={t("se.describePh")}
            error={errors.name?.message}
            {...register("name")}
          />
        ) : (
          <Select
            label={t("se.field")}
            error={errors.name?.message}
            {...register("name", {
              onChange: (e) => {
                if (e.target.value === "__custom__") {
                  setCustomName(true);
                  setValue("name", "");
                }
              },
            })}
          >
            <option value="">{t("se.choose")}</option>
            {COMMON_SIDE_EFFECT_KEYS.map((key) => (
              <option key={key} value={t(key)}>
                {t(key)}
              </option>
            ))}
            <option value="__custom__">{t("se.other")}</option>
          </Select>
        )}

        <FieldWrapper label={t("se.severity")}>
          <div
            role="radiogroup"
            aria-label={t("se.severity")}
            className="grid grid-cols-3 gap-2"
          >
            {SEVERITIES.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={severity === option.value}
                onClick={() =>
                  setValue("severity", option.value, { shouldValidate: true })
                }
                className={cn(
                  "h-10 rounded-xl border text-sm font-medium transition-colors",
                  severity === option.value
                    ? "border-ink bg-ink text-cream"
                    : "border-line bg-surface text-ink-soft hover:border-line-strong"
                )}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        </FieldWrapper>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            control={control}
            name="startedAt"
            render={({ field }) => (
              <DateTimeField
                label={t("se.started")}
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.startedAt?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="endedAt"
            render={({ field }) => (
              <DateTimeField
                label={t("se.ended")}
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.endedAt?.message}
              />
            )}
          />
        </div>

        {treatments.length > 0 && (
          <Select label={t("se.treatment")} {...register("treatmentId")}>
            <option value="">{t("se.notLinked")}</option>
            {treatments.map((tr) => (
              <option key={tr.id} value={tr.id}>
                {tr.name}
              </option>
            ))}
          </Select>
        )}

        <Textarea
          label={`${t("form.notes")} ${t("common.optional")}`}
          placeholder={t("se.notesPh")}
          error={errors.notes?.message}
          {...register("notes")}
        />

        <p className="text-xs text-muted leading-relaxed">
          {t("se.professionalNote")}
        </p>

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
            {sideEffect ? t("common.saveChanges") : t("se.saveRecord")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
