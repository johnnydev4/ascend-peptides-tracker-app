import type { SupabaseClient } from "@supabase/supabase-js";
import type { Treatment, TreatmentReconstitution } from "@/lib/types";
import type { ReconstituteInput } from "@/lib/validation/treatment";

/** Reconstitution history for a treatment, newest first. */
export async function listReconstitutions(
  supabase: SupabaseClient,
  treatmentId: string
) {
  const { data, error } = await supabase
    .from("treatment_reconstitutions")
    .select("*")
    .eq("treatment_id", treatmentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TreatmentReconstitution[];
}

/**
 * Records a fresh vial for an existing treatment: stores a history snapshot and
 * updates the treatment's current vial fields to the new values. If the
 * treatment was 'expired' (vial past its date), it goes back to 'active'. The
 * dose schedule is intentionally left untouched — only the vial changed.
 */
export async function reconstituteTreatment(
  supabase: SupabaseClient,
  userId: string,
  treatmentId: string,
  input: ReconstituteInput
) {
  const vialQuantity = input.vialQuantity ?? null;
  const vialUnit = input.vialUnit;
  const bacWaterMl = input.bacWaterMl ?? null;
  const syringeType = input.syringeType || null;
  const reconstitutedAt = input.reconstitutedAt || null;
  const vialExpiresAt = input.vialExpiresAt || null;

  const { error: histError } = await supabase
    .from("treatment_reconstitutions")
    .insert({
      treatment_id: treatmentId,
      user_id: userId,
      vial_quantity: vialQuantity,
      vial_unit: vialUnit,
      bac_water_ml: bacWaterMl,
      syringe_type: syringeType,
      reconstituted_at: reconstitutedAt,
      vial_expires_at: vialExpiresAt,
      note: input.note || null,
    });
  if (histError) throw histError;

  // Only un-expire; don't disturb paused/completed/archived states.
  const { data: current, error: readError } = await supabase
    .from("treatments")
    .select("status")
    .eq("id", treatmentId)
    .single();
  if (readError) throw readError;

  const update: Record<string, unknown> = {
    vial_quantity: vialQuantity,
    vial_unit: vialUnit,
    bac_water_ml: bacWaterMl,
    syringe_type: syringeType,
    reconstituted_at: reconstitutedAt,
    vial_expires_at: vialExpiresAt,
  };
  if ((current as { status: string }).status === "expired") {
    update.status = "active";
  }

  const { data: treatment, error } = await supabase
    .from("treatments")
    .update(update)
    .eq("id", treatmentId)
    .select()
    .single();
  if (error) throw error;
  return treatment as Treatment;
}
