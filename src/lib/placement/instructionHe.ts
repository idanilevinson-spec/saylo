// A short Hebrew instruction shown above each placement question, the way
// the Bagrut questions already pair a Hebrew line with the English item:
// a beginner sees what to do even if "Choose the correct synonym" means
// nothing to them yet. The English question stays as it is underneath.
// Returns null for a shape it doesn't recognize, so nothing wrong is shown.

const quoted = (prompt: string) => prompt.match(/"([^"]+)"/)?.[1] ?? null;

export function placementInstructionHe(prompt: string): string | null {
  const p = prompt.trim();
  const word = quoted(p);

  if (/^Listen and answer/i.test(p)) return "האזינו לקטע וענו על השאלה";
  if (/^Read:/i.test(p)) return "קראו את הקטע וענו על השאלה";
  if (/^What is the English word for/i.test(p)) return "בחרו את המילה באנגלית שמתאימה למילה בעברית";
  if (/^What is the opposite of/i.test(p) && word) return `בחרו את ההפך של "${word}"`;
  if (/^Choose the correct synonym for/i.test(p) && word) return `בחרו מילה שהמשמעות שלה דומה ל-"${word}"`;
  if (/^Choose the word closest in meaning to/i.test(p) && word) return `בחרו את הפירוש הקרוב ביותר ל-"${word}"`;
  if (/^What does the idiom/i.test(p) && word) return `מה הפירוש של הביטוי "${word}"?`;
  if (/^What does/i.test(p) && word) return `מה הפירוש של "${word}"?`;
  if (/^Choose the correct color/i.test(p)) return "בחרו את הצבע שמשלים את המשפט";
  if (p.includes("___")) return "בחרו את מה שמשלים את המשפט";
  return null;
}
