"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import EnglishText from "@/components/EnglishText";
import { useAuth } from "@/context/AuthProvider";
import { PRICING_PLANS, TRIAL_DAYS, monthlyEquivalent, type PricingPlan } from "@/lib/subscriptions/plans";
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

const INCLUDED = [
  "מבחן רמה ותוכנית יומית לפי הרמה שלכם",
  "שיחות עם המורה, בכתב ובקול",
  "תרגול הגייה עם זיהוי דיבור",
  "משוב אישי על כתיבה",
  "תרגול בלי מגבלת לבבות",
  "חזרה חכמה על מה שטעיתם בו",
  "כל התוכן, מ-A1 עד C2, וגם הכנה לבגרות",
];

export default function PricingCards() {
  const router = useRouter();
  const { session, profile } = useAuth();
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nativePackages, setNativePackages] = useState<NativePlanPackage[]>([]);
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string>(
    (PRICING_PLANS.find((p) => p.badge) ?? PRICING_PLANS[PRICING_PLANS.length - 1]).code,
  );
  const selected = PRICING_PLANS.find((p) => p.code === selectedCode) ?? PRICING_PLANS[0];

  // On the native app every price shown must be exactly what Apple charges,
  // so it comes from StoreKit rather than plans.ts.
  const nativeFor = (plan: PricingPlan) => (isNative ? nativePackages.find((p) => p.planCode === plan.code) : undefined);
  function priceOf(plan: PricingPlan): { total: string; perMonth: string } {
    const native = nativeFor(plan);
    if (native) {
      const fmt = new Intl.NumberFormat("en", { style: "currency", currency: native.currencyCode, maximumFractionDigits: 0 });
      return { total: native.priceString, perMonth: fmt.format(native.price / plan.months) };
    }
    return { total: `₪${plan.totalPrice}`, perMonth: `₪${monthlyEquivalent(plan)}` };
  }
  // Percent saved per month against the monthly plan, from real prices.
  function savingOf(plan: PricingPlan): number | null {
    if (plan.months === 1) return null;
    const monthly = PRICING_PLANS.find((p) => p.months === 1);
    if (!monthly) return null;
    const nm = nativeFor(monthly);
    const np = nativeFor(plan);
    const base = nm ? nm.price : monthly.totalPrice;
    const per = np ? np.price / plan.months : plan.totalPrice / plan.months;
    if (isNative && (!nm || !np)) return null;
    const pct = Math.round((1 - per / base) * 100);
    return pct >= 1 ? pct : null;
  }

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
      const res = await fetch("/api/payplus/checkout", {
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
          שלכם. לכן ההרשמה היא הצעד הראשון. היא גם מה שמאפשר לגשת למנוי מכל אחד מהמכשירים שלכם.
        </p>
      )}

      {/* One decision at a time: pick a duration on one side, see exactly
          what it costs and includes on the other. Five identical cards
          with five identical buttons made the choice harder, not clearer.
          Savings are computed from the real prices (StoreKit's on the
          native app), never stated by hand. */}
      <div className="max-w-5xl mx-auto grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start pb-24 lg:pb-0">
        <div role="radiogroup" aria-label="משך המנוי" className="space-y-2">
          {PRICING_PLANS.map((plan) => {
            const p = priceOf(plan);
            const active = plan.code === selected.code;
            const saving = savingOf(plan);
            return (
              <button
                key={plan.code}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelectedCode(plan.code)}
                className={`game-press flex w-full items-center gap-4 rounded-lg border px-4 py-3.5 text-start transition-[background-color,border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                  active ? "border-primary bg-primary/[0.07]" : "border-card-border bg-card hover:border-primary/40"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${active ? "border-primary" : "border-card-border"}`}
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 font-bold">
                    {plan.label}
                    {plan.badge && (
                      <span className="rounded-md bg-primary px-1.5 py-0.5 text-[0.7rem] font-bold text-primary-ink">{plan.badge}</span>
                    )}
                  </span>
                  <span className="block text-xs text-muted">
                    {plan.months === 1 ? "מתחדש כל חודש" : `תשלום אחד של ${p.total}`}
                  </span>
                </span>
                <span className="shrink-0 text-end">
                  <span className="block font-bold tabular-nums" dir="ltr">
                    {p.perMonth}
                  </span>
                  <span className="block text-xs text-muted">{saving ? `לחודש · חיסכון ${saving}%` : "לחודש"}</span>
                </span>
              </button>
            );
          })}
        </div>

        <motion.div
          key={selected.code}
          initial={{ opacity: 0.6, transform: "translateY(4px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className="relative overflow-hidden rounded-lg border border-primary bg-card p-6 sm:p-7 lg:sticky lg:top-24"
        >
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
          <h2 className="text-lg font-black">{selected.label}</h2>
          <p className="mt-3 flex items-baseline gap-2">
            <EnglishText as="span" className="chyron text-6xl leading-none">
              {priceOf(selected).perMonth}
            </EnglishText>
            <span className="text-muted">לחודש</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            {selected.months === 1
              ? "חיוב חודשי, מתחדש אוטומטית עד שמבטלים."
              : `${priceOf(selected).total} בתשלום אחד ל${selected.months === 12 ? "שנה" : `-${selected.months} חודשים`}, מתחדש לאותה תקופה עד שמבטלים.`}
          </p>

          <ul className="mt-5 space-y-2 border-t border-card-border pt-5 text-sm">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check size={16} className="shrink-0 text-success" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          {session ? (
            <button
              type="button"
              onClick={() => handleCheckout(selected.code)}
              disabled={loadingCode !== null}
              className="game-press mt-6 w-full min-h-12 rounded-lg bg-primary text-primary-ink text-lg font-bold hover:bg-primary-hover transition-[background-color,opacity,transform] duration-150 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              {loadingCode === selected.code ? "פותח תשלום..." : "להמשיך לתשלום"}
            </button>
          ) : (
            <Link
              href="/signup"
              className="game-press mt-6 flex w-full min-h-12 items-center justify-center rounded-lg bg-primary text-primary-ink text-lg font-bold hover:bg-primary-hover transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              להתחיל {TRIAL_DAYS} ימים חינם
            </Link>
          )}
          <p className="mt-3 text-xs text-muted leading-relaxed">
            שימוש הוגן: עד {DAILY_CONVERSATION_LIMIT} שיחות חדשות עם המורה ועד {DAILY_WRITING_LIMIT} הגשות כתיבה בכל 24 שעות.
            שיחה עם המורה זמינה במנוי בתשלום בלבד, ולא בניסיון החינם.
          </p>
        </motion.div>
      </div>

      {!isNative && (
        <p className="max-w-3xl mx-auto mt-8 text-center text-sm text-muted leading-relaxed">
          המחירים בשקלים והם סופיים: העסק רשום כעוסק פטור ואינו גובה מע״מ. כל מסלול משולם מראש, בתשלום אחד, ומתחדש
          אוטומטית לאותה תקופה עד שתבטלו. אפשר לבטל את החידוש בכל עת בעמוד הפרופיל. פרטים ב
          <Link href="/terms" className="text-primary underline underline-offset-2">
            תנאי השימוש
          </Link>{" "}
          וב
          <Link href="/refunds" className="text-primary hover:underline">
            מדיניות הביטולים וההחזרים
          </Link>
          .
        </p>
      )}

      {/* Apple Pay's own one-time device token can't be charged again for an
          automatic renewal (confirmed against a real decline, not a guess) —
          disclosed here rather than left to surprise someone when their
          subscription quietly lapses. */}
      {!isNative && (
        <p className="max-w-3xl mx-auto mt-2 text-center text-[11px] text-muted leading-relaxed">
          בתשלום דרך Apple Pay החידוש האוטומטי אינו נתמך כרגע. בתום התקופה יהיה צורך לבצע תשלום חדש כדי להמשיך.
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
            <a href="/terms" className="text-primary underline underline-offset-2">
              תנאי שימוש
            </a>
            {" · "}
            <a href="/privacy" className="text-primary underline underline-offset-2">
              מדיניות פרטיות
            </a>
            {" · "}
            <a href="/refunds" className="text-primary hover:underline">
              ביטולים והחזרים
            </a>
          </p>
        </div>
      )}

      {/* Seller identification (name, business number, address) is required
          on a page a sale happens from — Consumer Protection Law s.14C —
          so it can't be dropped, only made quiet: smallest text on the
          page, muted, and the last thing before the footer rather than
          sitting right under the price cards. */}
      {!isNative && (
        <p className="max-w-3xl mx-auto mt-6 text-center text-[11px] text-muted leading-relaxed">
          המוכר: {BUSINESS_NAME}
          {BUSINESS_REGISTRATION ? `, ${BUSINESS_REGISTRATION}` : ""}
          {BUSINESS_ADDRESS ? `, ${BUSINESS_ADDRESS}` : ""}.
        </p>
      )}
    </section>
  );
}
