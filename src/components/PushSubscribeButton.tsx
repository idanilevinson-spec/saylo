"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "@/lib/supabase/browserClient";
import { useAuth } from "@/context/AuthProvider";

type Status = "unsupported" | "loading" | "off" | "on" | "denied";

// The native iOS app can't use Web Push at all (iOS's WKWebView doesn't
// implement the Push API there), so this button does something entirely
// different when running inside Capacitor: talk to Apple Push Notification
// service via @capacitor/push-notifications and store the device token in
// device_push_tokens, instead of subscribing through the browser's
// PushManager into push_subscriptions. Same button, same on/off language —
// the split only matters inside enable()/disable()/checkStatus().
const isNative = Capacitor.isNativePlatform();

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function PushSubscribeButton() {
  const { profile } = useAuth();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    async function checkStatus() {
      if (isNative) {
        const { receive } = await PushNotifications.checkPermissions();
        if (receive === "denied") {
          setStatus("denied");
          return;
        }
        // No per-token "is this device currently subscribed" check exists
        // on the native side the way pushManager.getSubscription() gives
        // one for web — granted-but-not-yet-registered and granted-and-
        // registered look the same to checkPermissions(), so "granted"
        // reads as already on. A stale row (app deleted and reinstalled)
        // self-corrects: sendApnsPush() clears it on the first 410.
        setStatus(receive === "granted" ? "on" : "off");
        return;
      }

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      setStatus(existing ? "on" : "off");
    }
    checkStatus();
  }, []);

  async function enableNative() {
    if (!profile) return;

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== "granted") {
      setStatus("denied");
      return;
    }

    // register() only asks APNs for a token — the actual token arrives
    // asynchronously via the "registration" listener, so the insert has to
    // happen from inside that callback, not right after calling register().
    const registered = await new Promise<boolean>((resolve) => {
      PushNotifications.addListener("registration", async (token) => {
        const { error } = await supabase
          .from("device_push_tokens")
          .upsert({ profile_id: profile.id, token: token.value, platform: "ios" }, { onConflict: "token" });
        // A save failure here (e.g. the table not existing yet) must not
        // report success — this exact silent-failure shape is what made a
        // real missing-migration bug look like a working subscription.
        resolve(!error);
      });
      PushNotifications.addListener("registrationError", () => resolve(false));
      PushNotifications.register();
    });

    setStatus(registered ? "on" : "denied");
  }

  async function enable() {
    if (isNative) return enableNative();
    if (!profile) return;
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setStatus("unsupported");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus("denied");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });

    const json = subscription.toJSON();
    await supabase.from("push_subscriptions").insert({
      profile_id: profile.id,
      endpoint: json.endpoint!,
      p256dh: json.keys!.p256dh,
      auth: json.keys!.auth,
    });

    setStatus("on");
  }

  async function disable() {
    if (isNative) {
      // Apple has no client-side "unsubscribe" the way Web Push does —
      // system-level notification permission can only be revoked from iOS
      // Settings. Deleting our own stored token is what actually stops
      // this device from receiving reminders, which is the part in this
      // app's control.
      if (profile) await supabase.from("device_push_tokens").delete().eq("profile_id", profile.id);
      setStatus("off");
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
      await subscription.unsubscribe();
    }
    setStatus("off");
  }

  if (status === "unsupported" || status === "loading") return null;

  if (status === "denied") {
    return (
      <p className="text-sm text-muted">
        {isNative
          ? "התראות חסומות — ניתן לאפשר בהגדרות המכשיר עבור Saylo."
          : "התראות חסומות בדפדפן — ניתן לאפשר בהגדרות האתר."}
      </p>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={status === "on" ? disable : enable}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-card-border font-medium hover:bg-background-2 transition-colors"
    >
      {status === "on" ? (
        <>
          <Bell size={18} /> התראות פעילות — לביטול
        </>
      ) : (
        <>
          <BellOff size={18} /> הפעלת התראות דחיפה
        </>
      )}
    </motion.button>
  );
}
