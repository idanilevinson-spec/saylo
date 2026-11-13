"use client";

import { Mic, Square, RotateCcw, ChevronLeft } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import { useLongAnswerRecognition } from "@/lib/speech/useLongAnswerRecognition";
import {
  formatSeconds,
  MAX_ANSWER_SECONDS,
  PART_B_MIN_SECONDS,
  PART_B_TARGET_SECONDS,
  partBLengthDeduction,
} from "@/lib/bagrut/oralRules";

export interface RecordedAnswer {
  transcript: string;
  seconds: number;
}

// One question set: the questions, one recording (re-recording replaces it,
// as in the real exam), and for Part B the length meter.
export default function OralRecorder({
  questions,
  lengthMeter = false,
  onDone,
}: {
  questions: string[];
  lengthMeter?: boolean;
  onDone: (answer: RecordedAnswer) => void;
}) {
  const rec = useLongAnswerRecognition(MAX_ANSWER_SECONDS);
  const recording = rec.status === "listening";

  return (
    <div>
      <ol className="space-y-2.5">
        {questions.map((q, i) => (
          <li key={i} className="flex gap-3 rounded-lg border border-card-border bg-background-2 px-4 py-3">
            <span className="mt-0.5 shrink-0 text-sm font-bold text-muted tabular-nums" aria-hidden="true">
              {i + 1}
            </span>
            <EnglishText as="p" className="min-w-0 flex-1 font-medium leading-relaxed">
              {q}
            </EnglishText>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-sm text-muted">עונים על כל השאלות בהקלטה אחת, בפירוט ועם דוגמאות.</p>

      {lengthMeter && (rec.status === "listening" || rec.status === "finishing" || rec.status === "done") && (
        <LengthMeter seconds={rec.seconds} />
      )}

      <div className="mt-6">
        {rec.status === "idle" && (
          <button
            type="button"
            onClick={rec.start}
            className="game-press inline-flex items-center gap-2 min-h-12 px-6 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <Mic size={18} aria-hidden="true" /> להתחיל להקליט
          </button>
        )}

        {rec.status === "connecting" && <p className="text-sm text-muted">מתחברים למיקרופון...</p>}

        {recording && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 min-h-12 px-4 rounded-lg bg-danger/12 text-danger-hover font-bold">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-danger motion-safe:animate-pulse" />
              מקליטים
              <span className="tabular-nums" aria-label={`${rec.seconds} שניות`}>
                {formatSeconds(rec.seconds)}
              </span>
            </span>
            <button
              type="button"
              onClick={rec.stop}
              className="game-press inline-flex items-center gap-2 min-h-12 px-5 rounded-lg border border-card-border bg-card font-bold hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <Square size={15} fill="currentColor" aria-hidden="true" /> סיימתי
            </button>
            <span className="text-xs text-muted">ההקלטה נעצרת לבד אחרי {formatSeconds(MAX_ANSWER_SECONDS)}</span>
          </div>
        )}

        {rec.status === "finishing" && <p className="text-sm text-muted">מסיימים את ההקלטה...</p>}

        {rec.status === "error" && (
          <div className="text-sm">
            <p role="alert" className="text-danger-hover">
              {rec.errorMessage}
            </p>
            {!rec.permissionDenied && (
              <button type="button" onClick={rec.start} className="mt-2 font-bold text-primary-hover hover:underline">
                להקליט שוב
              </button>
            )}
          </div>
        )}
      </div>

      {/* What the recognizer heard so far, so a wrong microphone shows up
          in the first seconds rather than after two minutes. */}
      {(recording || rec.status === "finishing") && (rec.transcript || rec.interim) && (
        <div className="mt-4 rounded-lg border border-card-border bg-card px-4 py-3">
          <p className="text-xs text-muted">מה שנקלט עד עכשיו</p>
          <EnglishText as="p" className="mt-1 text-sm leading-relaxed">
            {rec.transcript} <span className="text-muted">{rec.interim}</span>
          </EnglishText>
        </div>
      )}

      {rec.status === "done" && (
        <div className="mt-4">
          <div className="rounded-lg border border-card-border bg-card px-4 py-3">
            <p className="text-xs text-muted">
              כך המערכת שמעה את התשובה שלכם (אורך {formatSeconds(rec.seconds)}):
            </p>
            <EnglishText as="p" className="mt-1 leading-relaxed">
              {rec.transcript}
            </EnglishText>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onDone({ transcript: rec.transcript, seconds: rec.seconds })}
              className="game-press inline-flex items-center gap-2 min-h-12 px-6 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              להמשיך <ChevronLeft size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={rec.start}
              className="game-press inline-flex items-center gap-2 min-h-12 px-5 rounded-lg border border-card-border bg-card font-bold hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <RotateCcw size={15} aria-hidden="true" /> להקליט מחדש
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">הקלטה חדשה מחליפה את הקודמת, כמו בבחינה.</p>
        </div>
      )}
    </div>
  );
}

// Part B: one to two minutes. The track shows the full recording window;
// the 1:00-2:00 band is where the answer loses nothing.
function LengthMeter({ seconds }: { seconds: number }) {
  const deduction = partBLengthDeduction(seconds);
  const pct = (s: number) => `${(s / MAX_ANSWER_SECONDS) * 100}%`;
  const message =
    seconds < PART_B_MIN_SECONDS
      ? `עוד ${PART_B_MIN_SECONDS - seconds} שניות עד הדקה הראשונה${deduction > 0 ? `. עכשיו זה ${deduction === 1 ? "בלי ניקוד על פיתוח הנושא" : `הורדה של ${Math.round(deduction * 100)}% מפיתוח הנושא`}` : ""}`
      : seconds <= PART_B_TARGET_SECONDS
        ? "באורך הנכון. אפשר לסיים בכל רגע עד שתי דקות."
        : "עברתם את שתי הדקות. כדאי לסגור במשפט אחד.";
  // The page is right-to-left, so time runs from the right edge.
  return (
    <div className="mt-5">
      <div className="relative h-3 overflow-hidden rounded-full bg-background-2 border border-card-border">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 bg-success/25"
          style={{ insetInlineStart: pct(PART_B_MIN_SECONDS), width: `calc(${pct(PART_B_TARGET_SECONDS)} - ${pct(PART_B_MIN_SECONDS)})` }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-y-0 start-0 w-full origin-right bg-primary/80 transition-transform duration-300"
          style={{ transform: `scaleX(${Math.min(1, seconds / MAX_ANSWER_SECONDS)})` }}
        />
      </div>
      <div className="relative mt-1.5 h-4 text-xs text-muted tabular-nums" aria-hidden="true">
        <span className="absolute start-0">0:00</span>
        {/* Anchored by its right edge (inline start), so half its width to the right centres it. */}
        {[PART_B_MIN_SECONDS, PART_B_TARGET_SECONDS].map((s) => (
          <span key={s} className="absolute translate-x-1/2" style={{ insetInlineStart: pct(s) }}>
            {formatSeconds(s)}
          </span>
        ))}
        <span className="absolute end-0">{formatSeconds(MAX_ANSWER_SECONDS)}</span>
      </div>
      <p className={`mt-1 text-sm ${seconds >= PART_B_MIN_SECONDS && seconds <= PART_B_TARGET_SECONDS ? "text-success-hover" : "text-muted"}`}>
        {message}
      </p>
    </div>
  );
}
