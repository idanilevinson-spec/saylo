import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import ContentCard from "@/components/ContentCard";
import { createClient } from "@/lib/supabase/serverClient";
import type { WritingPrompt } from "@/types/database";

export const metadata: Metadata = {
  title: "כתיבה — Saylo",
};

export default async function WritingPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("writing_prompts")
    .select("*")
    .eq("status", "published")
    .order("sort_order");
  const prompts: WritingPrompt[] = data ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">כתיבה</h1>
        <p className="mt-2 text-muted">כתבו טקסט קצר באנגלית, וקבלו משוב אישי ממורה ה-AI</p>
      </div>

      {prompts.length === 0 ? (
        <p className="mt-10 text-muted">אין עדיין נושאי כתיבה זמינים — יתווספו בקרוב.</p>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {prompts.map((p, i) => (
            <ContentCard key={p.id} href={`/writing/${p.id}`} index={i}>
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg">{p.title_he}</h2>
                <CefrBadge level={p.cefr_level} />
              </div>
              <EnglishText as="p" className="mt-1 text-sm text-muted">
                {p.prompt_en}
              </EnglishText>
            </ContentCard>
          ))}
        </div>
      )}
    </div>
  );
}
