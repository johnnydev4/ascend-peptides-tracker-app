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
  treatment?: Pick<Treatment, "id" | "name" | "dose_amount" | "dose_unit"> | null;
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

export interface SiteUsageSummary {
  site: InjectionSite;
  injectionCount: number;
  lastUsedAt: string | null;
}
