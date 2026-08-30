-- Phase 6: AI speaking (scenarios + free-form chat), pronunciation schema
-- (unused until a speech provider is wired in a later phase), and the real
-- parental-consent flow for minors (guardian_links existed since Phase 1 as
-- schema-only — this migration makes it functional).
-- Run this against a project that already has migration 004 applied.

-- ============ CONVERSATION SCENARIOS ============

create table public.conversation_scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_he text not null,
  title_en text not null,
  system_prompt text not null,
  cefr_level cefr_level not null,
  status content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============ CONVERSATIONS ============
-- scenario_id null = free-form chat with the AI Teacher rather than a
-- scripted role-play.

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  scenario_id uuid references public.conversation_scenarios(id),
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index conversations_profile_idx on public.conversations (profile_id, created_at);

create table public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index conversation_messages_conversation_idx on public.conversation_messages (conversation_id, created_at);

create table public.conversation_scores (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null unique references public.conversations(id) on delete cascade,
  fluency_score int not null check (fluency_score between 0 and 100),
  grammar_score int not null check (grammar_score between 0 and 100),
  vocabulary_score int not null check (vocabulary_score between 0 and 100),
  overall_score int not null check (overall_score between 0 and 100),
  feedback jsonb not null,
  created_at timestamptz not null default now()
);

-- ============ PRONUNCIATION (schema only) ============
-- No speech provider is wired up yet (see src/lib/speech/provider.ts) — this
-- table exists now so a later phase can start writing to it without a
-- migration, once real mic recording + a provider are in place.

create table public.pronunciation_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  target_phrase text not null,
  audio_url text,
  provider text,
  score jsonb,
  created_at timestamptz not null default now()
);

-- ============ PARENTAL CONSENT (making guardian_links functional) ============

alter table public.guardian_links alter column consent_token set default gen_random_uuid()::text;

create policy "minors can request consent for themselves"
  on public.guardian_links for insert
  to authenticated
  with check (auth.uid() = minor_profile_id);

-- Guardians aren't app users — they act through a one-time token link, not a
-- session. These functions are the only way to read/resolve a consent
-- request as anon, scoped narrowly to that single action (not general table
-- access), and resolution requires status = 'pending' so a token can't be
-- replayed after it's already been decided.

create or replace function public.get_guardian_consent_info(p_token text)
returns table (minor_display_name text, minor_age smallint, guardian_email text, status text)
language sql
security definer
set search_path = public
stable
as $$
  select p.display_name, p.age, gl.guardian_email, gl.status
  from public.guardian_links gl
  join public.profiles p on p.id = gl.minor_profile_id
  where gl.consent_token = p_token
$$;

grant execute on function public.get_guardian_consent_info(text) to anon, authenticated;

create or replace function public.resolve_guardian_consent(p_token text, p_approve boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link record;
begin
  select * into v_link from public.guardian_links where consent_token = p_token and status = 'pending';
  if not found then
    return false;
  end if;

  update public.guardian_links
  set status = case when p_approve then 'granted' else 'denied' end::parental_consent_status,
      resolved_at = now()
  where id = v_link.id;

  update public.profiles
  set parental_consent_status = case when p_approve then 'granted' else 'denied' end::parental_consent_status
  where id = v_link.minor_profile_id;

  return true;
end;
$$;

grant execute on function public.resolve_guardian_consent(text, boolean) to anon, authenticated;

-- ============ ROW LEVEL SECURITY ============

alter table public.conversation_scenarios enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.conversation_scores enable row level security;
alter table public.pronunciation_attempts enable row level security;

create policy "published scenarios are viewable by authenticated users"
  on public.conversation_scenarios for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

create policy "users manage their own conversations"
  on public.conversations for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "users manage their own conversation messages"
  on public.conversation_messages for all
  to authenticated
  using (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.profile_id = auth.uid())
  )
  with check (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.profile_id = auth.uid())
  );

create policy "users manage their own conversation scores"
  on public.conversation_scores for all
  to authenticated
  using (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.profile_id = auth.uid())
  )
  with check (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.profile_id = auth.uid())
  );

create policy "users manage their own pronunciation attempts"
  on public.pronunciation_attempts for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);
