"use client";

import { useState } from "react";
import { speak } from "@/lib/speech/browserTts";
import EnglishText from "@/components/EnglishText";

interface ListeningPlayerProps {
  transcriptEn: string;
}

export default function ListeningPlayer({ transcriptEn }: ListeningPlayerProps) {
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => speak(transcriptEn, 1)}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
        >
          🔊 השמעה
        </button>
        <button
          onClick={() => speak(transcriptEn, 0.6)}
          className="px-5 py-2.5 rounded-xl border border-card-border font-medium hover:bg-background-2 transition-colors"
        >
          🐢 השמעה לאט
        </button>
        <button
          onClick={() => setShowTranscript((s) => !s)}
          className="px-5 py-2.5 rounded-xl border border-card-border font-medium hover:bg-background-2 transition-colors"
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
