import { cn } from "@/lib/utils";

/** Small molecule mark echoing the product identity. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("size-7 text-ink", className)}
    >
      <circle cx="9" cy="10" r="3.2" fill="currentColor" />
      <circle cx="22" cy="7" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="13" cy="23" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="24" cy="21" r="3.2" fill="currentColor" />
      <path
        d="M11.8 11.4 20 8m-9 12.8 1.6-8.6M15.3 22l6-1.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Logo />
      <span className="text-[15px] font-semibold leading-tight tracking-tight text-ink">
        Peptide
        <br />
        Tracker
      </span>
    </span>
  );
}
