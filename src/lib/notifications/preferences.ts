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

// --- Vial expiry reminders --------------------------------------------------
// Warns, once per day while the app is open, when a reconstituted vial is about
// to expire (or just did). Device-local like the reminders above.

export interface VialExpiryReminderPreferences {
  enabled: boolean;
  /** How many days ahead of the expiry date to start warning. */
  daysBefore: number;
  /** ISO date (yyyy-MM-dd) we last showed the warning for. */
  lastPromptedDate: string | null;
}

const VIAL_EXPIRY_KEY = "peptide-tracker:vial-expiry-reminders";

export const DEFAULT_VIAL_EXPIRY_PREFERENCES: VialExpiryReminderPreferences = {
  enabled: false,
  daysBefore: 3,
  lastPromptedDate: null,
};

export function getVialExpiryPreferences(): VialExpiryReminderPreferences {
  if (typeof window === "undefined") return DEFAULT_VIAL_EXPIRY_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(VIAL_EXPIRY_KEY);
    if (!raw) return DEFAULT_VIAL_EXPIRY_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<VialExpiryReminderPreferences>;
    return {
      enabled: !!parsed.enabled,
      daysBefore:
        typeof parsed.daysBefore === "number" &&
        parsed.daysBefore >= 0 &&
        parsed.daysBefore <= 30
          ? parsed.daysBefore
          : DEFAULT_VIAL_EXPIRY_PREFERENCES.daysBefore,
      lastPromptedDate:
        typeof parsed.lastPromptedDate === "string"
          ? parsed.lastPromptedDate
          : null,
    };
  } catch {
    return DEFAULT_VIAL_EXPIRY_PREFERENCES;
  }
}

export function saveVialExpiryPreferences(
  prefs: VialExpiryReminderPreferences
): void {
  window.localStorage.setItem(VIAL_EXPIRY_KEY, JSON.stringify(prefs));
}

// --- Needle inventory -------------------------------------------------------
// A simple device-local stock counter for the injection needles the user keeps
// on hand: how many are left, which type they are, an optional note, and an
// optional low-stock reminder (fires while the app is open, once a day, when the
// count drops below the threshold).

export interface NeedlePreferences {
  /** How many needles are left. */
  count: number;
  /** Needle type / gauge, e.g. "31G". Free text. */
  needleType: string;
  /** Free note about the needles. */
  note: string;
  /** Whether to warn when running low. */
  reminderEnabled: boolean;
  /** Warn once the count is at or below this many. */
  threshold: number;
  /** ISO date (yyyy-MM-dd) we last showed the low-stock warning for. */
  lastPromptedDate: string | null;
}

const NEEDLE_KEY = "peptide-tracker:needle-inventory";

export const DEFAULT_NEEDLE_PREFERENCES: NeedlePreferences = {
  count: 0,
  needleType: "",
  note: "",
  reminderEnabled: false,
  threshold: 5,
  lastPromptedDate: null,
};

export function getNeedlePreferences(): NeedlePreferences {
  if (typeof window === "undefined") return DEFAULT_NEEDLE_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(NEEDLE_KEY);
    if (!raw) return DEFAULT_NEEDLE_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<NeedlePreferences>;
    return {
      count:
        typeof parsed.count === "number" && parsed.count >= 0
          ? Math.floor(parsed.count)
          : DEFAULT_NEEDLE_PREFERENCES.count,
      needleType:
        typeof parsed.needleType === "string"
          ? parsed.needleType
          : DEFAULT_NEEDLE_PREFERENCES.needleType,
      note: typeof parsed.note === "string" ? parsed.note : "",
      reminderEnabled: !!parsed.reminderEnabled,
      threshold:
        typeof parsed.threshold === "number" &&
        parsed.threshold >= 1 &&
        parsed.threshold <= 100
          ? Math.floor(parsed.threshold)
          : DEFAULT_NEEDLE_PREFERENCES.threshold,
      lastPromptedDate:
        typeof parsed.lastPromptedDate === "string"
          ? parsed.lastPromptedDate
          : null,
    };
  } catch {
    return DEFAULT_NEEDLE_PREFERENCES;
  }
}

export function saveNeedlePreferences(prefs: NeedlePreferences): void {
  window.localStorage.setItem(NEEDLE_KEY, JSON.stringify(prefs));
}
