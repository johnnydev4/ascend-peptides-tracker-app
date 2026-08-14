"use client";

import Link from "next/link";
import { Plus, Syringe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAsyncData } from "@/hooks/useAsyncData";
import { listTreatments } from "@/lib/data/treatments";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { TreatmentCard } from "@/components/features/TreatmentCard";
import { useI18n } from "@/lib/i18n/context";

interface DoseCount {
  treatment_id: string;
  status: string;
}

export default function TreatmentsPage() {
  const { t } = useI18n();
  const { data, loading } = useAsyncData(async () => {
    const supabase = createClient();
    const [treatments, doseRows] = await Promise.all([
      listTreatments(supabase),
      supabase
        .from("doses")
        .select("treatment_id, status")
        .then(({ data: rows, error }) => {
          if (error) throw error;
          return (rows ?? []) as DoseCount[];
        }),
    ]);
    return { treatments, doseRows };
  });

  if (loading || !data) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={t("tr.title")}
        subtitle={t("tr.subtitle")}
        action={
          <Link href="/treatments/new">
            <Button>
              <Plus className="size-4" /> {t("tr.new")}
            </Button>
          </Link>
        }
      />

      {data.treatments.length === 0 ? (
        <Card>
          <EmptyState
            icon={Syringe}
            title={t("dash.noTreatmentsTitle")}
            description={t("tr.emptyDesc")}
            action={
              <Link href="/treatments/new">
                <Button>
                  <Plus className="size-4" /> {t("tr.createTreatment")}
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.treatments.map((treatment) => {
            const doses = data.doseRows.filter(
              (d) => d.treatment_id === treatment.id
            );
            return (
              <TreatmentCard
                key={treatment.id}
                treatment={treatment}
                completed={doses.filter((d) => d.status === "completed").length}
                total={doses.length}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
