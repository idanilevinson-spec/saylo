import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import WritingCoachForm from "@/components/WritingCoachForm";
import { createClient } from "@/lib/supabase/serverClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPrompt(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("writing_prompts").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const prompt = await getPrompt(id);
  return { title: prompt ? `${prompt.title_he} — כתיבה` : "כתיבה" };
}

export default async function WritingPromptPage({ params }: PageProps) {
  const { id } = await params;
  const prompt = await getPrompt(id);
  if (!prompt) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/writing" className="text-sm text-primary">
        ← כל נושאי הכתיבה
      </Link>

      <div className="animate-fade-up">
        <div className="mt-4 flex items-center gap-3">
          <h1 className="text-3xl font-bold">{prompt.title_he}</h1>
          <CefrBadge level={prompt.cefr_level} />
        </div>
      </div>

      <div className="mt-6 bg-card border border-card-border rounded-2xl p-6">
        <EnglishText as="p" className="text-lg leading-relaxed text-left">
          {prompt.prompt_en}
        </EnglishText>
      </div>

      <div className="mt-6">
        <WritingCoachForm writingPromptId={prompt.id} />
      </div>
    </div>
  );
}
