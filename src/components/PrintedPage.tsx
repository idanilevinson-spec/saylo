import type { ReactNode } from "react";

interface PrintedPageProps {
  // The running head: a Hebrew label on the reading-start side, the
  // English title on the other, like the top of a printed exam booklet.
  label?: ReactNode;
  titleEn?: string;
  children: ReactNode;
  className?: string;
}

// A long English text set as a printed page: paper, a margin rule, numbered
// paragraphs in the margin (Bagrut questions say "paragraph 2", so the number
// is information, not decoration) and a few sheets underneath. One page that
// scrolls, never a spread that flips: a learner re-reads while answering,
// and a phone has no room for two columns of text.
export default function PrintedPage({ label, titleEn, children, className = "" }: PrintedPageProps) {
  return (
    <article className={`printed-page ${className}`}>
      {(label || titleEn) && (
        <header className="printed-page-head">
          {label && <span className="font-bold">{label}</span>}
          {titleEn && (
            <span dir="ltr" lang="en" className="font-content printed-page-title">
              {titleEn}
            </span>
          )}
        </header>
      )}
      <div dir="ltr" lang="en" className="printed-page-body font-content">
        {children}
      </div>
      <span aria-hidden="true" className="printed-page-end" />
    </article>
  );
}
