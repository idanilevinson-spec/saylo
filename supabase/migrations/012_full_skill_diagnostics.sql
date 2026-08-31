-- Extends the placement test to cover all 6 skills instead of just
-- grammar/vocabulary, and adds an audio_text field so listening
-- placement questions can be spoken (via the browser TTS already used
-- by DictationQuestion) without revealing the transcript in the visible
-- question text.
-- Safe to re-run: idempotent add-column.

alter table public.placement_questions add column if not exists audio_text text;
