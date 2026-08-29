"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { getSyringeInventory } from "@/lib/data/syringes";
import {
  getSyringeReminderLastPrompted,
  setSyringeReminderLastPrompted,
  supportsNotifications,
} from "@/lib/notifications/preferences";
import { useI18n } from "@/lib/i18n/context";

/**
 * While the app is open, warns once a day when the syringe stock has dropped to
 * or below the chosen threshold. The inventory lives in Supabase (synced across
 * devices); the "last warned" flag is device-local. Best-effort, like the other
 * reminders.
 */
export function SyringeReminderScheduler() {
  const { t } = useI18n();
  useEffect(() => {
    if (!supportsNotifications() || Notification.permission !== "granted") {
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const todayKey = format(new Date(), "yyyy-MM-dd");
        if (getSyringeReminderLastPrompted() === todayKey) return;

        const inv = await getSyringeInventory(createClient());
        if (cancelled || !inv) return;
        if (!inv.reminder_enabled) return;
        if (inv.count > inv.low_stock_threshold) return;

        const body =
          inv.count === 0
            ? t("syringe.notifOut")
            : t("syringe.notifLow", { count: inv.count });
        new Notification(t("syringe.notifTitle"), {
          body,
          icon: "/icons/icon-192.png",
          tag: `syringe-stock-${todayKey}`,
        });
        setSyringeReminderLastPrompted(todayKey);
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
