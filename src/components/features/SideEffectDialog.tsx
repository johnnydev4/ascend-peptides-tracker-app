"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { createSideEffect } from "@/lib/data/side-effects";
import {
  sideEffectSchema,
  COMMON_SIDE_EFFECT_KEYS,
  type SideEffectInput,
} from "@/lib/validation/side-effect";
import type { Treatment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, FieldWrapper } from "@/components/ui/Field";

const SEVERITIES = [
  { value: "mild", labelKey: "severityOpt.mild" },
  { value: "moderate", labelKey: "severityOpt.moderate" },
  { value: "severe", labelKey: "severityOpt.severe" },
] as const;

export function SideEffectDialog({
  open,
  onClose,
  onSaved,
  userId,
  treatments,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId: string;
  treatments: Treatment[];
}) {
  const { t } = useI18n();
  const [serverError, setServerError] = useState<string | null>(null);
  const [customName, setCustomName] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SideEffectInput>({
    resolver: zodResolver(sideEffectSchema),
    defaultValues: {
      name: "",
      severity: "mild",
      startedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endedAt: "",
      treatmentId: treatments.find((t) => t.status === "active")?.id ?? "",
      notes: "",
    },
  });

  const severity = watch("severity");

  const onSubmit = async (values: SideEffectInput) => {
    setServerError(null);
    try {
      const supabase = createClient();
      await createSideEffect(supabase, userId, values);
      reset();
      onSaved();
      onClose();
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : t("common.somethingWrong")
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("se.dialogTitle")}>
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
          <Input
            label={t("se.started")}
            type="datetime-local"
            error={errors.startedAt?.message}
            {...register("startedAt")}
          />
          <Input
            label={t("se.ended")}
            type="datetime-local"
            error={errors.endedAt?.message}
            {...register("endedAt")}
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
            {t("se.saveRecord")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
