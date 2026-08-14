"use client";

import Link from "next/link";
import {
  CalendarDays,
  Target,
  Calculator,
  BellRing,
  ShieldCheck,
  LineChart,
} from "lucide-react";
import { Wordmark } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/context";

const FEATURES = [
  { icon: CalendarDays, key: "calendar" },
  { icon: Target, key: "rotation" },
  { icon: Calculator, key: "math" },
  { icon: LineChart, key: "progress" },
  { icon: BellRing, key: "reminders" },
  { icon: ShieldCheck, key: "private" },
] as const;

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <Wordmark />
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              {t("common.signIn")}
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">{t("common.getStarted")}</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 pb-20 max-w-5xl mx-auto w-full">
        <section className="py-16 sm:py-24 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-ink leading-[1.1]">
            {t("landing.heroTitle")}
          </h1>
          <p className="mt-5 text-lg text-muted leading-relaxed">
            {t("landing.heroSubtitle")}
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg">{t("landing.createTracker")}</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                {t("common.signIn")}
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted">{t("landing.disclaimer")}</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.key} className="p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-tan-faint text-tan mb-4">
                <feature.icon className="size-5" strokeWidth={1.8} aria-hidden />
              </div>
              <h2 className="text-sm font-semibold text-ink">
                {t(`landing.feature.${feature.key}.title`)}
              </h2>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">
                {t(`landing.feature.${feature.key}.desc`)}
              </p>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        {t("landing.footer")}
      </footer>
    </div>
  );
}
