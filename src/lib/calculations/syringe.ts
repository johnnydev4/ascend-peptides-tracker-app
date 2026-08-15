/**
 * Insulin-syringe helpers.
 *
 * Insulin syringes are graduated in "units" (IU marks), not millilitres. The
 * syringe type tells you how many units fit in 1 mL:
 *   U-100 → 100 units/mL (the common one)   1 unit = 0.01 mL
 *   U-40  →  40 units/mL                    1 unit = 0.025 mL
 *   U-500 → 500 units/mL                    1 unit = 0.002 mL
 *
 * This module answers the reverse question the calculator needs: "I want my
 * dose to sit on a specific mark (e.g. 200 mcg = 2 units) — how much BAC water
 * should I reconstitute the vial with?"
 */

import {
  CalculationError,
  calculateReconstitution,
  type ReconstitutionResult,
} from "./reconstitution";

export const SYRINGE_TYPES = ["U-100", "U-40", "U-500"] as const;
export type SyringeType = (typeof SYRINGE_TYPES)[number];

export const SYRINGE_UNITS_PER_ML: Record<SyringeType, number> = {
  "U-100": 100,
  "U-40": 40,
  "U-500": 500,
};

/** Common barrel sizes, in mL — used to warn when a dose won't fit. */
export const SYRINGE_BARREL_ML = [0.3, 0.5, 1] as const;
const MAX_BARREL_ML = 1;

export type MassUnit = "mg" | "mcg";

export function toMg(amount: number, unit: MassUnit): number {
  return unit === "mcg" ? amount / 1000 : amount;
}

export function unitsToMl(units: number, syringe: SyringeType): number {
  return units / SYRINGE_UNITS_PER_ML[syringe];
}

export function mlToUnits(ml: number, syringe: SyringeType): number {
  return ml * SYRINGE_UNITS_PER_ML[syringe];
}

export interface SyringeTargetInput {
  vialQuantity: number;
  vialUnit: MassUnit;
  /** The dose the user wants to land on a given mark. */
  doseAmount: number;
  doseUnit: MassUnit;
  /** The syringe mark that dose should sit on. */
  targetUnits: number;
  syringe: SyringeType;
}

export interface SyringeTargetResult extends ReconstitutionResult {
  /** mL to draw for the target dose (= the chosen units on the syringe). */
  volumePerDoseMl: number;
  /** mcg contained in a single syringe unit at this concentration. */
  mcgPerUnit: number;
  /** Whole doses the vial yields once reconstituted. */
  dosesPerVial: number;
  /** True when a single dose is bigger than a 1 mL barrel. */
  exceedsBarrel: boolean;
  /** Smallest standard barrel that fits one dose, if any. */
  suggestedBarrelMl: number | null;
  syringe: SyringeType;
  /** Units on the syringe for an arbitrary dose in mg. */
  unitsForDoseMg: (doseMg: number) => number;
}

/**
 * Solves the reconstitution volume from a target "dose = N units" on a given
 * insulin syringe.
 *
 *   volume per dose (mL) = target units / (units per mL)
 *   concentration        = dose (mg) / volume per dose (mL)
 *   BAC water (mL)       = vial (mg) / concentration
 */
export function calculateFromSyringeTarget(
  input: SyringeTargetInput
): SyringeTargetResult {
  const { doseAmount, doseUnit, targetUnits, syringe } = input;

  // Error messages are i18n keys, translated by the caller at render time.
  if (!Number.isFinite(doseAmount) || doseAmount <= 0) {
    throw new CalculationError("calc.errZeroDose");
  }
  if (!Number.isFinite(targetUnits) || targetUnits <= 0) {
    throw new CalculationError("calc.errZeroUnits");
  }

  const doseMg = toMg(doseAmount, doseUnit);
  const volumePerDoseMl = unitsToMl(targetUnits, syringe);
  const concentrationMgPerMl = doseMg / volumePerDoseMl;

  const base = calculateReconstitution({
    vialQuantity: input.vialQuantity,
    vialUnit: input.vialUnit,
    desiredConcentration: concentrationMgPerMl,
    concentrationUnit: "mg/mL",
  });

  const suggestedBarrelMl =
    SYRINGE_BARREL_ML.find((ml) => volumePerDoseMl <= ml) ?? null;

  return {
    ...base,
    volumePerDoseMl,
    mcgPerUnit: (concentrationMgPerMl * 1000) / SYRINGE_UNITS_PER_ML[syringe],
    dosesPerVial: Math.floor(base.vialMg / doseMg),
    exceedsBarrel: volumePerDoseMl > MAX_BARREL_ML,
    suggestedBarrelMl,
    syringe,
    unitsForDoseMg: (mg: number) =>
      mlToUnits(base.volumeForDoseMg(mg), syringe),
  };
}

/**
 * Concentration of an already-reconstituted vial, in mg/mL — used by treatments
 * that store how much BAC water was added.
 */
export function concentrationOf(
  vialQuantity: number,
  vialUnit: string,
  bacWaterMl: number
): number | null {
  if (!vialQuantity || !bacWaterMl || bacWaterMl <= 0) return null;
  const mg = vialUnit === "mcg" ? vialQuantity / 1000 : vialQuantity;
  if (!Number.isFinite(mg) || mg <= 0) return null;
  return mg / bacWaterMl;
}

/**
 * Syringe units for a dose, given a reconstituted vial. Returns null when the
 * dose unit isn't a mass we can convert (IU, mL, "units").
 */
export function doseInSyringeUnits(params: {
  vialQuantity: number | null;
  vialUnit: string;
  bacWaterMl: number | null;
  doseAmount: number;
  doseUnit: string;
  syringe: SyringeType;
}): number | null {
  const { vialQuantity, vialUnit, bacWaterMl, doseAmount, doseUnit, syringe } =
    params;
  if (!vialQuantity || !bacWaterMl) return null;
  if (doseUnit !== "mg" && doseUnit !== "mcg") return null;
  const concentration = concentrationOf(vialQuantity, vialUnit, bacWaterMl);
  if (!concentration) return null;
  const doseMg = toMg(doseAmount, doseUnit);
  return mlToUnits(doseMg / concentration, syringe);
}

/** Round syringe units for display — insulin marks are whole/half units. */
export function roundUnits(value: number): number {
  return Math.round(value * 100) / 100;
}
