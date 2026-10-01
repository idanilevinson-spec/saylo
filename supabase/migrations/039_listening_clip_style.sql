-- Adds a `style` column to listening_clips so natural/connected-speech
-- content (docs/specs/connected-speech-listening.md) can live in the same
-- table as regular listening clips, filterable as its own section, instead
-- of a parallel table — the row shape (title/transcript/level/status) is
-- otherwise identical.

alter table public.listening_clips
  add column style text not null default 'standard';

alter table public.listening_clips
  add constraint listening_clips_style_check
  check (style in ('standard', 'natural_speech'));
