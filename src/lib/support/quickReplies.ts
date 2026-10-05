// The suggested questions shown when the support chat opens. Their answers
// are known in advance, so they skip the AI entirely: the server builds the
// answer from the same facts the knowledge base uses (and, for the account
// questions, from the person's own account) and returns it in well under a
// second, instead of waiting several seconds on the model. Anything the
// person types themselves still goes to the AI, which sees these answers in
// the conversation history, so follow-ups keep their context.
//
// Shared by the widget (which ids to show where) and the chat route (which
// ids it accepts). Answers live server-side in quickAnswers.ts.

export const QUICK_REPLIES = {
  plans_difference: "מה ההבדל בין המסלולים?",
  cancel_anytime: "אפשר לבטל מתי שרוצים?",
  trial: "מה כלול בתקופת הניסיון?",
  how_to_cancel: "איך מבטלים את המנוי?",
  emails_off: "איך מכבים את המיילים?",
  delete_account: "איך מוחקים את החשבון?",
  teacher_unavailable: "למה השיחה עם המורה לא זמינה לי?",
  microphone: "המיקרופון לא עובד",
  conversation_limit: "יש מגבלה על מספר השיחות?",
  what_is_saylo: "מה זה Saylo?",
  price: "כמה זה עולה?",
  kids: "זה מתאים גם לילדים?",
  my_subscription: "מה מצב המנוי שלי?",
  no_hearts: "למה אין לי לבבות?",
  // Not answered at all: the widget opens the contact form straight away.
  talk_to_person: "אפשר לדבר עם מישהו מהצוות?",
} as const;

export type QuickReplyId = keyof typeof QUICK_REPLIES;

export const OPENS_CONTACT_FORM = "talk_to_person" satisfies QuickReplyId;

export function isQuickReplyId(value: unknown): value is QuickReplyId {
  return typeof value === "string" && Object.hasOwn(QUICK_REPLIES, value);
}

// Starting points that match where the person is, so the first tap is
// already a real question. Plain wording a person would actually type.
export function suggestionsFor(pathname: string, signedIn: boolean): QuickReplyId[] {
  if (pathname.startsWith("/pricing")) return ["plans_difference", "cancel_anytime", "trial"];
  if (pathname.startsWith("/profile")) return ["how_to_cancel", "emails_off", "delete_account"];
  if (pathname.startsWith("/speaking")) return ["teacher_unavailable", "microphone", "conversation_limit"];
  if (!signedIn) return ["what_is_saylo", "price", "kids"];
  return ["my_subscription", "no_hearts", "talk_to_person"];
}
