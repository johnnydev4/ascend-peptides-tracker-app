import { z } from "zod";

export const recordDoseSchema = z.object({
  administeredAt: z.string().min(1, "Choose a date and time"),
  doseAmount: z.coerce
    .number({ error: "Enter a number" })
    .positive("Must be greater than zero"),
  doseUnit: z.string().min(1),
  injectionSiteId: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
});

export type RecordDoseInput = z.output<typeof recordDoseSchema>;
export type RecordDoseFormValues = z.input<typeof recordDoseSchema>;
