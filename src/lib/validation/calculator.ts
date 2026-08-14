import { z } from "zod";

export const calculatorSchema = z.object({
  vialQuantity: z.coerce
    .number({ error: "Enter a number" })
    .positive("Must be greater than zero")
    .max(100000, "Value is too large"),
  vialUnit: z.enum(["mg", "mcg"]),
  desiredConcentration: z.coerce
    .number({ error: "Enter a number" })
    .positive("Must be greater than zero")
    .max(100000, "Value is too large"),
  concentrationUnit: z.enum(["mg/mL", "mcg/mL"]),
});

export type CalculatorInput = z.output<typeof calculatorSchema>;
export type CalculatorFormValues = z.input<typeof calculatorSchema>;
