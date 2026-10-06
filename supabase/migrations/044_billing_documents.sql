-- Receipts for web payments (PayPlus). Saylo's seller is an עוסק פטור, so the
-- document for a payment is a קבלה (receipt) — never a tax invoice. The
-- documents themselves are produced by PayPlus Invoice+, which is registered
-- invoicing software; this table is our own ledger of what was issued, for
-- which payment, and what still needs a receipt.
--
-- One row per payment. A row is written as 'pending' the moment a charge
-- succeeds, before PayPlus is asked for the document, so a failure on the
-- PayPlus side never loses track of a payment: the daily cron retries
-- 'pending'/'failed' rows, and the admin billing screen lists them.
--
-- Bookkeeping rules require receipts to be kept for years, so a deleted
-- account doesn't delete its receipts: profile_id is set null and the
-- customer name/email snapshot taken at issue time stays.
--
-- App Store purchases are not here: Apple is the seller there and sends its
-- own receipt.

create table public.billing_documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  -- Our idempotency key for the payment: the PayPlus transaction uid for a
  -- card charge, 'renewal:<profile>:<period end>' for a renewal, or
  -- 'manual:<uuid>' for a payment entered by an admin (a school paying by
  -- bank transfer, for instance). Also sent to PayPlus as unique_identifier
  -- so a retried call can't produce a second document.
  payment_ref text not null unique,
  source text not null check (source in ('checkout', 'renewal', 'manual')),
  doc_type text not null default 'receipt' check (doc_type in ('receipt')),
  status text not null default 'pending' check (status in ('pending', 'issued', 'failed')),
  amount_ils numeric(10, 2) not null check (amount_ils > 0),
  payment_method text not null default 'credit-card'
    check (payment_method in ('credit-card', 'bank-transfer', 'cash', 'payment-app', 'other')),
  description text not null,
  customer_name text not null,
  customer_email text,
  paid_at timestamptz not null default now(),
  -- Filled in by PayPlus once the document exists.
  doc_uid text,
  doc_number text,
  pdf_url text,
  issued_at timestamptz,
  attempts int not null default 0,
  last_error text,
  -- For a manual receipt: which admin confirmed it.
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index billing_documents_profile_idx on public.billing_documents (profile_id, paid_at desc);
create index billing_documents_open_idx on public.billing_documents (status, created_at) where status <> 'issued';

alter table public.billing_documents enable row level security;

-- Every write goes through the server with the service role. A learner can
-- read their own issued receipts (the profile page lists them); admins read
-- everything.
create policy "read own issued receipts"
  on public.billing_documents for select
  to authenticated
  using (profile_id = auth.uid() and status = 'issued');

create policy "admins read billing documents"
  on public.billing_documents for select
  to authenticated
  using (public.is_admin(auth.uid()));
