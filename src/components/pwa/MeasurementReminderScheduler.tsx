"use client";

import { useEffect } from "react";
import { addDays, format, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { getLatestMeasurement } from "@/lib/data/measurements";
import {
  getMeasurementPreferences,
  saveMeasurementPreferences,
  supportsNotifications,
} from "@/lib/notifications/preferences";
import { useI18n } from "@/lib/i18n/context";

/**
 * While the app is open, reminds the user to weigh in / take measurements once
 * a measurement is due (last measurement + cadence) at their chosen time.
 * Device-local and best-effort, like the dose reminder.
 */
export function MeasurementReminderScheduler() {
  const { t } = useI18n();
  useEffect(() => {
    if (!supportsNotifications() || Notification.permission !== "granted") {
      return;
    }
    const prefs = getMeasurementPreferences();
    if (!prefs.enabled) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const run = async () => {
      try {
        const supabase = createClient();
        const latest = await getLatestMeasurement(supabase);
        if (cancelled) return;

        const now = new Date();
        const todayKey = format(now, "yyyy-MM-dd");
        if (prefs.lastPromptedDate === todayKey) return; // already nudged today

        // A measurement is "due" once cadence days have passed since the last one.
        const dueDate = latest
          ? addDays(parseISO(latest.measured_at), prefs.everyDays)
          : now;
        const dueDay = format(dueDate, "yyyy-MM-dd");
        if (dueDay > todayKey) return; // not due yet

        const [h, m] = prefs.time.split(":").map(Number);
        const remindAt = new Date(now);
        remindAt.setHours(h, m, 0, 0);

        const fire = () => {
          new Notification(t("mreminder.title"), {
            body: t("mreminder.body"),
            icon: "/icons/icon-192.png",
            tag: `measurement-${todayKey}`,
          });
          saveMeasurementPreferences({ ...prefs, lastPromptedDate: todayKey });
        };

        const delay = remindAt.getTime() - now.getTime();
        if (delay <= 0) {
          fire();
        } else if (delay <= 16 * 3600_000) {
          timer = setTimeout(fire, delay);
        }
      } catch {
        // Reminders are best-effort.
      }
    };

    void run();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [t]);

  return null;
}
