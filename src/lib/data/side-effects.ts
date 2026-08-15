import type { SupabaseClient } from "@supabase/supabase-js";
import type { SideEffectWithTreatment } from "@/lib/types";
import type { SideEffectInput } from "@/lib/validation/side-effect";

const SELECT = "*, treatment:treatments(id, name)";

export async function listSideEffects(
  supabase: SupabaseClient,
  options: { limit?: number } = {}
) {
  let query = supabase
    .from("side_effects")
    .select(SELECT)
    .order("started_at", { ascending: false });
  if (options.limit) query = query.limit(options.limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as SideEffectWithTreatment[];
}

export async function createSideEffect(
  supabase: SupabaseClient,
  userId: string,
  input: SideEffectInput
) {
  const { error } = await supabase.from("side_effects").insert({
    user_id: userId,
    treatment_id: input.treatmentId || null,
    dose_id: input.doseId || null,
    name: input.name,
    severity: input.severity,
    started_at: new Date(input.startedAt).toISOString(),
    ended_at: input.endedAt ? new Date(input.endedAt).toISOString() : null,
    notes: input.notes || null,
  });
  if (error) throw error;
}

export async function updateSideEffect(
  supabase: SupabaseClient,
  id: string,
  input: SideEffectInput
) {
  const { error } = await supabase
    .from("side_effects")
    .update({
      treatment_id: input.treatmentId || null,
      dose_id: input.doseId || null,
      name: input.name,
      severity: input.severity,
      started_at: new Date(input.startedAt).toISOString(),
      ended_at: input.endedAt ? new Date(input.endedAt).toISOString() : null,
      notes: input.notes || null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSideEffect(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("side_effects").delete().eq("id", id);
  if (error) throw error;
}
