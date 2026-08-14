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

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Automatic calendar",
    description:
      "Your full dose schedule, generated from the protocol you configure.",
  },
  {
    icon: Target,
    title: "Site rotation",
    description:
      "A visual body map remembers where you injected and suggests where to go next.",
  },
  {
    icon: Calculator,
    title: "Reconstitution math",
    description:
      "BAC water calculations from your vial size and target concentration.",
  },
  {
    icon: LineChart,
    title: "Progress & history",
    description:
      "Adherence, completed doses, and side effects — all in one calm overview.",
  },
  {
    icon: BellRing,
    title: "Dose reminders",
    description: "Optional notifications so a scheduled dose never slips by.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description:
      "Your data is yours alone, protected with row-level security.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <Wordmark />
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 pb-20 max-w-5xl mx-auto w-full">
        <section className="py-16 sm:py-24 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-ink leading-[1.1]">
            A calm home for your peptide protocol.
          </h1>
          <p className="mt-5 text-lg text-muted leading-relaxed">
            Track doses, rotate injection sites, log side effects, and see your
            progress — organized automatically around the schedule you set.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg">Create your tracker</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted">
            A tracking and organization tool — not medical advice.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-tan-faint text-tan mb-4">
                <feature.icon className="size-5" strokeWidth={1.8} aria-hidden />
              </div>
              <h2 className="text-sm font-semibold text-ink">{feature.title}</h2>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        Peptide Tracker — organize an existing treatment protocol.
      </footer>
    </div>
  );
}
