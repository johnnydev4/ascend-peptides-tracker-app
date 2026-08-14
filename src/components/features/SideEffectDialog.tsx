"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { createSideEffect } from "@/lib/data/side-effects";
import {
  sideEffectSchema,
  COMMON_SIDE_EFFECTS,
  type SideEffectInput,
} from "@/lib/validation/side-effect";
import type { Treatment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, FieldWrapper } from "@/components/ui/Field";

const SEVERITIES = [
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
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
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Record side effect">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {customName ? (
          <Input
            label="Side effect"
            placeholder="Describe the side effect"
            error={errors.name?.message}
            {...register("name")}
          />
        ) : (
          <Select
            label="Side effect"
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
            <option value="">Choose…</option>
            {COMMON_SIDE_EFFECTS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value="__custom__">Other (type your own)</option>
          </Select>
        )}

        <FieldWrapper label="Severity">
          <div
            role="radiogroup"
            aria-label="Severity"
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
                {option.label}
              </button>
            ))}
          </div>
        </FieldWrapper>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Started"
            type="datetime-local"
            error={errors.startedAt?.message}
            {...register("startedAt")}
          />
          <Input
            label="Ended (optional)"
            type="datetime-local"
            error={errors.endedAt?.message}
            {...register("endedAt")}
          />
        </div>

        {treatments.length > 0 && (
          <Select label="Treatment (optional)" {...register("treatmentId")}>
            <option value="">Not linked</option>
            {treatments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        )}

        <Textarea
          label="Notes (optional)"
          placeholder="Context, timing relative to the dose, what helped…"
          error={errors.notes?.message}
          {...register("notes")}
        />

        <p className="text-xs text-muted leading-relaxed">
          Severe or concerning symptoms should be discussed with a qualified
          healthcare professional.
        </p>

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
            Save record
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
