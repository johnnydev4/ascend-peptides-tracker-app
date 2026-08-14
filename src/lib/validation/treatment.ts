import { z } from "zod";

// Messages are i18n keys; the Field components translate them at render time.

export const DOSE_UNITS = ["mg", "mcg", "IU", "mL", "units"] as const;
export const VIAL_UNITS = ["mg", "mcg", "IU"] as const;

export const treatmentSchema = z
  .object({
    name: z.string().min(1, "val.peptideName").max(120),
    vialQuantity: z.coerce
      .number({ error: "val.number" })
      .positive("val.positive")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    vialUnit: z.enum(VIAL_UNITS),
    startDate: z.string().min(1, "val.chooseStartDate"),
    durationWeeks: z.coerce
      .number({ error: "val.number" })
      .int("val.wholeWeeks")
      .min(1, "val.atLeastWeek")
      .max(104, "val.maxWeeks"),
    frequency: z.enum(["daily", "every_n_days", "weekly_days"]),
    intervalDays: z.coerce
      .number({ error: "val.number" })
      .int()
      .min(2, "val.intervalMin")
      .max(90)
      .optional(),
    scheduledDays: z.array(z.number().int().min(0).max(6)).optional(),
    scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, "val.chooseTime"),
    doseAmount: z.coerce
      .number({ error: "val.number" })
      .positive("val.positive"),
    doseUnit: z.enum(DOSE_UNITS),
    notes: z.string().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.frequency === "every_n_days" && !data.intervalDays) {
      ctx.addIssue({
        code: "custom",
        path: ["intervalDays"],
        message: "val.intervalRequired",
      });
    }
    if (
      data.frequency === "weekly_days" &&
      (!data.scheduledDays || data.scheduledDays.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledDays"],
        message: "val.chooseDay",
      });
    }
  });

export type TreatmentInput = z.output<typeof treatmentSchema>;
export type TreatmentFormValues = z.input<typeof treatmentSchema>;
