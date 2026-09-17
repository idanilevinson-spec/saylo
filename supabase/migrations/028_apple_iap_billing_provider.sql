-- Adds Apple In-App Purchase (via RevenueCat) as a second billing source
-- alongside the web checkout (Stripe today, PayPlus once that migration
-- lands) — an iOS user subscribing from inside the native app has to buy
-- through Apple's own StoreKit (App Store review guideline 3.1.1), so this
-- app now genuinely has two billing sources that can both write to the same
-- subscriptions row. billing_provider records which one currently owns a
-- given row, so each webhook only ever updates rows it actually owns
-- instead of two providers racing to overwrite each other's state.

alter table public.subscriptions
  add column billing_provider text not null default 'stripe'
    check (billing_provider in ('stripe', 'payplus', 'apple'));

alter table public.subscription_plans
  add column apple_product_id text;

comment on column public.subscriptions.billing_provider is
  'Which system is authoritative for this row''s status/period_end — set on every insert/upsert, checked by every webhook before it writes.';
comment on column public.subscription_plans.apple_product_id is
  'The App Store Connect subscription product identifier for this plan (e.g. com.saylolearn.app.monthly), filled in once the products are created there.';
