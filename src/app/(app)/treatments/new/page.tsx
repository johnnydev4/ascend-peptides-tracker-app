"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createTreatment } from "@/lib/data/treatments";
import type { TreatmentInput } from "@/lib/validation/treatment";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { TreatmentForm } from "@/components/features/TreatmentForm";

export default function NewTreatmentPage() {
  const router = useRouter();

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
      <PageHeader
        title="New treatment"
        subtitle="Enter your protocol — the dose calendar is generated from these parameters."
      />
      <Card>
        <CardBody className="pt-5">
          <TreatmentForm onSubmit={onSubmit} submitLabel="Create treatment" />
        </CardBody>
      </Card>
    </div>
  );
}
