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
import { Select, Input } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge, statusTone } from "@/components/ui/Badge";

export default function HistoryPage() {
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
      <PageHeader
        title="History"
        subtitle="Every recorded dose, filterable by treatment, date, site, and status."
      />

      <Card className="mb-4">
        <CardBody className="pt-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Select
              label="Treatment"
              value={treatmentId}
              onChange={(e) => setTreatmentId(e.target.value)}
            >
              <option value="">All</option>
              {meta?.treatments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="missed">Missed</option>
              <option value="skipped">Skipped</option>
            </Select>
            <Select
              label="Injection site"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
            >
              <option value="">All</option>
              {meta?.sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <Input
              label="From"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <Input
              label="To"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
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
              title="No doses match"
              description="Try widening the filters."
            />
          ) : (
            <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-xs text-muted border-b border-line">
                    <th className="py-2.5 pr-4 font-medium">Treatment</th>
                    <th className="py-2.5 pr-4 font-medium">Scheduled</th>
                    <th className="py-2.5 pr-4 font-medium">Administered</th>
                    <th className="py-2.5 pr-4 font-medium">Dose</th>
                    <th className="py-2.5 pr-4 font-medium">Site</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                    <th className="py-2.5 font-medium">Notes</th>
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
                        {dose.injection_site?.name ?? "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone={statusTone(dose.status)}>
                          {dose.status}
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
