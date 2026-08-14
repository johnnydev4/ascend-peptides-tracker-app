import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_INJECTION_SITES,
  ROTATION_REST_DAYS,
} from "@/lib/injection-sites/defaults";
import type { InjectionSite, SiteUsageSummary } from "@/lib/types";

/** Creates the default site catalogue for new users (idempotent). */
export async function ensureDefaultSites(
  supabase: SupabaseClient,
  userId: string
) {
  const { count, error } = await supabase
    .from("injection_sites")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  if ((count ?? 0) > 0) return;

  const { error: insertError } = await supabase.from("injection_sites").upsert(
    DEFAULT_INJECTION_SITES.map((site) => ({
      user_id: userId,
      name: site.name,
      body_region: site.bodyRegion,
    })),
    { onConflict: "user_id,body_region", ignoreDuplicates: true }
  );
  if (insertError) throw insertError;
}

export async function listSites(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("injection_sites")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as InjectionSite[];
}

export async function setSiteEnabled(
  supabase: SupabaseClient,
  siteId: string,
  enabled: boolean
) {
  const { error } = await supabase
    .from("injection_sites")
    .update({ enabled })
    .eq("id", siteId);
  if (error) throw error;
}

interface UsageRow {
  injection_site_id: string;
  used_at: string;
}

/** Per-site usage summary: count + last used. */
export async function getSiteUsageSummaries(
  supabase: SupabaseClient
): Promise<SiteUsageSummary[]> {
  const [sites, usage] = await Promise.all([
    listSites(supabase),
    supabase
      .from("injection_site_usage")
      .select("injection_site_id, used_at")
      .order("used_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as UsageRow[];
      }),
  ]);

  return sites.map((site) => {
    const rows = usage.filter((u) => u.injection_site_id === site.id);
    return {
      site,
      injectionCount: rows.length,
      lastUsedAt: rows[0]?.used_at ?? null,
    };
  });
}

export type RotationStatus = "recent" | "used" | "unused";

export function rotationStatus(summary: SiteUsageSummary): RotationStatus {
  if (!summary.lastUsedAt) return "unused";
  const days =
    (Date.now() - new Date(summary.lastUsedAt).getTime()) / 86_400_000;
  return days < ROTATION_REST_DAYS ? "recent" : "used";
}

/**
 * Recommended next site: enabled sites, least-recently used first,
 * never-used sites take priority.
 */
export function recommendNextSite(
  summaries: SiteUsageSummary[]
): SiteUsageSummary | null {
  const enabled = summaries.filter((s) => s.site.enabled);
  if (enabled.length === 0) return null;
  const unused = enabled.filter((s) => !s.lastUsedAt);
  if (unused.length > 0) return unused[0];
  return [...enabled].sort(
    (a, b) =>
      new Date(a.lastUsedAt!).getTime() - new Date(b.lastUsedAt!).getTime()
  )[0];
}
