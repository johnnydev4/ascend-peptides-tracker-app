"use client";

import { useState } from "react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import {
  rescheduleDose,
  setDoseStatus,
  updateDoseNotes,
} from "@/lib/data/doses";
import type { DoseWithRelations } from "@/lib/types";
import { toDate } from "@/lib/utils";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";

/** Edit a single scheduled event: time, notes, or status. */
export function EditDoseDialog({
  dose,
  open,
  onClose,
  onSaved,
}: {
  dose: DoseWithRelations;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [scheduledAt, setScheduledAt] = useState(
    format(toDate(dose.scheduled_at), "yyyy-MM-dd'T'HH:mm")
  );
  const [notes, setNotes] = useState(dose.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (statusChange?: "skipped" | "scheduled") => {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const nextIso = new Date(scheduledAt).toISOString();
      if (nextIso !== dose.scheduled_at) {
        await rescheduleDose(supabase, dose.id, nextIso);
      }
      if ((notes || "") !== (dose.notes ?? "")) {
        await updateDoseNotes(supabase, dose.id, notes);
      }
      if (statusChange) {
        await setDoseStatus(supabase, dose.id, statusChange);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Edit dose — ${dose.treatment?.name ?? "Treatment"}`}
      className="sm:max-w-md"
    >
      <div className="space-y-4">
        <Input
          label="Scheduled for"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes for this dose…"
        />

        {error && (
          <p role="alert" className="text-sm text-terracotta">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3 justify-between pt-1">
          {dose.status === "scheduled" && (
            <Button
              variant="ghost"
              onClick={() => save("skipped")}
              disabled={busy}
            >
              Skip this dose
            </Button>
          )}
          {dose.status === "skipped" && (
            <Button
              variant="ghost"
              onClick={() => save("scheduled")}
              disabled={busy}
            >
              Restore to scheduled
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button variant="secondary" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={() => save()} loading={busy}>
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
