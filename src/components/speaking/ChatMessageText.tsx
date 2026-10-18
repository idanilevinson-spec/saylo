import { wordAtPoint } from "@/components/speaking/WordLookup";

// A chat message is English, but the teacher answers Hebrew questions in
// Hebrew and glosses words for beginners ("a receipt (קבלה)"), and a
// learner may write in Hebrew when stuck. Each paragraph takes its
// direction from its own first letter, so an English line reads left to
// right and a Hebrew line right to left, in the same bubble.
//
// With onTapWord, tapping an English word reports it with its sentence
// (the teacher's messages, for the tap-to-translate card).
export default function ChatMessageText({
  text,
  className = "",
  onTapWord,
}: {
  text: string;
  className?: string;
  onTapWord?: (word: string, sentence: string) => void;
}) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim());
  return (
    <div
      className={`font-content leading-relaxed space-y-2 ${className}`}
      onClick={
        onTapWord
          ? (e) => {
              // Selecting text to copy it is not a tap.
              if (!window.getSelection()?.isCollapsed) return;
              const hit = wordAtPoint(e.clientX, e.clientY);
              if (hit) onTapWord(hit.word, hit.sentence);
            }
          : undefined
      }
    >
      {paragraphs.map((p, i) => (
        <p key={i} dir="auto" className="text-start whitespace-pre-line" style={{ unicodeBidi: "plaintext" }}>
          {p}
        </p>
      ))}
    </div>
  );
}
