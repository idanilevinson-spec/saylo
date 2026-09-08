"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Crown } from "lucide-react";
import IconBadge from "@/components/IconBadge";
import { useAuth } from "@/context/AuthProvider";
import { isUserPremium, isUserPaidSubscriber } from "@/lib/subscriptions/subscriptionService";

interface PremiumGateProps {
  children: ReactNode;
  featureName: string;
  /** When true, an active free trial does NOT qualify — only a genuinely
   *  paid, active subscription does. Used for the AI Teacher chat/voice
   *  conversation, whose per-message cost is high enough that it's
   *  deliberately excluded from the trial (unlike Writing Coach and the
   *  other AI-cost features this gate otherwise covers). */
  requirePaid?: boolean;
}

// Gates Writing Coach and AI Teacher suggestions — the features with a real
// per-use AI cost — behind an active trial or paid subscription. Pass
// requirePaid for the stricter, trial-excluded variant.
export default function PremiumGate({ children, featureName, requirePaid = false }: PremiumGateProps) {
  const { profile } = useAuth();
  const [status, setStatus] = useState<"checking" | "blocked" | "ok">("checking");

  useEffect(() => {
    if (!profile) return;
    const check = requirePaid ? isUserPaidSubscriber(profile.id) : isUserPremium(profile.id);
    check.then((allowed) => setStatus(allowed ? "ok" : "blocked"));
  }, [profile, requirePaid]);

  if (status === "checking") {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  if (status === "blocked") {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <IconBadge icon={Crown} tone="accent" />
        <h1 className="text-2xl font-bold">
          {featureName} {requirePaid ? "זמין למנויים בתשלום בלבד" : "זמין למנויי פרימיום"}
        </h1>
        <p className="mt-2 text-muted">
          {requirePaid
            ? "התכונה הזו אינה כלולה בתקופת הניסיון החינמי — זמינה רק למנויים עם מנוי פעיל בתשלום."
            : "תקופת הניסיון שלכם הסתיימה. שדרגו כדי להמשיך וליהנות מכל התכונות."}
        </p>
        <Link
          href="/pricing"
          className="mt-6 inline-block px-6 py-3 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
        >
          לצפייה במסלולים
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
