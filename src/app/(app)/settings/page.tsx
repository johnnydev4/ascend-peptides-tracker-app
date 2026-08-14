"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing, LogOut, UserRound, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
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
      <PageHeader title="Settings" />

      <div className="space-y-4">
        <Card>
          <CardHeader title="Profile" />
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted">
              <UserRound className="size-4" />
              {user?.email}
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  label="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <Button variant="secondary" onClick={saveName}>
                {savedName ? "Saved ✓" : "Save"}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Dose reminders" />
          <CardBody className="space-y-4">
            {!notifSupported ? (
              <p className="text-sm text-muted">
                Notifications aren&apos;t available in this browser.
              </p>
            ) : (
              <>
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <span className="flex items-center gap-2.5 text-sm text-ink">
                    <BellRing className="size-4 text-muted" />
                    Remind me about upcoming doses
                  </span>
                  <input
                    type="checkbox"
                    checked={prefs.enabled}
                    onChange={(e) => toggleNotifications(e.target.checked)}
                    className="size-5 accent-[var(--color-ink)] cursor-pointer"
                  />
                </label>
                {notifDenied && (
                  <p className="text-xs text-terracotta">
                    Notifications are blocked for this site — allow them in your
                    browser settings to enable reminders.
                  </p>
                )}
                {prefs.enabled && (
                  <Select
                    label="Remind me"
                    value={String(prefs.minutesBefore)}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                  >
                    <option value="0">At the scheduled time</option>
                    <option value="5">5 minutes before</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                  </Select>
                )}
                <p className="text-xs text-muted leading-relaxed">
                  Reminders are shown while the app is open in your browser.
                  Support varies by platform — iOS requires the app to be
                  installed to the home screen.
                </p>
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="App" />
          <CardBody className="space-y-3">
            <p className="flex items-center gap-2.5 text-sm text-muted">
              <Download className="size-4" />
              Install: use your browser&apos;s “Add to Home Screen” / “Install
              app” option for a full-screen experience.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-5">
            <Button variant="secondary" onClick={signOut} className="w-full">
              <LogOut className="size-4" /> Sign out
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
