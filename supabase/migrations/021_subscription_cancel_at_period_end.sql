-- Lets a subscriber cancel a multi-month plan without losing the period
-- they already paid for: cancel_at_period_end mirrors Stripe's own field
-- of the same name — the subscription's `status` stays 'active' and
-- current_period_end is untouched, so isPremiumActive() keeps granting
-- access exactly as before, right up until Stripe actually ends the
-- subscription (customer.subscription.deleted) at that date.

alter table public.subscriptions
  add column if not exists cancel_at_period_end boolean not null default false;
