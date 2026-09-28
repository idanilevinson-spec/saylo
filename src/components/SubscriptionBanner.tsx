"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gift, Clock } from "lucide-react";
import { isPremiumActive } from "@/lib/subscriptions/entitlements";
import type { Subscription } from "@/types/database";

const bannerMotion = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

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
      <motion.div
        {...bannerMotion}
        className="mt-4 flex items-center justify-between gap-3 flex-wrap px-4 py-3 rounded-lg bg-danger-ink border border-danger/20"
      >
        <p className="text-sm font-medium">דיבור, כתיבה והמלצות AI זמינים רק לפרימיום</p>
        <Link href="/pricing" className="text-sm font-bold text-primary">
          שדרגו עכשיו ←
        </Link>
      </motion.div>
    );
  }

  if (subscription.status === "trialing" && daysLeft !== null) {
    // Last day of the trial gets its own, more urgent treatment (solid
    // primary fill, not the calm accent tint) instead of just showing "0
    // days left" in the same low-key style used for days 2-3.
    if (daysLeft <= 1) {
      return (
        <motion.div
          {...bannerMotion}
          className="mt-4 flex items-center justify-between gap-3 flex-wrap px-4 py-3 rounded-lg bg-primary"
        >
          <p className="flex items-center gap-1.5 text-sm font-bold text-primary-ink">
            <Clock size={16} className="shrink-0" /> היום היום האחרון בניסיון החינמי — אחר כך נסגר הדיבור, הכתיבה
            וההמלצות של ה-AI
          </p>
          <Link href="/pricing" className="text-sm font-bold text-primary-ink underline underline-offset-2">
            שדרגו עכשיו ←
          </Link>
        </motion.div>
      );
    }

    return (
      <motion.div
        {...bannerMotion}
        className="mt-4 flex items-center justify-between gap-3 flex-wrap px-4 py-3 rounded-lg bg-accent/10 border border-accent/20"
      >
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <Gift size={16} className="shrink-0" /> נשארו לכם <strong>{daysLeft}</strong> ימים בניסיון החינמי — כל התכונות
          פתוחות
        </p>
        <Link href="/pricing" className="text-sm font-bold text-primary">
          שדרגו עכשיו ←
        </Link>
      </motion.div>
    );
  }

  if (!isPremiumActive(subscription)) {
    return (
      <motion.div
        {...bannerMotion}
        className="mt-4 flex items-center justify-between gap-3 flex-wrap px-4 py-3 rounded-lg bg-danger-ink border border-danger/20"
      >
        <p className="text-sm font-medium">תקופת הניסיון הסתיימה — דיבור, כתיבה והמלצות AI זמינים רק לפרימיום</p>
        <Link href="/pricing" className="text-sm font-bold text-primary">
          שדרגו עכשיו ←
        </Link>
      </motion.div>
    );
  }

  return null;
}
