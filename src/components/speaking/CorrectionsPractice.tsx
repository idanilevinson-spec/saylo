"use client";

import { useState } from "react";
import { CheckCircle2, Eye, XCircle } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import { ENGLISH_TEXT_INPUT } from "@/lib/utils/inputProps";
import { normalizeAnswer } from "@/lib/exercises/grade";
import type { ConversationFix } from "@/lib/ai/conversationFix";

// After a conversation: every correction the teacher made, as a short
// drill. The learner writes the sentence again the right way; seeing the
// fix once in a card is easy to forget, producing it yourself is what
// makes it stick. Checked on the spot, nothing is sent anywhere.

// "I went to the beach... we ate ice cream": the teacher shortens long
// sentences with "...", which nobody types back.
const comparable = (s: string) => normalizeAnswer(s.replace(/\.{3}|…/g, " "));

export function isCorrectRewrite(answer: string, fix: ConversationFix): boolean {
  // The fix is often a fragment ("I went to the beach") and the learner
  // writes the whole sentence ("Yesterday I went to the beach"): right if
  // the corrected words are all there, in order.
  const given = ` ${comparable(answer)} `;
  return given.includes(` ${comparable(fix.better)} `);
}

function CorrectionDrill({ fix, index }: { fix: ConversationFix; index: number }) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const [revealed, setRevealed] = useState(false);

  function check() {
    if (!answer.trim()) return;
    setResult(isCorrectRewrite(answer, fix) ? "right" : "wrong");
  }

  return (
    <li className="rounded-lg border border-card-border bg-card p-4">
      <p className="text-xs font-bold text-muted">משפט {index + 1}</p>
      <EnglishText as="p" className="mt-1 text-danger line-through decoration-danger/60">
        {fix.original}
      </EnglishText>
      {fix.why && <p className="mt-1 text-sm text-muted">{fix.why}</p>}

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          {...ENGLISH_TEXT_INPUT}
          aria-label={`כתבו את המשפט ${index + 1} בצורה הנכונה`}
          placeholder="Write it the right way"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setResult(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && check()}
          disabled={result === "right"}
          className="min-w-0 flex-1 rounded-lg border border-card-border bg-background px-3 py-2 font-content focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-70"
        />
        <button
          type="button"
          onClick={check}
          disabled={!answer.trim() || result === "right"}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-ink hover:bg-primary-hover transition-colors disabled:opacity-40"
        >
          בדיקה
        </button>
      </div>

      <div aria-live="polite">
        {result === "right" && (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-success">
            <CheckCircle2 size={15} aria-hidden="true" /> נכון.
          </p>
        )}
        {result === "wrong" && !revealed && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-danger">
            <XCircle size={15} aria-hidden="true" /> עוד לא. נסו שוב, או הציגו את התשובה.
          </p>
        )}
      </div>

      {result !== "right" &&
        (revealed ? (
          <EnglishText as="p" className="mt-2 font-bold text-success">
            {fix.better}
          </EnglishText>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-2 flex items-center gap-1 text-xs text-muted hover:text-foreground"
          >
            <Eye size={13} aria-hidden="true" /> הציגו את התשובה
          </button>
        ))}
    </li>
  );
}

export default function CorrectionsPractice({ fixes }: { fixes: ConversationFix[] }) {
  if (!fixes.length) return null;
  return (
    <section aria-labelledby="corrections-title" className="mt-6">
      <h2 id="corrections-title" className="font-bold">
        התיקונים מהשיחה ({fixes.length})
      </h2>
      <p className="mt-0.5 text-sm text-muted">כתבו כל משפט מחדש, בצורה הנכונה. ככה התיקון נשאר.</p>
      <ol className="mt-3 space-y-3">
        {fixes.map((fix, i) => (
          <CorrectionDrill key={i} fix={fix} index={i} />
        ))}
      </ol>
    </section>
  );
}
