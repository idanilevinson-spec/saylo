-- Phase 4: reading, listening, idioms/phrasal verbs.
-- Run this against a project that already has migration 002 applied.
--
-- Audio is synthesized client-side via the browser's Web Speech API
-- (see src/lib/speech/browserTts.ts) rather than pre-recorded files — no
-- audio_url/storage needed. Swap in real recordings later by adding an
-- audio_url column and a fallback in the player if a more natural voice is
-- wanted; nothing else about this schema needs to change for that.

-- ============ ENUMS ============

create type idiom_type as enum ('idiom', 'phrasal_verb');

-- New exercise type for listening comprehension. Must be committed before
-- any INSERT references it (Postgres forbids using a new enum value in the
-- same transaction that added it) — run this migration, then the seed files,
-- as separate SQL Editor executions.
alter type exercise_type add value 'dictation';

-- ============ READING ============

create table public.reading_texts (
  id uuid primary key default gen_random_uuid(),
  title_he text not null,
  title_en text not null,
  body_en text not null,
  cefr_level cefr_level not null,
  status content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============ LISTENING ============

create table public.listening_clips (
  id uuid primary key default gen_random_uuid(),
  title_he text not null,
  title_en text not null,
  transcript_en text not null,
  cefr_level cefr_level not null,
  status content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============ IDIOMS & PHRASAL VERBS ============

create table public.idioms_phrasal_verbs (
  id uuid primary key default gen_random_uuid(),
  phrase text not null,
  type idiom_type not null,
  meaning_he text not null,
  example_en text not null,
  cefr_level cefr_level not null,
  status content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============ LINK EXERCISES TO READING/LISTENING ============
-- Reuses the Phase 3 exercise player/grading/XP/SRS pipeline for
-- comprehension questions and dictation, instead of building new UI.

alter table public.exercises add column reading_text_id uuid references public.reading_texts(id) on delete cascade;
alter table public.exercises add column listening_clip_id uuid references public.listening_clips(id) on delete cascade;

create index exercises_reading_text_idx on public.exercises (reading_text_id, sort_order);
create index exercises_listening_clip_idx on public.exercises (listening_clip_id, sort_order);

-- ============ ROW LEVEL SECURITY ============

alter table public.reading_texts enable row level security;
alter table public.listening_clips enable row level security;
alter table public.idioms_phrasal_verbs enable row level security;

create policy "published reading texts are viewable by authenticated users"
  on public.reading_texts for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

create policy "published listening clips are viewable by authenticated users"
  on public.listening_clips for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

create policy "published idioms are viewable by authenticated users"
  on public.idioms_phrasal_verbs for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));
