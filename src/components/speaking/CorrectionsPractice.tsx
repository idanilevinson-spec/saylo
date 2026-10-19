"use client";

import { useState } from "react";
import { CheckCircle2, Eye, Mic, XCircle } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import MixedText from "@/components/MixedText";
import SpeakButton from "@/components/SpeakButton";
import PronunciationRecorder from "@/components/PronunciationRecorder";
import { ENGLISH_TEXT_INPUT } from "@/lib/utils/inputProps";
import type { ConversationFix } from "@/lib/ai/conversationFix";
import { isCorrectRewrite, sayableFix } from "@/lib/speaking/correctionDrill";

// After a conversation: every correction the teacher made, as a short
// drill. The learner writes the sentence again the right way; seeing the
// fix once in a card is easy to forget, producing it yourself is what
// makes it stick. Checked on the spot, nothing is sent anywhere.

function CorrectionDrill({
  fix,
  index,
}: {
  fix: ConversationFix;
  index: number;
}) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [aloud, setAloud] = useState(false);
  const sayable = sayableFix(fix.better);

  function check() {
    if (!answer.trim()) return;
    setResult(isCorrectRewrite(answer, fix) ? "right" : "wrong");
  }

  return (
    <li className="rounded-lg border border-card-border bg-card p-4">
      <p className="text-xs font-bold text-muted">משפט {index + 1}</p>
      <EnglishText
        as="p"
        className="mt-1 text-danger line-through decoration-danger/60"
      >
        {fix.original}
      </EnglishText>
      {fix.why && (
        <p className="mt-1 text-sm text-muted">
          <MixedText>{fix.why}</MixedText>
        </p>
      )}

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
            <XCircle size={15} aria-hidden="true" /> עוד לא. נסו שוב, או הציגו
            את התשובה.
          </p>
        )}
      </div>

      {result !== "right" &&
        (revealed ? (
          // Once practising aloud, the sentence shows there (with audio) instead.
          !aloud && (
            <EnglishText as="p" className="mt-2 font-bold text-success">
              {fix.better}
            </EnglishText>
          )
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-2 flex items-center gap-1 text-xs text-muted hover:text-foreground"
          >
            <Eye size={13} aria-hidden="true" /> הציגו את התשובה
          </button>
        ))}

      {/* Written right; now said right. Scored against this exact
          sentence, so the feedback is about how it sounded. */}
      {(result === "right" || revealed) &&
        (aloud ? (
          <div className="mt-3 border-t border-card-border pt-3">
            <div dir="ltr" className="flex items-center justify-end gap-2">
              <EnglishText className="font-medium">{sayable}</EnglishText>
              <SpeakButton text={sayable} className="p-1" />
            </div>
            <div className="mt-2">
              <PronunciationRecorder targetPhrase={sayable} hidePhrase />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAloud(true)}
            className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Mic size={14} aria-hidden="true" /> ועכשיו בקול
          </button>
        ))}
    </li>
  );
}

export default function CorrectionsPractice({
  fixes,
}: {
  fixes: ConversationFix[];
}) {
  if (!fixes.length) return null;
  return (
    <section aria-labelledby="corrections-title" className="mt-6">
      <h2 id="corrections-title" className="font-bold">
        התיקונים מהשיחה ({fixes.length})
      </h2>
      <p className="mt-0.5 text-sm text-muted">
        כתבו כל משפט מחדש, בצורה הנכונה. ככה התיקון נשאר.
      </p>
      <ol className="mt-3 space-y-3">
        {fixes.map((fix, i) => (
          <CorrectionDrill key={i} fix={fix} index={i} />
        ))}
      </ol>
    </section>
  );
}
