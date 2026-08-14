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
