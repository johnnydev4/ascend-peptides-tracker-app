/**
 * Demo mode lets the whole app run in the browser with no Supabase backend:
 * a seeded dataset in localStorage and a mock auth session. It turns on
 * automatically whenever real Supabase credentials are absent, and turns off
 * the moment you add them to .env.local.
 */
export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return true;
  if (url.includes("YOUR-PROJECT-REF") || key.includes("YOUR-ANON")) return true;
  return false;
}

/** Fixed identity used by both the client mock and server components. */
export const DEMO_USER = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "demo@peptidetracker.local",
  displayName: "Alex",
};

export const DEMO_CREDENTIALS = {
  email: DEMO_USER.email,
  password: "demo1234",
};
