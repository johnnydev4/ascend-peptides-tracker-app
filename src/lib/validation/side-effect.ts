import { z } from "zod";

export const COMMON_SIDE_EFFECTS = [
  "Nausea",
  "Headache",
  "Fatigue",
  "Injection site redness",
  "Injection site pain",
  "Dizziness",
  "Constipation",
  "Diarrhea",
  "Decreased appetite",
  "Bloating",
  "Heartburn",
] as const;

export const sideEffectSchema = z
  .object({
    name: z.string().min(1, "Enter or choose a side effect").max(120),
    severity: z.enum(["mild", "moderate", "severe"]),
    startedAt: z.string().min(1, "Choose when it started"),
    endedAt: z.string().optional().or(z.literal("")),
    treatmentId: z.string().uuid().optional().or(z.literal("")),
    doseId: z.string().uuid().optional().or(z.literal("")),
    notes: z.string().max(2000).optional(),
  })
  .refine(
    (data) =>
      !data.endedAt || new Date(data.endedAt) >= new Date(data.startedAt),
    { message: "End must be after start", path: ["endedAt"] }
  );

export type SideEffectInput = z.infer<typeof sideEffectSchema>;
