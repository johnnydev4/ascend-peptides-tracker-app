import Link from "next/link";
import { Wordmark } from "@/components/layout/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8">
        <Wordmark />
      </Link>
      <div className="w-full max-w-sm bg-surface border border-line rounded-card shadow-soft p-6 sm:p-8 animate-rise">
        {children}
      </div>
    </div>
  );
}
