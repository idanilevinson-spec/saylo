-- Phase 7: subscriptions, hearts (free-tier practice limiter).
-- Run this against a project that already has migration 005 applied.
-- stripe_price_id on subscription_plans is filled in separately once
-- Stripe products/prices are created (needs STRIPE_SECRET_KEY) — the table
-- structure doesn't change for that, only a later UPDATE statement.

-- ============ SUBSCRIPTION PLANS ============
-- Matches the pricing already shown on /pricing (src/lib/subscriptions/plans.ts).

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  months int not null,
  price_ils numeric(10, 2) not null,
  stripe_price_id text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============ SUBSCRIPTIONS ============
-- One row per user reflecting their current state — trialing, active on a
-- paid plan, or lapsed. History isn't tracked separately; Stripe itself is
-- the source of truth for billing history if that's ever needed.

create table public.subscriptions (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  plan_id uuid references public.subscription_plans(id),
  status text not null default 'trialing' check (status in ('trialing', 'active', 'canceled', 'past_due', 'expired')),
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ HEARTS (free-tier daily practice limiter) ============
-- Only enforced once trial/premium has lapsed — see
-- src/lib/subscriptions/entitlements.ts. Lost on a wrong answer, regenerate
-- over time (handled in application code, not a DB cron).

create table public.hearts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  current_hearts int not null default 5,
  max_hearts int not null default 5,
  last_regen_at timestamptz not null default now()
);

-- ============ ROW LEVEL SECURITY ============

alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.hearts enable row level security;

create policy "subscription plans are viewable by authenticated users"
  on public.subscription_plans for select
  to authenticated
  using (true);

create policy "users view their own subscription"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = profile_id);

-- Users may create their own initial trial row (once, at signup) — but never
-- update it themselves, since that would let anyone grant themselves an
-- active/paid status directly. Only the Stripe webhook (via the
-- service-role client, never the user's session) updates status afterward.
create policy "users create their own trial subscription"
  on public.subscriptions for insert
  to authenticated
  with check (auth.uid() = profile_id and status = 'trialing');

create policy "users manage their own hearts"
  on public.hearts for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- No update policy on subscriptions for regular users — every status change
-- after the initial trial row goes through the Stripe webhook using the
-- service-role client, never the user's own browser session.
