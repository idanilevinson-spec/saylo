"use client";

import { Volume2 } from "lucide-react";
import { speak } from "@/lib/speech/browserTts";

interface SpeakButtonProps {
  text: string;
  className?: string;
}

export default function SpeakButton({ text, className = "" }: SpeakButtonProps) {
  return (
    <button
      onClick={() => speak(text)}
      aria-label={`השמע הגייה של ${text}`}
      className={`text-primary hover:text-primary-hover transition-colors ${className}`}
    >
      <Volume2 size={16} />
    </button>
  );
}
