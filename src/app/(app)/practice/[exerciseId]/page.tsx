import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/serverClient";
import ExercisePlayer from "@/components/ExercisePlayer";
import type { Exercise } from "@/types/database";

interface PageProps {
  params: Promise<{ exerciseId: string }>;
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

// Exercises hang off exactly one of four possible parents (topic, grammar
// topic, reading text, listening clip). This resolves whichever one is set
// into a back-link and the ordered sibling list used for "next exercise".
async function resolveParent(supabase: SupabaseClient, exercise: Exercise) {
  const parentColumn = (
    ["topic_id", "grammar_topic_id", "reading_text_id", "listening_clip_id"] as const
  ).find((col) => exercise[col]);

  if (!parentColumn) {
    return { siblings: [] as { id: string }[], backHref: "/learn", backLabel: "מסלול הלימוד" };
  }

  const parentId = exercise[parentColumn] as string;
  const config = {
    topic_id: { table: "topics" as const, hrefPrefix: "/vocabulary", byId: false },
    grammar_topic_id: { table: "grammar_topics" as const, hrefPrefix: "/grammar", byId: false },
    reading_text_id: { table: "reading_texts" as const, hrefPrefix: "/reading", byId: true },
    listening_clip_id: { table: "listening_clips" as const, hrefPrefix: "/listening", byId: true },
  }[parentColumn];

  const [{ data: parent }, { data: siblingRows }] = await Promise.all([
    supabase.from(config.table).select("*").eq("id", parentId).maybeSingle(),
    supabase.from("exercises").select("id").eq(parentColumn, parentId).eq("status", "published").order("sort_order"),
  ]);

  const siblings = siblingRows ?? [];
  if (!parent) {
    return { siblings, backHref: "/learn", backLabel: "מסלול הלימוד" };
  }

  const slugOrId = config.byId ? parent.id : (parent as { slug: string }).slug;
  return {
    siblings,
    backHref: `${config.hrefPrefix}/${slugOrId}`,
    backLabel: (parent as { name_he?: string; title_he?: string }).name_he ?? (parent as { title_he: string }).title_he,
  };
}

export default async function PracticePage({ params }: PageProps) {
  const { exerciseId } = await params;
  const supabase = await createClient();

  const { data: exercise } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", exerciseId)
    .eq("status", "published")
    .maybeSingle();

  if (!exercise) notFound();

  const { siblings, backHref, backLabel } = await resolveParent(supabase, exercise);

  const currentIndex = siblings.findIndex((s) => s.id === exercise.id);
  const nextHref =
    currentIndex >= 0 && currentIndex < siblings.length - 1 ? `/practice/${siblings[currentIndex + 1].id}` : null;

  return <ExercisePlayer exercise={exercise} nextHref={nextHref} backHref={backHref} backLabel={backLabel} />;
}
