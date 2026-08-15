import type { SupabaseClient } from "@supabase/supabase-js";
import { generateSchedule, computeEndDate } from "@/lib/calendar/generate";
import type { Treatment } from "@/lib/types";
import type { TreatmentInput } from "@/lib/validation/treatment";

export async function listTreatments(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("treatments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Treatment[];
}

export async function getTreatment(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("treatments")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Treatment;
}

/**
 * Creates a treatment and generates its full dose schedule.
 */
export async function createTreatment(
  supabase: SupabaseClient,
  userId: string,
  input: TreatmentInput
) {
  const endDate = computeEndDate(input.startDate, input.durationWeeks);

  const { data: treatment, error } = await supabase
    .from("treatments")
    .insert({
      user_id: userId,
      name: input.name,
      vial_quantity: input.vialQuantity ?? null,
      vial_unit: input.vialUnit,
      start_date: input.startDate,
      end_date: endDate,
      duration_weeks: input.durationWeeks,
      frequency: input.frequency,
      interval_days: input.frequency === "every_n_days" ? input.intervalDays : null,
      scheduled_days: input.frequency === "weekly_days" ? input.scheduledDays : null,
      scheduled_time: input.scheduledTime,
      dose_amount: input.doseAmount,
      dose_unit: input.doseUnit,
      notes: input.notes || null,
      status: "active",
    })
    .select()
    .single();
  if (error) throw error;

  await insertScheduledDoses(supabase, userId, treatment as Treatment, input);
  return treatment as Treatment;
}

/**
 * Updates a treatment and rebuilds its schedule so the calendar always matches
 * the current parameters. Doses the user actually recorded (completed) are kept;
 * every other dose (scheduled/missed/skipped, which are auto-generated and
 * never administered) is deleted and regenerated. This ensures that correcting,
 * e.g., an accidental start date removes the now-orphaned doses instead of
 * leaving stale "missed" entries behind on the calendar.
 */
export async function updateTreatment(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  input: TreatmentInput
) {
  const endDate = computeEndDate(input.startDate, input.durationWeeks);

  const { data: treatment, error } = await supabase
    .from("treatments")
    .update({
      name: input.name,
      vial_quantity: input.vialQuantity ?? null,
      vial_unit: input.vialUnit,
      start_date: input.startDate,
      end_date: endDate,
      duration_weeks: input.durationWeeks,
      frequency: input.frequency,
      interval_days: input.frequency === "every_n_days" ? input.intervalDays : null,
      scheduled_days: input.frequency === "weekly_days" ? input.scheduledDays : null,
      scheduled_time: input.scheduledTime,
      dose_amount: input.doseAmount,
      dose_unit: input.doseUnit,
      notes: input.notes || null,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  // Keep completed (recorded) doses; drop everything else and regenerate.
  const { data: completedRows, error: compError } = await supabase
    .from("doses")
    .select("scheduled_at")
    .eq("treatment_id", id)
    .eq("status", "completed");
  if (compError) throw compError;

  const { error: delError } = await supabase
    .from("doses")
    .delete()
    .eq("treatment_id", id)
    .neq("status", "completed");
  if (delError) throw delError;

  // Don't recreate a scheduled dose on a day that already has a recorded one.
  const takenDays = new Set(
    (completedRows ?? []).map((r) => dayKey(new Date(r.scheduled_at as string)))
  );

  await insertScheduledDoses(supabase, userId, treatment as Treatment, input, {
    skipDays: takenDays,
  });

  return treatment as Treatment;
}

export async function setTreatmentStatus(
  supabase: SupabaseClient,
  id: string,
  status: Treatment["status"]
) {
  const { error } = await supabase
    .from("treatments")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTreatment(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("treatments").delete().eq("id", id);
  if (error) throw error;
}

/** Local calendar-day key (yyyy-M-d) used to dedupe doses by day. */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

async function insertScheduledDoses(
  supabase: SupabaseClient,
  userId: string,
  treatment: Treatment,
  input: TreatmentInput,
  options?: { onlyAfter?: Date; skipDays?: Set<string> }
) {
  const schedule = generateSchedule({
    startDate: input.startDate,
    durationWeeks: input.durationWeeks,
    frequency: input.frequency,
    intervalDays: input.intervalDays,
    scheduledDays: input.scheduledDays,
    scheduledTime: input.scheduledTime,
  });

  const rows = schedule
    .filter((d) => !options?.onlyAfter || d.scheduledAt > options.onlyAfter)
    .filter((d) => !options?.skipDays?.has(dayKey(d.scheduledAt)))
    .map((d) => ({
      treatment_id: treatment.id,
      user_id: userId,
      scheduled_at: d.scheduledAt.toISOString(),
      dose_amount: input.doseAmount,
      dose_unit: input.doseUnit,
      status: "scheduled" as const,
    }));

  if (rows.length === 0) return;

  // Insert in chunks to stay well under request limits.
  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await supabase.from("doses").insert(rows.slice(i, i + 200));
    if (error) throw error;
  }
}
