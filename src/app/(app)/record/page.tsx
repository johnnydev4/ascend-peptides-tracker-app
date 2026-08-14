"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Pill } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useUser } from "@/hooks/useUser";
import { listDoses, sweepMissedDoses } from "@/lib/data/doses";
import { getSiteUsageSummaries } from "@/lib/data/injection-sites";
import type { DoseWithRelations } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { DoseCard } from "@/components/features/DoseCard";
import { RecordDoseDialog } from "@/components/features/RecordDoseDialog";
import { useI18n } from "@/lib/i18n/context";

/** Mobile quick-record: the next doses ready to be marked as completed. */
export default function RecordPage() {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useI18n();
  const [doseToRecord, setDoseToRecord] = useState<DoseWithRelations | null>(null);
  const [recorded, setRecorded] = useState(false);

  const { data, loading, refresh } = useAsyncData(async () => {
    const supabase = createClient();
    await sweepMissedDoses(supabase);
    const [doses, siteSummaries] = await Promise.all([
      listDoses(supabase, { status: "scheduled", limit: 5 }).then((d) =>
        [...d].reverse()
      ),
      getSiteUsageSummaries(supabase),
    ]);
    return { doses, siteSummaries };
  });

  if (loading || !data) return <Spinner />;

  return (
    <div className="max-w-xl">
      <PageHeader title={t("rec.title")} subtitle={t("rec.subtitle")} />

      {recorded && (
        <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-sage-soft bg-sage-soft/60 px-4 py-3 text-sm text-sage font-medium">
          <CheckCircle2 className="size-4" /> {t("rec.recorded")}
        </div>
      )}

      <Card>
        <CardBody className="pt-5 space-y-2.5">
          {data.doses.length > 0 ? (
            data.doses.map((dose) => (
              <DoseCard key={dose.id} dose={dose} onComplete={setDoseToRecord} />
            ))
          ) : (
            <EmptyState
              icon={Pill}
              title={t("rec.nothingTitle")}
              description={t("rec.nothingDesc")}
            />
          )}
        </CardBody>
      </Card>

      {doseToRecord && user && (
        <RecordDoseDialog
          dose={doseToRecord}
          siteSummaries={data.siteSummaries}
          userId={user.id}
          open={!!doseToRecord}
          onClose={() => setDoseToRecord(null)}
          onRecorded={() => {
            setRecorded(true);
            void refresh();
            setTimeout(() => router.push("/dashboard"), 1200);
          }}
        />
      )}
    </div>
  );
}
