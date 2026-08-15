"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import {
  DEFAULT_MEASUREMENT_PREFERENCES,
  getMeasurementPreferences,
  requestPermission,
  saveMeasurementPreferences,
  supportsNotifications,
  type MeasurementReminderPreferences,
} from "@/lib/notifications/preferences";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { TimeField } from "@/components/ui/DateTimePicker";
import { useI18n } from "@/lib/i18n/context";

export function MeasurementReminderCard() {
  const { t } = useI18n();
  const [prefs, setPrefs] = useState<MeasurementReminderPreferences>(
    DEFAULT_MEASUREMENT_PREFERENCES
  );
  const [supported, setSupported] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setPrefs(getMeasurementPreferences());
      setSupported(supportsNotifications());
      if (supportsNotifications()) {
        setDenied(Notification.permission === "denied");
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const update = (patch: Partial<MeasurementReminderPreferences>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    saveMeasurementPreferences(next);
  };

  const toggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermission();
      if (!granted) {
        setDenied(Notification.permission === "denied");
        return;
      }
    }
    // Re-enabling starts fresh so a due reminder can fire again.
    update({ enabled, lastPromptedDate: enabled ? null : prefs.lastPromptedDate });
  };

  return (
    <Card>
      <CardHeader title={t("trans.reminderTitle")} />
      <CardBody className="space-y-4">
        {!supported ? (
          <p className="text-sm text-muted">{t("set.noNotifications")}</p>
        ) : (
          <>
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="flex items-center gap-2.5 text-sm text-ink">
                <BellRing className="size-4 text-muted" />
                {t("trans.reminderToggle")}
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
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label={t("trans.reminderEvery")}
                  value={String(prefs.everyDays)}
                  onChange={(e) => update({ everyDays: Number(e.target.value) })}
                >
                  <option value="1">{t("trans.everyDay")}</option>
                  <option value="3">{t("trans.everyN", { n: 3 })}</option>
                  <option value="7">{t("trans.everyN", { n: 7 })}</option>
                  <option value="14">{t("trans.everyN", { n: 14 })}</option>
                  <option value="30">{t("trans.everyN", { n: 30 })}</option>
                </Select>
                <TimeField
                  label={t("trans.reminderTime")}
                  value={prefs.time}
                  onChange={(v) => update({ time: v })}
                />
              </div>
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
