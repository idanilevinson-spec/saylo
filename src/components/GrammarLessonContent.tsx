import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface GrammarLessonContentProps {
  bodyMd: string;
}

// Lesson prose mixes Hebrew explanation with inline English examples.
// unicode-bidi: plaintext lets each paragraph pick its own direction per the
// Unicode Bidi Algorithm instead of forcing everything into the page's RTL
// flow, which is the right default for this kind of mixed-language prose —
// unlike vocabulary/UI chrome, which always goes through EnglishText instead.
export default function GrammarLessonContent({ bodyMd }: GrammarLessonContentProps) {
  return (
    <div className="prose prose-neutral max-w-none" style={{ unicodeBidi: "plaintext" }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyMd}</ReactMarkdown>
    </div>
  );
}
