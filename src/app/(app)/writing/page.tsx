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
      <div className="relative -mx-4 px-4 pb-2 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-16 h-48 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at 20% 30%, color-mix(in srgb, var(--primary) 11%, transparent) 0%, transparent 65%), radial-gradient(ellipse 45% 100% at 85% 10%, color-mix(in srgb, var(--accent) 9%, transparent) 0%, transparent 60%)",
          }}
        />
        <div className="animate-fade-up">
          <span className="block text-xs font-bold tracking-[0.14em] uppercase text-accent-hover mb-2">ביטוי בכתב</span>
          <h1 className="text-3xl font-bold">כתיבה</h1>
          <p className="mt-2 text-muted">כתבו טקסט קצר באנגלית, וקבלו משוב אישי ממורה ה-AI</p>
        </div>
      </div>

      {prompts.length === 0 ? (
        <p className="mt-10 text-muted">אין עדיין נושאי כתיבה זמינים — יתווספו בקרוב.</p>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {prompts.map((p, i) => (
            <ContentCard key={p.id} href={`/writing/${p.id}`} index={i}>
              <div className="flex flex-col items-start gap-1.5">
                <EnglishText as="h2" className="text-lg font-bold">
                  {p.prompt_en}
                </EnglishText>
                <p className="text-sm font-medium text-foreground/70">{p.title_he}</p>
                <CefrBadge level={p.cefr_level} />
              </div>
            </ContentCard>
          ))}
        </div>
      )}
    </div>
  );
}
