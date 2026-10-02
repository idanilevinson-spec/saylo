-- Support assistant: the AI help chat on the site and in the app, plus the
-- "have someone get back to me" requests it can hand off to a person.
--
-- Every write goes through the server with the service role (the API routes
-- in src/app/api/support/*), never straight from the browser: the chat is
-- open to visitors who aren't signed in, so there is no auth.uid() to scope
-- a client-side policy to, and the server is where rate limits, PII
-- redaction and ownership checks live. The only policies below are the
-- admin ones the back-office screen reads and updates through.
--
-- Retention (also stated on the privacy page): chats that never turned into
-- a request are deleted after 90 days, requests after 12 months —
-- public.purge_old_support_data(), called daily by /api/cron/support-cleanup.

-- ============ CONVERSATIONS ============
-- owner_key_hash is an HMAC of either the signed-in profile id or a random
-- token the browser keeps for the session. A conversation id alone is not
-- enough to read or continue someone's chat; the matching owner key is.
create table public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  owner_key_hash text not null,
  -- Where the chat was opened from, e.g. "/pricing" — helps the person who
  -- calls back understand the context, and shows which pages confuse people.
  page_path text,
  -- Written by the assistant (offer_callback_form tool) for the person who
  -- will handle the request. Never shown to the visitor.
  handoff_topic text,
  handoff_summary text,
  message_count int not null default 0,
  consented_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create index support_conversations_last_message_idx on public.support_conversations (last_message_at desc);
create index support_conversations_profile_idx on public.support_conversations (profile_id);

-- ============ MESSAGES ============
create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  -- Thumbs up / down from the visitor on an assistant answer. The admin
  -- screen lists the thumbs-down ones: they are where the knowledge base
  -- needs work.
  rating smallint check (rating in (-1, 1)),
  input_tokens int,
  output_tokens int,
  created_at timestamptz not null default now()
);

create index support_messages_conversation_idx on public.support_messages (conversation_id, created_at);
create index support_messages_rating_idx on public.support_messages (rating) where rating is not null;

-- ============ CALLBACK REQUESTS ============
create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.support_conversations(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null check (char_length(name) between 1 and 80),
  email text check (email is null or char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 20),
  preferred_channel text not null check (preferred_channel in ('email', 'phone', 'whatsapp')),
  topic text not null check (topic in ('billing', 'technical', 'account', 'content', 'privacy', 'school', 'other')),
  message text not null check (char_length(message) between 1 and 1000),
  page_path text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'done')),
  admin_notes text,
  consented_at timestamptz not null,
  created_at timestamptz not null default now(),
  handled_at timestamptz,
  check (email is not null or phone is not null)
);

create index support_requests_status_idx on public.support_requests (status, created_at desc);

-- ============ RATE LIMIT EVENTS ============
-- One row per chat message / request, keyed by an HMAC of the caller's IP or
-- profile id (never the raw IP). Counted over a rolling 24h window and
-- purged after two days.
create table public.support_rate_events (
  id bigint generated always as identity primary key,
  key_hash text not null,
  kind text not null check (kind in ('message', 'request')),
  created_at timestamptz not null default now()
);

create index support_rate_events_lookup_idx on public.support_rate_events (key_hash, kind, created_at);

-- ============ RLS ============
alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;
alter table public.support_requests enable row level security;
alter table public.support_rate_events enable row level security;

create policy "admins read support conversations"
  on public.support_conversations for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "admins read support messages"
  on public.support_messages for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "admins read support requests"
  on public.support_requests for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "admins update support requests"
  on public.support_requests for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- support_rate_events: no policy at all — only the service role touches it.

-- ============ RETENTION ============
create or replace function public.purge_old_support_data()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.support_rate_events where created_at < now() - interval '2 days';
  delete from public.support_requests where created_at < now() - interval '12 months';
  delete from public.support_conversations c
  where c.last_message_at < now() - interval '90 days'
    and not exists (select 1 from public.support_requests r where r.conversation_id = c.id);
$$;

revoke all on function public.purge_old_support_data() from public, anon, authenticated;
