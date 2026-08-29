export type TreatmentFrequency = "daily" | "every_n_days" | "weekly_days";
export type TreatmentStatus = "active" | "paused" | "completed" | "archived";
export type DoseStatus = "scheduled" | "completed" | "missed" | "skipped";
export type SideEffectSeverity = "mild" | "moderate" | "severe";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Treatment {
  id: string;
  user_id: string;
  name: string;
  vial_quantity: number | null;
  vial_unit: string;
  start_date: string; // ISO date (yyyy-MM-dd)
  end_date: string | null;
  duration_weeks: number | null;
  frequency: TreatmentFrequency;
  interval_days: number | null;
  scheduled_days: number[] | null; // 0 = Sunday … 6 = Saturday
  scheduled_time: string; // HH:mm[:ss]
  dose_amount: number;
  dose_unit: string;
  notes: string | null;
  status: TreatmentStatus;
  /** mL of bacteriostatic water the vial was reconstituted with. */
  bac_water_ml: number | null;
  /** Insulin syringe used to draw doses ("U-100" | "U-40" | "U-500"). */
  syringe_type: string | null;
  reconstituted_at: string | null; // ISO date (yyyy-MM-dd)
  vial_expires_at: string | null; // ISO date (yyyy-MM-dd)
  created_at: string;
  updated_at: string;
}

export interface Dose {
  id: string;
  treatment_id: string;
  user_id: string;
  scheduled_at: string;
  administered_at: string | null;
  dose_amount: number | null;
  dose_unit: string | null;
  injection_site_id: string | null;
  status: DoseStatus;
  notes: string | null;
  created_at: string;
}

export interface DoseWithRelations extends Dose {
  treatment?: Pick<
    Treatment,
    | "id"
    | "name"
    | "dose_amount"
    | "dose_unit"
    | "vial_quantity"
    | "vial_unit"
    | "bac_water_ml"
    | "syringe_type"
  > | null;
  injection_site?: Pick<InjectionSite, "id" | "name" | "body_region"> | null;
}

export interface InjectionSite {
  id: string;
  user_id: string;
  name: string;
  body_region: string;
  enabled: boolean;
  created_at: string;
}

export interface InjectionSiteUsage {
  id: string;
  user_id: string;
  dose_id: string | null;
  injection_site_id: string;
  used_at: string;
}

export interface SideEffect {
  id: string;
  user_id: string;
  treatment_id: string | null;
  dose_id: string | null;
  name: string;
  severity: SideEffectSeverity;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface SideEffectWithTreatment extends SideEffect {
  treatment?: Pick<Treatment, "id" | "name"> | null;
}

export interface CalculatorHistoryEntry {
  id: string;
  user_id: string;
  vial_quantity: number;
  vial_unit: string;
  desired_concentration: number;
  concentration_unit: string;
  calculated_volume: number;
  volume_unit: string;
  created_at: string;
}

export type WeightUnit = "kg" | "lb";
export type LengthUnit = "cm" | "in";

export interface BodyMeasurement {
  id: string;
  user_id: string;
  measured_at: string; // ISO date (yyyy-MM-dd)
  weight: number | null;
  weight_unit: WeightUnit;
  body_fat: number | null; // %
  muscle_mass: number | null; // in weight_unit
  length_unit: LengthUnit;
  neck: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  arms: number | null;
  arm_left: number | null;
  arm_right: number | null;
  thighs: number | null;
  thigh_left: number | null;
  thigh_right: number | null;
  notes: string | null;
  photos: string[]; // data URLs
  created_at: string;
  updated_at: string;
}

/** The numeric metrics a measurement can chart, in a stable order. */
export const MEASUREMENT_METRICS = [
  "weight",
  "body_fat",
  "muscle_mass",
  "neck",
  "chest",
  "waist",
  "hips",
  "arms",
  "arm_left",
  "arm_right",
  "thighs",
  "thigh_left",
  "thigh_right",
] as const;

export type MeasurementMetric = (typeof MEASUREMENT_METRICS)[number];

export interface SiteUsageSummary {
  site: InjectionSite;
  injectionCount: number;
  lastUsedAt: string | null;
}

export interface SyringeInventory {
  user_id: string;
  count: number;
  syringe_type: string;
  note: string;
  low_stock_threshold: number;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
}
