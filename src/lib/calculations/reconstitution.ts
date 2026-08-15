/**
 * Reconstitution (BAC water) calculator.
 *
 * Pure math on user-supplied values:
 *   volume to add (mL) = vial quantity / desired concentration
 *
 * Units are normalized to mg and mg/mL internally.
 */

export interface ReconstitutionInput {
  vialQuantity: number;
  vialUnit: "mg" | "mcg";
  desiredConcentration: number;
  concentrationUnit: "mg/mL" | "mcg/mL";
}

export interface ReconstitutionResult {
  volumeMl: number;
  /** Normalized values used in the calculation, for display. */
  vialMg: number;
  concentrationMgPerMl: number;
  /** mL to draw for a given dose in mg (helper for the syringe table). */
  volumeForDoseMg: (doseMg: number) => number;
}

export class CalculationError extends Error {}

export function calculateReconstitution(
  input: ReconstitutionInput
): ReconstitutionResult {
  const { vialQuantity, vialUnit, desiredConcentration, concentrationUnit } =
    input;

  // Error messages are i18n keys, translated by the caller at render time.
  if (!Number.isFinite(vialQuantity) || vialQuantity <= 0) {
    throw new CalculationError("calc.errZeroVial");
  }
  if (!Number.isFinite(desiredConcentration) || desiredConcentration <= 0) {
    throw new CalculationError("calc.errZeroConc");
  }

  const vialMg = vialUnit === "mcg" ? vialQuantity / 1000 : vialQuantity;
  const concentrationMgPerMl =
    concentrationUnit === "mcg/mL"
      ? desiredConcentration / 1000
      : desiredConcentration;

  const volumeMl = vialMg / concentrationMgPerMl;

  if (!Number.isFinite(volumeMl) || volumeMl <= 0) {
    throw new CalculationError("calc.errInvalid");
  }
  if (volumeMl > 1000) {
    throw new CalculationError("calc.errTooLarge");
  }

  return {
    volumeMl,
    vialMg,
    concentrationMgPerMl,
    volumeForDoseMg: (doseMg: number) => doseMg / concentrationMgPerMl,
  };
}

/**
 * Bacteriostatic water is ~99% water with 0.9% benzyl alcohol, so 1 g ≈ 1 mL.
 * Good enough for a kitchen/jewellery scale, which is what this mode is for.
 */
export const BAC_WATER_G_PER_ML = 1;

export interface WeightReconstitutionInput {
  vialQuantity: number;
  vialUnit: "mg" | "mcg";
  /** Weight of the sealed, un-reconstituted vial. */
  weightBefore: number;
  /** Weight of the same vial right after the water went in. */
  weightAfter: number;
  weightUnit: "g" | "mg";
}

export interface WeightReconstitutionResult extends ReconstitutionResult {
  /** Water that actually went into the vial, in grams. */
  addedGrams: number;
}

/**
 * Works out the *real* concentration of an already-mixed vial by weighing it
 * before and after adding the water — the difference in weight is the water
 * that actually went in, which is more honest than what the syringe said.
 */
export function calculateFromWeight(
  input: WeightReconstitutionInput
): WeightReconstitutionResult {
  const { vialQuantity, vialUnit, weightBefore, weightAfter, weightUnit } = input;

  // Error messages are i18n keys, translated by the caller at render time.
  if (!Number.isFinite(vialQuantity) || vialQuantity <= 0) {
    throw new CalculationError("calc.errZeroVial");
  }
  if (
    !Number.isFinite(weightBefore) ||
    !Number.isFinite(weightAfter) ||
    weightBefore <= 0 ||
    weightAfter <= 0
  ) {
    throw new CalculationError("calc.errZeroWeight");
  }
  if (weightAfter <= weightBefore) {
    throw new CalculationError("calc.errWeightOrder");
  }

  const toGrams = (value: number) => (weightUnit === "mg" ? value / 1000 : value);
  const addedGrams = toGrams(weightAfter) - toGrams(weightBefore);
  const volumeMl = addedGrams / BAC_WATER_G_PER_ML;

  const vialMg = vialUnit === "mcg" ? vialQuantity / 1000 : vialQuantity;
  const concentrationMgPerMl = vialMg / volumeMl;

  if (!Number.isFinite(concentrationMgPerMl) || concentrationMgPerMl <= 0) {
    throw new CalculationError("calc.errInvalid");
  }

  return {
    addedGrams,
    volumeMl,
    vialMg,
    concentrationMgPerMl,
    volumeForDoseMg: (doseMg: number) => doseMg / concentrationMgPerMl,
  };
}

/** Round for display without losing meaningful precision. */
export function roundVolume(value: number): number {
  if (value >= 100) return Math.round(value * 10) / 10;
  if (value >= 1) return Math.round(value * 100) / 100;
  return Math.round(value * 1000) / 1000;
}
