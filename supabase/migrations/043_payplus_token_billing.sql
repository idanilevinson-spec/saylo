-- PayPlus's merchant account was never approved for their own recurring-
-- billing engine (charge_method 3 / recurring_settings — see the 422
-- "dont-have-permission-recurring-payment" error). Switching to their
-- cheaper tokenization-only product instead: the first charge saves a card
-- token, and our own cron (api/cron/payplus-renewals) charges it again on
-- each plan's renewal date via Transactions/Charge. payplus_recurring_uid
-- is left in place, unused — no row has ever been written with it since
-- checkout has been failing since launch.

alter table public.subscriptions
  add column payplus_customer_uid text,
  add column payplus_token text;
