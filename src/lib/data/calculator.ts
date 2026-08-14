import type { SupabaseClient } from "@supabase/supabase-js";
import type { CalculatorHistoryEntry } from "@/lib/types";

export async function listCalculatorHistory(
  supabase: SupabaseClient,
  limit = 10
) {
  const { data, error } = await supabase
    .from("calculator_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as CalculatorHistoryEntry[];
}

export async function saveCalculation(
  supabase: SupabaseClient,
  userId: string,
  entry: Omit<CalculatorHistoryEntry, "id" | "user_id" | "created_at">
) {
  const { error } = await supabase.from("calculator_history").insert({
    user_id: userId,
    ...entry,
  });
  if (error) throw error;
}
