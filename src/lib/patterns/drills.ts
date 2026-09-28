// Short drill sentences for each pattern's practice screen.
// docs/specs/hebrew-pattern-coach.md §7 and §11: the pattern LIST itself was
// verified by the owner (2026-09-21), but these drill sentences are a
// SEPARATE approval gate — they are what a learner directly practices on, so
// a mistake here teaches the wrong thing. Nothing with `reviewed: false`
// is ever shown to a learner; see getReviewedDrill() below.
//
// How to approve a pattern's drill: have a qualified English teacher or
// native-speaker professional read its sentences, fix anything wrong, then
// flip that pattern's `reviewed` to true.

export interface DrillItem {
  // The full sentence with the target word/phrase blanked out as "___".
  promptWithBlank: string;
  options: string[];
  correctOptionIndex: number;
}

export interface PatternDrill {
  code: string;
  reviewed: boolean;
  items: DrillItem[];
}

export const PATTERN_DRILLS: readonly PatternDrill[] = [
  {
    code: "MISSING_COPULA",
    reviewed: false,
    items: [
      { promptWithBlank: "She ___ happy today.", options: ["happy", "is happy", "have happy"], correctOptionIndex: 1 },
      { promptWithBlank: "They ___ from Israel.", options: ["from", "are from", "have from"], correctOptionIndex: 1 },
      { promptWithBlank: "This ___ very interesting.", options: ["very interesting", "is very interesting", "very interesting is"], correctOptionIndex: 1 },
      { promptWithBlank: "My parents ___ at home now.", options: ["at home", "are at home", "have at home"], correctOptionIndex: 1 },
      { promptWithBlank: "I ___ tired after work.", options: ["tired", "am tired", "have tired"], correctOptionIndex: 1 },
      { promptWithBlank: "The food ___ delicious.", options: ["delicious", "is delicious", "has delicious"], correctOptionIndex: 1 },
      { promptWithBlank: "We ___ ready to start.", options: ["ready", "are ready", "have ready"], correctOptionIndex: 1 },
      { promptWithBlank: "It ___ a beautiful day.", options: ["a beautiful day", "is a beautiful day", "has a beautiful day"], correctOptionIndex: 1 },
    ],
  },
  {
    code: "OBJECT_GENDER",
    reviewed: false,
    items: [
      { promptWithBlank: "I bought a new car — ___ is very fast.", options: ["he", "she", "it"], correctOptionIndex: 2 },
      { promptWithBlank: "Look at this book — ___ is really long.", options: ["he", "she", "it"], correctOptionIndex: 2 },
      { promptWithBlank: "The table is broken; ___ needs fixing.", options: ["he", "she", "it"], correctOptionIndex: 2 },
      { promptWithBlank: "I love my phone — ___ takes great photos.", options: ["he", "she", "it"], correctOptionIndex: 2 },
      { promptWithBlank: "The sun is bright today; ___ is very hot.", options: ["he", "she", "it"], correctOptionIndex: 2 },
      { promptWithBlank: "This chair is old — ___ is still comfortable.", options: ["he", "she", "it"], correctOptionIndex: 2 },
    ],
  },
  {
    code: "INVITE_RESERVE_ORDER",
    reviewed: false,
    items: [
      { promptWithBlank: "I ___ a table for two at the restaurant.", options: ["invited", "reserved", "ordered"], correctOptionIndex: 1 },
      { promptWithBlank: "We ___ pizza for dinner tonight.", options: ["invited", "reserved", "ordered"], correctOptionIndex: 2 },
      { promptWithBlank: "She ___ all her friends to the party.", options: ["invited", "reserved", "ordered"], correctOptionIndex: 0 },
      { promptWithBlank: "Did you ___ a hotel room for the trip?", options: ["invite", "reserve", "order"], correctOptionIndex: 1 },
      { promptWithBlank: "I ___ a coffee at the café.", options: ["invited", "reserved", "ordered"], correctOptionIndex: 2 },
      { promptWithBlank: "They ___ us to their wedding.", options: ["invited", "reserved", "ordered"], correctOptionIndex: 0 },
    ],
  },
  {
    code: "INDEFINITE_ARTICLE",
    reviewed: false,
    items: [
      { promptWithBlank: "She is ___ doctor.", options: ["doctor", "a doctor", "the doctor"], correctOptionIndex: 1 },
      { promptWithBlank: "I saw ___ elephant at the zoo.", options: ["elephant", "a elephant", "an elephant"], correctOptionIndex: 2 },
      { promptWithBlank: "He has ___ dog and ___ cat.", options: ["dog / cat", "a dog / a cat", "the dog / the cat"], correctOptionIndex: 1 },
      { promptWithBlank: "Can I have ___ apple, please?", options: ["apple", "a apple", "an apple"], correctOptionIndex: 2 },
      { promptWithBlank: "This is ___ interesting book.", options: ["interesting book", "a interesting book", "an interesting book"], correctOptionIndex: 2 },
    ],
  },
  {
    code: "GENERIC_THE",
    reviewed: false,
    items: [
      { promptWithBlank: "I love ___ music.", options: ["the music", "music", "a music"], correctOptionIndex: 1 },
      { promptWithBlank: "___ cats are independent animals.", options: ["The cats", "Cats", "A cats"], correctOptionIndex: 1 },
      { promptWithBlank: "She enjoys ___ art in general.", options: ["the art", "art", "an art"], correctOptionIndex: 1 },
      { promptWithBlank: "___ money can't buy happiness.", options: ["The money", "Money", "A money"], correctOptionIndex: 1 },
      { promptWithBlank: "I don't like ___ coffee.", options: ["the coffee", "coffee", "a coffee"], correctOptionIndex: 1 },
    ],
  },
  {
    code: "VERB_PREPOSITION",
    reviewed: false,
    items: [
      { promptWithBlank: "I entered ___ the room.", options: ["to", "into", "— (no word)"], correctOptionIndex: 2 },
      { promptWithBlank: "We arrived ___ the airport at 9am.", options: ["to", "at", "for"], correctOptionIndex: 1 },
      { promptWithBlank: "She is married ___ a doctor.", options: ["with", "to", "for"], correctOptionIndex: 1 },
      { promptWithBlank: "He is waiting ___ the bus.", options: ["to", "for", "on"], correctOptionIndex: 1 },
      { promptWithBlank: "I'm listening ___ the radio.", options: ["at", "to", "for"], correctOptionIndex: 1 },
      { promptWithBlank: "This depends ___ the weather.", options: ["of", "on", "for"], correctOptionIndex: 1 },
    ],
  },
  {
    code: "DO_SUPPORT",
    reviewed: false,
    items: [
      { promptWithBlank: "___ you live near here?", options: ["—", "Do", "Are"], correctOptionIndex: 1 },
      { promptWithBlank: "He ___ not like spicy food.", options: ["not", "no", "does"], correctOptionIndex: 2 },
      { promptWithBlank: "___ she speak English?", options: ["—", "Does", "Is"], correctOptionIndex: 1 },
      { promptWithBlank: "I ___ not understand the question.", options: ["not", "no", "do"], correctOptionIndex: 2 },
      { promptWithBlank: "Where ___ they work?", options: ["—", "do", "are"], correctOptionIndex: 1 },
    ],
  },
  {
    code: "MAKE_DO",
    reviewed: false,
    items: [
      { promptWithBlank: "I ___ a mistake on the test.", options: ["did", "made", "took"], correctOptionIndex: 1 },
      { promptWithBlank: "Can you ___ me a favor?", options: ["do", "make", "take"], correctOptionIndex: 1 },
      { promptWithBlank: "She ___ her homework every day.", options: ["does", "makes", "takes"], correctOptionIndex: 0 },
      { promptWithBlank: "He ___ a lot of noise last night.", options: ["did", "made", "took"], correctOptionIndex: 1 },
      { promptWithBlank: "I need to ___ the dishes.", options: ["do", "make", "take"], correctOptionIndex: 0 },
    ],
  },
  {
    code: "SAY_TELL",
    reviewed: false,
    items: [
      { promptWithBlank: "He ___ me the truth.", options: ["said", "told", "spoke"], correctOptionIndex: 1 },
      { promptWithBlank: "She ___ that she was tired.", options: ["said", "told", "talked"], correctOptionIndex: 0 },
      { promptWithBlank: "Can you ___ me your name?", options: ["say", "tell", "talk"], correctOptionIndex: 1 },
      { promptWithBlank: "He ___ hello to everyone.", options: ["said", "told", "spoke"], correctOptionIndex: 0 },
      { promptWithBlank: "I ___ him about the meeting.", options: ["said", "told", "talked"], correctOptionIndex: 1 },
    ],
  },
  {
    code: "PRESENT_PERFECT",
    reviewed: false,
    items: [
      { promptWithBlank: "I ___ here since 2020.", options: ["live", "have lived", "am living"], correctOptionIndex: 1 },
      { promptWithBlank: "She ___ this company for five years.", options: ["works at", "has worked at", "is working at"], correctOptionIndex: 1 },
      { promptWithBlank: "We ___ each other since high school.", options: ["know", "have known", "are knowing"], correctOptionIndex: 1 },
      { promptWithBlank: "He ___ English for three years already.", options: ["studies", "has studied", "is studying"], correctOptionIndex: 1 },
      { promptWithBlank: "They ___ married since 2015.", options: ["are", "have been", "were"], correctOptionIndex: 1 },
    ],
  },
  {
    code: "SIMPLE_VS_CONTINUOUS",
    reviewed: false,
    items: [
      { promptWithBlank: "Right now I ___ on a report.", options: ["work", "am working", "worked"], correctOptionIndex: 1 },
      { promptWithBlank: "I usually ___ coffee in the morning.", options: ["drink", "am drinking", "drank"], correctOptionIndex: 0 },
      { promptWithBlank: "Look — it ___ outside!", options: ["rains", "is raining", "rained"], correctOptionIndex: 1 },
      { promptWithBlank: "She ___ in Tel Aviv every summer.", options: ["visits", "is visiting", "visited"], correctOptionIndex: 0 },
      { promptWithBlank: "Can you be quiet? I ___ to study.", options: ["try", "am trying", "tried"], correctOptionIndex: 1 },
    ],
  },
  {
    code: "UNCOUNTABLE_PLURAL",
    reviewed: false,
    items: [
      { promptWithBlank: "She gave me a lot of useful ___.", options: ["advices", "advice", "adviced"], correctOptionIndex: 1 },
      { promptWithBlank: "I need more ___ before I decide.", options: ["informations", "information", "informed"], correctOptionIndex: 1 },
      { promptWithBlank: "We don't have much ___ left.", options: ["furnitures", "furniture", "furnished"], correctOptionIndex: 1 },
      { promptWithBlank: "Can I get some ___, please?", options: ["feedbacks", "feedback", "feedbacked"], correctOptionIndex: 1 },
      { promptWithBlank: "There is a lot of ___ on the road today.", options: ["traffics", "traffic", "trafficked"], correctOptionIndex: 1 },
    ],
  },
  {
    code: "DOUBLE_LETTERS",
    reviewed: false,
    items: [
      { promptWithBlank: "I ___ this restaurant to everyone.", options: ["recomend", "recommend", "reccomend"], correctOptionIndex: 1 },
      { promptWithBlank: "This word ___ twice in the text.", options: ["ocurs", "occurs", "occures"], correctOptionIndex: 1 },
      { promptWithBlank: "We had a lot of ___ this year.", options: ["sucess", "success", "sucssess"], correctOptionIndex: 1 },
      { promptWithBlank: "It's a very ___ problem.", options: ["dificult", "difficult", "diffucult"], correctOptionIndex: 1 },
      { promptWithBlank: "The meeting has been ___ to Monday.", options: ["postponned", "postponed", "postpond"], correctOptionIndex: 1 },
    ],
  },
  {
    code: "CAPITALIZATION",
    reviewed: false,
    items: [
      { promptWithBlank: "___ am going to the store.", options: ["i", "I"], correctOptionIndex: 1 },
      { promptWithBlank: "We visited ___ last year.", options: ["israel", "Israel"], correctOptionIndex: 1 },
      { promptWithBlank: "My friend and ___ went to the movies.", options: ["i", "I"], correctOptionIndex: 1 },
      { promptWithBlank: "___ speak Hebrew and English.", options: ["i", "I"], correctOptionIndex: 1 },
    ],
  },
  {
    code: "APOSTROPHE",
    reviewed: false,
    items: [
      { promptWithBlank: "I ___ know the answer.", options: ["dont", "don't"], correctOptionIndex: 1 },
      { promptWithBlank: "___ a beautiful day today.", options: ["Its", "It's"], correctOptionIndex: 1 },
      { promptWithBlank: "He ___ coming to the party.", options: ["isnt", "isn't"], correctOptionIndex: 1 },
      { promptWithBlank: "___ going to be late.", options: ["Im", "I'm"], correctOptionIndex: 1 },
      { promptWithBlank: "___ meet at six o'clock.", options: ["Lets", "Let's"], correctOptionIndex: 1 },
    ],
  },
] as const;

export function getPatternDrill(code: string): PatternDrill | undefined {
  return PATTERN_DRILLS.find((d) => d.code === code);
}

// The only entry point the UI should use: returns the drill only once it
// has actually been reviewed, so an unreviewed pattern's practice screen
// never silently ships to a learner.
export function getReviewedDrill(code: string): PatternDrill | undefined {
  const drill = getPatternDrill(code);
  return drill?.reviewed ? drill : undefined;
}
