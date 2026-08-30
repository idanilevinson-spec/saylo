"use client";

import { useState } from "react";
import Link from "next/link";
import { isPremiumActive } from "@/lib/subscriptions/entitlements";
import type { Subscription } from "@/types/database";

interface SubscriptionBannerProps {
  subscription: Subscription | null;
}

export default function SubscriptionBanner({ subscription }: SubscriptionBannerProps) {
  // Lazy initializer runs once rather than on every render, which is what
  // makes reading the current time here safe under React's purity rules —
  // a plain call in the render body would not be.
  const [daysLeft] = useState(() => {
    if (subscription?.status !== "trialing" || !subscription.trial_ends_at) return null;
    return Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / 86_400_000));
  });

  // No row at all (accounts created before trials existed) is treated the
  // same as a lapsed trial — not premium, upgrade prompt shown.
  if (!subscription) {
    return (
      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap px-4 py-3 rounded-xl bg-danger-ink border border-danger/20">
        <p className="text-sm font-medium">דיבור, כתיבה והמלצות AI זמינים רק לפרימיום</p>
        <Link href="/pricing" className="text-sm font-bold text-primary">
          שדרגו עכשיו ←
        </Link>
      </div>
    );
  }

  if (subscription.status === "trialing" && daysLeft !== null) {
    return (
      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap px-4 py-3 rounded-xl bg-accent/10 border border-accent/20">
        <p className="text-sm font-medium">
          🎁 נשארו לכם <strong>{daysLeft}</strong> ימים בניסיון החינמי — כל התכונות פתוחות
        </p>
        <Link href="/pricing" className="text-sm font-bold text-primary">
          שדרגו עכשיו ←
        </Link>
      </div>
    );
  }

  if (!isPremiumActive(subscription)) {
    return (
      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap px-4 py-3 rounded-xl bg-danger-ink border border-danger/20">
        <p className="text-sm font-medium">תקופת הניסיון הסתיימה — דיבור, כתיבה והמלצות AI זמינים רק לפרימיום</p>
        <Link href="/pricing" className="text-sm font-bold text-primary">
          שדרגו עכשיו ←
        </Link>
      </div>
    );
  }

  return null;
}
