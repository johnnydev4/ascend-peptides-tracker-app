"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { BodyMeasurement } from "@/lib/types";
import { formatFullDate, formatAmount } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

export function MeasurementCard({
  measurement,
  onEdit,
  onDelete,
  onViewPhoto,
}: {
  measurement: BodyMeasurement;
  onEdit: (m: BodyMeasurement) => void;
  onDelete: (id: string) => void;
  onViewPhoto?: (src: string) => void;
}) {
  const { t } = useI18n();
  const m = measurement;
  const wu = m.weight_unit;
  const lu = m.length_unit;

  const chips: { label: string; value: string }[] = [];
  if (m.weight != null)
    chips.push({ label: t("metric.weight"), value: `${formatAmount(m.weight)} ${wu}` });
  if (m.body_fat != null)
    chips.push({ label: t("metric.body_fat"), value: `${formatAmount(m.body_fat)}%` });
  if (m.muscle_mass != null)
    chips.push({
      label: t("metric.muscle_mass"),
      value: `${formatAmount(m.muscle_mass)} ${wu}`,
    });
  (
    [
      ["neck", m.neck],
      ["chest", m.chest],
      ["waist", m.waist],
      ["hips", m.hips],
      ["arms", m.arms],
      ["arm_left", m.arm_left],
      ["arm_right", m.arm_right],
      ["thighs", m.thighs],
      ["thigh_left", m.thigh_left],
      ["thigh_right", m.thigh_right],
    ] as const
  ).forEach(([key, value]) => {
    if (value != null)
      chips.push({ label: t(`metric.${key}`), value: `${formatAmount(value)} ${lu}` });
  });

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-ink">
          {formatFullDate(m.measured_at)}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(m)}
            aria-label={t("common.edit")}
            className="rounded-lg p-1.5 text-muted hover:bg-cream-deep hover:text-ink transition-colors"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(m.id)}
            aria-label={t("common.delete")}
            className="rounded-lg p-1.5 text-muted hover:bg-terracotta-soft hover:text-terracotta transition-colors"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {chips.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span
              key={c.label}
              className="inline-flex items-baseline gap-1 rounded-lg bg-tan-faint px-2.5 py-1 text-xs"
            >
              <span className="text-muted">{c.label}</span>
              <span className="font-medium text-ink">{c.value}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted">{t("trans.noValues")}</p>
      )}

      {m.notes && (
        <p className="mt-3 text-sm text-ink-soft whitespace-pre-line">{m.notes}</p>
      )}

      {m.photos.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {m.photos.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onViewPhoto?.(src)}
              className="size-20 overflow-hidden rounded-xl border border-line"
              aria-label={t("trans.photoAlt", { n: i + 1 })}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={t("trans.photoAlt", { n: i + 1 })}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
