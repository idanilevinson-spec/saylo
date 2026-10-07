-- Receipts issued by hand in an external, Tax-Authority-registered invoicing
-- system (חשבון מהיר, free plan — it has no API). The ledger from migration
-- 044 still records every payment; the owner issues the receipt there and
-- marks the row issued in /admin/billing with the receipt's number.
--
-- 046, not 045: the open Bagrut branch already uses 045 (bagrut_track).

alter table public.billing_documents
  add column issued_via text check (issued_via in ('invoice_plus', 'external_manual')),
  -- When the owner was emailed that this payment needs a receipt, so a
  -- redelivered webhook doesn't send the same email twice.
  add column receipt_notified_at timestamptz;

update public.billing_documents set issued_via = 'invoice_plus' where status = 'issued' and issued_via is null;
