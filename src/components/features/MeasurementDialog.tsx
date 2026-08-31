"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Camera, ImagePlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  createMeasurement,
  updateMeasurement,
} from "@/lib/data/measurements";
import {
  measurementSchema,
  type MeasurementInput,
  type MeasurementFormValues,
} from "@/lib/validation/measurement";
import { fileToCompressedDataUrl } from "@/lib/images/resize";
import type { BodyMeasurement } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { DateField } from "@/components/ui/DateTimePicker";

const MAX_PHOTOS = 10;

export function MeasurementDialog({
  measurement,
  userId,
  open,
  onClose,
  onSaved,
}: {
  measurement?: BodyMeasurement | null;
  userId: string;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useI18n();
  const [serverError, setServerError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>(measurement?.photos ?? []);
  const [processing, setProcessing] = useState(false);

  const num = (v: number | null | undefined) => (v == null ? "" : String(v));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MeasurementFormValues, unknown, MeasurementInput>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      measuredAt: measurement?.measured_at ?? format(new Date(), "yyyy-MM-dd"),
      weight: num(measurement?.weight),
      weightUnit: measurement?.weight_unit ?? "kg",
      bodyFat: num(measurement?.body_fat),
      muscleMass: num(measurement?.muscle_mass),
      lengthUnit: measurement?.length_unit ?? "cm",
      neck: num(measurement?.neck),
      chest: num(measurement?.chest),
      waist: num(measurement?.waist),
      hips: num(measurement?.hips),
      arms: num(measurement?.arms),
      armLeft: num(measurement?.arm_left),
      armRight: num(measurement?.arm_right),
      thighs: num(measurement?.thighs),
      thighLeft: num(measurement?.thigh_left),
      thighRight: num(measurement?.thigh_right),
      notes: measurement?.notes ?? "",
      camera: measurement?.camera ?? "",
      lens: measurement?.lens ?? "",
      focalLength: measurement?.focal_length ?? "",
      subjectDistance: measurement?.subject_distance ?? "",
      flash: measurement?.flash ?? "",
      flashPower: measurement?.flash_power ?? "",
      aperture: measurement?.aperture ?? "",
      shutterSpeed: measurement?.shutter_speed ?? "",
      iso: measurement?.iso ?? "",
      whiteBalance: measurement?.white_balance ?? "",
      cameraElevation: measurement?.camera_elevation ?? "",
    },
  });

  const onPickPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setProcessing(true);
    try {
      const room = MAX_PHOTOS - photos.length;
      const chosen = Array.from(files).slice(0, Math.max(0, room));
      const encoded = await Promise.all(
        chosen.map((f) => fileToCompressedDataUrl(f))
      );
      setPhotos((prev) => [...prev, ...encoded].slice(0, MAX_PHOTOS));
    } catch {
      setServerError(t("common.somethingWrong"));
    } finally {
      setProcessing(false);
    }
  };

  const onSubmit = async (values: MeasurementInput) => {
    setServerError(null);
    try {
      const supabase = createClient();
      if (measurement) {
        await updateMeasurement(supabase, userId, measurement.id, values, photos);
      } else {
        await createMeasurement(supabase, userId, values, photos);
      }
      onSaved();
      onClose();
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : t("common.somethingWrong")
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={measurement ? t("trans.editTitle") : t("trans.addTitle")}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Controller
          control={control}
          name="measuredAt"
          render={({ field }) => (
            <DateField
              label={t("trans.date")}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.measuredAt?.message}
            />
          )}
        />

        <div>
          <p className="text-[13px] font-medium text-ink-soft mb-2">
            {t("trans.composition")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t("metric.weight")}
              type="number"
              step="any"
              inputMode="decimal"
              error={errors.weight?.message}
              {...register("weight")}
            />
            <Input
              label={t("trans.muscleMass")}
              type="number"
              step="any"
              inputMode="decimal"
              error={errors.muscleMass?.message}
              {...register("muscleMass")}
            />
            <Input
              label={t("trans.bodyFatPct")}
              type="number"
              step="any"
              inputMode="decimal"
              suffix="%"
              error={errors.bodyFat?.message}
              {...register("bodyFat")}
            />
            <Select label={t("trans.weightUnit")} {...register("weightUnit")}>
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </Select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-medium text-ink-soft">
              {t("trans.circumferences")}
            </p>
            <div className="w-24">
              <Select aria-label={t("trans.lengthUnit")} {...register("lengthUnit")}>
                <option value="cm">cm</option>
                <option value="in">in</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(
              [
                ["neck", "neck", errors.neck?.message],
                ["chest", "chest", errors.chest?.message],
                ["waist", "waist", errors.waist?.message],
                ["hips", "hips", errors.hips?.message],
                ["arms", "arms", errors.arms?.message],
                ["armLeft", "arm_left", errors.armLeft?.message],
                ["armRight", "arm_right", errors.armRight?.message],
                ["thighs", "thighs", errors.thighs?.message],
                ["thighLeft", "thigh_left", errors.thighLeft?.message],
                ["thighRight", "thigh_right", errors.thighRight?.message],
              ] as const
            ).map(([name, labelKey, err]) => (
              <Input
                key={name}
                label={t(`metric.${labelKey}`)}
                type="number"
                step="any"
                inputMode="decimal"
                error={err}
                {...register(name)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[13px] font-medium text-ink-soft mb-2">
            {t("trans.photos")}
          </p>
          {photos.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photos.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-xl border border-line"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={t("trans.photoAlt", { n: i + 1 })}
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                    aria-label={t("common.delete")}
                    className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-ink/70 text-cream hover:bg-ink"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {photos.length < MAX_PHOTOS && (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-tan-faint/50 px-4 py-3 text-sm text-ink-soft hover:bg-tan-faint transition-colors">
              <ImagePlus className="size-4 text-muted" />
              {processing ? t("trans.processing") : t("trans.addPhotos")}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  void onPickPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          )}
          <p className="mt-1.5 text-xs text-muted">
            {t("trans.photosHint", { max: MAX_PHOTOS })}
          </p>

          <details className="mt-3 rounded-xl border border-line bg-tan-faint/40 px-3 py-2 group">
            <summary className="cursor-pointer list-none text-[13px] font-medium text-ink-soft marker:content-none">
              <span className="inline-flex items-center gap-1.5">
                <Camera className="size-4 text-muted" />
                {t("trans.camera")}
              </span>
            </summary>
            <p className="mt-1 text-xs text-muted">{t("trans.cameraHint")}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Input label={t("trans.cameraBody")} {...register("camera")} />
              <Input label={t("trans.lens")} {...register("lens")} />
              <Input
                label={t("trans.focalLength")}
                placeholder="50 mm"
                {...register("focalLength")}
              />
              <Input
                label={t("trans.subjectDistance")}
                placeholder="1.5 m"
                {...register("subjectDistance")}
              />
              <Select label={t("trans.flash")} {...register("flash")}>
                <option value="">—</option>
                <option value="yes">{t("common.yes")}</option>
                <option value="no">{t("common.no")}</option>
              </Select>
              <Input label={t("trans.flashPower")} {...register("flashPower")} />
              <Input
                label={t("trans.aperture")}
                placeholder="f/2.8"
                {...register("aperture")}
              />
              <Input
                label={t("trans.shutterSpeed")}
                placeholder="1/125"
                {...register("shutterSpeed")}
              />
              <Input label={t("trans.iso")} placeholder="100" {...register("iso")} />
              <Input
                label={t("trans.whiteBalance")}
                placeholder="5600 K"
                {...register("whiteBalance")}
              />
              <Input
                label={t("trans.cameraElevation")}
                {...register("cameraElevation")}
              />
            </div>
          </details>
        </div>

        <Textarea
          label={`${t("form.notes")} ${t("common.optional")}`}
          placeholder={t("trans.notesPh")}
          error={errors.notes?.message}
          {...register("notes")}
        />

        {serverError && (
          <p role="alert" className="text-sm text-terracotta">
            {serverError}
          </p>
        )}

        <div className="flex gap-3 justify-end pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={isSubmitting || processing}>
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
