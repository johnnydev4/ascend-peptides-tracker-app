"use client";

import { Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useUser } from "@/hooks/useUser";
import {
  ensureDefaultSites,
  getSiteUsageSummaries,
  recommendNextSite,
  rotationStatus,
  setSiteEnabled,
} from "@/lib/data/injection-sites";
import { formatDay } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { InjectionSiteMap } from "@/components/features/InjectionSiteMap";
import { useI18n } from "@/lib/i18n/context";
import { siteName } from "@/lib/i18n/labels";

const statusMeta = {
  recent: { key: "is.usedRecently", tone: "tan" as const },
  used: { key: "is.ready", tone: "sage" as const },
  unused: { key: "is.notUsed", tone: "neutral" as const },
};

export default function InjectionSitesPage() {
  const { user } = useUser();
  const { t } = useI18n();

  const { data, loading, refresh } = useAsyncData(async () => {
    const supabase = createClient();
    const {
      data: { user: current },
    } = await supabase.auth.getUser();
    if (current) await ensureDefaultSites(supabase, current.id);
    return getSiteUsageSummaries(supabase);
  }, [user?.id]);

  if (loading || !data) return <Spinner />;

  const recommended = recommendNextSite(data);

  const toggle = async (siteId: string, enabled: boolean) => {
    const supabase = createClient();
    await setSiteEnabled(supabase, siteId, enabled);
    await refresh();
  };

  return (
    <div>
      <PageHeader title={t("is.title")} subtitle={t("is.subtitle")} />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <Card className="h-fit">
          <CardHeader title={t("is.bodyMap")} />
          <CardBody>
            <InjectionSiteMap summaries={data} />
            {recommended && (
              <p className="mt-4 text-sm text-ink-soft bg-tan-faint border border-tan-soft rounded-xl px-3.5 py-2.5">
                {t("dash.nextSuggested", {
                  name: siteName(t, recommended.site),
                })}
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t("is.allAreas")} />
          <CardBody className="space-y-2">
            {data.length === 0 ? (
              <EmptyState icon={Target} title={t("is.noSites")} />
            ) : (
              data.map((summary) => {
                const status = rotationStatus(summary);
                const label = siteName(t, summary.site);
                return (
                  <div
                    key={summary.site.id}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{label}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {summary.lastUsedAt
                          ? t("is.injectionsLastUsed", {
                              n: summary.injectionCount,
                              day: formatDay(summary.lastUsedAt),
                            })
                          : t("is.injections", {
                              n: summary.injectionCount,
                            })}
                      </p>
                    </div>
                    {summary.site.enabled && (
                      <Badge tone={statusMeta[status].tone}>
                        {t(statusMeta[status].key)}
                      </Badge>
                    )}
                    <label className="flex items-center gap-2 text-xs text-muted cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={summary.site.enabled}
                        onChange={(e) =>
                          toggle(summary.site.id, e.target.checked)
                        }
                        className="size-4 accent-[var(--color-ink)] cursor-pointer"
                        aria-label={label}
                      />
                      {t("is.available")}
                    </label>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
