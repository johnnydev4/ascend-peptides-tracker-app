"use client";

import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";
import {
  DEFAULT_VIAL_EXPIRY_PREFERENCES,
  getVialExpiryPreferences,
  requestPermission,
  saveVialExpiryPreferences,
  supportsNotifications,
  type VialExpiryReminderPreferences,
} from "@/lib/notifications/preferences";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { useI18n } from "@/lib/i18n/context";

export function VialExpiryReminderCard() {
  const { t } = useI18n();
  const [prefs, setPrefs] = useState<VialExpiryReminderPreferences>(
    DEFAULT_VIAL_EXPIRY_PREFERENCES
  );
  const [supported, setSupported] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setPrefs(getVialExpiryPreferences());
      setSupported(supportsNotifications());
      if (supportsNotifications()) {
        setDenied(Notification.permission === "denied");
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const update = (patch: Partial<VialExpiryReminderPreferences>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    saveVialExpiryPreferences(next);
  };

  const toggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermission();
      if (!granted) {
        setDenied(Notification.permission === "denied");
        return;
      }
    }
    // Re-enabling starts fresh so a due warning can fire again today.
    update({ enabled, lastPromptedDate: enabled ? null : prefs.lastPromptedDate });
  };

  return (
    <Card>
      <CardHeader title={t("vial.reminderTitle")} />
      <CardBody className="space-y-4">
        {!supported ? (
          <p className="text-sm text-muted">{t("set.noNotifications")}</p>
        ) : (
          <>
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="flex items-center gap-2.5 text-sm text-ink">
                <FlaskConical className="size-4 text-muted" />
                {t("vial.reminderToggle")}
              </span>
              <input
                type="checkbox"
                checked={prefs.enabled}
                onChange={(e) => toggle(e.target.checked)}
                className="size-5 accent-[var(--color-ink)] cursor-pointer"
              />
            </label>
            {denied && (
              <p className="text-xs text-terracotta">{t("set.blocked")}</p>
            )}
            {prefs.enabled && (
              <Select
                label={t("vial.reminderWarn")}
                value={String(prefs.daysBefore)}
                onChange={(e) => update({ daysBefore: Number(e.target.value) })}
              >
                <option value="0">{t("vial.warnSameDay")}</option>
                <option value="1">{t("vial.warnDays", { days: 1 })}</option>
                <option value="3">{t("vial.warnDays", { days: 3 })}</option>
                <option value="7">{t("vial.warnDays", { days: 7 })}</option>
                <option value="14">{t("vial.warnDays", { days: 14 })}</option>
              </Select>
            )}
            <p className="text-xs text-muted leading-relaxed">
              {t("set.remindersNote")}
            </p>
          </>
        )}
      </CardBody>
    </Card>
  );
}
