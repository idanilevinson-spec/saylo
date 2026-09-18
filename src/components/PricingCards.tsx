"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";
import { useAuth } from "@/context/AuthProvider";
import { PRICING_PLANS, monthlyEquivalent } from "@/lib/subscriptions/plans";
import { configureNativeIap, getNativePlanPackages, purchaseNativePlan, type NativePlanPackage } from "@/lib/subscriptions/nativeIap";

// App Store Review Guideline 3.1.1: a subscription that unlocks in-app
// content has to be purchased through Apple's own StoreKit when running as
// the native app — Israel isn't covered by any of the external-purchase-
// link exceptions Apple has granted elsewhere. So the native build never
// uses the Stripe/PayPlus checkout below at all, only RevenueCat — see
// nativeIap.ts for why, and the webhook that actually owns the write.
const isNative = Capacitor.isNativePlatform();

export default function PricingCards() {
  const router = useRouter();
  const { session, profile } = useAuth();
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nativePackages, setNativePackages] = useState<NativePlanPackage[]>([]);

  useEffect(() => {
    if (!isNative || !profile) return;
    (async () => {
      await configureNativeIap(profile.id);
      setNativePackages(await getNativePlanPackages());
    })();
  }, [profile]);

  async function handleCheckout(planCode: string) {
    setLoadingCode(planCode);
    setError(null);

    if (isNative) {
      const match = nativePackages.find((p) => p.planCode === planCode);
      if (!match) {
        setError("המסלול הזה עדיין לא זמין דרך האפליקציה. נסו שוב בעוד רגע.");
        setLoadingCode(null);
        return;
      }
      const ok = await purchaseNativePlan(match.pkg);
      if (ok) router.push("/dashboard?upgraded=1");
      else setLoadingCode(null);
      return;
    }

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
        {PRICING_PLANS.map((plan, i) => {
          // On the native app the price shown must be exactly what Apple
          // charges, so it comes from StoreKit rather than plans.ts.
          const native = isNative ? nativePackages.find((p) => p.planCode === plan.code) : undefined;
          return (
          <motion.div
            key={plan.code}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -3 }}
            className={`relative overflow-hidden rounded-lg p-6 border flex flex-col transition-shadow hover:shadow-lg hover:shadow-primary/5 ${
              plan.badge
                ? "pt-14 border-primary bg-card shadow-xl shadow-primary/10 lg:-translate-y-2"
                : "border-card-border bg-card"
            }`}
          >
            {plan.badge && (
              <>
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
                <span className="absolute top-4 right-6 px-2.5 py-1 rounded-md bg-primary text-primary-ink text-xs font-bold">
                  {plan.badge}
                </span>
              </>
            )}
            <h2 className="font-bold text-lg">{plan.label}</h2>
            <div className="mt-4">
              <EnglishText as="span" className="text-3xl font-bold">
                {native
                  ? new Intl.NumberFormat("en", {
                      style: "currency",
                      currency: native.currencyCode,
                      maximumFractionDigits: 0,
                    }).format(native.price / plan.months)
                  : `₪${monthlyEquivalent(plan)}`}
              </EnglishText>
              <span className="text-muted text-sm"> / חודש</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              <EnglishText as="span">{native ? native.priceString : `₪${plan.totalPrice}`}</EnglishText> בתשלום אחד ל־{plan.months}{" "}
              {plan.months === 1 ? "חודש" : "חודשים"}
            </p>

            {session ? (
              <motion.button
                whileHover={loadingCode === null ? { scale: 1.02 } : undefined}
                whileTap={loadingCode === null ? { scale: 0.97 } : undefined}
                onClick={() => handleCheckout(plan.code)}
                disabled={loadingCode !== null}
                className="mt-6 px-4 py-2.5 rounded-lg font-bold transition-colors bg-primary text-primary-ink hover:bg-primary-hover disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                {loadingCode === plan.code ? "פותח תשלום..." : "התחילו עכשיו"}
              </motion.button>
            ) : (
              <MotionLink
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                href="/signup"
                className="mt-6 block text-center px-4 py-2.5 rounded-lg font-bold transition-colors bg-primary text-primary-ink hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                התחילו עכשיו
              </MotionLink>
            )}
          </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto mt-14 bg-background-2 border border-card-border rounded-lg p-6"
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
