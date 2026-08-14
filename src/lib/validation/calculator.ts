import { z } from "zod";

// Messages are i18n keys; the Field components translate them at render time.

export const calculatorSchema = z.object({
  vialQuantity: z.coerce
    .number({ error: "val.number" })
    .positive("val.positive")
    .max(100000, "val.tooLarge"),
  vialUnit: z.enum(["mg", "mcg"]),
  desiredConcentration: z.coerce
    .number({ error: "val.number" })
    .positive("val.positive")
    .max(100000, "val.tooLarge"),
  concentrationUnit: z.enum(["mg/mL", "mcg/mL"]),
});

export type CalculatorInput = z.output<typeof calculatorSchema>;
export type CalculatorFormValues = z.input<typeof calculatorSchema>;
