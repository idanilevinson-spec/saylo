import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { sendPushNotification } from "@/lib/notifications/webpush";
import { sendApnsPush, type ApnsResult } from "@/lib/notifications/apns";

// Sends a test notification to the signed-in admin's own devices right now,
// and says in plain Hebrew what happened, so a failure can be fixed without
// reading server logs. Used by the "בדיקת התראות לטלפון" button on the admin
// overview (inside the app the admin is already signed in) and as a plain link.

function explainApns(r: ApnsResult): string {
  if (r.ok) return "נשלחה לאייפון.";
  switch (r.reason) {
    case "not_configured":
      return "השרת לא מוגדר לשליחה לאייפון: חסרים מפתחות Apple (APNS_KEY, APNS_KEY_ID, APNS_TEAM_ID) בהגדרות האתר ב-Vercel.";
    case "bad_key":
      return "מפתח ה-Apple שבהגדרות האתר (APNS_KEY) לא תקין או הודבק לא נכון.";
    case "network":
      return "לא הצלחנו להתחבר לשרת של Apple. כדאי לנסות שוב בעוד רגע.";
    case "InvalidProviderToken":
    case "ExpiredProviderToken":
      return "Apple דחתה את המפתח: מזהה המפתח (APNS_KEY_ID) או מזהה הצוות (APNS_TEAM_ID) לא תואמים למפתח.";
    case "TopicDisallowed":
      return "המפתח של Apple לא מורשה לשלוח לאפליקציה הזו.";
    default:
      return r.expired
        ? `הרישום של הטלפון כבר לא תקף (${r.reason}) ונמחק. באפליקציה: פרופיל, לכבות ולהדליק התראות, ואז לבדוק שוב.`
        : `Apple דחתה את השליחה (${r.reason ?? "סיבה לא ידועה"}).`;
  }
}

async function run() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "unauthorized", message: "צריך להיות מחובר כמנהל באותו דפדפן או אפליקציה שבהם מריצים את הבדיקה." },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: "forbidden", message: "רק מנהל יכול להריץ את הבדיקה." }, { status: 403 });
  }

  const payload = { title: "בדיקת התראות Saylo", body: "אם אתם רואים את זה, ההתראות עובדות!", url: "/admin" };

  const [{ data: webSubs }, { data: deviceTokens }] = await Promise.all([
    supabaseAdmin.from("push_subscriptions").select("*").eq("profile_id", user.id),
    supabaseAdmin.from("device_push_tokens").select("*").eq("profile_id", user.id),
  ]);

  const lines: string[] = [];
  let sent = 0;

  for (const device of deviceTokens ?? []) {
    const r = await sendApnsPush(device.token, payload);
    if (r.ok) sent++;
    if (r.expired) await supabaseAdmin.from("device_push_tokens").delete().eq("token", device.token);
    lines.push(`אייפון (נרשם ב-${new Date(device.created_at).toLocaleDateString("he-IL")}): ${explainApns(r)}`);
  }
  for (const sub of webSubs ?? []) {
    const r = await sendPushNotification(sub, payload);
    if (r.ok) sent++;
    if (r.expired) await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
    lines.push(`דפדפן: ${r.ok ? "נשלחה." : r.expired ? "הרישום כבר לא תקף ונמחק." : "השליחה נכשלה."}`);
  }

  if (lines.length === 0) {
    lines.push("אין אף מכשיר רשום להתראות. באפליקציה: פרופיל, להדליק התראות, ואז לבדוק שוב.");
  }

  return NextResponse.json({
    message: sent > 0 ? `נשלחה התראת בדיקה ל-${sent} מכשירים.` : "ההתראה לא נשלחה.",
    lines,
    sent,
  });
}

async function handle() {
  try {
    return await run();
  } catch (err) {
    console.error("test-push failed", err);
    return NextResponse.json({ error: "server_error", message: "שגיאה בשרת בזמן הבדיקה." }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
