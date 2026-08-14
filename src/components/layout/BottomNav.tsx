"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { NAV_ITEMS, MOBILE_NAV } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const items = NAV_ITEMS.filter((i) => MOBILE_NAV.includes(i.href));
  const [first, second, third] = items;

  const linkClass = (href: string) =>
    cn(
      "flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors min-w-16",
      pathname === href || pathname.startsWith(`${href}/`)
        ? "text-ink"
        : "text-muted hover:text-ink"
    );

  return (
    <nav
      aria-label="Main navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2">
        {[first, second].map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            <item.icon className="size-5" strokeWidth={1.8} aria-hidden />
            {t(item.label)}
          </Link>
        ))}

        <Link
          href="/record"
          aria-label={t("nav.recordDose")}
          className="flex size-13 -mt-6 items-center justify-center rounded-full bg-ink text-cream shadow-raised transition-transform active:scale-95"
        >
          <Plus className="size-6" />
        </Link>

        <Link href={third.href} className={linkClass(third.href)}>
          <third.icon className="size-5" strokeWidth={1.8} aria-hidden />
          {t(third.label)}
        </Link>

        <Link href="/more" className={linkClass("/more")}>
          <LayoutGrid className="size-5" strokeWidth={1.8} aria-hidden />
          {t("nav.more")}
        </Link>
      </div>
    </nav>
  );
}
