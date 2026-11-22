import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { isRealPerson, notifyAdmins } from "@/lib/notifications/adminPush";

// Called once by the browser right after it creates a new learner's profile
// (SignupForm for email signups, /profile/setup for Google/Apple and
// confirmed-email signups). The profile insert happens client-side, so this
// is the server's only moment to hear about it. It tells the admins' phones
// "new signup". Guarded so it can't be used to spam them: the caller must be
// signed in, the profile must be theirs and freshly created, and each
// profile is announced at most once (recorded in admin_audit_log).

const FRESH_MS = 15 * 60 * 1000;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, created_at")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || Date.now() - new Date(profile.created_at).getTime() > FRESH_MS) {
    return NextResponse.json({ ok: true });
  }

  after(async () => {
    if (!(await isRealPerson(user.id))) return;
    const { data: admins } = await supabaseAdmin.from("profiles").select("id").eq("is_admin", true).limit(1);
    const adminId = admins?.[0]?.id;
    if (!adminId) return;

    const { count } = await supabaseAdmin
      .from("admin_audit_log")
      .select("id", { count: "exact", head: true })
      .eq("action", "push_new_signup")
      .eq("target_id", user.id);
    if (count) return;
    await supabaseAdmin.from("admin_audit_log").insert({
      admin_profile_id: adminId,
      action: "push_new_signup",
      target_type: "profile",
      target_id: user.id,
    });

    const method = user.app_metadata?.provider === "google" ? "Google" : user.app_metadata?.provider === "apple" ? "Apple" : "מייל";
    await notifyAdmins({ title: "נרשם חדש בסיילו", body: `הרשמה חדשה דרך ${method}.`, url: "/admin/users" });
  });

  return NextResponse.json({ ok: true });
}
