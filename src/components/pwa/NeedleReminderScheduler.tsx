"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import {
  getNeedlePreferences,
  saveNeedlePreferences,
  supportsNotifications,
} from "@/lib/notifications/preferences";
import { useI18n } from "@/lib/i18n/context";

/**
 * While the app is open, warns once a day when the needle stock has dropped to
 * or below the chosen threshold. Device-local and best-effort, like the other
 * reminders — reads the count straight from localStorage.
 */
export function NeedleReminderScheduler() {
  const { t } = useI18n();
  useEffect(() => {
    if (!supportsNotifications() || Notification.permission !== "granted") {
      return;
    }
    const prefs = getNeedlePreferences();
    if (!prefs.reminderEnabled) return;
    if (prefs.count > prefs.threshold) return;

    const todayKey = format(new Date(), "yyyy-MM-dd");
    if (prefs.lastPromptedDate === todayKey) return; // already warned today

    try {
      const body =
        prefs.count === 0
          ? t("needle.notifOut")
          : t("needle.notifLow", { count: prefs.count });
      new Notification(t("needle.notifTitle"), {
        body,
        icon: "/icons/icon-192.png",
        tag: `needle-stock-${todayKey}`,
      });
      saveNeedlePreferences({ ...prefs, lastPromptedDate: todayKey });
    } catch {
      // Reminders are best-effort.
    }
  }, [t]);

  return null;
}
