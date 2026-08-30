"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { isUserPremium } from "@/lib/subscriptions/subscriptionService";
import { getCurrentHearts } from "@/lib/subscriptions/heartsService";

// Wraps any practice UI (exercise player, daily review) and blocks entry
// once a non-premium user is out of hearts — premium/trialing users always
// pass straight through.
export default function HeartsGate({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [status, setStatus] = useState<"checking" | "blocked" | "ok">("checking");

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const premium = await isUserPremium(profile.id);
      if (premium) {
        setStatus("ok");
        return;
      }
      const hearts = await getCurrentHearts(profile.id);
      setStatus(hearts.current > 0 ? "ok" : "blocked");
    })();
  }, [profile]);

  if (status === "checking") {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  if (status === "blocked") {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-4xl mb-4">💔</p>
        <h1 className="text-2xl font-bold">נגמרו לכם הלבבות להיום</h1>
        <p className="mt-2 text-muted">הלבבות מתחדשים עם הזמן, או שדרגו לפרימיום לתרגול ללא הגבלה.</p>
        <Link
          href="/pricing"
          className="mt-6 inline-block px-6 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
        >
          לצפייה במסלולים
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
