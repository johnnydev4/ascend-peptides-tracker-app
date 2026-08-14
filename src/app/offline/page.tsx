"use client";

import { WifiOff } from "lucide-react";
import { Wordmark } from "@/components/layout/Logo";
import { useI18n } from "@/lib/i18n/context";

export default function OfflinePage() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Wordmark className="mb-10" />
      <div className="flex size-14 items-center justify-center rounded-2xl bg-tan-faint text-tan mb-5">
        <WifiOff className="size-6" aria-hidden />
      </div>
      <h1 className="text-xl font-semibold text-ink">{t("off.title")}</h1>
      <p className="mt-2 max-w-sm text-sm text-muted leading-relaxed">
        {t("off.body")}
      </p>
    </div>
  );
}
