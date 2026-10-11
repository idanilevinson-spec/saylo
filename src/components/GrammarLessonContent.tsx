import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { createElement, type ReactNode } from "react";

interface GrammarLessonContentProps {
  bodyMd: string;
}

interface HastNode {
  type: string;
  value?: string;
  children?: HastNode[];
}

function textOf(node: HastNode | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

const HEBREW = /[\u0590-\u05FF]/;
const LATIN = /[A-Za-z]/;

// Which way a line of lesson prose runs, decided per line from its text.
// The CSS default (unicode-bidi: plaintext) goes by the first letter, which
// breaks the most common lesson line: an English term followed by its
// Hebrew explanation ("I am: עם "אני" (לרוב מתקצר ל-I'm)") gets laid out
// left to right and its Hebrew and brackets come out scrambled. So:
//  - no Hebrew at all: an English example, left to right;
//  - opens with a full English sentence and then a Hebrew gloss
//    ("I wish I had studied harder. (לא למדתי מספיק)"): left to right;
//  - anything else with Hebrew in it is explanation: right to left.
// A right-to-left line that ends inside English ("...: Do you have any
// milk?") gets an invisible left-to-right mark at its end so the closing
// punctuation stays with the English sentence instead of jumping to the
// far side of it. Checked against every published lesson line.
const SENTENCE_END = /[A-Za-z0-9'\u2019"\u201D)][.?!]/;
const STRONG = /[A-Za-z\u0590-\u05FF]/g;

export function lessonLineDir(text: string): { dir?: "rtl" | "ltr"; endMark: boolean } {
  const t = text.trim();
  if (!HEBREW.test(t)) return { dir: LATIN.test(t) ? "ltr" : undefined, endMark: false };
  const lead = t.slice(0, t.search(HEBREW));
  if (LATIN.test(lead) && SENTENCE_END.test(lead)) return { dir: "ltr", endMark: false };
  const lastStrong = t.match(STRONG)?.pop() ?? "";
  return { dir: "rtl", endMark: LATIN.test(lastStrong) && /[^\sA-Za-z0-9]$/.test(t) };
}

// An explicit direction must also switch off the CSS `plaintext`, which
// otherwise ignores dir and goes by the first letter again.
function directed(tag: "p" | "li" | "td" | "th") {
  function Directed({ node, children }: { node?: unknown; children?: ReactNode }) {
    const { dir, endMark } = lessonLineDir(textOf(node as HastNode));
    if (!dir) return createElement(tag, null, children);
    return createElement(
      tag,
      { dir, lang: dir === "ltr" ? "en" : undefined, style: { unicodeBidi: "isolate" } },
      children,
      endMark ? "\u200E" : null
    );
  }
  return Directed;
}

const COMPONENTS: Components = {
  p: directed("p"),
  li: directed("li"),
  td: directed("td"),
  th: directed("th"),
};

// Lesson prose mixes Hebrew explanation with English examples; every line
// gets the direction of what it actually is (lessonLineDir above).
export default function GrammarLessonContent({ bodyMd }: GrammarLessonContentProps) {
  return (
    <div className="lesson prose prose-neutral max-w-none" style={{ unicodeBidi: "plaintext" }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {bodyMd}
      </ReactMarkdown>
    </div>
  );
}
