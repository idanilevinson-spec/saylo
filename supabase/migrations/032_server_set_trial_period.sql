-- The "users create their own trial subscription" policy only checks that
-- status = 'trialing'. Everything else in the row came from the browser, so a
-- user could insert their own trial with trial_ends_at set years ahead and
-- keep every trial feature (Writing Coach, teacher suggestions, unlimited
-- hearts) for free. This trigger takes those fields out of the client's hands.
--
-- Only direct client statements are rewritten. The Stripe and RevenueCat
-- webhooks use the service role, and the SQL editor runs as postgres, so both
-- still write real subscription state. Keep the interval in step with
-- TRIAL_DAYS in src/lib/subscriptions/plans.ts.

create or replace function public.set_trial_period_on_client_insert()
returns trigger
language plpgsql
as $$
begin
  -- Not SECURITY DEFINER on purpose: current_user is the role that issued the
  -- statement.
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  new.status := 'trialing';
  new.trial_ends_at := now() + interval '3 days';
  new.plan_id := null;
  new.current_period_end := null;
  new.stripe_customer_id := null;
  new.stripe_subscription_id := null;
  new.cancel_at_period_end := false;
  new.billing_provider := 'stripe';
  return new;
end;
$$;

drop trigger if exists set_trial_period_on_client_insert on public.subscriptions;
create trigger set_trial_period_on_client_insert
  before insert on public.subscriptions
  for each row execute function public.set_trial_period_on_client_insert();
