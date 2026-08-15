import { z } from "zod";
import { SYRINGE_TYPES } from "@/lib/calculations/syringe";

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
  /** Optional: shows the per-dose table in syringe units too. */
  syringeType: z
    .enum(SYRINGE_TYPES)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type CalculatorInput = z.output<typeof calculatorSchema>;
export type CalculatorFormValues = z.input<typeof calculatorSchema>;

/**
 * "I want <dose> to be <units> on a <syringe>" — solves for the amount of BAC
 * water instead of asking for the concentration up front.
 */
export const syringeCalculatorSchema = z.object({
  vialQuantity: z.coerce
    .number({ error: "val.number" })
    .positive("val.positive")
    .max(100000, "val.tooLarge"),
  vialUnit: z.enum(["mg", "mcg"]),
  syringeType: z.enum(SYRINGE_TYPES),
  doseAmount: z.coerce
    .number({ error: "val.number" })
    .positive("val.positive")
    .max(100000, "val.tooLarge"),
  doseUnit: z.enum(["mg", "mcg"]),
  targetUnits: z.coerce
    .number({ error: "val.number" })
    .positive("val.positive")
    .max(500, "val.tooLarge"),
});

export type SyringeCalculatorInput = z.output<typeof syringeCalculatorSchema>;
export type SyringeCalculatorFormValues = z.input<
  typeof syringeCalculatorSchema
>;
