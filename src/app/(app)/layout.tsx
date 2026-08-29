import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Logo } from "@/components/layout/Logo";
import { DoseReminderScheduler } from "@/components/pwa/DoseReminderScheduler";
import { MeasurementReminderScheduler } from "@/components/pwa/MeasurementReminderScheduler";
import { VialExpiryReminderScheduler } from "@/components/pwa/VialExpiryReminderScheduler";
import { NeedleReminderScheduler } from "@/components/pwa/NeedleReminderScheduler";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const displayName =
    profile?.display_name || user.email?.split("@")[0] || "there";

  return (
    <div className="flex min-h-dvh w-full">
      <Sidebar displayName={displayName} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-line bg-cream/90 backdrop-blur px-4 sm:px-6 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <Link href="/dashboard" aria-label="Dashboard">
            <Logo />
          </Link>
          <span className="text-sm font-semibold text-ink">Ascend Tracker</span>
          <span className="w-7" aria-hidden />
        </header>

        <main className="flex-1 px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-8 lg:pb-10 max-w-6xl w-full mx-auto animate-rise">
          {children}
        </main>
      </div>

      <BottomNav />
      <DoseReminderScheduler />
      <MeasurementReminderScheduler />
      <VialExpiryReminderScheduler />
      <NeedleReminderScheduler />
    </div>
  );
}
