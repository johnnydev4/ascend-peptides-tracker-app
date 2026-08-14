import { addDays, addWeeks, format } from "date-fns";
import type { TreatmentFrequency } from "@/lib/types";

export interface ScheduleParams {
  startDate: string; // yyyy-MM-dd
  durationWeeks: number;
  frequency: TreatmentFrequency;
  intervalDays?: number | null;
  scheduledDays?: number[] | null; // 0 = Sunday … 6 = Saturday
  scheduledTime: string; // HH:mm
}

export interface GeneratedDose {
  scheduledAt: Date;
}

/**
 * Generates every scheduled dose date for a treatment, in local time,
 * from the parameters the user entered.
 */
export function generateSchedule(params: ScheduleParams): GeneratedDose[] {
  const {
    startDate,
    durationWeeks,
    frequency,
    intervalDays,
    scheduledDays,
    scheduledTime,
  } = params;

  const [hours, minutes] = scheduledTime.split(":").map(Number);
  const start = new Date(`${startDate}T00:00:00`);
  const end = addWeeks(start, durationWeeks); // exclusive
  const doses: GeneratedDose[] = [];

  const step =
    frequency === "daily" ? 1 : frequency === "every_n_days" ? intervalDays ?? 1 : 1;

  let cursor = start;
  while (cursor < end) {
    const include =
      frequency === "weekly_days"
        ? (scheduledDays ?? []).includes(cursor.getDay())
        : true;

    if (include) {
      const scheduledAt = new Date(cursor);
      scheduledAt.setHours(hours, minutes, 0, 0);
      doses.push({ scheduledAt });
    }

    cursor = addDays(cursor, frequency === "weekly_days" ? 1 : step);
  }

  return doses;
}

export function computeEndDate(startDate: string, durationWeeks: number): string {
  const end = addDays(addWeeks(new Date(`${startDate}T00:00:00`), durationWeeks), -1);
  return format(end, "yyyy-MM-dd");
}

export const WEEKDAY_LABELS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
] as const;
