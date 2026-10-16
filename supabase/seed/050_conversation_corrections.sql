-- 050_conversation_corrections.sql: a teacher reply can carry the correction
-- it made to the learner's message before it, shown as a card under that
-- message ({"original": ..., "better": ..., "why": ...}). Nullable, so
-- every existing message is untouched. The app works before and after this
-- runs (it stores the reply without the card until the column exists).

alter table public.conversation_messages add column if not exists correction jsonb;

-- Check: should return one row, "correction".
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'conversation_messages' and column_name = 'correction';
