-- PayPlus identifies a recurring subscription by its own "recurring_uid",
-- returned in the first charge's callback (see the recurring_charge_information
-- field in the IPN payload) — needed later to cancel the recurring charge via
-- POST /RecurringPayments/{uid}/Valid.

alter table public.subscriptions
  add column payplus_recurring_uid text;
