"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";

// In the iOS app, tapping a notification opens the screen it points to
// (every push carries a "url", e.g. /admin/support?request=…). Only paths on
// this site are followed; anything else is ignored. In a browser, the
// service worker already handles taps, so this does nothing there.
export function pushTargetPath(url: unknown): string | null {
  if (typeof url !== "string" || !url.startsWith("/") || url.startsWith("//")) return null;
  return url;
}

export default function PushTapHandler() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let remove: (() => void) | undefined;
    let cancelled = false;
    import("@capacitor/push-notifications").then(({ PushNotifications }) =>
      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        const path = pushTargetPath((action.notification.data as { url?: unknown } | undefined)?.url);
        if (path) router.push(path);
      }).then((handle) => {
        if (cancelled) handle.remove();
        else remove = () => handle.remove();
      })
    );
    return () => {
      cancelled = true;
      remove?.();
    };
  }, [router]);

  return null;
}
