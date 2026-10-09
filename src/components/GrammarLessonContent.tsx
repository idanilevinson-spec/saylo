import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";

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

// Lesson prose mixes Hebrew explanation with English examples. Each line
// picks its own direction (see .lesson in globals.css); list items that are
// English examples are also marked ltr, so their bullet sits next to the
// sentence instead of across the line on the Hebrew side.
export default function GrammarLessonContent({ bodyMd }: GrammarLessonContentProps) {
  return (
    <div className="lesson prose prose-neutral max-w-none" style={{ unicodeBidi: "plaintext" }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          li: ({ node, children }: { node?: unknown; children?: ReactNode }) => {
            const text = textOf(node as HastNode).trim();
            const english = /^[A-Za-z"'(]/.test(text);
            return english ? (
              <li dir="ltr" lang="en">
                {children}
              </li>
            ) : (
              <li>{children}</li>
            );
          },
        }}
      >
        {bodyMd}
      </ReactMarkdown>
    </div>
  );
}
