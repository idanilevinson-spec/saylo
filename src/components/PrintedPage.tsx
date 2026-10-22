import type { ReactNode } from "react";

interface PrintedPageProps {
  // The running head: a Hebrew label on the reading-start side, the
  // English title on the other, like the top of a printed exam booklet.
  label?: ReactNode;
  titleEn?: string;
  // "story" binds the page into a hardcover book: a cover around it, the
  // binding's shadow on the spine side, a book face, and an opening title.
  // "booklet" (the default) is a plain exam sheet, for Bagrut passages.
  variant?: "booklet" | "story";
  storyTitle?: string;
  children: ReactNode;
  className?: string;
}

// A story opens on a drop cap: the first letter, the rest of its word, and
// what follows. Null when the text doesn't open on a capital letter.
export function splitDropCap(text: string): [string, string, string] | null {
  const m = text.match(/^([A-Z])([A-Za-z']*)([\s\S]*)$/);
  return m ? [m[1], m[2], m[3]] : null;
}

// The first letter set large. Letter and word sit side by side with no
// space between, so the word still reads (and is found) as one word.
export function DropCap({ letter }: { letter: string }) {
  return <span className="story-dropcap">{letter}</span>;
}

// A long English text set as a printed page: paper, numbered paragraphs in
// the margin (Bagrut questions say "paragraph 2", so the number is
// information, not decoration) and a few sheets underneath. One page that
// scrolls, never a spread that flips: a learner re-reads while answering,
// and a phone has no room for two columns of text.
export default function PrintedPage({ label, titleEn, variant = "booklet", storyTitle, children, className = "" }: PrintedPageProps) {
  const story = variant === "story";
  const page = (
    <article className={`printed-page ${story ? "printed-page-story" : ""} ${story ? "" : className}`}>
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
      {story && storyTitle && (
        <div className="story-opening">
          <h2 dir="ltr" lang="en" className="story-title">
            {storyTitle}
          </h2>
          <span aria-hidden="true" className="story-ornament" />
        </div>
      )}
      <div dir="ltr" lang="en" className="printed-page-body font-content">
        {children}
      </div>
      <span aria-hidden="true" className="printed-page-end" />
    </article>
  );
  if (!story) return page;
  return (
    <div className={`story-book ${className}`}>
      {page}
      <span aria-hidden="true" className="story-ribbon" />
    </div>
  );
}
