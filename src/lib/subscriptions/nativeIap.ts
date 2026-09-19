"use client";

import { Purchases, type PurchasesPackage } from "@revenuecat/purchases-capacitor";

// Apple's App Store Review Guideline 3.1.1 requires a subscription that
// unlocks in-app content to be purchased through Apple's own StoreKit, not
// an external checkout — Israel isn't covered by any of the external-link
// exceptions Apple has granted elsewhere (US, EU/EEA, South Korea), so this
// is the only compliant path for the native app specifically. Web stays on
// PayPlus/Stripe; this whole module is native-only (see Capacitor.isNative
// Platform() checks at every call site) and never runs on the web.
//
// RevenueCat wraps StoreKit + the receipt-validation/renewal/refund
// lifecycle that's genuinely easy to get wrong hand-rolled — see
// src/app/api/webhooks/revenuecat/route.ts for the server side, which is
// the actual source of truth for the subscriptions table (this module's
// job is only to trigger a real purchase and reflect the immediate result,
// same division of labor as the Stripe checkout redirect + its webhook).

let configured = false;

// Uses our own Supabase profile_id as RevenueCat's appUserID — no separate
// identity mapping needed on either side; the webhook's app_user_id field
// arrives back as this same value.
export async function configureNativeIap(profileId: string): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
  if (!apiKey || configured) return;
  await Purchases.configure({ apiKey, appUserID: profileId });
  configured = true;
}

export interface NativePlanPackage {
  planCode: string;
  priceString: string;
  price: number;
  currencyCode: string;
  pkg: PurchasesPackage;
}

// Product IDs follow com.saylolearn.app.<planCode> (see
// subscription_plans.apple_product_id) — the segment after the last dot is
// exactly one of PRICING_PLANS' own codes, so no separate id-to-plan map is
// needed on the client either.
export async function getNativePlanPackages(): Promise<NativePlanPackage[]> {
  if (!configured) return [];
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  if (!current) return [];

  return current.availablePackages.map((pkg) => ({
    planCode: pkg.product.identifier.split(".").pop() ?? "",
    priceString: pkg.product.priceString,
    price: pkg.product.price,
    currencyCode: pkg.product.currencyCode,
    pkg,
  }));
}

export async function purchaseNativePlan(pkg: PurchasesPackage): Promise<boolean> {
  try {
    await Purchases.purchasePackage({ aPackage: pkg });
    // The subscriptions table update itself comes from RevenueCat's server
    // webhook, not from this client call — this just confirms StoreKit
    // accepted the purchase. A caller that needs the row to exist right
    // away (e.g. to redirect somewhere premium-gated) should poll briefly
    // rather than assume it's already written the instant this resolves.
    return true;
  } catch {
    // Covers both a real failure and the user canceling the native sheet —
    // RevenueCat's SDK surfaces cancellation as a rejected promise too, and
    // the caller shouldn't tell those two apart differently here.
    return false;
  }
}

// Apple requires a way to re-sync purchases made on another device or after
// a reinstall. Resolves to whether an active entitlement exists afterwards.
export async function restoreNativePurchases(): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    return Object.keys(customerInfo.entitlements.active).length > 0;
  } catch {
    return false;
  }
}
