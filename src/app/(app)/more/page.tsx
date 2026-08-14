"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

/** Mobile-only index of every section. */
export default function MorePage() {
  return (
    <div className="max-w-xl">
      <PageHeader title="All sections" />
      <Card className="divide-y divide-line overflow-hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3.5 px-5 py-4 hover:bg-cream transition-colors"
          >
            <item.icon className="size-5 text-muted" strokeWidth={1.8} />
            <span className="flex-1 text-sm font-medium text-ink">
              {item.label}
            </span>
            <ChevronRight className="size-4 text-muted" />
          </Link>
        ))}
      </Card>
    </div>
  );
}
