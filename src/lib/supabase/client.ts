"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isDemoMode } from "@/lib/demo/config";
import { createMockClient } from "@/lib/demo/mockClient";

export function createClient(): SupabaseClient {
  if (isDemoMode()) {
    return createMockClient() as unknown as SupabaseClient;
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
