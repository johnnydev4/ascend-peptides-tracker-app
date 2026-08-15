"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlaskConical, Equal, Syringe, AlertTriangle, Scale } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useUser } from "@/hooks/useUser";
import {
  calculateReconstitution,
  calculateFromWeight,
  roundVolume,
  CalculationError,
  type ReconstitutionResult,
  type WeightReconstitutionResult,
} from "@/lib/calculations/reconstitution";
import {
  calculateFromSyringeTarget,
  roundUnits,
  SYRINGE_TYPES,
  SYRINGE_UNITS_PER_ML,
  type SyringeTargetResult,
  type SyringeType,
} from "@/lib/calculations/syringe";
import {
  calculatorSchema,
  syringeCalculatorSchema,
  weightCalculatorSchema,
  type CalculatorInput,
  type CalculatorFormValues,
  type SyringeCalculatorInput,
  type SyringeCalculatorFormValues,
  type WeightCalculatorInput,
  type WeightCalculatorFormValues,
} from "@/lib/validation/calculator";
import { listCalculatorHistory, saveCalculation } from "@/lib/data/calculator";
import { cn, formatAmount, formatDay } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { useI18n } from "@/lib/i18n/context";

const SYRINGE_DOSES_MG = [0.25, 0.5, 1, 2, 2.5];

type Mode = "concentration" | "units" | "weight";

type Outcome =
  | { mode: "concentration"; result: ReconstitutionResult; inputs: CalculatorInput }
  | { mode: "units"; result: SyringeTargetResult; inputs: SyringeCalculatorInput }
  | {
      mode: "weight";
      result: WeightReconstitutionResult;
      inputs: WeightCalculatorInput;
    };

export default function CalculatorPage() {
  const { user } = useUser();
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("concentration");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  const { data: history, refresh } = useAsyncData(async () => {
    const supabase = createClient();
    return listCalculatorHistory(supabase);
  });

  const concentrationForm = useForm<CalculatorFormValues, unknown, CalculatorInput>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      vialUnit: "mg",
      concentrationUnit: "mg/mL",
    },
  });

  const unitsForm = useForm<
    SyringeCalculatorFormValues,
    unknown,
    SyringeCalculatorInput
  >({
    resolver: zodResolver(syringeCalculatorSchema),
    defaultValues: {
      vialUnit: "mg",
      doseUnit: "mcg",
      syringeType: "U-100",
    },
  });

  const weightForm = useForm<
    WeightCalculatorFormValues,
    unknown,
    WeightCalculatorInput
  >({
    resolver: zodResolver(weightCalculatorSchema),
    defaultValues: {
      vialUnit: "mg",
      weightUnit: "g",
    },
  });

  const persist = async (
    concentrationMgPerMl: number,
    volumeMl: number,
    vialQuantity: number,
    vialUnit: string
  ) => {
    if (!user) return;
    const supabase = createClient();
    await saveCalculation(supabase, user.id, {
      vial_quantity: vialQuantity,
      vial_unit: vialUnit,
      desired_concentration: roundVolume(concentrationMgPerMl),
      concentration_unit: "mg/mL",
      calculated_volume: roundVolume(volumeMl),
      volume_unit: "mL",
    });
    await refresh();
  };

  const handleError = (error: unknown) => {
    setOutcome(null);
    setCalcError(
      error instanceof CalculationError ? t(error.message) : t("calc.errGeneric")
    );
  };

  const onSubmitConcentration = async (values: CalculatorInput) => {
    setCalcError(null);
    try {
      const result = calculateReconstitution(values);
      setOutcome({ mode: "concentration", result, inputs: values });
      await persist(
        result.concentrationMgPerMl,
        result.volumeMl,
        values.vialQuantity,
        values.vialUnit
      );
    } catch (error) {
      handleError(error);
    }
  };

  const onSubmitUnits = async (values: SyringeCalculatorInput) => {
    setCalcError(null);
    try {
      const result = calculateFromSyringeTarget({
        vialQuantity: values.vialQuantity,
        vialUnit: values.vialUnit,
        doseAmount: values.doseAmount,
        doseUnit: values.doseUnit,
        targetUnits: values.targetUnits,
        syringe: values.syringeType,
      });
      setOutcome({ mode: "units", result, inputs: values });
      await persist(
        result.concentrationMgPerMl,
        result.volumeMl,
        values.vialQuantity,
        values.vialUnit
      );
    } catch (error) {
      handleError(error);
    }
  };

  const onSubmitWeight = async (values: WeightCalculatorInput) => {
    setCalcError(null);
    try {
      const result = calculateFromWeight(values);
      setOutcome({ mode: "weight", result, inputs: values });
      await persist(
        result.concentrationMgPerMl,
        result.volumeMl,
        values.vialQuantity,
        values.vialUnit
      );
    } catch (error) {
      handleError(error);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setOutcome(null);
    setCalcError(null);
  };

  // Syringe used for the per-dose table (explicit in units mode, optional in
  // concentration mode).
  const tableSyringe: SyringeType | undefined = outcome?.inputs.syringeType;

  return (
    <div>
      <PageHeader title={t("calc.title")} subtitle={t("calc.subtitle")} />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader title={t("calc.bacToAdd")} />
            <CardBody>
              <div
                role="tablist"
                aria-label={t("calc.mode")}
                className="mb-5 grid grid-cols-3 gap-1 rounded-xl bg-cream-deep p-1"
              >
                {(["concentration", "units", "weight"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => switchMode(m)}
                    className={cn(
                      "rounded-lg px-2 py-2 text-[13px] font-medium transition-colors",
                      mode === m
                        ? "bg-surface text-ink shadow-sm"
                        : "text-muted hover:text-ink"
                    )}
                  >
                    {m === "concentration"
                      ? t("calc.modeConcentration")
                      : m === "units"
                      ? t("calc.modeUnits")
                      : t("calc.modeWeight")}
                  </button>
                ))}
              </div>

              {mode === "concentration" ? (
                <form
                  onSubmit={concentrationForm.handleSubmit(onSubmitConcentration)}
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
                      error={concentrationForm.formState.errors.vialQuantity?.message}
                      {...concentrationForm.register("vialQuantity")}
                    />
                    <Select
                      label={t("calc.unit")}
                      {...concentrationForm.register("vialUnit")}
                    >
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
                      error={
                        concentrationForm.formState.errors.desiredConcentration
                          ?.message
                      }
                      {...concentrationForm.register("desiredConcentration")}
                    />
                    <Select
                      label={t("calc.unit")}
                      {...concentrationForm.register("concentrationUnit")}
                    >
                      <option value="mg/mL">mg/mL</option>
                      <option value="mcg/mL">mcg/mL</option>
                    </Select>
                  </div>
                  <Select
                    label={`${t("calc.syringeType")} ${t("common.optional")}`}
                    hint={t("calc.syringeTypeHint")}
                    {...concentrationForm.register("syringeType")}
                  >
                    <option value="">{t("calc.noSyringe")}</option>
                    {SYRINGE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type} ({SYRINGE_UNITS_PER_ML[type]} u/mL)
                      </option>
                    ))}
                  </Select>

                  {calcError && (
                    <p role="alert" className="text-sm text-terracotta">
                      {calcError}
                    </p>
                  )}

                  <Button type="submit" className="w-full">
                    {t("calc.calculate")}
                  </Button>
                </form>
              ) : mode === "units" ? (
                <form
                  onSubmit={unitsForm.handleSubmit(onSubmitUnits)}
                  className="space-y-4"
                  noValidate
                >
                  <p className="text-sm text-muted leading-relaxed">
                    {t("calc.unitsIntro")}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label={t("calc.vialQuantity")}
                      type="number"
                      step="any"
                      inputMode="decimal"
                      placeholder="10"
                      error={unitsForm.formState.errors.vialQuantity?.message}
                      {...unitsForm.register("vialQuantity")}
                    />
                    <Select
                      label={t("calc.unit")}
                      {...unitsForm.register("vialUnit")}
                    >
                      <option value="mg">mg</option>
                      <option value="mcg">mcg</option>
                    </Select>
                  </div>

                  <Select
                    label={t("calc.syringeType")}
                    hint={t("calc.syringeTypeHint")}
                    error={unitsForm.formState.errors.syringeType?.message}
                    {...unitsForm.register("syringeType")}
                  >
                    {SYRINGE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type} ({SYRINGE_UNITS_PER_ML[type]} u/mL)
                      </option>
                    ))}
                  </Select>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                    <Input
                      label={t("calc.iWantDose")}
                      type="number"
                      step="any"
                      inputMode="decimal"
                      placeholder="200"
                      error={unitsForm.formState.errors.doseAmount?.message}
                      {...unitsForm.register("doseAmount")}
                    />
                    <Select
                      className="w-24"
                      aria-label={t("calc.unit")}
                      {...unitsForm.register("doseUnit")}
                    >
                      <option value="mcg">mcg</option>
                      <option value="mg">mg</option>
                    </Select>
                    <Input
                      label={t("calc.toEqualUnits")}
                      type="number"
                      step="any"
                      inputMode="decimal"
                      placeholder="2"
                      suffix="u"
                      error={unitsForm.formState.errors.targetUnits?.message}
                      {...unitsForm.register("targetUnits")}
                    />
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
              ) : (
                <form
                  onSubmit={weightForm.handleSubmit(onSubmitWeight)}
                  className="space-y-4"
                  noValidate
                >
                  <p className="text-sm text-muted leading-relaxed">
                    {t("calc.weightIntro")}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label={t("calc.vialQuantity")}
                      type="number"
                      step="any"
                      inputMode="decimal"
                      placeholder="10"
                      error={weightForm.formState.errors.vialQuantity?.message}
                      {...weightForm.register("vialQuantity")}
                    />
                    <Select
                      label={t("calc.unit")}
                      {...weightForm.register("vialUnit")}
                    >
                      <option value="mg">mg</option>
                      <option value="mcg">mcg</option>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label={t("calc.weightBefore")}
                      type="number"
                      step="any"
                      inputMode="decimal"
                      placeholder="12.35"
                      error={weightForm.formState.errors.weightBefore?.message}
                      {...weightForm.register("weightBefore")}
                    />
                    <Input
                      label={t("calc.weightAfter")}
                      type="number"
                      step="any"
                      inputMode="decimal"
                      placeholder="14.35"
                      error={weightForm.formState.errors.weightAfter?.message}
                      {...weightForm.register("weightAfter")}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label={t("calc.weightUnit")}
                      {...weightForm.register("weightUnit")}
                    >
                      <option value="g">g</option>
                      <option value="mg">mg</option>
                    </Select>
                    <Select
                      label={`${t("calc.syringeType")} ${t("common.optional")}`}
                      {...weightForm.register("syringeType")}
                    >
                      <option value="">{t("calc.noSyringe")}</option>
                      {SYRINGE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type} ({SYRINGE_UNITS_PER_ML[type]} u/mL)
                        </option>
                      ))}
                    </Select>
                  </div>

                  <p className="text-xs text-muted leading-relaxed">
                    {t("calc.weightNote")}
                  </p>

                  {calcError && (
                    <p role="alert" className="text-sm text-terracotta">
                      {calcError}
                    </p>
                  )}

                  <Button type="submit" className="w-full">
                    {t("calc.calculate")}
                  </Button>
                </form>
              )}

              {outcome && (
                <div className="mt-5 rounded-2xl bg-tan-faint border border-tan-soft p-5">
                  {outcome.mode === "concentration" ? (
                    <div className="flex items-center gap-3 text-sm text-muted">
                      <span>
                        {formatAmount(outcome.inputs.vialQuantity)}{" "}
                        {outcome.inputs.vialUnit}
                      </span>
                      <span>÷</span>
                      <span>
                        {formatAmount(outcome.inputs.desiredConcentration)}{" "}
                        {outcome.inputs.concentrationUnit}
                      </span>
                      <Equal className="size-4" />
                    </div>
                  ) : outcome.mode === "units" ? (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Syringe className="size-4" />
                      <span>
                        {t("calc.targetRecap", {
                          dose: `${formatAmount(outcome.inputs.doseAmount)} ${outcome.inputs.doseUnit}`,
                          units: formatAmount(outcome.inputs.targetUnits),
                          syringe: outcome.inputs.syringeType,
                        })}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Scale className="size-4" />
                      <span>
                        {t("calc.weightRecap", {
                          after: `${formatAmount(outcome.inputs.weightAfter)} ${outcome.inputs.weightUnit}`,
                          before: `${formatAmount(outcome.inputs.weightBefore)} ${outcome.inputs.weightUnit}`,
                          added: `${formatAmount(
                            roundVolume(outcome.result.addedGrams)
                          )} g`,
                        })}
                      </span>
                    </div>
                  )}

                  {outcome.mode === "weight" ? (
                    <>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                        {formatAmount(
                          roundVolume(outcome.result.concentrationMgPerMl)
                        )}{" "}
                        mg/mL
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {t("calc.realConcentration")}
                      </p>
                      <div className="mt-4 grid gap-2 sm:grid-cols-3 text-sm">
                        <Stat
                          label={t("calc.waterAdded")}
                          value={`${formatAmount(
                            roundVolume(outcome.result.volumeMl)
                          )} mL`}
                        />
                        <Stat
                          label={t("calc.perMcgMl")}
                          value={`${formatAmount(
                            roundVolume(outcome.result.concentrationMgPerMl * 1000)
                          )} mcg/mL`}
                        />
                        {outcome.inputs.syringeType && (
                          <Stat
                            label={t("calc.perUnit")}
                            value={`${formatAmount(
                              roundVolume(
                                (outcome.result.concentrationMgPerMl * 1000) /
                                  SYRINGE_UNITS_PER_ML[outcome.inputs.syringeType]
                              )
                            )} mcg`}
                          />
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                        {formatAmount(roundVolume(outcome.result.volumeMl))} mL
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {t("calc.resultSuffix")}
                      </p>
                    </>
                  )}

                  {outcome.mode === "units" && (
                    <>
                      <div className="mt-4 grid gap-2 sm:grid-cols-3 text-sm">
                        <Stat
                          label={t("calc.concentration")}
                          value={`${formatAmount(
                            roundVolume(outcome.result.concentrationMgPerMl)
                          )} mg/mL`}
                        />
                        <Stat
                          label={t("calc.perUnit")}
                          value={`${formatAmount(
                            roundVolume(outcome.result.mcgPerUnit)
                          )} mcg`}
                        />
                        <Stat
                          label={t("calc.dosesPerVial")}
                          value={String(outcome.result.dosesPerVial)}
                        />
                      </div>
                      {outcome.result.exceedsBarrel ? (
                        <p className="mt-3 flex items-start gap-2 text-xs text-terracotta">
                          <AlertTriangle className="size-4 shrink-0" />
                          {t("calc.exceedsBarrel")}
                        </p>
                      ) : (
                        outcome.result.suggestedBarrelMl && (
                          <p className="mt-3 text-xs text-muted">
                            {t("calc.suggestedBarrel", {
                              ml: formatAmount(outcome.result.suggestedBarrelMl),
                              units: formatAmount(
                                roundUnits(
                                  outcome.result.suggestedBarrelMl *
                                    SYRINGE_UNITS_PER_ML[outcome.inputs.syringeType]
                                )
                              ),
                            })}
                          </p>
                        )
                      )}
                    </>
                  )}

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
                              roundVolume(outcome.result.volumeForDoseMg(doseMg))
                            )}{" "}
                            mL
                          </span>
                          {tableSyringe && (
                            <span className="block text-xs text-muted">
                              {formatAmount(
                                roundUnits(
                                  outcome.result.volumeForDoseMg(doseMg) *
                                    SYRINGE_UNITS_PER_ML[tableSyringe]
                                )
                              )}{" "}
                              u ({tableSyringe})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-muted leading-relaxed">
                    {t("calc.saveHint")}
                  </p>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface border border-line px-3 py-2">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-medium text-ink">{value}</p>
    </div>
  );
}
