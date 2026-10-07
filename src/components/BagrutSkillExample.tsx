"use client";

import { useState } from "react";
import { Eye, Lightbulb } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import { ChoiceGrid, SpeakButton } from "@/components/games/GameKit";
import type { BagrutSkill } from "@/lib/content/bagrut/skills";

// The worked example on a skill page: a multiple-choice example is answered
// first and explained after; an open/writing one shows the model answer on
// demand. Self-check only — nothing is graded or saved.
export default function BagrutSkillExample({ skill }: { skill: BagrutSkill }) {
  const { example } = skill;
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const isMcq = !!example.options && example.correctOptionIndex !== undefined;
  const answered = isMcq ? selected !== null : revealed;

  return (
    <div>
      {example.passageEn && (
        <div className="rounded-lg bg-background-2 p-4">
          {skill.kind === "listening" && (
            <div className="mb-3 flex items-center gap-2 text-sm text-muted">
              <SpeakButton text={example.passageEn} label="השמעת הקטע" />
              בבחינה שומעים את הקטע בלי לראות אותו. נסו קודם להקשיב בלי לקרוא.
            </div>
          )}
          <EnglishText as="p" className="leading-relaxed">
            {example.passageEn}
          </EnglishText>
        </div>
      )}

      <EnglishText as="p" className={`${example.passageEn ? "mt-4" : ""} text-lg font-bold leading-snug`}>
        {example.questionEn}
      </EnglishText>

      {isMcq ? (
        <div className="mt-4">
          <ChoiceGrid
            options={example.options as string[]}
            correctIndex={example.correctOptionIndex as number}
            selected={selected}
            locked={selected !== null}
            onChoose={setSelected}
          />
        </div>
      ) : (
        !revealed && (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="game-press mt-4 inline-flex items-center gap-1.5 min-h-10 px-3.5 rounded-lg border border-card-border text-sm font-medium hover:border-primary/50 transition-[border-color,transform] duration-150"
          >
            <Eye size={15} aria-hidden="true" />
            {skill.kind === "writing" ? "הצגת תשובה לדוגמה" : "הצגת התשובה וההסבר"}
          </button>
        )
      )}

      {answered && (
        <div role="status" className="mt-4 rounded-lg border border-primary/30 bg-primary/[0.05] p-4">
          {example.modelAnswerEn && (
            <EnglishText as="p" className="whitespace-pre-line leading-relaxed">
              {example.modelAnswerEn}
            </EnglishText>
          )}
          <p className={`${example.modelAnswerEn ? "mt-3 border-t border-card-border pt-3" : ""} flex gap-2 text-sm leading-relaxed`}>
            <Lightbulb size={16} aria-hidden="true" className="shrink-0 mt-0.5 text-accent-hover" />
            <span>{example.explanationHe}</span>
          </p>
        </div>
      )}
    </div>
  );
}
