"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import { useAuth } from "@/context/AuthProvider";

type Status = "unsupported" | "loading" | "off" | "on" | "denied";

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

  async function enable() {
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
    return <p className="text-sm text-muted">התראות חסומות בדפדפן — ניתן לאפשר בהגדרות האתר.</p>;
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={status === "on" ? disable : enable}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-card-border font-medium hover:bg-background-2 transition-colors"
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
