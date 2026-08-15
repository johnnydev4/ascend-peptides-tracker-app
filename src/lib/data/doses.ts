import type { SupabaseClient } from "@supabase/supabase-js";
import type { Dose, DoseWithRelations, DoseStatus } from "@/lib/types";

const DOSE_SELECT =
  "*, treatment:treatments(id, name, dose_amount, dose_unit), injection_site:injection_sites(id, name, body_region)";

export interface DoseFilters {
  treatmentId?: string;
  status?: DoseStatus;
  injectionSiteId?: string;
  from?: string; // ISO
  to?: string; // ISO
  limit?: number;
  /** Order by scheduled_at ascending (soonest first). Defaults to descending. */
  ascending?: boolean;
}

export async function listDoses(
  supabase: SupabaseClient,
  filters: DoseFilters = {}
) {
  let query = supabase
    .from("doses")
    .select(DOSE_SELECT)
    .order("scheduled_at", { ascending: filters.ascending ?? false });

  if (filters.treatmentId) query = query.eq("treatment_id", filters.treatmentId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.injectionSiteId)
    query = query.eq("injection_site_id", filters.injectionSiteId);
  if (filters.from) query = query.gte("scheduled_at", filters.from);
  if (filters.to) query = query.lte("scheduled_at", filters.to);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as DoseWithRelations[];
}

export async function getNextScheduledDose(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("doses")
    .select(DOSE_SELECT)
    .eq("status", "scheduled")
    .gte("scheduled_at", new Date(Date.now() - 12 * 3600_000).toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as DoseWithRelations | null;
}

export async function listDosesBetween(
  supabase: SupabaseClient,
  from: Date,
  to: Date
) {
  const { data, error } = await supabase
    .from("doses")
    .select(DOSE_SELECT)
    .gte("scheduled_at", from.toISOString())
    .lte("scheduled_at", to.toISOString())
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DoseWithRelations[];
}

export interface CompleteDoseParams {
  administeredAt: string; // ISO
  doseAmount: number;
  doseUnit: string;
  injectionSiteId?: string | null;
  notes?: string | null;
}

/** Marks a dose completed and records injection-site usage. */
export async function completeDose(
  supabase: SupabaseClient,
  userId: string,
  doseId: string,
  params: CompleteDoseParams
) {
  const { error } = await supabase
    .from("doses")
    .update({
      status: "completed",
      administered_at: params.administeredAt,
      dose_amount: params.doseAmount,
      dose_unit: params.doseUnit,
      injection_site_id: params.injectionSiteId || null,
      notes: params.notes || null,
    })
    .eq("id", doseId);
  if (error) throw error;

  if (params.injectionSiteId) {
    const { error: usageError } = await supabase
      .from("injection_site_usage")
      .insert({
        user_id: userId,
        dose_id: doseId,
        injection_site_id: params.injectionSiteId,
        used_at: params.administeredAt,
      });
    if (usageError) throw usageError;
  }
}

export async function setDoseStatus(
  supabase: SupabaseClient,
  doseId: string,
  status: DoseStatus
) {
  const patch: Partial<Dose> = { status };
  if (status !== "completed") {
    patch.administered_at = null;
  }
  const { error } = await supabase.from("doses").update(patch).eq("id", doseId);
  if (error) throw error;
}

export async function updateDoseNotes(
  supabase: SupabaseClient,
  doseId: string,
  notes: string
) {
  const { error } = await supabase
    .from("doses")
    .update({ notes: notes || null })
    .eq("id", doseId);
  if (error) throw error;
}

export async function rescheduleDose(
  supabase: SupabaseClient,
  doseId: string,
  scheduledAt: string
) {
  const { error } = await supabase
    .from("doses")
    .update({ scheduled_at: scheduledAt })
    .eq("id", doseId);
  if (error) throw error;
}

/** Marks past-due scheduled doses (>12h late) as missed. */
export async function sweepMissedDoses(supabase: SupabaseClient) {
  const cutoff = new Date(Date.now() - 12 * 3600_000).toISOString();
  const { error } = await supabase
    .from("doses")
    .update({ status: "missed" })
    .eq("status", "scheduled")
    .lt("scheduled_at", cutoff);
  if (error) throw error;
}
