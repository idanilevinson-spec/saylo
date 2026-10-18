-- 051_learner_words.sql: words learners look up in a conversation join the
-- vocabulary pool, with their translation and a review question, so any
-- word (not only the curated catalog) can go into a learner's reviews.
--
-- They are kept apart from the curated content: status 'draft' plus
-- learner_added = true, under a hidden topic. Every public page, game and
-- count selects status = 'published', so none of them ever shows these
-- words; only reviews (by id) and the word lookup read them. An admin can
-- see and fix them under the topic "מילים מהשיחות".

alter table public.vocabulary_items add column if not exists learner_added boolean not null default false;
alter table public.exercises add column if not exists learner_added boolean not null default false;

-- One shared entry per word.
create unique index if not exists vocabulary_items_learner_headword_idx
  on public.vocabulary_items (lower(headword)) where learner_added;

insert into public.topics (slug, name_he, name_en, cefr_level, sort_order, status)
values ('learner-words', 'מילים מהשיחות', 'Words from conversations', 'B1', 9999, 'draft')
on conflict (slug) do nothing;

drop policy if exists "learner-added vocabulary is viewable by authenticated users" on public.vocabulary_items;
create policy "learner-added vocabulary is viewable by authenticated users"
  on public.vocabulary_items for select
  to authenticated
  using (learner_added);

drop policy if exists "learner-added exercises are viewable by authenticated users" on public.exercises;
create policy "learner-added exercises are viewable by authenticated users"
  on public.exercises for select
  to authenticated
  using (learner_added);

-- Check: should return 1 topic row and the two columns.
select slug, status from public.topics where slug = 'learner-words';
select table_name, column_name from information_schema.columns
where table_schema = 'public' and column_name = 'learner_added' order by table_name;
