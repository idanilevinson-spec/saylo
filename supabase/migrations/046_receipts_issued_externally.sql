-- issued_via: 'invoice_plus' = a receipt PayPlus Invoice+ issued (on its
-- own after a charge, or through our API call); 'external_manual' = one the
-- owner issued by hand and recorded in /admin/billing with its number.
-- (Already run on the live DB on 2026-10-07, together with 044.)
--
-- 046, not 045: the open Bagrut branch already uses 045 (bagrut_track).

alter table public.billing_documents
  add column issued_via text check (issued_via in ('invoice_plus', 'external_manual')),
  -- When the owner was emailed that this payment needs a receipt, so a
  -- redelivered webhook doesn't send the same email twice.
  add column receipt_notified_at timestamptz;

update public.billing_documents set issued_via = 'invoice_plus' where status = 'issued' and issued_via is null;
