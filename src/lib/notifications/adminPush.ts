import "server-only";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { sendPushNotification } from "@/lib/notifications/webpush";
import { sendApnsPush } from "@/lib/notifications/apns";

// Real-time pushes to the site's admins (the owner's phone): a new signup,
// a new callback request, a new help-chat conversation. They go to every
// device an admin turned notifications on for (profile page → notifications),
// in the iOS app or the browser.
//
// The text carries no personal details (no name, email, phone or message):
// pushes pass through Apple's and the browsers' push services. The admin
// screen the push points to holds the details.

export type AdminPushPayload = { title: string; body: string; url: string };

// Test and admin accounts never trigger an admin push (the owner testing the
// site shouldn't ping their own phone). A visitor with no account is real.
export async function isRealPerson(profileId: string | null | undefined): Promise<boolean> {
  if (!profileId) return true;
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("is_admin, is_test_account")
    .eq("id", profileId)
    .maybeSingle();
  return !(data?.is_admin || data?.is_test_account);
}

export async function notifyAdmins(payload: AdminPushPayload): Promise<number> {
  try {
    const { data: admins } = await supabaseAdmin.from("profiles").select("id").eq("is_admin", true);
    const ids = (admins ?? []).map((a) => a.id);
    if (ids.length === 0) return 0;

    const [{ data: webSubs }, { data: devices }] = await Promise.all([
      supabaseAdmin.from("push_subscriptions").select("*").in("profile_id", ids),
      supabaseAdmin.from("device_push_tokens").select("*").in("profile_id", ids),
    ]);

    let sent = 0;
    await Promise.all([
      ...(webSubs ?? []).map(async (sub) => {
        const r = await sendPushNotification(sub, payload);
        if (r.ok) sent++;
        else if (r.expired) await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
      }),
      ...(devices ?? []).map(async (device) => {
        const r = await sendApnsPush(device.token, payload);
        if (r.ok) sent++;
        else if (r.expired) await supabaseAdmin.from("device_push_tokens").delete().eq("token", device.token);
      }),
    ]);
    return sent;
  } catch (err) {
    // A push is a nudge on top of the email and the admin screen; it must
    // never fail the request that triggered it.
    console.error("admin push failed", err);
    return 0;
  }
}
