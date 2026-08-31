-- Adds AI-graded open-ended reading comprehension: a short free-text
-- question per reading text (not just multiple choice), graded by
-- Claude and calibrated to the reader's tested level, matching the
-- user's explicit ask for deeper comprehension checks, not just MCQ.
-- Mirrors the existing writing_submissions/writing_feedback + daily
-- rate-limit pattern (same cost profile: one AI call per submission).

alter table public.reading_texts add column if not exists open_question_en text;

create table public.reading_responses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reading_text_id uuid not null references public.reading_texts(id) on delete cascade,
  submitted_text text not null,
  score int not null check (score between 0 and 100),
  feedback_he text not null,
  model_answer_en text not null,
  created_at timestamptz not null default now()
);

create index reading_responses_profile_idx on public.reading_responses (profile_id, created_at);

alter table public.reading_responses enable row level security;

create policy "users manage their own reading responses"
  on public.reading_responses for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- Caps reading-response submissions at 15 per profile per rolling 24
-- hours (admins exempt) — identical shape to enforce_daily_writing_limit.
create or replace function public.enforce_daily_reading_response_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
begin
  if public.is_admin(new.profile_id) then
    return new;
  end if;

  select count(*) into recent_count
  from public.reading_responses
  where profile_id = new.profile_id
    and created_at >= now() - interval '24 hours';

  if recent_count >= 15 then
    raise exception 'daily_reading_response_limit_reached';
  end if;

  return new;
end;
$$;

drop trigger if exists reading_response_daily_limit on public.reading_responses;
create trigger reading_response_daily_limit
  before insert on public.reading_responses
  for each row
  execute function public.enforce_daily_reading_response_limit();
