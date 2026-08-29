"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Pencil, Bell, TriangleAlert } from "lucide-react";
import {
  getNeedlePreferences,
  saveNeedlePreferences,
  type NeedlePreferences,
} from "@/lib/notifications/preferences";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

const NEEDLE_TYPES = ["29G", "30G", "31G", "32G", "34G"];

export function NeedleInventoryPanel() {
  const { t } = useI18n();
  const [prefs, setPrefs] = useState<NeedlePreferences | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Load device-local prefs after mount (localStorage is client-only).
  useEffect(() => {
    setPrefs(getNeedlePreferences());
  }, []);

  const update = (next: NeedlePreferences) => {
    setPrefs(next);
    saveNeedlePreferences(next);
  };

  const adjust = (delta: number) => {
    if (!prefs) return;
    update({ ...prefs, count: Math.max(0, prefs.count + delta) });
  };

  if (!prefs) {
    return (
      <Card className="flex-1">
        <CardHeader title={t("needle.title")} />
        <CardBody />
      </Card>
    );
  }

  const low = prefs.count <= prefs.threshold;
  const empty = prefs.count === 0;

  return (
    <Card className="flex flex-1 flex-col">
      <CardHeader
        title={t("needle.title")}
        action={
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            <Pencil className="size-3" /> {t("common.edit")}
          </button>
        }
      />
      <CardBody className="flex flex-1 flex-col justify-center">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-4xl font-semibold tabular-nums tracking-tight text-ink transition-colors",
                  low &&
                    "text-terracotta text-5xl font-extrabold animate-pulse drop-shadow-sm"
                )}
              >
                {prefs.count}
              </span>
              <span
                className={cn(
                  "text-sm text-muted",
                  low && "font-semibold text-terracotta"
                )}
              >
                {t("needle.unit")}
              </span>
            </div>
            <p className="mt-1 truncate text-sm text-muted">
              {prefs.needleType
                ? t("needle.typeLabel", { type: prefs.needleType })
                : t("needle.noType")}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label={t("needle.decrement")}
              onClick={() => adjust(-1)}
              disabled={empty}
              className="flex size-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-tan-soft hover:bg-tan-faint disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <button
              type="button"
              aria-label={t("needle.increment")}
              onClick={() => adjust(1)}
              className="flex size-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-tan-soft hover:bg-tan-faint"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        {prefs.note && (
          <p className="mt-3 rounded-lg bg-tan-faint border border-tan-soft px-3 py-2 text-sm text-ink-soft">
            {prefs.note}
          </p>
        )}

        {low && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta">
            <TriangleAlert className="size-4 shrink-0" />
            {empty
              ? t("needle.outOfStock")
              : t("needle.lowStock", { count: prefs.count })}
          </p>
        )}

        {prefs.reminderEnabled && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted">
            <Bell className="size-3 shrink-0" />
            {t("needle.reminderOn", { threshold: prefs.threshold })}
          </p>
        )}
      </CardBody>

      <NeedleEditDialog
        open={editOpen}
        prefs={prefs}
        onClose={() => setEditOpen(false)}
        onSave={(next) => {
          // Re-enabling / adjusting the reminder should be able to fire again.
          update({ ...next, lastPromptedDate: null });
          setEditOpen(false);
        }}
      />
    </Card>
  );
}

function NeedleEditDialog({
  open,
  prefs,
  onClose,
  onSave,
}: {
  open: boolean;
  prefs: NeedlePreferences;
  onClose: () => void;
  onSave: (next: NeedlePreferences) => void;
}) {
  const { t } = useI18n();
  // A saved non-preset, non-empty type is edited through the "Other…" option.
  const toSelectValue = (type: string) =>
    type === "" || NEEDLE_TYPES.includes(type) ? type : "__custom__";

  const [count, setCount] = useState(String(prefs.count));
  const [needleType, setNeedleType] = useState(toSelectValue(prefs.needleType));
  const [customType, setCustomType] = useState(
    toSelectValue(prefs.needleType) === "__custom__" ? prefs.needleType : ""
  );
  const [note, setNote] = useState(prefs.note);
  const [reminderEnabled, setReminderEnabled] = useState(prefs.reminderEnabled);
  const [threshold, setThreshold] = useState(String(prefs.threshold));

  // Reset the form to the latest prefs each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setCount(String(prefs.count));
    setNeedleType(toSelectValue(prefs.needleType));
    setCustomType(
      toSelectValue(prefs.needleType) === "__custom__" ? prefs.needleType : ""
    );
    setNote(prefs.note);
    setReminderEnabled(prefs.reminderEnabled);
    setThreshold(String(prefs.threshold));
  }, [open, prefs]);

  const submit = () => {
    const parsedCount = Math.max(0, Math.floor(Number(count) || 0));
    const parsedThreshold = Math.min(
      100,
      Math.max(1, Math.floor(Number(threshold) || 1))
    );
    const resolvedType = needleType === "__custom__" ? customType.trim() : needleType;
    onSave({
      ...prefs,
      count: parsedCount,
      needleType: resolvedType,
      note: note.trim(),
      reminderEnabled,
      threshold: parsedThreshold,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("needle.editTitle")}>
      <div className="space-y-4">
        <Input
          label={t("needle.countLabel")}
          type="number"
          min={0}
          inputMode="numeric"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />

        <Select
          label={t("needle.typeSelect")}
          value={needleType}
          onChange={(e) => setNeedleType(e.target.value)}
        >
          <option value="">{t("needle.noneOption")}</option>
          {NEEDLE_TYPES.map((tp) => (
            <option key={tp} value={tp}>
              {tp}
            </option>
          ))}
          <option value="__custom__">{t("needle.customOption")}</option>
        </Select>

        {needleType === "__custom__" && (
          <Input
            label={t("needle.customLabel")}
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            placeholder={t("needle.customPlaceholder")}
          />
        )}

        <Textarea
          label={t("needle.noteLabel")}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("needle.notePlaceholder")}
        />

        <label className="flex items-start gap-3 rounded-xl border border-line bg-surface px-3.5 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={(e) => setReminderEnabled(e.target.checked)}
            className="mt-0.5 size-4 accent-ink"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-ink">
              {t("needle.reminderLabel")}
            </span>
            <span className="block text-xs text-muted">
              {t("needle.reminderHint")}
            </span>
          </span>
        </label>

        {reminderEnabled && (
          <Input
            label={t("needle.thresholdLabel")}
            type="number"
            min={1}
            max={100}
            inputMode="numeric"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
        )}

        <div className="flex justify-end gap-3 pt-1">
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit}>{t("common.save")}</Button>
        </div>
      </div>
    </Dialog>
  );
}
