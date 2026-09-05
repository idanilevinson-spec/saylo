"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";
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
      {error && <p role="alert" className="max-w-md mx-auto mb-6 text-center text-sm text-danger">{error}</p>}

      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {PRICING_PLANS.map((plan, i) => (
          <motion.div
            key={plan.code}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -3 }}
            className={`relative rounded-2xl p-6 border flex flex-col transition-shadow hover:shadow-lg hover:shadow-primary/5 ${
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
            <h2 className="font-bold text-lg">{plan.label}</h2>
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
              <motion.button
                whileHover={loadingCode === null ? { scale: 1.02 } : undefined}
                whileTap={loadingCode === null ? { scale: 0.97 } : undefined}
                onClick={() => handleCheckout(plan.code)}
                disabled={loadingCode !== null}
                className="mt-6 px-4 py-2.5 rounded-xl font-medium transition-colors bg-primary text-primary-ink hover:bg-primary-hover disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                {loadingCode === plan.code ? "פותח תשלום..." : "התחילו עכשיו"}
              </motion.button>
            ) : (
              <MotionLink
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                href="/signup"
                className="mt-6 block text-center px-4 py-2.5 rounded-xl font-medium transition-colors bg-primary text-primary-ink hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                התחילו עכשיו
              </MotionLink>
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
        <h2 className="font-bold mb-3">מה כלול בכל המסלולים בתשלום?</h2>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted">
          {[
            "מבחן רמה ומסלול לימוד אישי",
            "מורה AI אישי ללא הגבלה",
            "תרגול דיבור עם AI",
            "תרגילים ללא הגבלה",
            "חזרה חכמה יומית",
            "כל 6 רמות ה־CEFR",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check size={16} className="shrink-0 text-success" />
              {item}
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
