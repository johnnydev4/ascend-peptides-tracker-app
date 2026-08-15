"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing, LogOut, UserRound, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/demo/config";
import { resetDemoData } from "@/lib/demo/mockClient";
import { useUser } from "@/hooks/useUser";
import {
  DEFAULT_PREFERENCES,
  getPreferences,
  requestPermission,
  savePreferences,
  supportsNotifications,
  type NotificationPreferences,
} from "@/lib/notifications/preferences";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { MeasurementReminderCard } from "@/components/features/MeasurementReminderCard";
import { useI18n } from "@/lib/i18n/context";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { t, locale, setLocale } = useI18n();
  const [displayName, setDisplayName] = useState("");
  const [savedName, setSavedName] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [notifSupported, setNotifSupported] = useState(true);
  const [notifDenied, setNotifDenied] = useState(false);

  useEffect(() => {
    // Hydrate device-local preferences after mount (avoids SSR mismatch).
    const id = requestAnimationFrame(() => {
      setPrefs(getPreferences());
      setNotifSupported(supportsNotifications());
      if (supportsNotifications()) {
        setNotifDenied(Notification.permission === "denied");
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
      });
  }, [user]);

  const saveName = async () => {
    if (!user) return;
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("user_id", user.id);
    setSavedName(true);
    setTimeout(() => setSavedName(false), 2000);
    router.refresh();
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermission();
      if (!granted) {
        setNotifDenied(Notification.permission === "denied");
        return;
      }
    }
    const next = { ...prefs, enabled };
    setPrefs(next);
    savePreferences(next);
  };

  const setMinutes = (minutesBefore: number) => {
    const next = { ...prefs, minutesBefore };
    setPrefs(next);
    savePreferences(next);
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="max-w-xl">
      <PageHeader title={t("set.title")} />

      <div className="space-y-4">
        <Card>
          <CardHeader title={t("set.profile")} />
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted">
              <UserRound className="size-4" />
              {user?.email}
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  label={t("set.displayName")}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t("set.yourName")}
                />
              </div>
              <Button variant="secondary" onClick={saveName}>
                {savedName ? t("common.saved") : t("common.save")}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t("set.language")} />
          <CardBody className="space-y-3">
            <Select
              label={t("set.language")}
              hint={t("set.languageDesc")}
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
            >
              {LOCALES.map((l) => (
                <option key={l} value={l}>
                  {LOCALE_LABELS[l]}
                </option>
              ))}
            </Select>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t("set.reminders")} />
          <CardBody className="space-y-4">
            {!notifSupported ? (
              <p className="text-sm text-muted">{t("set.noNotifications")}</p>
            ) : (
              <>
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <span className="flex items-center gap-2.5 text-sm text-ink">
                    <BellRing className="size-4 text-muted" />
                    {t("set.remindUpcoming")}
                  </span>
                  <input
                    type="checkbox"
                    checked={prefs.enabled}
                    onChange={(e) => toggleNotifications(e.target.checked)}
                    className="size-5 accent-[var(--color-ink)] cursor-pointer"
                  />
                </label>
                {notifDenied && (
                  <p className="text-xs text-terracotta">{t("set.blocked")}</p>
                )}
                {prefs.enabled && (
                  <Select
                    label={t("set.remindMe")}
                    value={String(prefs.minutesBefore)}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                  >
                    <option value="0">{t("set.remindAt")}</option>
                    <option value="5">{t("set.remind5")}</option>
                    <option value="15">{t("set.remind15")}</option>
                    <option value="30">{t("set.remind30")}</option>
                    <option value="60">{t("set.remind60")}</option>
                  </Select>
                )}
                <p className="text-xs text-muted leading-relaxed">
                  {t("set.remindersNote")}
                </p>
              </>
            )}
          </CardBody>
        </Card>

        <MeasurementReminderCard />

        <Card>
          <CardHeader title={t("set.app")} />
          <CardBody className="space-y-3">
            <p className="flex items-center gap-2.5 text-sm text-muted">
              <Download className="size-4" />
              {t("set.install")}
            </p>
          </CardBody>
        </Card>

        {isDemoMode() && (
          <Card>
            <CardHeader title={t("set.demoTitle")} />
            <CardBody className="space-y-3">
              <p className="text-sm text-muted leading-relaxed">
                {t("set.demoBody")}
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  resetDemoData();
                  window.location.reload();
                }}
              >
                {t("set.resetDemo")}
              </Button>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody className="pt-5">
            <Button variant="secondary" onClick={signOut} className="w-full">
              <LogOut className="size-4" /> {t("common.signOut")}
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
