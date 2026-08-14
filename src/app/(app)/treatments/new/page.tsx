"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createTreatment } from "@/lib/data/treatments";
import type { TreatmentInput } from "@/lib/validation/treatment";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { TreatmentForm } from "@/components/features/TreatmentForm";
import { useI18n } from "@/lib/i18n/context";

export default function NewTreatmentPage() {
  const router = useRouter();
  const { t } = useI18n();

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
    <div className="max-w-xl">
      <PageHeader title={t("tr.new")} subtitle={t("tr.newSubtitle")} />
      <Card>
        <CardBody className="pt-5">
          <TreatmentForm
            onSubmit={onSubmit}
            submitLabel={t("tr.createTreatment")}
          />
        </CardBody>
      </Card>
    </div>
  );
}
