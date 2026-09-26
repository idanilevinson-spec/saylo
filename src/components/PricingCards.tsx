"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";
import { useAuth } from "@/context/AuthProvider";
import { PRICING_PLANS, monthlyEquivalent } from "@/lib/subscriptions/plans";
import {
  BUSINESS_ADDRESS,
  BUSINESS_NAME,
  BUSINESS_REGISTRATION,
  DAILY_CONVERSATION_LIMIT,
  DAILY_WRITING_LIMIT,
} from "@/lib/legal/siteInfo";
import {
  configureNativeIap,
  getNativePlanPackages,
  purchaseNativePlan,
  restoreNativePurchases,
  type NativePlanPackage,
} from "@/lib/subscriptions/nativeIap";

// App Store Review Guideline 3.1.1: a subscription that unlocks in-app
// content has to be purchased through Apple's own StoreKit when running as
// the native app — Israel isn't covered by any of the external-purchase-
// link exceptions Apple has granted elsewhere. So the native build never
// uses the Stripe/PayPlus checkout below at all, only RevenueCat — see
// nativeIap.ts for why, and the webhook that actually owns the write.
const isNative = Capacitor.isNativePlatform();

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function PricingCards() {
  const router = useRouter();
  const { session, profile } = useAuth();
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nativePackages, setNativePackages] = useState<NativePlanPackage[]>([]);
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  async function handleRestore() {
    setRestoring(true);
    setRestoreMessage(null);
    const found = await restoreNativePurchases();
    setRestoreMessage(found ? "המנוי שוחזר בהצלחה." : "לא נמצא מנוי פעיל לשחזור בחשבון ה-Apple הזה.");
    setRestoring(false);
    if (found) router.push("/dashboard");
  }

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

      {/* App Store Review Guideline 5.1.1: every plan below unlocks
          account-specific functionality (an adaptive learning path, an AI
          teacher that remembers the learner's own recurring mistakes,
          per-skill progress, XP/streaks), which is why starting one means
          creating an account first — spelled out here, not just asserted to
          a reviewer after the fact. */}
      {!session && (
        <p className="max-w-2xl mx-auto mb-8 text-center text-sm text-muted leading-relaxed">
          כל המסלולים למטה מותאמים אישית: מסלול לימוד שמתעדכן לפי הביצועים שלכם, ומורה AI שזוכר את הטעויות החוזרות
          שלכם. לכן ההרשמה היא הצעד הראשון — היא גם מה שמאפשר לגשת למנוי מכל אחד מהמכשירים שלכם.
        </p>
      )}

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
            transition={{ duration: 0.4, delay: i * 0.06, ease: EASE_OUT }}
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
                {native ? native.priceString : `₪${plan.totalPrice}`}
              </EnglishText>
              <span className="text-muted text-sm">
                {" "}
                / {plan.months === 1 ? "חודש" : plan.months === 12 ? "שנה" : `${plan.months} חודשים`}
              </span>
            </div>
            {plan.months > 1 && (
              <p className="mt-1 text-xs text-muted">
                שווה ערך ל־
                <EnglishText as="span">
                  {native
                    ? new Intl.NumberFormat("en", {
                        style: "currency",
                        currency: native.currencyCode,
                        maximumFractionDigits: 0,
                      }).format(native.price / plan.months)
                    : `₪${monthlyEquivalent(plan)}`}
                </EnglishText>{" "}
                לחודש
              </p>
            )}

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

      {!isNative && (
        <p className="max-w-3xl mx-auto mt-8 text-center text-sm text-muted leading-relaxed">
          המחירים בשקלים והם סופיים: העסק רשום כעוסק פטור ואינו גובה מע״מ. כל מסלול משולם מראש, בתשלום אחד, ומתחדש
          אוטומטית לאותה תקופה עד שתבטלו. אפשר לבטל את החידוש בכל עת בעמוד הפרופיל. פרטים ב
          <Link href="/terms" className="text-primary hover:underline">
            תנאי השימוש
          </Link>{" "}
          וב
          <Link href="/refunds" className="text-primary hover:underline">
            מדיניות הביטולים וההחזרים
          </Link>
          .
          <span className="block mt-2">
            המוכר: {BUSINESS_NAME}
            {BUSINESS_REGISTRATION ? `, ${BUSINESS_REGISTRATION}` : ""}
            {BUSINESS_ADDRESS ? `, ${BUSINESS_ADDRESS}` : ""}.
          </span>
        </p>
      )}

      {isNative && (
        <div className="max-w-3xl mx-auto mt-8 text-center space-y-3">
          {session && (
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="text-sm text-primary font-medium hover:underline disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              {restoring ? "משחזר..." : "שחזור רכישות"}
            </button>
          )}
          {restoreMessage && (
            <p role="status" className="text-sm text-muted">
              {restoreMessage}
            </p>
          )}
          <p className="text-xs text-muted leading-relaxed">
            המנוי מתחדש אוטומטית בתום כל תקופה, באותו מחיר ובאותו משך, אלא אם בוטל לפחות 24 שעות לפני סיומה. החיוב
            נעשה דרך חשבון ה-Apple שלכם, ואפשר לנהל או לבטל את המנוי בכל עת בהגדרות ה-Apple ID.
          </p>
          <p className="text-xs">
            <a href="/terms" className="text-primary hover:underline">
              תנאי שימוש
            </a>
            {" · "}
            <a href="/privacy" className="text-primary hover:underline">
              מדיניות פרטיות
            </a>
            {" · "}
            <a href="/refunds" className="text-primary hover:underline">
              ביטולים והחזרים
            </a>
          </p>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto mt-8 bg-background-2 border border-card-border rounded-lg p-6"
      >
        <h2 className="font-bold mb-3">מה כלול בכל המסלולים בתשלום?</h2>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted">
          {[
            "מבחן רמה ומסלול לימוד אישי",
            "שיחות עם מורה AI, בטקסט ובקול",
            "תרגול דיבור עם AI",
            "משוב AI על כתיבה",
            "תרגול בלי מגבלת לבבות",
            "חזרה חכמה יומית",
            "כל 6 רמות ה־CEFR",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check size={16} className="shrink-0 text-success" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted leading-relaxed">
          שימוש הוגן: עד {DAILY_CONVERSATION_LIMIT} שיחות חדשות עם המורה ועד {DAILY_WRITING_LIMIT} הגשות כתיבה בכל 24
          שעות. שיחה עם המורה זמינה במנוי בתשלום בלבד, ולא בניסיון החינם.
        </p>
      </motion.div>
    </section>
  );
}
