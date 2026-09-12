"use client";

import { FlaskConical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useUser } from "@/hooks/useUser";
import { roundVolume } from "@/lib/calculations/reconstitution";
import { listCalculatorHistory, saveCalculation } from "@/lib/data/calculator";
import { formatAmount, formatDay } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ReconstitutionCalculator,
  type Outcome,
} from "@/components/features/ReconstitutionCalculator";
import { useI18n } from "@/lib/i18n/context";

export default function CalculatorPage() {
  const { user } = useUser();
  const { t } = useI18n();

  const { data: history, refresh } = useAsyncData(async () => {
    const supabase = createClient();
    return listCalculatorHistory(supabase);
  });

  const onCalculated = async (outcome: Outcome) => {
    if (!user) return;
    const supabase = createClient();
    await saveCalculation(supabase, user.id, {
      vial_quantity: outcome.inputs.vialQuantity,
      vial_unit: outcome.inputs.vialUnit,
      desired_concentration: roundVolume(outcome.result.concentrationMgPerMl),
      concentration_unit: "mg/mL",
      calculated_volume: roundVolume(outcome.result.volumeMl),
      volume_unit: "mL",
    });
    await refresh();
  };

  return (
    <div>
      <PageHeader title={t("calc.title")} subtitle={t("calc.subtitle")} />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader title={t("calc.bacToAdd")} />
            <CardBody>
              <ReconstitutionCalculator
                onCalculated={onCalculated}
                outcomeFooter={
                  <p className="mt-4 text-xs text-muted leading-relaxed">
                    {t("calc.saveHint")}
                  </p>
                }
              />
            </CardBody>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader title={t("calc.recent")} />
          <CardBody className="space-y-2">
            {history && history.length > 0 ? (
              history.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm"
                >
                  <p className="text-ink">
                    {formatAmount(entry.vial_quantity)} {entry.vial_unit} @{" "}
                    {formatAmount(entry.desired_concentration)}{" "}
                    {entry.concentration_unit} →{" "}
                    <span className="font-semibold">
                      {formatAmount(entry.calculated_volume)} {entry.volume_unit}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDay(entry.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                icon={FlaskConical}
                title={t("calc.noCalcs")}
                className="py-8"
              />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
