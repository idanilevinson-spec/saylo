-- Real Stripe price IDs, generated via the Stripe API.

insert into public.subscription_plans (code, months, price_ils, stripe_price_id, sort_order) values
  ('monthly', 1, 59, 'price_1U93HFIFE4jZUSJRn4DqXuud', 1),
  ('bimonthly', 2, 109, 'price_1U93HGIFE4jZUSJRNJb9WJb8', 2),
  ('quarterly', 3, 149, 'price_1U93HGIFE4jZUSJRLrnOWmQM', 3),
  ('biannual', 6, 269, 'price_1U93HHIFE4jZUSJRnWnbTJSb', 4),
  ('annual', 12, 449, 'price_1U93HIIFE4jZUSJRKPZGjyNu', 5)
on conflict (code) do update set
  months = excluded.months,
  price_ils = excluded.price_ils,
  stripe_price_id = excluded.stripe_price_id,
  sort_order = excluded.sort_order;
