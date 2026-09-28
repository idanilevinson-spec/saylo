// Golden set for measuring how accurately the writing-coach prompt tags each
// AI-detectable pattern (docs/specs/hebrew-pattern-coach.md §8, §10 step 7).
// Used by accuracyCheck.manual.test.ts — never imported by the app itself.
//
// Only the 13 AI-detectable patterns are covered here (the 12 grammar/usage
// patterns plus DOUBLE_LETTERS). CAPITALIZATION and APOSTROPHE are checked
// by deterministic rules instead (see textAnalysis.test.ts) and were never
// sent to the model in the first place — there's nothing here to measure for
// them.
//
// The spec suggests 15 positive + 10 negative sentences per pattern; this
// file has fewer (roughly 5-6 positive, 3-4 negative) to keep a first,
// genuinely hand-checked set reviewable. Whoever reviews the pattern content
// (spec §11, decision 1) should feel free to extend this file before
// raising the accuracy bar much past a first pass.

export interface GoldenExample {
  code: string;
  sentence: string;
  // true: this sentence should trigger the pattern. false: a sentence that
  // could superficially look related but is actually correct, or is a
  // different mistake — the model should NOT tag this pattern here.
  expected: boolean;
}

export const GOLDEN_SET: readonly GoldenExample[] = [
  // MISSING_COPULA
  { code: "MISSING_COPULA", sentence: "My sister happy about the news.", expected: true },
  { code: "MISSING_COPULA", sentence: "The weather very cold this morning.", expected: true },
  { code: "MISSING_COPULA", sentence: "He tired after the long trip.", expected: true },
  { code: "MISSING_COPULA", sentence: "We ready for the exam.", expected: true },
  { code: "MISSING_COPULA", sentence: "This soup too salty for me.", expected: true },
  { code: "MISSING_COPULA", sentence: "My sister is happy about the news.", expected: false },
  { code: "MISSING_COPULA", sentence: "We were ready for the exam yesterday.", expected: false },
  { code: "MISSING_COPULA", sentence: "The teacher explained the lesson clearly.", expected: false },

  // OBJECT_GENDER
  { code: "OBJECT_GENDER", sentence: "I bought a new laptop, and she works really fast.", expected: true },
  { code: "OBJECT_GENDER", sentence: "Look at this bridge — he is very old.", expected: true },
  { code: "OBJECT_GENDER", sentence: "My guitar is broken; she needs a new string.", expected: true },
  { code: "OBJECT_GENDER", sentence: "The house is big, and she has a nice garden.", expected: true },
  { code: "OBJECT_GENDER", sentence: "I bought a new laptop, and it works really fast.", expected: false },
  { code: "OBJECT_GENDER", sentence: "My sister is very tall, and she loves basketball.", expected: false },
  { code: "OBJECT_GENDER", sentence: "The dog ran to its owner across the yard.", expected: false },

  // INVITE_RESERVE_ORDER
  { code: "INVITE_RESERVE_ORDER", sentence: "I invited two seats for the concert next week.", expected: true },
  { code: "INVITE_RESERVE_ORDER", sentence: "We invited a room at the hotel for the weekend.", expected: true },
  { code: "INVITE_RESERVE_ORDER", sentence: "She invited a pizza for the whole family.", expected: true },
  { code: "INVITE_RESERVE_ORDER", sentence: "Did you invite a taxi for tomorrow morning?", expected: true },
  { code: "INVITE_RESERVE_ORDER", sentence: "I reserved two seats for the concert next week.", expected: false },
  { code: "INVITE_RESERVE_ORDER", sentence: "We invited all our cousins to the wedding.", expected: false },
  { code: "INVITE_RESERVE_ORDER", sentence: "She ordered a pizza for the whole family.", expected: false },

  // INDEFINITE_ARTICLE
  { code: "INDEFINITE_ARTICLE", sentence: "My father is engineer at a big company.", expected: true },
  { code: "INDEFINITE_ARTICLE", sentence: "I need umbrella because it's raining.", expected: true },
  { code: "INDEFINITE_ARTICLE", sentence: "She has old car from her grandmother.", expected: true },
  { code: "INDEFINITE_ARTICLE", sentence: "He wants to be pilot when he grows up.", expected: true },
  { code: "INDEFINITE_ARTICLE", sentence: "My father is an engineer at a big company.", expected: false },
  { code: "INDEFINITE_ARTICLE", sentence: "I need an umbrella because it's raining.", expected: false },
  { code: "INDEFINITE_ARTICLE", sentence: "She loves music and painting in her free time.", expected: false },

  // GENERIC_THE
  { code: "GENERIC_THE", sentence: "I really enjoy the sports on weekends.", expected: true },
  { code: "GENERIC_THE", sentence: "The children need the education to succeed.", expected: true },
  { code: "GENERIC_THE", sentence: "She is afraid of the spiders in general.", expected: true },
  { code: "GENERIC_THE", sentence: "The honesty is important in every relationship.", expected: true },
  { code: "GENERIC_THE", sentence: "I really enjoy sports on weekends.", expected: false },
  { code: "GENERIC_THE", sentence: "The children in that class are very kind.", expected: false },
  { code: "GENERIC_THE", sentence: "She is afraid of the spider under the bed.", expected: false },

  // VERB_PREPOSITION
  { code: "VERB_PREPOSITION", sentence: "We entered to the building through the back door.", expected: true },
  { code: "VERB_PREPOSITION", sentence: "The train arrived to the station five minutes late.", expected: true },
  { code: "VERB_PREPOSITION", sentence: "My brother is married with a lawyer from Haifa.", expected: true },
  { code: "VERB_PREPOSITION", sentence: "I'm waiting to my friend outside the café.", expected: true },
  { code: "VERB_PREPOSITION", sentence: "We entered the building through the back door.", expected: false },
  { code: "VERB_PREPOSITION", sentence: "The train arrived at the station five minutes late.", expected: false },
  { code: "VERB_PREPOSITION", sentence: "My brother is married to a lawyer from Haifa.", expected: false },

  // DO_SUPPORT
  { code: "DO_SUPPORT", sentence: "Why you always come late to class?", expected: true },
  { code: "DO_SUPPORT", sentence: "She not want to go to the party tonight.", expected: true },
  { code: "DO_SUPPORT", sentence: "Where your parents live now?", expected: true },
  { code: "DO_SUPPORT", sentence: "He not like when people are late.", expected: true },
  { code: "DO_SUPPORT", sentence: "Why do you always come late to class?", expected: false },
  { code: "DO_SUPPORT", sentence: "She doesn't want to go to the party tonight.", expected: false },
  { code: "DO_SUPPORT", sentence: "Where do your parents live now?", expected: false },

  // MAKE_DO
  { code: "MAKE_DO", sentence: "I did a big mistake on the final exam.", expected: true },
  { code: "MAKE_DO", sentence: "She did a lot of noise during the meeting.", expected: true },
  { code: "MAKE_DO", sentence: "Please make your homework before dinner.", expected: true },
  { code: "MAKE_DO", sentence: "He did his best to make a good decision.", expected: true },
  { code: "MAKE_DO", sentence: "I made a big mistake on the final exam.", expected: false },
  { code: "MAKE_DO", sentence: "Please do your homework before dinner.", expected: false },
  { code: "MAKE_DO", sentence: "He made a beautiful cake for the party.", expected: false },

  // SAY_TELL
  { code: "SAY_TELL", sentence: "She said me that the meeting was cancelled.", expected: true },
  { code: "SAY_TELL", sentence: "Can you say me what time it is?", expected: true },
  { code: "SAY_TELL", sentence: "He said us to wait outside the office.", expected: true },
  { code: "SAY_TELL", sentence: "She told that she was very tired.", expected: true },
  { code: "SAY_TELL", sentence: "She told me that the meeting was cancelled.", expected: false },
  { code: "SAY_TELL", sentence: "Can you tell me what time it is?", expected: false },
  { code: "SAY_TELL", sentence: "She said that she was very tired.", expected: false },

  // PRESENT_PERFECT
  { code: "PRESENT_PERFECT", sentence: "I know her since we were children.", expected: true },
  { code: "PRESENT_PERFECT", sentence: "He works at that hospital for ten years already.", expected: true },
  { code: "PRESENT_PERFECT", sentence: "We live in this apartment since last spring.", expected: true },
  { code: "PRESENT_PERFECT", sentence: "She studies English for a very long time now.", expected: true },
  { code: "PRESENT_PERFECT", sentence: "I have known her since we were children.", expected: false },
  { code: "PRESENT_PERFECT", sentence: "He has worked at that hospital for ten years already.", expected: false },
  { code: "PRESENT_PERFECT", sentence: "We moved into this apartment last spring.", expected: false },

  // SIMPLE_VS_CONTINUOUS
  { code: "SIMPLE_VS_CONTINUOUS", sentence: "Look, the baby sleeps in the other room right now.", expected: true },
  { code: "SIMPLE_VS_CONTINUOUS", sentence: "Please be quiet, I write an important email at the moment.", expected: true },
  { code: "SIMPLE_VS_CONTINUOUS", sentence: "Right now she cooks dinner for the whole family.", expected: true },
  { code: "SIMPLE_VS_CONTINUOUS", sentence: "Listen, it rains very hard outside right now.", expected: true },
  { code: "SIMPLE_VS_CONTINUOUS", sentence: "Look, the baby is sleeping in the other room right now.", expected: false },
  { code: "SIMPLE_VS_CONTINUOUS", sentence: "She cooks dinner for the family every single evening.", expected: false },
  { code: "SIMPLE_VS_CONTINUOUS", sentence: "It usually rains a lot in this city during winter.", expected: false },

  // UNCOUNTABLE_PLURAL
  { code: "UNCOUNTABLE_PLURAL", sentence: "The teacher gave us a lot of good advices.", expected: true },
  { code: "UNCOUNTABLE_PLURAL", sentence: "We still need more informations before deciding.", expected: true },
  { code: "UNCOUNTABLE_PLURAL", sentence: "There were too many furnitures in that small room.", expected: true },
  { code: "UNCOUNTABLE_PLURAL", sentence: "I got some interesting feedbacks from my manager.", expected: true },
  { code: "UNCOUNTABLE_PLURAL", sentence: "The teacher gave us a lot of good advice.", expected: false },
  { code: "UNCOUNTABLE_PLURAL", sentence: "We still need more information before deciding.", expected: false },
  { code: "UNCOUNTABLE_PLURAL", sentence: "There were too many chairs in that small room.", expected: false },

  // DOUBLE_LETTERS
  { code: "DOUBLE_LETTERS", sentence: "I strongly recomend this book to every student.", expected: true },
  { code: "DOUBLE_LETTERS", sentence: "This mistake ocurs very often in beginner writing.", expected: true },
  { code: "DOUBLE_LETTERS", sentence: "We had great sucess with the new project.", expected: true },
  { code: "DOUBLE_LETTERS", sentence: "It was a very dificult decision to make.", expected: true },
  { code: "DOUBLE_LETTERS", sentence: "I strongly recommend this book to every student.", expected: false },
  { code: "DOUBLE_LETTERS", sentence: "This mistake occurs very often in beginner writing.", expected: false },
  { code: "DOUBLE_LETTERS", sentence: "We had great success with the new project.", expected: false },
] as const;
