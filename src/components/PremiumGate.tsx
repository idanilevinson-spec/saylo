"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { isUserPremium } from "@/lib/subscriptions/subscriptionService";

interface PremiumGateProps {
  children: ReactNode;
  featureName: string;
}

// Gates Speaking, Writing Coach, and AI Teacher — the features with a real
// per-use AI cost — behind an active trial or paid subscription.
export default function PremiumGate({ children, featureName }: PremiumGateProps) {
  const { profile } = useAuth();
  const [status, setStatus] = useState<"checking" | "blocked" | "ok">("checking");

  useEffect(() => {
    if (!profile) return;
    isUserPremium(profile.id).then((premium) => setStatus(premium ? "ok" : "blocked"));
  }, [profile]);

  if (status === "checking") {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  if (status === "blocked") {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-4xl mb-4">⭐</p>
        <h1 className="text-2xl font-bold">{featureName} זמין למנויי פרימיום</h1>
        <p className="mt-2 text-muted">תקופת הניסיון שלכם הסתיימה. שדרגו כדי להמשיך וליהנות מכל התכונות.</p>
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
