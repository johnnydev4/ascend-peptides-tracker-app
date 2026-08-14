import { z } from "zod";

// Messages are i18n keys; the Field components translate them at render time.

export const recordDoseSchema = z.object({
  administeredAt: z.string().min(1, "val.chooseDateTime"),
  doseAmount: z.coerce.number({ error: "val.number" }).positive("val.positive"),
  doseUnit: z.string().min(1),
  injectionSiteId: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
});

export type RecordDoseInput = z.output<typeof recordDoseSchema>;
export type RecordDoseFormValues = z.input<typeof recordDoseSchema>;
