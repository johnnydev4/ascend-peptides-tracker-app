"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAsyncData } from "@/hooks/useAsyncData";
import { listDoses, type DoseFilters } from "@/lib/data/doses";
import { listTreatments } from "@/lib/data/treatments";
import { listSites } from "@/lib/data/injection-sites";
import type { DoseStatus } from "@/lib/types";
import { formatAmount, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { DateField } from "@/components/ui/DateTimePicker";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge, statusTone } from "@/components/ui/Badge";
import { useI18n } from "@/lib/i18n/context";
import { statusLabel, siteName } from "@/lib/i18n/labels";

export default function HistoryPage() {
  const { t } = useI18n();
  const [treatmentId, setTreatmentId] = useState("");
  const [status, setStatus] = useState("");
  const [siteId, setSiteId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data: meta } = useAsyncData(async () => {
    const supabase = createClient();
    const [treatments, sites] = await Promise.all([
      listTreatments(supabase),
      listSites(supabase),
    ]);
    return { treatments, sites };
  });

  const { data: doses, loading } = useAsyncData(async () => {
    const supabase = createClient();
    const filters: DoseFilters = { limit: 200 };
    if (treatmentId) filters.treatmentId = treatmentId;
    if (status) filters.status = status as DoseStatus;
    if (siteId) filters.injectionSiteId = siteId;
    if (from) filters.from = new Date(`${from}T00:00:00`).toISOString();
    if (to) filters.to = new Date(`${to}T23:59:59`).toISOString();
    return listDoses(supabase, filters);
  }, [treatmentId, status, siteId, from, to]);

  return (
    <div>
      <PageHeader title={t("hist.title")} subtitle={t("hist.subtitle")} />

      <Card className="mb-4">
        <CardBody className="pt-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Select
              label={t("hist.treatment")}
              value={treatmentId}
              onChange={(e) => setTreatmentId(e.target.value)}
            >
              <option value="">{t("common.all")}</option>
              {meta?.treatments.map((tr) => (
                <option key={tr.id} value={tr.id}>
                  {tr.name}
                </option>
              ))}
            </Select>
            <Select
              label={t("hist.status")}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">{t("common.all")}</option>
              <option value="scheduled">{t("statusOpt.scheduled")}</option>
              <option value="completed">{t("statusOpt.completed")}</option>
              <option value="missed">{t("statusOpt.missed")}</option>
              <option value="skipped">{t("statusOpt.skipped")}</option>
            </Select>
            <Select
              label={t("hist.injectionSite")}
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
            >
              <option value="">{t("common.all")}</option>
              {meta?.sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {siteName(t, s)}
                </option>
              ))}
            </Select>
            <DateField
              label={t("hist.from")}
              value={from}
              onChange={setFrom}
            />
            <DateField label={t("hist.to")} value={to} onChange={setTo} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="pt-5">
          {loading ? (
            <Spinner />
          ) : !doses || doses.length === 0 ? (
            <EmptyState
              icon={Clock}
              title={t("hist.noMatch")}
              description={t("hist.noMatchDesc")}
            />
          ) : (
            <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-xs text-muted border-b border-line">
                    <th className="py-2.5 pr-4 font-medium">{t("hist.treatment")}</th>
                    <th className="py-2.5 pr-4 font-medium">{t("hist.scheduled")}</th>
                    <th className="py-2.5 pr-4 font-medium">{t("hist.administered")}</th>
                    <th className="py-2.5 pr-4 font-medium">{t("hist.dose")}</th>
                    <th className="py-2.5 pr-4 font-medium">{t("hist.site")}</th>
                    <th className="py-2.5 pr-4 font-medium">{t("hist.status")}</th>
                    <th className="py-2.5 font-medium">{t("hist.notes")}</th>
                  </tr>
                </thead>
                <tbody>
                  {doses.map((dose) => (
                    <tr
                      key={dose.id}
                      className="border-b border-line/60 last:border-0"
                    >
                      <td className="py-3 pr-4 font-medium text-ink">
                        {dose.treatment?.name ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        {formatDateTime(dose.scheduled_at)}
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        {dose.administered_at
                          ? formatDateTime(dose.administered_at)
                          : "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        {dose.dose_amount
                          ? `${formatAmount(dose.dose_amount)} ${dose.dose_unit ?? ""}`
                          : "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        {dose.injection_site
                          ? siteName(t, dose.injection_site)
                          : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone={statusTone(dose.status)}>
                          {statusLabel(t, dose.status)}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted max-w-48 truncate">
                        {dose.notes ?? ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
