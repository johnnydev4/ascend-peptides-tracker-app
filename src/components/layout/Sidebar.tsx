"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Wordmark } from "./Logo";
import { NAV_ITEMS } from "./nav-items";

export function Sidebar({ displayName }: { displayName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-line bg-surface/60 px-4 py-6 sticky top-0 h-dvh">
      <Link href="/dashboard" className="px-2 mb-8 block w-fit">
        <Wordmark />
      </Link>

      <nav className="flex-1 space-y-0.5" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-cream-deep text-ink"
                  : "text-ink-soft hover:bg-cream hover:text-ink"
              )}
            >
              <item.icon className="size-[18px]" strokeWidth={1.8} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 flex items-center justify-between gap-2 border-t border-line pt-4 px-1">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{displayName}</p>
          <p className="text-xs text-muted">Signed in</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          aria-label="Sign out"
          className="rounded-lg p-2 text-muted hover:bg-cream-deep hover:text-ink transition-colors"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  );
}
