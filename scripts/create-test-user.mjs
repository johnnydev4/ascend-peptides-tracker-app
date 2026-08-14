/**
 * Creates a confirmed test user (and optional demo data) in your Supabase
 * project — no email-confirmation step needed.
 *
 * Requires the service-role key, which is a SECRET: it bypasses row-level
 * security. Only ever use it in a local script like this. Never commit it,
 * never put it in a NEXT_PUBLIC_* variable, never ship it to the browser.
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_URL="https://YOUR-REF.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
 *   node scripts/create-test-user.mjs
 *
 * Optional overrides:
 *   $env:TEST_EMAIL="you@example.com"
 *   $env:TEST_PASSWORD="your-password"
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.TEST_EMAIL || "test@peptidetracker.local";
const password = process.env.TEST_PASSWORD || "peptides123";
const displayName = process.env.TEST_NAME || "Alex";

if (!url || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1. Create the user, already email-confirmed.
const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { display_name: displayName },
});

if (error) {
  if (error.message?.toLowerCase().includes("already")) {
    console.log(`User ${email} already exists — you can sign in with it.`);
    process.exit(0);
  }
  console.error("Failed to create user:", error.message);
  process.exit(1);
}

console.log("✓ Test account created and confirmed.");
console.log("  Email:   ", email);
console.log("  Password:", password);
console.log("\nSign in at http://localhost:3000/login");
console.log(
  "\nTip: to fill this account with demo data, run supabase/seed.sql in the\n" +
    "Supabase SQL editor (it targets the first user in the project)."
);
