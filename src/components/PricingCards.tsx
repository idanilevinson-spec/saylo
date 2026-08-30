"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import EnglishText from "@/components/EnglishText";
import { useAuth } from "@/context/AuthProvider";
import { PRICING_PLANS, monthlyEquivalent } from "@/lib/subscriptions/plans";

export default function PricingCards() {
  const { session } = useAuth();
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planCode: string) {
    setLoadingCode(planCode);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      });
      if (!res.ok) throw new Error("checkout failed");
      const data = await res.json();
      if (data.url) window.location.assign(data.url);
    } catch {
      setError("אירעה שגיאה בפתיחת התשלום. נסו שוב.");
      setLoadingCode(null);
    }
  }

  return (
    <section className="px-4 py-12">
      {error && <p className="max-w-md mx-auto mb-6 text-center text-sm text-danger">{error}</p>}

      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {PRICING_PLANS.map((plan, i) => (
          <motion.div
            key={plan.code}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className={`relative rounded-2xl p-6 border flex flex-col ${
              plan.badge
                ? "border-primary bg-card shadow-xl shadow-primary/10 lg:-translate-y-2"
                : "border-card-border bg-card"
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-primary text-primary-ink text-xs font-bold">
                {plan.badge}
              </span>
            )}
            <h3 className="font-bold text-lg">{plan.label}</h3>
            <div className="mt-4">
              <EnglishText as="span" className="text-3xl font-bold">
                ₪{monthlyEquivalent(plan)}
              </EnglishText>
              <span className="text-muted text-sm"> / חודש</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              <EnglishText as="span">₪{plan.totalPrice}</EnglishText> בתשלום אחד ל־{plan.months}{" "}
              {plan.months === 1 ? "חודש" : "חודשים"}
            </p>

            {session ? (
              <button
                onClick={() => handleCheckout(plan.code)}
                disabled={loadingCode !== null}
                className="mt-6 px-4 py-2.5 rounded-xl font-medium transition-colors bg-primary text-primary-ink hover:bg-primary-hover disabled:opacity-50"
              >
                {loadingCode === plan.code ? "פותח תשלום..." : "התחילו עכשיו"}
              </button>
            ) : (
              <Link
                href="/signup"
                className="mt-6 block text-center px-4 py-2.5 rounded-xl font-medium transition-colors bg-primary text-primary-ink hover:bg-primary-hover"
              >
                התחילו עכשיו
              </Link>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto mt-14 bg-background-2 border border-card-border rounded-2xl p-6"
      >
        <h3 className="font-bold mb-3">מה כלול בכל המסלולים בתשלום?</h3>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted">
          <li>✓ מבחן רמה ומסלול לימוד אישי</li>
          <li>✓ מורה AI אישי ללא הגבלה</li>
          <li>✓ תרגול דיבור עם AI</li>
          <li>✓ תרגילים ללא הגבלה</li>
          <li>✓ חזרה חכמה יומית</li>
          <li>✓ כל 6 רמות ה־CEFR</li>
        </ul>
      </motion.div>
    </section>
  );
}
