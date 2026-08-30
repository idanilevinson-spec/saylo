import "server-only";
import webpush from "web-push";
import type { PushSubscriptionRow } from "@/types/database";

let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails("mailto:support@saylo.app", publicKey, privateKey);
  configured = true;
  return true;
}

export async function sendPushNotification(
  subscription: PushSubscriptionRow,
  payload: { title: string; body: string; url?: string }
): Promise<{ ok: boolean; expired?: boolean }> {
  if (!ensureConfigured()) return { ok: false };

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
    return { ok: true };
  } catch (err) {
    // 404/410 means the browser unsubscribed or the endpoint expired —
    // the caller should delete this row so future jobs don't retry it.
    const statusCode = (err as { statusCode?: number }).statusCode;
    return { ok: false, expired: statusCode === 404 || statusCode === 410 };
  }
}
