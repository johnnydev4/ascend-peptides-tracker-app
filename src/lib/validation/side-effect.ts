import { z } from "zod";

// i18n keys for the common side-effect options; the dialog translates them.
export const COMMON_SIDE_EFFECT_KEYS = [
  "se.nausea",
  "se.headache",
  "se.fatigue",
  "se.injectionRedness",
  "se.injectionPain",
  "se.dizziness",
  "se.constipation",
  "se.diarrhea",
  "se.appetite",
  "se.bloating",
  "se.heartburn",
] as const;

export const sideEffectSchema = z
  .object({
    name: z.string().min(1, "val.chooseSideEffect").max(120),
    severity: z.enum(["mild", "moderate", "severe"]),
    startedAt: z.string().min(1, "val.chooseStart"),
    endedAt: z.string().optional().or(z.literal("")),
    treatmentId: z.string().uuid().optional().or(z.literal("")),
    doseId: z.string().uuid().optional().or(z.literal("")),
    notes: z.string().max(2000).optional(),
  })
  .refine(
    (data) =>
      !data.endedAt || new Date(data.endedAt) >= new Date(data.startedAt),
    { message: "val.endAfterStart", path: ["endedAt"] }
  );

export type SideEffectInput = z.infer<typeof sideEffectSchema>;
