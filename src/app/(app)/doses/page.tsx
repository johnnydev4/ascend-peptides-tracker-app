"use client";

import { useState } from "react";
import { Pill } from "lucide-react";
import { addDays } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useUser } from "@/hooks/useUser";
import { listDoses, sweepMissedDoses } from "@/lib/data/doses";
import { getSiteUsageSummaries } from "@/lib/data/injection-sites";
import type { DoseWithRelations } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { DoseCard } from "@/components/features/DoseCard";
import { RecordDoseDialog } from "@/components/features/RecordDoseDialog";
import { EditDoseDialog } from "@/components/features/EditDoseDialog";

export default function DosesPage() {
  const { user } = useUser();
  const [doseToRecord, setDoseToRecord] = useState<DoseWithRelations | null>(null);
  const [doseToEdit, setDoseToEdit] = useState<DoseWithRelations | null>(null);

  const { data, loading, refresh } = useAsyncData(async () => {
    const supabase = createClient();
    await sweepMissedDoses(supabase);
    const now = new Date();
    const [due, upcoming, siteSummaries] = await Promise.all([
      // Scheduled doses whose time has passed (still within the grace window)
      listDoses(supabase, {
        status: "scheduled",
        to: now.toISOString(),
      }).then((d) => [...d].reverse()),
      listDoses(supabase, {
        status: "scheduled",
        from: now.toISOString(),
        to: addDays(now, 7).toISOString(),
      }).then((d) => [...d].reverse()),
      getSiteUsageSummaries(supabase),
    ]);
    return { due, upcoming, siteSummaries };
  });

  if (loading || !data) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Doses"
        subtitle="What's due now and what's coming this week."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Due now" />
          <CardBody className="space-y-2.5">
            {data.due.length > 0 ? (
              data.due.map((dose) => (
                <DoseCard
                  key={dose.id}
                  dose={dose}
                  onComplete={setDoseToRecord}
                  onEdit={setDoseToEdit}
                />
              ))
            ) : (
              <EmptyState
                icon={Pill}
                title="All caught up"
                description="No doses waiting to be recorded."
                className="py-8"
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Next 7 days" />
          <CardBody className="space-y-2.5">
            {data.upcoming.length > 0 ? (
              data.upcoming.map((dose) => (
                <DoseCard
                  key={dose.id}
                  dose={dose}
                  onComplete={setDoseToRecord}
                  onEdit={setDoseToEdit}
                />
              ))
            ) : (
              <EmptyState
                icon={Pill}
                title="Nothing scheduled"
                description="Doses appear here once a treatment is active."
                className="py-8"
              />
            )}
          </CardBody>
        </Card>
      </div>

      {doseToRecord && user && (
        <RecordDoseDialog
          dose={doseToRecord}
          siteSummaries={data.siteSummaries}
          userId={user.id}
          open={!!doseToRecord}
          onClose={() => setDoseToRecord(null)}
          onRecorded={refresh}
        />
      )}
      {doseToEdit && (
        <EditDoseDialog
          dose={doseToEdit}
          open={!!doseToEdit}
          onClose={() => setDoseToEdit(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
