"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createTreatment } from "@/lib/data/treatments";
import type { TreatmentInput } from "@/lib/validation/treatment";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { TreatmentForm } from "@/components/features/TreatmentForm";
import { PeptideInfoPanel } from "@/components/features/PeptideReference";
import type { Peptide } from "@/lib/peptides";
import { useI18n } from "@/lib/i18n/context";

export default function NewTreatmentPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [peptide, setPeptide] = useState<Peptide | null>(null);

  const onSubmit = async (values: TreatmentInput) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in.");
    const treatment = await createTreatment(supabase, user.id, values);
    router.push(`/treatments/${treatment.id}`);
  };

  return (
    <div className="max-w-4xl">
      <PageHeader title={t("tr.new")} subtitle={t("tr.newSubtitle")} />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card>
          <CardBody className="pt-5">
            <TreatmentForm
              onSubmit={onSubmit}
              submitLabel={t("tr.createTreatment")}
              onPeptideChange={setPeptide}
            />
          </CardBody>
        </Card>
        <PeptideInfoPanel
          peptide={peptide}
          showEmpty
          className={
            peptide
              ? "lg:sticky lg:top-4"
              : "hidden lg:block lg:sticky lg:top-4"
          }
        />
      </div>
    </div>
  );
}
