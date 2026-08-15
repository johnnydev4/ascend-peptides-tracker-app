"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { listVialExpirations } from "@/lib/data/treatments";
import {
  getVialExpiryPreferences,
  saveVialExpiryPreferences,
  supportsNotifications,
} from "@/lib/notifications/preferences";
import { daysUntil } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

/** Keep warning for a week after a vial expired, then stop nagging. */
const EXPIRED_GRACE_DAYS = 7;

/**
 * While the app is open, warns once a day when a reconstituted vial is close to
 * its expiry date (or recently passed it). Device-local and best-effort, like
 * the other reminders.
 */
export function VialExpiryReminderScheduler() {
  const { t } = useI18n();
  useEffect(() => {
    if (!supportsNotifications() || Notification.permission !== "granted") {
      return;
    }
    const prefs = getVialExpiryPreferences();
    if (!prefs.enabled) return;

    let cancelled = false;

    const run = async () => {
      try {
        const todayKey = format(new Date(), "yyyy-MM-dd");
        if (prefs.lastPromptedDate === todayKey) return; // already warned today

        const supabase = createClient();
        const treatments = await listVialExpirations(supabase);
        if (cancelled) return;

        const due = treatments
          .map((tr) => ({
            treatment: tr,
            left: daysUntil(tr.vial_expires_at as string),
          }))
          .filter(
            ({ left }) => left <= prefs.daysBefore && left >= -EXPIRED_GRACE_DAYS
          );
        if (due.length === 0) return;

        const [first] = due;
        const body =
          first.left < 0
            ? t("vial.notifExpired", { name: first.treatment.name })
            : first.left === 0
            ? t("vial.notifToday", { name: first.treatment.name })
            : t("vial.notifSoon", {
                name: first.treatment.name,
                days: first.left,
              });

        new Notification(t("vial.notifTitle"), {
          body: due.length > 1 ? `${body} +${due.length - 1}` : body,
          icon: "/icons/icon-192.png",
          tag: `vial-expiry-${todayKey}`,
        });
        saveVialExpiryPreferences({ ...prefs, lastPromptedDate: todayKey });
      } catch {
        // Reminders are best-effort.
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [t]);

  return null;
}
