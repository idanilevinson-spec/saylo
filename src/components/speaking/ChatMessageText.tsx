// A chat message is English, but the teacher answers Hebrew questions in
// Hebrew and glosses words for beginners ("a receipt (קבלה)"), and a
// learner may write in Hebrew when stuck. Each paragraph takes its
// direction from its own first letter, so an English line reads left to
// right and a Hebrew line right to left, in the same bubble.
export default function ChatMessageText({ text, className = "" }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim());
  return (
    <div className={`font-content leading-relaxed space-y-2 ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i} dir="auto" className="text-start whitespace-pre-line" style={{ unicodeBidi: "plaintext" }}>
          {p}
        </p>
      ))}
    </div>
  );
}
