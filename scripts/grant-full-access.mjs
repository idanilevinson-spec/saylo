import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const EMAIL = "idani.levinson@gmail.com";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let user = null;
let page = 1;
while (!user) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
  if (error) throw error;
  user = data.users.find((u) => u.email?.toLowerCase() === EMAIL.toLowerCase()) ?? null;
  if (data.users.length < 200) break;
  page += 1;
}

if (!user) {
  console.error(`No auth user found with email ${EMAIL}. Sign up / log in first, then re-run this script.`);
  process.exit(1);
}

console.log(`Found user ${user.id} (${user.email})`);

const { data: profile, error: profileErr } = await supabase
  .from("profiles")
  .select("id, display_name, is_admin")
  .eq("id", user.id)
  .maybeSingle();

if (profileErr) throw profileErr;
if (!profile) {
  console.error("No profiles row for this user yet — finish onboarding (profile setup) first, then re-run.");
  process.exit(1);
}

const { error: updateErr } = await supabase
  .from("profiles")
  .update({ is_admin: true })
  .eq("id", user.id);
if (updateErr) throw updateErr;
console.log(`profiles.is_admin set to true for ${profile.display_name} (was ${profile.is_admin})`);

const { error: subErr } = await supabase
  .from("subscriptions")
  .upsert(
    {
      profile_id: user.id,
      status: "active",
      current_period_end: null,
      trial_ends_at: null,
    },
    { onConflict: "profile_id" }
  );
if (subErr) throw subErr;
console.log("subscriptions row set to status=active with no expiry (current_period_end: null).");

console.log("Done. Refresh the app (and re-login if needed) to see admin + premium access.");
