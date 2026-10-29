"use client";

import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";

// The assistant's replies as Markdown. Its own chunk, loaded only when the
// panel opens (see SupportChat), so the Markdown stack isn't downloaded on
// every page for a chat most visitors never open.
export default function SupportMarkdown({ text, onInternalLink }: { text: string; onInternalLink: () => void }) {
  const components: Components = {
    a: ({ href, children }) => {
      if (href?.startsWith("/")) {
        return (
          <Link
            href={href}
            onClick={onInternalLink}
            className="text-primary underline underline-offset-2 decoration-primary/40 hover:decoration-primary"
          >
            {children}
          </Link>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
          {children}
        </a>
      );
    },
    p: ({ children }) => <p className="[&:not(:first-child)]:mt-2">{children}</p>,
    ul: ({ children }) => <ul className="mt-2 list-disc ps-5 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="mt-2 list-decimal ps-5 space-y-1">{children}</ol>,
  };
  return (
    <ReactMarkdown components={components} skipHtml allowedElements={["p", "a", "strong", "em", "ul", "ol", "li", "br", "code"]} unwrapDisallowed>
      {text}
    </ReactMarkdown>
  );
}
