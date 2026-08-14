"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getNextScheduledDose } from "@/lib/data/doses";
import {
  getPreferences,
  supportsNotifications,
} from "@/lib/notifications/preferences";
import { formatTime, formatAmount } from "@/lib/utils";

/**
 * While the app is open, schedules a browser notification for the next dose
 * according to the user's reminder preferences. (Background push requires a
 * push server and is intentionally out of scope.)
 */
export function DoseReminderScheduler() {
  useEffect(() => {
    if (!supportsNotifications() || Notification.permission !== "granted") {
      return;
    }
    const prefs = getPreferences();
    if (!prefs.enabled) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const schedule = async () => {
      try {
        const supabase = createClient();
        const next = await getNextScheduledDose(supabase);
        if (!next || cancelled) return;

        const remindAt =
          new Date(next.scheduled_at).getTime() - prefs.minutesBefore * 60_000;
        const delay = remindAt - Date.now();
        if (delay <= 0 || delay > 12 * 3600_000) return;

        timer = setTimeout(() => {
          const amount =
            next.dose_amount ?? next.treatment?.dose_amount ?? undefined;
          new Notification("Upcoming dose", {
            body: `${next.treatment?.name ?? "Dose"}${
              amount ? ` · ${formatAmount(amount)} ${next.dose_unit ?? next.treatment?.dose_unit ?? ""}` : ""
            } at ${formatTime(next.scheduled_at)}`,
            icon: "/icons/icon-192.png",
            tag: `dose-${next.id}`,
          });
        }, delay);
      } catch {
        // Reminders are best-effort.
      }
    };

    void schedule();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return null;
}
