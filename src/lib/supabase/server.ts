import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isDemoMode, DEMO_USER } from "@/lib/demo/config";

/**
 * In demo mode the server never talks to Supabase. Server components only need
 * the current user and the profile display name, so a tiny stand-in suffices;
 * all real data reads/writes happen client-side against the mock client.
 */
function createServerMock(): SupabaseClient {
  const user = {
    id: DEMO_USER.id,
    email: DEMO_USER.email,
    user_metadata: { display_name: DEMO_USER.displayName },
  };
  const mock = {
    auth: {
      async getUser() {
        return { data: { user }, error: null };
      },
    },
    from() {
      const result = {
        data: { display_name: DEMO_USER.displayName },
        error: null,
      };
      const builder = {
        select: () => builder,
        eq: () => builder,
        async maybeSingle() {
          return result;
        },
        async single() {
          return result;
        },
      };
      return builder;
    },
  };
  return mock as unknown as SupabaseClient;
}

export async function createClient(): Promise<SupabaseClient> {
  if (isDemoMode()) {
    return createServerMock();
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore when middleware
            // is refreshing sessions.
          }
        },
      },
    }
  );
}
