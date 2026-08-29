"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Pencil, Bell, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getSyringeInventory,
  upsertSyringeInventory,
  type SyringeInventoryInput,
} from "@/lib/data/syringes";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

const SYRINGE_TYPES = ["U-100", "U-40", "U-500", "29G", "30G", "31G", "32G"];

const EMPTY: SyringeInventoryInput = {
  count: 0,
  syringe_type: "",
  note: "",
  low_stock_threshold: 5,
  reminder_enabled: false,
};

export function SyringeInventoryPanel({ userId }: { userId: string }) {
  const { t } = useI18n();
  const [inv, setInv] = useState<SyringeInventoryInput | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Load the user's inventory from Supabase (syncs across devices).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const row = await getSyringeInventory(createClient());
        if (cancelled) return;
        setInv(
          row
            ? {
                count: row.count,
                syringe_type: row.syringe_type,
                note: row.note,
                low_stock_threshold: row.low_stock_threshold,
                reminder_enabled: row.reminder_enabled,
              }
            : EMPTY
        );
      } catch {
        if (!cancelled) setInv(EMPTY);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Optimistically update the UI, then persist to the DB.
  const persist = async (next: SyringeInventoryInput) => {
    setInv(next);
    try {
      await upsertSyringeInventory(createClient(), userId, next);
    } catch {
      // best-effort; the local view already reflects the change
    }
  };

  const adjust = (delta: number) => {
    if (!inv) return;
    void persist({ ...inv, count: Math.max(0, inv.count + delta) });
  };

  if (!inv) {
    return (
      <Card className="flex flex-col">
        <CardHeader title={t("syringe.title")} />
        <CardBody />
      </Card>
    );
  }

  const low = inv.count <= inv.low_stock_threshold;
  const empty = inv.count === 0;

  return (
    <Card className="flex flex-col">
      <CardHeader
        title={t("syringe.title")}
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
                {inv.count}
              </span>
              <span
                className={cn(
                  "text-sm text-muted",
                  low && "font-semibold text-terracotta"
                )}
              >
                {t("syringe.unit")}
              </span>
            </div>
            <p className="mt-1 truncate text-sm text-muted">
              {inv.syringe_type
                ? t("syringe.typeLabel", { type: inv.syringe_type })
                : t("syringe.noType")}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label={t("syringe.decrement")}
              onClick={() => adjust(-1)}
              disabled={empty}
              className="flex size-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-tan-soft hover:bg-tan-faint disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <button
              type="button"
              aria-label={t("syringe.increment")}
              onClick={() => adjust(1)}
              className="flex size-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-tan-soft hover:bg-tan-faint"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        {inv.note && (
          <p className="mt-3 rounded-lg bg-tan-faint border border-tan-soft px-3 py-2 text-sm text-ink-soft">
            {inv.note}
          </p>
        )}

        {low && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta">
            <TriangleAlert className="size-4 shrink-0" />
            {empty
              ? t("syringe.outOfStock")
              : t("syringe.lowStock", { count: inv.count })}
          </p>
        )}

        {inv.reminder_enabled && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted">
            <Bell className="size-3 shrink-0" />
            {t("syringe.reminderOn", { threshold: inv.low_stock_threshold })}
          </p>
        )}
      </CardBody>

      <SyringeEditDialog
        open={editOpen}
        inv={inv}
        onClose={() => setEditOpen(false)}
        onSave={(next) => {
          void persist(next);
          setEditOpen(false);
        }}
      />
    </Card>
  );
}

function SyringeEditDialog({
  open,
  inv,
  onClose,
  onSave,
}: {
  open: boolean;
  inv: SyringeInventoryInput;
  onClose: () => void;
  onSave: (next: SyringeInventoryInput) => void;
}) {
  const { t } = useI18n();

  // A saved non-preset, non-empty type is edited through the "Other…" option.
  const toSelectValue = (type: string) =>
    type === "" || SYRINGE_TYPES.includes(type) ? type : "__custom__";

  const [count, setCount] = useState(String(inv.count));
  const [syringeType, setSyringeType] = useState(toSelectValue(inv.syringe_type));
  const [customType, setCustomType] = useState(
    toSelectValue(inv.syringe_type) === "__custom__" ? inv.syringe_type : ""
  );
  const [note, setNote] = useState(inv.note);
  const [reminderEnabled, setReminderEnabled] = useState(inv.reminder_enabled);
  const [threshold, setThreshold] = useState(String(inv.low_stock_threshold));

  // Reset the form to the latest values each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setCount(String(inv.count));
    setSyringeType(toSelectValue(inv.syringe_type));
    setCustomType(
      toSelectValue(inv.syringe_type) === "__custom__" ? inv.syringe_type : ""
    );
    setNote(inv.note);
    setReminderEnabled(inv.reminder_enabled);
    setThreshold(String(inv.low_stock_threshold));
  }, [open, inv]);

  const submit = () => {
    const parsedCount = Math.max(0, Math.floor(Number(count) || 0));
    const parsedThreshold = Math.min(
      100,
      Math.max(1, Math.floor(Number(threshold) || 1))
    );
    const resolvedType =
      syringeType === "__custom__" ? customType.trim() : syringeType;
    onSave({
      count: parsedCount,
      syringe_type: resolvedType,
      note: note.trim(),
      reminder_enabled: reminderEnabled,
      low_stock_threshold: parsedThreshold,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("syringe.editTitle")}>
      <div className="space-y-4">
        <Input
          label={t("syringe.countLabel")}
          type="number"
          min={0}
          inputMode="numeric"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />

        <Select
          label={t("syringe.typeSelect")}
          value={syringeType}
          onChange={(e) => setSyringeType(e.target.value)}
        >
          <option value="">{t("syringe.noneOption")}</option>
          {SYRINGE_TYPES.map((tp) => (
            <option key={tp} value={tp}>
              {tp}
            </option>
          ))}
          <option value="__custom__">{t("syringe.customOption")}</option>
        </Select>

        {syringeType === "__custom__" && (
          <Input
            label={t("syringe.customLabel")}
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            placeholder={t("syringe.customPlaceholder")}
          />
        )}

        <Textarea
          label={t("syringe.noteLabel")}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("syringe.notePlaceholder")}
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
              {t("syringe.reminderLabel")}
            </span>
            <span className="block text-xs text-muted">
              {t("syringe.reminderHint")}
            </span>
          </span>
        </label>

        {reminderEnabled && (
          <Input
            label={t("syringe.thresholdLabel")}
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
