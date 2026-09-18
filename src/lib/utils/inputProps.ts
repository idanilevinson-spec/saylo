// Autocorrect and predictive text would hand the learner the right spelling
// (or silently rewrite what they typed), so English practice fields switch
// them off. `lang="en"` asks mobile keyboards for the English layout.

export const ENGLISH_WORD_INPUT = {
  dir: "ltr",
  lang: "en",
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "off",
  spellCheck: false,
  enterKeyHint: "done",
} as const;

export const ENGLISH_TEXT_INPUT = {
  dir: "ltr",
  lang: "en",
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "sentences",
  spellCheck: false,
} as const;

export const EMAIL_INPUT = {
  type: "email",
  dir: "ltr",
  inputMode: "email",
  autoComplete: "email",
  autoCapitalize: "none",
  autoCorrect: "off",
  spellCheck: false,
} as const;
