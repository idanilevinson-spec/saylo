import "server-only";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { FillBlankContentSchema, McqContentSchema } from "@/types/exercises";
import { unitsForLevel } from "./course";
import type { CefrLevel } from "@/types/database";

// The trial lesson (/try): a few minutes of real practice before signing
// up. Six questions from the first course unit at the level the visitor
// picks, three vocabulary and three grammar, graded on the device like the
// app's own practice. Nothing is saved; there is no session. Read with the
// admin client like the other public pages, and cached for an hour.

export const TRIAL_TRACKS = [
  { key: "a1", level: "A1", labelHe: "מתחילים" },
  { key: "b1", level: "B1", labelHe: "בינוני" },
  { key: "c1", level: "C1", labelHe: "מתקדם" },
] as const satisfies readonly { key: string; level: CefrLevel; labelHe: string }[];

export type TrialTrack = (typeof TRIAL_TRACKS)[number];

export interface TrialQuestion {
  id: string;
  kind: "vocabulary" | "grammar";
  type: "mcq" | "fill_blank";
  content: Record<string, unknown>;
}

export interface TrialLesson {
  level: CefrLevel;
  unitTitleHe: string;
  goalHe: string;
  questions: TrialQuestion[];
}

const PER_KIND = 3;

function valid(type: string, content: unknown): boolean {
  if (type === "mcq") return McqContentSchema.safeParse(content).success;
  if (type === "fill_blank") return FillBlankContentSchema.safeParse(content).success;
  return false;
}

export const getTrialLesson = unstable_cache(
  async (level: CefrLevel): Promise<TrialLesson | null> => {
    // The first unit at the level whose topics have enough questions; a unit
    // whose content was unpublished just gives way to the next.
    for (const unit of unitsForLevel(level)) {
      const vocabRef = unit.steps.find((s) => s.kind === "vocabulary")?.ref;
      const grammarRef = unit.steps.find((s) => s.kind === "grammar")?.ref;
      if (!vocabRef || !grammarRef) continue;

      const [{ data: topic }, { data: grammarTopic }] = await Promise.all([
        supabaseAdmin.from("topics").select("id").eq("slug", vocabRef).eq("status", "published").maybeSingle(),
        supabaseAdmin.from("grammar_topics").select("id").eq("slug", grammarRef).eq("status", "published").maybeSingle(),
      ]);
      if (!topic || !grammarTopic) continue;

      const [{ data: vocab }, { data: grammar }] = await Promise.all([
        supabaseAdmin
          .from("exercises")
          .select("id, type, content")
          .eq("topic_id", topic.id)
          .eq("type", "mcq")
          .eq("status", "published")
          .order("sort_order")
          .limit(PER_KIND * 3),
        supabaseAdmin
          .from("exercises")
          .select("id, type, content")
          .eq("grammar_topic_id", grammarTopic.id)
          .in("type", ["mcq", "fill_blank"])
          .eq("status", "published")
          .order("sort_order")
          .limit(PER_KIND * 3),
      ]);
      const pick = (rows: { id: string; type: string; content: unknown }[] | null, kind: TrialQuestion["kind"]) =>
        (rows ?? [])
          .filter((r) => valid(r.type, r.content))
          .slice(0, PER_KIND)
          .map((r) => ({ id: r.id, kind, type: r.type as TrialQuestion["type"], content: r.content as Record<string, unknown> }));
      const questions = [...pick(vocab, "vocabulary"), ...pick(grammar, "grammar")];
      if (questions.length < PER_KIND * 2) continue;

      return { level, unitTitleHe: unit.titleHe, goalHe: unit.goalHe, questions };
    }
    return null;
  },
  ["trial-lesson"],
  { revalidate: 3600 },
);
