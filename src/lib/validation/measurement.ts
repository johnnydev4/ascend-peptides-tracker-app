import { z } from "zod";

// Messages are i18n keys; the Field components translate them at render time.

const optionalPositive = z.coerce
  .number({ error: "val.number" })
  .positive("val.positive")
  .max(9999, "val.tooLarge")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const measurementSchema = z.object({
  measuredAt: z.string().min(1, "val.chooseDate"),
  weight: optionalPositive,
  weightUnit: z.enum(["kg", "lb"]),
  bodyFat: z.coerce
    .number({ error: "val.number" })
    .min(0, "val.positive")
    .max(100, "val.percentRange")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  muscleMass: optionalPositive,
  lengthUnit: z.enum(["cm", "in"]),
  neck: optionalPositive,
  chest: optionalPositive,
  waist: optionalPositive,
  hips: optionalPositive,
  arms: optionalPositive,
  thighs: optionalPositive,
  notes: z.string().max(2000).optional(),
});

export type MeasurementInput = z.output<typeof measurementSchema>;
export type MeasurementFormValues = z.input<typeof measurementSchema>;
