import type { SupabaseClient } from "@supabase/supabase-js";
import type { SyringeInventory } from "@/lib/types";

/** Fields the user can edit; the rest are managed by the DB. */
export interface SyringeInventoryInput {
  count: number;
  syringe_type: string;
  note: string;
  low_stock_threshold: number;
  reminder_enabled: boolean;
}

/** The signed-in user's syringe inventory, or null if none saved yet. */
export async function getSyringeInventory(
  supabase: SupabaseClient
): Promise<SyringeInventory | null> {
  const { data, error } = await supabase
    .from("syringe_inventory")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return (data as SyringeInventory | null) ?? null;
}

/**
 * Removes one syringe from stock when a dose is recorded. No-ops if there's no
 * inventory row yet or the count is already zero (never goes negative).
 */
export async function decrementSyringeStock(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const inv = await getSyringeInventory(supabase);
  if (!inv || inv.count <= 0) return;
  const { error } = await supabase
    .from("syringe_inventory")
    .update({ count: inv.count - 1 })
    .eq("user_id", userId);
  if (error) throw error;
}

/** Create or update the user's single inventory row. */
export async function upsertSyringeInventory(
  supabase: SupabaseClient,
  userId: string,
  input: SyringeInventoryInput
): Promise<SyringeInventory> {
  const { data, error } = await supabase
    .from("syringe_inventory")
    .upsert(
      {
        user_id: userId,
        count: input.count,
        syringe_type: input.syringe_type,
        note: input.note,
        low_stock_threshold: input.low_stock_threshold,
        reminder_enabled: input.reminder_enabled,
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();
  if (error) throw error;
  return data as SyringeInventory;
}
