// The concrete next steps under the teacher's recommendation on the
// dashboard: each one a real thing from the learner's own data, one tap
// away. Nothing is shown to fill space; with no data there are no steps.

export interface TeacherAction {
  kind: "grammar" | "review" | "conversation";
  label: string;
  href: string;
}

export function buildTeacherActions(input: {
  // Grammar topics they got wrong most recently, most mistakes first.
  weakTopics: { nameHe: string; slug: string }[];
  dueWords: number;
  // Days since their last conversation with the teacher; null if never.
  daysSinceConversation: number | null;
}): TeacherAction[] {
  const actions: TeacherAction[] = [];
  const topic = input.weakTopics[0];
  if (topic) actions.push({ kind: "grammar", label: `לחזור על ${topic.nameHe}`, href: `/grammar/${topic.slug}` });
  if (input.dueWords > 0)
    actions.push({
      kind: "review",
      label: input.dueWords === 1 ? "מילה אחת מחכה לחזרה" : `${input.dueWords} מילים מחכות לחזרה`,
      href: "/review",
    });
  if (input.daysSinceConversation === null || input.daysSinceConversation >= 3)
    actions.push({ kind: "conversation", label: "שיחה קצרה עם המורה", href: "/speaking" });
  return actions.slice(0, 3);
}

// The dashboard's lead already sends the learner to their next course
// step; a teacher action to the same page would be a second button for it.
export function withoutLeadStep(actions: TeacherAction[], leadHref: string | null): TeacherAction[] {
  if (!leadHref) return actions;
  const lead = leadHref.split("?")[0];
  return actions.filter((a) => a.href.split("?")[0] !== lead);
}
