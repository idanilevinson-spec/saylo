import "server-only";
import type { createClient } from "@/lib/supabase/serverClient";
import { fetchMyPatternStats } from "@/lib/patterns/getMyPatterns";
import { getPatternDefinition } from "@/lib/patterns/patternDefinitions";
import type { ConversationFix } from "@/lib/ai/conversationFix";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

// What the teacher knows about this learner from earlier lessons: the
// mistakes that keep coming back, recent corrections from other
// conversations, what they talked about lately, and words they are
// learning right now. This is what makes the teacher feel like *their*
// teacher rather than a fresh chatbot every time. Only facts from the
// database go in; the prompt forbids inventing anything beyond them.

export interface LearnerMemory {
  recurringMistakes: { label: string; wrong: string; right: string }[];
  recentFixes: ConversationFix[];
  recentTopics: string[];
  wordsLearning: string[];
}

export function formatLearnerMemory(m: LearnerMemory): string | null {
  const lines: string[] = [];
  if (m.recurringMistakes.length)
    lines.push(
      `Mistakes that keep coming back for this learner: ${m.recurringMistakes
        .map((p) => `${p.label} (e.g. "${p.wrong}" instead of "${p.right}")`)
        .join("; ")}.`,
    );
  if (m.recentFixes.length)
    lines.push(`Corrections you gave them in recent conversations: ${m.recentFixes.map((f) => `"${f.original}" → "${f.better}"`).join("; ")}.`);
  if (m.recentTopics.length) lines.push(`What you talked about recently: ${m.recentTopics.join("; ")}.`);
  if (m.wordsLearning.length) lines.push(`English words they are learning right now: ${m.wordsLearning.join(", ")}.`);
  if (!lines.length) return null;
  return `What you remember about this learner from earlier lessons (true facts from their history; never invent anything beyond them):
${lines.map((l) => `- ${l}`).join("\n")}
Use this the way a teacher who knows them would, without reciting it:
- When they now get right something you corrected before (for example they say "I went" after you once corrected "I go"), point it out in a few words, e.g. "And 'went', exactly right this time." That earned recognition is the one kind of praise you give.
- Steer the conversation so they get a natural chance to use a structure they keep getting wrong.
- Work in one of the words they are learning when it fits naturally.
- In your first reply of a conversation, if it fits, connect to something from the list (a past topic, a word they are learning) instead of a generic opener.
- Mention a past topic only from the list above, never invent one. Never mention a database, records, or memory.`;
}

// One fetch per conversation is plenty: none of this changes mid-call,
// and a voice turn shouldn't wait on four extra queries every time.
const cache = new Map<string, { at: number; text: string | null }>();
const TTL_MS = 30 * 60 * 1000;

export async function getLearnerMemory(
  supabase: SupabaseClient,
  profileId: string,
  conversationId: string,
): Promise<string | null> {
  const hit = cache.get(conversationId);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.text;

  try {
    const [patterns, fixesRes, topicsRes, srsRes] = await Promise.all([
      fetchMyPatternStats(supabase, profileId),
      supabase
        .from("conversation_messages")
        .select("correction, conversation_id, conversations!inner(profile_id)")
        .eq("conversations.profile_id", profileId)
        .neq("conversation_id", conversationId)
        .not("correction", "is", null)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("conversations")
        .select("id, conversation_scenarios(title_en)")
        .eq("profile_id", profileId)
        .neq("id", conversationId)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("srs_items")
        .select("due_at, vocabulary_items(headword)")
        .eq("profile_id", profileId)
        .order("due_at")
        .limit(5),
    ]);

    const memory: LearnerMemory = {
      recurringMistakes: patterns
        .map((p) => getPatternDefinition(p.code))
        .filter((d): d is NonNullable<typeof d> => !!d)
        .map((d) => ({ label: d.labelHe, wrong: d.exampleWrong, right: d.exampleRight })),
      recentFixes: ((fixesRes.data ?? []) as { correction: ConversationFix | null }[])
        .map((r) => r.correction)
        .filter((f): f is ConversationFix => !!f && !!f.original && !!f.better),
      recentTopics: [
        ...new Set(
          ((topicsRes.data ?? []) as unknown as { conversation_scenarios: { title_en: string } | null }[]).map(
            (c) => c.conversation_scenarios?.title_en ?? "a free conversation",
          ),
        ),
      ],
      wordsLearning: ((srsRes.data ?? []) as unknown as { vocabulary_items: { headword: string } | null }[])
        .map((s) => s.vocabulary_items?.headword)
        .filter((w): w is string => !!w && w.length > 2),
    };
    const text = formatLearnerMemory(memory);
    cache.set(conversationId, { at: Date.now(), text });
    if (cache.size > 500) cache.delete(cache.keys().next().value as string);
    return text;
  } catch {
    // Memory is a bonus: a failed lookup must never block the reply.
    return null;
  }
}
