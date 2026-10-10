import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// For visitors who want to look before signing up: the public grammar,
// vocabulary, level and Bagrut pages. Counts are passed in from the live
// content, so the numbers here are always the real ones.
export default function LandingFreeResources({ grammarTopics, words }: { grammarTopics: number; words: number }) {
  const items = [
    { href: "/english-grammar", title: "דקדוק באנגלית", detail: `${grammarTopics} נושאים, לכל אחד הסבר בעברית ודוגמאות` },
    { href: "/english-vocabulary", title: "אוצר מילים לפי נושא", detail: `${words} מילים עם תרגום, הגייה ומשפט לדוגמה` },
    { href: "/english-level-test", title: "מה לומדים בכל רמה", detail: "מ-A1 עד C2, עם המילים והנושאים של כל רמה" },
    { href: "/english-bagrut", title: "הכנה לבגרות", detail: "איך בנוי כל שאלון, A עד G, ומה הוא בודק" },
  ];

  return (
    <section aria-labelledby="free-title" className="px-4 pb-20 sm:pb-24">
      <div className="max-w-4xl mx-auto">
        <h2 id="free-title" className="text-2xl sm:text-3xl font-black tracking-tight">
          אפשר להציץ גם בלי חשבון
        </h2>
        <p className="mt-2 max-w-xl text-muted leading-relaxed">ההסברים והמילים שבאפליקציה פתוחים לכולם. התרגול, החזרה והמורה מחכים אחרי ההרשמה.</p>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-lg border border-card-border bg-card px-4 py-3.5 hover:border-primary/50 transition-colors"
              >
                <span className="min-w-0">
                  <span className="block font-bold">{item.title}</span>
                  <span className="block text-sm text-muted">{item.detail}</span>
                </span>
                <ChevronLeft size={16} aria-hidden="true" className="shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
