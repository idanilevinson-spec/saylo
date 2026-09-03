-- Roughly doubles the placement test bank (28 -> 56 questions) and closes
-- the biggest gap in it: reading and listening previously had zero
-- questions at C1/C2, so anyone advanced enough to need them was scored
-- on grammar/vocabulary alone for those two skills. This file only adds
-- rows — it never touches the questions from seed 005 or 011.
-- Run this AFTER migration 011_placement_reading_listening.sql has been
-- applied. Safe to re-run: only deletes the sort_order range (29-56)
-- this file itself owns.

delete from public.placement_questions where sort_order between 29 and 56;

insert into public.placement_questions (prompt, options, correct_index, skill_area, cefr_level, audio_text, sort_order) values

  -- grammar (one more per level)
  ('We ___ happy today.', '["is", "am", "are", "be"]', 2, 'grammar', 'A1', null, 29),
  ('My brother ___ football every Sunday.', '["play", "plays", "playing", "played"]', 1, 'grammar', 'A2', null, 30),
  ('By the time we arrived, the movie ___ already started.', '["has", "have", "had", "was"]', 2, 'grammar', 'B1', null, 31),
  ('The report ___ by the manager before the meeting starts.', '["is reviewing", "will review", "will be reviewed", "reviews"]', 2, 'grammar', 'B2', null, 32),
  ('Rarely ___ such a compelling argument.', '["I have heard", "have I heard", "I heard", "did I heard"]', 1, 'grammar', 'C1', null, 33),
  ('___ the committee reach a decision, would you agree to implement it immediately?', '["Should", "If", "Would", "Were"]', 0, 'grammar', 'C2', null, 34),

  -- vocabulary (one more per level)
  ('What is the English word for "תפוח"?', '["banana", "apple", "orange", "grape"]', 1, 'vocabulary', 'A1', null, 35),
  ('Choose the correct word: I usually ___ breakfast at 7 AM.', '["have", "do", "make", "take"]', 0, 'vocabulary', 'A2', null, 36),
  ('What does "run out of" mean?', '["to exercise outside", "to have no more of something", "to run quickly", "to escape"]', 1, 'vocabulary', 'B1', null, 37),
  ('Choose the word closest in meaning to "reluctant":', '["eager", "unwilling", "confident", "curious"]', 1, 'vocabulary', 'B2', null, 38),
  ('What does the phrase "a blessing in disguise" mean?', '["an obvious blessing", "something bad that turns out good", "a disguise for evil", "a religious ceremony"]', 1, 'vocabulary', 'C1', null, 39),
  ('Choose the word closest in meaning to "ubiquitous":', '["rare", "present everywhere", "expensive", "ancient"]', 1, 'vocabulary', 'C2', null, 40),

  -- reading (one more at A1-B2, two more each at C1/C2 to close the gap)
  ('Read: "Ben has a red bike. He rides his bike to school every day. On weekends, he rides in the park." Question: Where does Ben ride his bike on weekends?',
   '["To school", "In the park", "To the store", "Nowhere"]', 1, 'reading', 'A1', null, 41),
  ('Read: "Lisa loves cooking. Every Friday, she cooks dinner for her family. Her favorite dish to make is pasta." Question: What is Lisa''s favorite dish to make?',
   '["Pizza", "Pasta", "Salad", "Soup"]', 1, 'reading', 'A2', null, 42),
  ('Read: "Even though the museum was far from his house, Daniel visited it every month because he loved learning about ancient history." Question: Why did Daniel visit the museum regularly?',
   '["It was close to his house", "He worked there", "He loved learning about ancient history", "His friends invited him"]', 2, 'reading', 'B1', null, 43),
  ('Read: "Despite widespread skepticism from experts, the small startup managed to secure significant funding by demonstrating a working prototype that addressed a genuine market need." Question: How did the startup overcome the skepticism?',
   '["By hiring more experts", "By demonstrating a working prototype", "By lowering its prices", "By avoiding investors"]', 1, 'reading', 'B2', null, 44),
  ('Read: "While automation has undeniably increased efficiency across many industries, critics argue that its unchecked expansion risks exacerbating inequality unless accompanied by deliberate policy interventions." Question: According to the passage, what do critics warn about?',
   '["Automation always reduces efficiency", "Unchecked automation may worsen inequality without policy action", "Policy interventions cause inequality", "Industries should stop using automation entirely"]', 1, 'reading', 'C1', null, 45),
  ('Read: "The novel''s protagonist, initially portrayed as indifferent to the plight of others, undergoes a gradual transformation that culminates in an act of considerable self-sacrifice." Question: How does the protagonist change over the course of the novel?',
   '["From caring to indifferent", "From indifferent to self-sacrificing", "He does not change at all", "From wealthy to poor"]', 1, 'reading', 'C1', null, 46),
  ('Read: "It would be disingenuous to attribute the company''s downfall solely to market conditions, when internal mismanagement and a persistent failure to innovate played at least an equally significant role." Question: What is the author''s main point?',
   '["Market conditions were entirely to blame", "Internal factors were also significantly responsible", "The company innovated too much", "Mismanagement had no effect"]', 1, 'reading', 'C2', null, 47),
  ('Read: "Far from being a mere formality, the ratification process exposed deep-seated ideological rifts that had long simmered beneath the surface of ostensible political unity." Question: What did the ratification process reveal?',
   '["That everyone agreed completely", "Hidden ideological divisions that had seemed like unity", "A purely administrative formality", "New alliances forming"]', 1, 'reading', 'C2', null, 48),

  -- listening (one more at A1-B2, two more each at C1/C2 to close the gap)
  ('Listen and answer: What is the dog''s name?',
   '["Rex", "Max", "Buddy", "Charlie"]', 1, 'listening', 'A1', 'I have a small brown dog. His name is Max.', 49),
  ('Listen and answer: What does the speaker do before work?',
   '["Watch TV", "Drink coffee and read the newspaper", "Go for a run", "Cook breakfast"]', 1, 'listening', 'A2', 'Every morning, I drink coffee and read the newspaper before work.', 50),
  ('Listen and answer: Why hasn''t the speaker gone hiking recently?',
   '["They don''t enjoy it anymore", "They are too busy", "They got injured", "They moved away"]', 1, 'listening', 'B1', 'Although I enjoy hiking, I haven''t gone in months because of my busy schedule.', 51),
  ('Listen and answer: What do the organizers believe?',
   '["The conference is cancelled", "It will happen next month", "It was successful", "It was postponed indefinitely"]', 1, 'listening', 'B2', 'The conference was postponed twice, but organizers are confident it will finally take place next month.', 52),
  ('Listen and answer: What did the committee decide?',
   '["To reject the proposal", "To approve the proposal despite criticism", "To postpone the review", "To criticize the committee"]', 1, 'listening', 'C1', 'Although the proposal received considerable criticism during the review, the committee ultimately decided to approve it, citing its long-term benefits.', 53),
  ('Listen and answer: Why wasn''t the speaker affected by the schedule change?',
   '["She was unaware of it", "She had already planned for it", "She cancelled her plans", "She was on vacation"]', 1, 'listening', 'C1', 'Having anticipated the delay, she had already made alternative arrangements, so the change in schedule barely affected her plans.', 54),
  ('Listen and answer: How did the initiative''s outcomes compare to expectations?',
   '["They exceeded expectations", "They fell short despite the resources", "They matched expectations exactly", "Resources were never allocated"]', 1, 'listening', 'C2', 'Notwithstanding the substantial resources allocated to the initiative, its outcomes fell markedly short of what stakeholders had been led to expect.', 55),
  ('Listen and answer: How did both parties feel about the final agreement?',
   '["Completely satisfied", "Not entirely satisfied but willing to accept it", "Totally opposed to it", "Unaware of the outcome"]', 1, 'listening', 'C2', 'The negotiations, protracted as they were, ultimately yielded an agreement that neither party found entirely satisfactory, yet both were willing to accept.', 56);
