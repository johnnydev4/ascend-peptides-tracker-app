"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlaskConical, Equal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useUser } from "@/hooks/useUser";
import {
  calculateReconstitution,
  roundVolume,
  CalculationError,
  type ReconstitutionResult,
} from "@/lib/calculations/reconstitution";
import {
  calculatorSchema,
  type CalculatorInput,
  type CalculatorFormValues,
} from "@/lib/validation/calculator";
import { listCalculatorHistory, saveCalculation } from "@/lib/data/calculator";
import { formatAmount, formatDay } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { useI18n } from "@/lib/i18n/context";

const SYRINGE_DOSES_MG = [0.25, 0.5, 1, 2, 2.5];

export default function CalculatorPage() {
  const { user } = useUser();
  const { t } = useI18n();
  const [result, setResult] = useState<ReconstitutionResult | null>(null);
  const [lastInputs, setLastInputs] = useState<CalculatorInput | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  const { data: history, refresh } = useAsyncData(async () => {
    const supabase = createClient();
    return listCalculatorHistory(supabase);
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CalculatorFormValues, unknown, CalculatorInput>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      vialUnit: "mg",
      concentrationUnit: "mg/mL",
    },
  });

  const onSubmit = async (values: CalculatorInput) => {
    setCalcError(null);
    try {
      const res = calculateReconstitution(values);
      setResult(res);
      setLastInputs(values);
      if (user) {
        const supabase = createClient();
        await saveCalculation(supabase, user.id, {
          vial_quantity: values.vialQuantity,
          vial_unit: values.vialUnit,
          desired_concentration: values.desiredConcentration,
          concentration_unit: values.concentrationUnit,
          calculated_volume: roundVolume(res.volumeMl),
          volume_unit: "mL",
        });
        await refresh();
      }
    } catch (error) {
      setResult(null);
      setCalcError(
        error instanceof CalculationError
          ? t(error.message)
          : t("calc.errGeneric")
      );
    }
  };

  return (
    <div>
      <PageHeader title={t("calc.title")} subtitle={t("calc.subtitle")} />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader title={t("calc.bacToAdd")} />
            <CardBody>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={t("calc.vialQuantity")}
                    type="number"
                    step="any"
                    inputMode="decimal"
                    placeholder="10"
                    error={errors.vialQuantity?.message}
                    {...register("vialQuantity")}
                  />
                  <Select label={t("calc.unit")} {...register("vialUnit")}>
                    <option value="mg">mg</option>
                    <option value="mcg">mcg</option>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={t("calc.desiredConcentration")}
                    type="number"
                    step="any"
                    inputMode="decimal"
                    placeholder="2"
                    error={errors.desiredConcentration?.message}
                    {...register("desiredConcentration")}
                  />
                  <Select label={t("calc.unit")} {...register("concentrationUnit")}>
                    <option value="mg/mL">mg/mL</option>
                    <option value="mcg/mL">mcg/mL</option>
                  </Select>
                </div>

                {calcError && (
                  <p role="alert" className="text-sm text-terracotta">
                    {calcError}
                  </p>
                )}

                <Button type="submit" className="w-full">
                  {t("calc.calculate")}
                </Button>
              </form>

              {result && lastInputs && (
                <div className="mt-5 rounded-2xl bg-tan-faint border border-tan-soft p-5">
                  <div className="flex items-center gap-3 text-sm text-muted">
                    <span>
                      {formatAmount(lastInputs.vialQuantity)}{" "}
                      {lastInputs.vialUnit}
                    </span>
                    <span>÷</span>
                    <span>
                      {formatAmount(lastInputs.desiredConcentration)}{" "}
                      {lastInputs.concentrationUnit}
                    </span>
                    <Equal className="size-4" />
                  </div>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                    {formatAmount(roundVolume(result.volumeMl))} mL
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {t("calc.resultSuffix")}
                  </p>

                  <div className="mt-5 border-t border-tan-soft pt-4">
                    <p className="text-xs font-semibold text-muted mb-2">
                      {t("calc.perDose")}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                      {SYRINGE_DOSES_MG.map((doseMg) => (
                        <div
                          key={doseMg}
                          className="rounded-xl bg-surface border border-line px-3 py-2"
                        >
                          <span className="text-muted">{doseMg} mg → </span>
                          <span className="font-medium text-ink">
                            {formatAmount(
                              roundVolume(result.volumeForDoseMg(doseMg))
                            )}{" "}
                            mL
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
