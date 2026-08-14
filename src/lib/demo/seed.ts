import { addMinutes, format, subDays } from "date-fns";
import { generateSchedule, computeEndDate } from "@/lib/calendar/generate";
import { DEFAULT_INJECTION_SITES } from "@/lib/injection-sites/defaults";
import { DEMO_USER } from "./config";

export type Row = Record<string, unknown>;
export type Database = Record<string, Row[]>;

function uuid(): string {
  return crypto.randomUUID();
}

/** Builds the initial in-browser dataset: one active treatment 3 weeks in,
 *  rotated injection sites, side effects, and calculator history. */
export function buildSeedDatabase(): Database {
  const now = new Date();
  const nowIso = now.toISOString();
  const userId = DEMO_USER.id;

  // Injection sites
  const injection_sites = DEFAULT_INJECTION_SITES.map((s) => ({
    id: uuid(),
    user_id: userId,
    name: s.name,
    body_region: s.bodyRegion,
    enabled: true,
    created_at: nowIso,
  }));
  const rotationSites = [
    injection_sites[0].id, // abdomen upper left
    injection_sites[1].id, // abdomen upper right
    injection_sites[2].id, // abdomen lower left
  ];

  // Treatment: daily 0.5 mg, 12 weeks, started 21 days ago at 20:00
  const startDate = format(subDays(now, 21), "yyyy-MM-dd");
  const durationWeeks = 12;
  const treatmentId = uuid();
  const treatment: Row = {
    id: treatmentId,
    user_id: userId,
    name: "Retatrutide",
    vial_quantity: 10,
    vial_unit: "mg",
    start_date: startDate,
    end_date: computeEndDate(startDate, durationWeeks),
    duration_weeks: durationWeeks,
    frequency: "daily",
    interval_days: null,
    scheduled_days: null,
    scheduled_time: "20:00",
    dose_amount: 0.5,
    dose_unit: "mg",
    notes: "Tratamiento de demostración — explora la app y luego crea el tuyo.",
    status: "active",
    created_at: nowIso,
    updated_at: nowIso,
  };

  // Doses generated from the schedule
  const schedule = generateSchedule({
    startDate,
    durationWeeks,
    frequency: "daily",
    scheduledTime: "20:00",
  });

  const doses: Row[] = [];
  const injection_site_usage: Row[] = [];
  schedule.forEach((entry, index) => {
    const scheduledAt = entry.scheduledAt;
    const isPast = scheduledAt.getTime() < now.getTime();
    const doseId = uuid();
    let status = "scheduled";
    let administeredAt: string | null = null;
    let siteId: string | null = null;

    if (isPast) {
      // Every 7th past dose is "missed"; the rest completed with a rotating site.
      if ((index + 1) % 7 === 0) {
        status = "missed";
      } else {
        status = "completed";
        administeredAt = addMinutes(scheduledAt, 12).toISOString();
        siteId = rotationSites[index % rotationSites.length];
        injection_site_usage.push({
          id: uuid(),
          user_id: userId,
          dose_id: doseId,
          injection_site_id: siteId,
          used_at: administeredAt,
        });
      }
    }

    doses.push({
      id: doseId,
      treatment_id: treatmentId,
      user_id: userId,
      scheduled_at: scheduledAt.toISOString(),
      administered_at: administeredAt,
      dose_amount: 0.5,
      dose_unit: "mg",
      injection_site_id: siteId,
      status,
      notes: null,
      created_at: nowIso,
    });
  });

  const side_effects: Row[] = [
    {
      id: uuid(),
      user_id: userId,
      treatment_id: treatmentId,
      dose_id: null,
      name: "Náuseas",
      severity: "mild",
      started_at: subDays(now, 2).toISOString(),
      ended_at: addMinutes(subDays(now, 2), 240).toISOString(),
      notes: "Poco después de la dosis de la tarde.",
      created_at: nowIso,
    },
    {
      id: uuid(),
      user_id: userId,
      treatment_id: treatmentId,
      dose_id: null,
      name: "Dolor de cabeza",
      severity: "mild",
      started_at: subDays(now, 4).toISOString(),
      ended_at: null,
      notes: null,
      created_at: nowIso,
    },
    {
      id: uuid(),
      user_id: userId,
      treatment_id: treatmentId,
      dose_id: null,
      name: "Fatiga",
      severity: "moderate",
      started_at: subDays(now, 6).toISOString(),
      ended_at: subDays(now, 5).toISOString(),
      notes: "Duró casi todo el día siguiente.",
      created_at: nowIso,
    },
  ];

  const calculator_history: Row[] = [
    {
      id: uuid(),
      user_id: userId,
      vial_quantity: 10,
      vial_unit: "mg",
      desired_concentration: 2,
      concentration_unit: "mg/mL",
      calculated_volume: 5,
      volume_unit: "mL",
      created_at: subDays(now, 3).toISOString(),
    },
  ];

  const profiles: Row[] = [
    {
      id: uuid(),
      user_id: userId,
      display_name: DEMO_USER.displayName,
      created_at: nowIso,
      updated_at: nowIso,
    },
  ];

  return {
    profiles,
    treatments: [treatment],
    doses,
    injection_sites,
    injection_site_usage,
    side_effects,
    calculator_history,
  };
}
