import { z } from "zod";

export const DOSE_UNITS = ["mg", "mcg", "IU", "mL", "units"] as const;
export const VIAL_UNITS = ["mg", "mcg", "IU"] as const;

export const treatmentSchema = z
  .object({
    name: z.string().min(1, "Enter the peptide name").max(120),
    vialQuantity: z.coerce
      .number({ error: "Enter a number" })
      .positive("Must be greater than zero")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    vialUnit: z.enum(VIAL_UNITS),
    startDate: z.string().min(1, "Choose a start date"),
    durationWeeks: z.coerce
      .number({ error: "Enter a number" })
      .int("Whole weeks only")
      .min(1, "At least 1 week")
      .max(104, "Maximum 104 weeks"),
    frequency: z.enum(["daily", "every_n_days", "weekly_days"]),
    intervalDays: z.coerce
      .number({ error: "Enter a number" })
      .int()
      .min(2, "At least every 2 days")
      .max(90)
      .optional(),
    scheduledDays: z.array(z.number().int().min(0).max(6)).optional(),
    scheduledTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Choose a time"),
    doseAmount: z.coerce
      .number({ error: "Enter a number" })
      .positive("Must be greater than zero"),
    doseUnit: z.enum(DOSE_UNITS),
    notes: z.string().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.frequency === "every_n_days" && !data.intervalDays) {
      ctx.addIssue({
        code: "custom",
        path: ["intervalDays"],
        message: "Enter the interval in days",
      });
    }
    if (
      data.frequency === "weekly_days" &&
      (!data.scheduledDays || data.scheduledDays.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledDays"],
        message: "Choose at least one day of the week",
      });
    }
  });

export type TreatmentInput = z.output<typeof treatmentSchema>;
export type TreatmentFormValues = z.input<typeof treatmentSchema>;
