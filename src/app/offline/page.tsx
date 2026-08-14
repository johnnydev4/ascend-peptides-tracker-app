import { WifiOff } from "lucide-react";
import { Wordmark } from "@/components/layout/Logo";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Wordmark className="mb-10" />
      <div className="flex size-14 items-center justify-center rounded-2xl bg-tan-faint text-tan mb-5">
        <WifiOff className="size-6" aria-hidden />
      </div>
      <h1 className="text-xl font-semibold text-ink">You&apos;re offline</h1>
      <p className="mt-2 max-w-sm text-sm text-muted leading-relaxed">
        Peptide Tracker needs a connection to load fresh data. Your records are
        safe — reconnect and try again.
      </p>
    </div>
  );
}
