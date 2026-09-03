-- Reading texts are moving from "1 open question" to "several open
-- questions" (to support a full 7-MCQ + 3-open-question exam format).
-- reading_texts.open_question_en stays as-is for backward compatibility
-- with existing content/rows that still use the single-question flow —
-- this just adds room for more, addressed by id rather than by column.

create table public.reading_open_questions (
  id uuid primary key default gen_random_uuid(),
  reading_text_id uuid not null references public.reading_texts(id) on delete cascade,
  question_en text not null,
  sort_order int not null default 0,
  status content_status not null default 'published',
  created_at timestamptz not null default now()
);

create index reading_open_questions_text_idx on public.reading_open_questions (reading_text_id, sort_order);

alter table public.reading_open_questions enable row level security;

create policy "published open questions are viewable by authenticated users"
  on public.reading_open_questions for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

-- reading_responses previously always graded against reading_texts.open_question_en
-- (implicitly, one per text). Nullable FK so old rows stay valid; new
-- submissions set it to say which of the several questions was answered.
alter table public.reading_responses add column open_question_id uuid references public.reading_open_questions(id);

-- Backfill: the reading exam UI now reads exclusively from
-- reading_open_questions, so every existing text's single legacy
-- open_question_en becomes that text's first (and for now only) row here
-- — otherwise those 15 older texts would silently lose their open
-- question in the new exam flow. open_question_en itself is untouched,
-- so the old column-based flow (openQuestionId omitted) still works too.
insert into public.reading_open_questions (reading_text_id, question_en, sort_order)
select rt.id, rt.open_question_en, 1
from public.reading_texts rt
where rt.open_question_en is not null
  and not exists (
    select 1 from public.reading_open_questions roq where roq.reading_text_id = rt.id
  );
