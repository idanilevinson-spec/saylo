"use client";

import { Loader2, Turtle, Volume2 } from "lucide-react";
import { useNeuralSpeech } from "@/lib/speech/useNeuralSpeech";

// "Play" and "slowly" for a single sentence (dictations, listening items in
// the placement test). Uses the same Azure neural voice as the listening
// clips, so a dictation taken from a clip sounds like the clip, and falls
// back to the browser's voice when Azure isn't available.
const SLOW_RATE = 0.6;

const buttonClass =
  "flex items-center gap-1.5 px-4 py-2 rounded-lg border border-card-border hover:border-primary/40 transition-[border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 active:scale-[0.98] disabled:opacity-60";

export default function SentenceAudioButtons({ text }: { text: string }) {
  const { state, rate, play, setRate } = useNeuralSpeech([text]);
  const loading = state === "loading";

  function playAt(r: number) {
    setRate(r);
    play(0);
  }

  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => playAt(1)} disabled={loading} className={buttonClass}>
        {loading && rate === 1 ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />} השמעה
      </button>
      <button type="button" onClick={() => playAt(SLOW_RATE)} disabled={loading} className={buttonClass}>
        {loading && rate === SLOW_RATE ? <Loader2 size={16} className="animate-spin" /> : <Turtle size={16} />} לאט
      </button>
    </div>
  );
}
