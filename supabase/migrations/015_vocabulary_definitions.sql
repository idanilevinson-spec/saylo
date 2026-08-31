-- Adds English definitions for the "identify the word by its definition"
-- game mode. Nullable and populated gradually (seed 018 starts with the
-- original A1 core vocabulary, the most-reviewed words) rather than all
-- at once - the definition game only draws from words that have one.

alter table public.vocabulary_items add column if not exists definition_en text;
