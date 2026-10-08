import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText, Headphones, Feather, BookOpen, PenLine, ChevronLeft, type LucideIcon } from "lucide-react";
import { BAGRUT_SKILLS, BAGRUT_SKILL_KIND_LABEL, type BagrutSkillKind } from "@/lib/content/bagrut/skills";

export const metadata: Metadata = {
  title: "מיומנויות לבגרות — Saylo",
};

const KIND_ORDER: BagrutSkillKind[] = ["reading", "listening", "literature", "vocabulary", "writing"];

const KIND_ICON: Record<BagrutSkillKind, LucideIcon> = {
  reading: BookOpenText,
  listening: Headphones,
  literature: Feather,
  vocabulary: BookOpen,
  writing: PenLine,
};

export default function BagrutSkillsIndexPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">מיומנויות לבחינה</h1>
      <p className="mt-2 text-muted leading-relaxed max-w-prose">
        כל מה שהשאלונים בודקים, מיומנות אחר מיומנות: מה זה בודק, איך ניגשים, מה המלכודות הנפוצות, ודוגמה פתורה שאפשר
        לנסות.
      </p>

      <div className="mt-8 space-y-10">
        {KIND_ORDER.map((kind) => {
          const skills = BAGRUT_SKILLS.filter((s) => s.kind === kind);
          if (skills.length === 0) return null;
          const Icon = KIND_ICON[kind];
          return (
            <section key={kind} aria-labelledby={`kind-${kind}`}>
              <h2 id={`kind-${kind}`} className="flex items-center gap-2 text-lg font-bold">
                <Icon size={18} aria-hidden="true" className="text-primary" />
                {BAGRUT_SKILL_KIND_LABEL[kind]}
              </h2>
              <ul className="mt-3 bg-card border border-card-border rounded-lg divide-y divide-card-border overflow-hidden">
                {skills.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/bagrut/skills/${s.slug}`}
                      className="game-press group flex items-center gap-4 p-4 hover:bg-background-2 transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
                    >
                      <span className="flex-1 min-w-0">
                        <span className="block font-bold">{s.titleHe}</span>
                        <span className="mt-0.5 block text-sm text-muted leading-snug">{s.summaryHe}</span>
                      </span>
                      <span dir="ltr" className="chyron shrink-0 text-sm text-muted tracking-wide">
                        {s.modules.join(" ")}
                      </span>
                      <ChevronLeft size={18} aria-hidden="true" className="text-muted shrink-0 transition-transform group-hover:-translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
