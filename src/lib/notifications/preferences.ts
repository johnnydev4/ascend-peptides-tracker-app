"use client";

/**
 * Notification preferences live on the device (localStorage) — reminders are
 * shown by the browser only where the Notifications API is available and
 * permitted. Not every browser/platform supports them.
 */

export interface NotificationPreferences {
  enabled: boolean;
  /** Minutes before the scheduled time to remind. */
  minutesBefore: number;
}

const STORAGE_KEY = "peptide-tracker:notifications";

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: false,
  minutesBefore: 15,
};

export function supportsNotifications(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return {
      enabled: !!parsed.enabled,
      minutesBefore:
        typeof parsed.minutesBefore === "number" &&
        parsed.minutesBefore >= 0 &&
        parsed.minutesBefore <= 1440
          ? parsed.minutesBefore
          : DEFAULT_PREFERENCES.minutesBefore,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: NotificationPreferences): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export async function requestPermission(): Promise<boolean> {
  if (!supportsNotifications()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

// --- Measurement (weigh-in) reminders --------------------------------------
// Also device-local: remind the user to weigh in and take measurements every
// N days at a chosen time. "lastPromptedAt" tracks the day we last nudged so a
// single open session doesn't fire repeatedly.

export interface MeasurementReminderPreferences {
  enabled: boolean;
  /** Reminder cadence in days. */
  everyDays: number;
  /** Time of day to remind, "HH:mm". */
  time: string;
  /** ISO date (yyyy-MM-dd) we last showed the reminder for. */
  lastPromptedDate: string | null;
}

const MEASUREMENT_KEY = "peptide-tracker:measurement-reminders";

export const DEFAULT_MEASUREMENT_PREFERENCES: MeasurementReminderPreferences = {
  enabled: false,
  everyDays: 7,
  time: "08:00",
  lastPromptedDate: null,
};

export function getMeasurementPreferences(): MeasurementReminderPreferences {
  if (typeof window === "undefined") return DEFAULT_MEASUREMENT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(MEASUREMENT_KEY);
    if (!raw) return DEFAULT_MEASUREMENT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<MeasurementReminderPreferences>;
    return {
      enabled: !!parsed.enabled,
      everyDays:
        typeof parsed.everyDays === "number" &&
        parsed.everyDays >= 1 &&
        parsed.everyDays <= 90
          ? parsed.everyDays
          : DEFAULT_MEASUREMENT_PREFERENCES.everyDays,
      time:
        typeof parsed.time === "string" && /^\d{2}:\d{2}$/.test(parsed.time)
          ? parsed.time
          : DEFAULT_MEASUREMENT_PREFERENCES.time,
      lastPromptedDate:
        typeof parsed.lastPromptedDate === "string"
          ? parsed.lastPromptedDate
          : null,
    };
  } catch {
    return DEFAULT_MEASUREMENT_PREFERENCES;
  }
}

export function saveMeasurementPreferences(
  prefs: MeasurementReminderPreferences
): void {
  window.localStorage.setItem(MEASUREMENT_KEY, JSON.stringify(prefs));
}
