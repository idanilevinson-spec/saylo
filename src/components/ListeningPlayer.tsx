"use client";

import { useState } from "react";
import { Volume2, Play, Pause, Loader2 } from "lucide-react";
import { useNeuralSpeech, NEURAL_SPEECH_RATES } from "@/lib/speech/useNeuralSpeech";
import EnglishText from "@/components/EnglishText";

interface ListeningPlayerProps {
  transcriptEn: string;
}

export default function ListeningPlayer({ transcriptEn }: ListeningPlayerProps) {
  const [showTranscript, setShowTranscript] = useState(false);
  const { state: playback, rate, togglePlayPause, setRate } = useNeuralSpeech([transcriptEn]);

  return (
    <div className="bg-card border border-card-border rounded-lg p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={togglePlayPause}
          disabled={playback === "loading"}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          {playback === "loading" && <Loader2 size={16} className="animate-spin" />}
          {playback === "playing" && <Pause size={16} />}
          {playback === "paused" && <Play size={16} />}
          {playback === "idle" && <Volume2 size={16} />}
          {playback === "loading"
            ? "טוען השמעה..."
            : playback === "playing"
              ? "השהו"
              : playback === "paused"
                ? "המשיכו"
                : "השמעה"}
        </button>

        <div className="flex items-center gap-1 text-xs">
          {NEURAL_SPEECH_RATES.map((r) => (
            <button
              key={r}
              onClick={() => setRate(r)}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                rate === r ? "bg-primary/15 text-primary" : "text-muted hover:bg-background-2"
              }`}
            >
              {r}x
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowTranscript((s) => !s)}
          aria-expanded={showTranscript}
          className="px-5 py-2.5 rounded-lg border border-card-border font-medium hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          {showTranscript ? "הסתירו תמלול" : "הציגו תמלול"}
        </button>
      </div>

      {showTranscript && (
        <EnglishText as="p" className="mt-6 text-lg leading-loose text-left">
          {transcriptEn}
        </EnglishText>
      )}
    </div>
  );
}
