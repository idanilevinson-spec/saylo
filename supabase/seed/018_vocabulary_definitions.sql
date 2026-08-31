-- English definitions for the original A1 core vocabulary (58 words
-- across numbers/colors/family/food-drink/animals/greetings) — the
-- most-reviewed words via SRS, so the highest-value starting batch for
-- the "identify the word by its definition" game. Definitions are kept
-- simple (A1-appropriate) and never contain the headword itself.
-- Run this AFTER migration 015_vocabulary_definitions.sql.
-- Safe to re-run: plain UPDATE, idempotent.

update public.vocabulary_items vi
set definition_en = v.definition_en
from (values
  ('numbers', 'one', 'the number 1'),
  ('numbers', 'two', 'the number 2'),
  ('numbers', 'three', 'the number 3'),
  ('numbers', 'four', 'the number 4'),
  ('numbers', 'five', 'the number 5'),
  ('numbers', 'six', 'the number 6'),
  ('numbers', 'seven', 'the number 7'),
  ('numbers', 'eight', 'the number 8'),
  ('numbers', 'nine', 'the number 9'),
  ('numbers', 'ten', 'the number 10'),
  ('colors', 'red', 'the color of blood or a ripe tomato'),
  ('colors', 'blue', 'the color of the sky on a clear day'),
  ('colors', 'green', 'the color of grass or leaves'),
  ('colors', 'yellow', 'the color of the sun or a banana'),
  ('colors', 'black', 'the darkest color, like the night sky'),
  ('colors', 'white', 'the color of snow or milk'),
  ('colors', 'orange', 'the color made by mixing red and yellow'),
  ('colors', 'purple', 'the color made by mixing red and blue'),
  ('colors', 'pink', 'a light shade of red'),
  ('colors', 'brown', 'the color of wood or coffee'),
  ('family', 'mother', 'a woman who has a child'),
  ('family', 'father', 'a man who has a child'),
  ('family', 'sister', 'a girl or woman with the same parents as you'),
  ('family', 'brother', 'a boy or man with the same parents as you'),
  ('family', 'grandmother', 'the mother of your mother or father'),
  ('family', 'grandfather', 'the father of your mother or father'),
  ('family', 'son', 'a person''s male child'),
  ('family', 'daughter', 'a person''s female child'),
  ('family', 'baby', 'a very young child'),
  ('family', 'family', 'a group of people related to each other, such as parents and children'),
  ('food-drink', 'water', 'a clear liquid that people and animals drink to live'),
  ('food-drink', 'bread', 'a food made from flour and water, usually baked'),
  ('food-drink', 'milk', 'a white liquid, often from cows, that people drink'),
  ('food-drink', 'apple', 'a round fruit that is red, green, or yellow'),
  ('food-drink', 'coffee', 'a hot brown drink made from roasted beans'),
  ('food-drink', 'tea', 'a hot drink made by putting dried leaves in hot water'),
  ('food-drink', 'egg', 'a food that comes from a chicken, often eaten for breakfast'),
  ('food-drink', 'rice', 'small white or brown grains that are cooked and eaten'),
  ('food-drink', 'chicken', 'a bird kept on farms for its meat and eggs'),
  ('food-drink', 'cheese', 'a solid food made from milk'),
  ('animals', 'dog', 'an animal often kept as a pet that barks'),
  ('animals', 'cat', 'a small animal often kept as a pet that says meow'),
  ('animals', 'bird', 'an animal with wings and feathers that can often fly'),
  ('animals', 'fish', 'an animal that lives in water and breathes through gills'),
  ('animals', 'horse', 'a large animal that people can ride'),
  ('animals', 'cow', 'a large farm animal that gives milk'),
  ('animals', 'lion', 'a large wild cat sometimes called the king of the jungle'),
  ('animals', 'elephant', 'a very large gray animal with a long trunk'),
  ('animals', 'rabbit', 'a small animal with long ears that hops'),
  ('animals', 'mouse', 'a very small animal with a long thin tail'),
  ('greetings', 'hello', 'a word people say when they meet someone'),
  ('greetings', 'goodbye', 'a word people say when they are leaving'),
  ('greetings', 'please', 'a word people use to ask for something politely'),
  ('greetings', 'thank you', 'words people say to show they are grateful'),
  ('greetings', 'sorry', 'a word people say when they made a mistake'),
  ('greetings', 'yes', 'a word that means you agree or accept'),
  ('greetings', 'no', 'a word that means you disagree or refuse'),
  ('greetings', 'my name is', 'words people use to tell someone what they are called')
) as v(topic_slug, headword, definition_en)
join public.topics t on t.slug = v.topic_slug
where vi.topic_id = t.id and vi.headword = v.headword;
