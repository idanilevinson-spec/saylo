import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { sendPushNotification } from "@/lib/notifications/webpush";
import { sendApnsPush } from "@/lib/notifications/apns";

// Manual on-demand test for push delivery — the real send path
// (cron/reminders) only fires once a day and only for users with an active,
// at-risk streak, which makes it awkward to verify a fresh device
// registration actually works end to end. Any admin can hit this route
// directly in a browser (GET, no body needed) to push a test notification
// to their own registered devices right now.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const payload = { title: "בדיקת התראות Saylo", body: "אם אתם רואים את זה — ההתראות עובדות!", url: "/dashboard" };

  const [{ data: webSubs }, { data: deviceTokens }] = await Promise.all([
    supabase.from("push_subscriptions").select("*").eq("profile_id", user.id),
    supabase.from("device_push_tokens").select("*").eq("profile_id", user.id),
  ]);

  const webResults = await Promise.all((webSubs ?? []).map((sub) => sendPushNotification(sub, payload)));
  const nativeResults = await Promise.all(
    (deviceTokens ?? []).map((device) => sendApnsPush(device.token, payload))
  );

  return NextResponse.json({
    webSubscriptions: webSubs?.length ?? 0,
    webSent: webResults.filter((r) => r.ok).length,
    deviceTokens: deviceTokens?.length ?? 0,
    nativeSent: nativeResults.filter((r) => r.ok).length,
    nativeResults,
  });
}
