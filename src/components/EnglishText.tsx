import type { ElementType, ReactNode } from "react";

interface EnglishTextProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

// Every piece of English learning content (a word, a sentence, an exercise
// prompt) renders through this one component instead of a bare span, so any
// bidi/RTL bug is fixed here once rather than scattered across every page.
export default function EnglishText({ children, as: Tag = "span", className = "" }: EnglishTextProps) {
  return (
    <Tag dir="ltr" lang="en" className={`font-content ${className}`}>
      {children}
    </Tag>
  );
}
