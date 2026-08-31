import { z } from "zod";

// Messages are i18n keys; the Field components translate them at render time.

const optionalPositive = z.coerce
  .number({ error: "val.number" })
  .positive("val.positive")
  .max(9999, "val.tooLarge")
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalText = z
  .string()
  .max(120, "val.tooLong")
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
  armLeft: optionalPositive,
  armRight: optionalPositive,
  thighs: optionalPositive,
  thighLeft: optionalPositive,
  thighRight: optionalPositive,
  notes: z.string().max(2000).optional(),
  // Camera / technical info for the progress photos.
  camera: optionalText,
  lens: optionalText,
  focalLength: optionalText,
  subjectDistance: optionalText,
  flash: z.enum(["yes", "no"]).optional().or(z.literal("").transform(() => undefined)),
  flashPower: optionalText,
  aperture: optionalText,
  diaphragm: optionalText,
  shutterSpeed: optionalText,
  iso: optionalText,
  whiteBalance: optionalText,
  cameraElevation: optionalText,
});

export type MeasurementInput = z.output<typeof measurementSchema>;
export type MeasurementFormValues = z.input<typeof measurementSchema>;
