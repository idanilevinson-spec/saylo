// Pluggable interface for a real speech provider (STT/TTS/pronunciation
// scoring), wired in once one is chosen and funded. Nothing calls this yet —
// src/lib/speech/browserTts.ts (zero-cost Web Speech API) covers playback
// for now. This exists so mic-based features can be built against a stable
// contract without a rewrite once a provider is selected.

export interface TranscriptionResult {
  text: string;
  confidence?: number;
}

export interface PronunciationWordScore {
  word: string;
  score: number; // 0-100
}

export interface PronunciationScore {
  overallScore: number; // 0-100
  wordScores?: PronunciationWordScore[];
  feedback?: string;
}

export interface SpeechProvider {
  transcribe(audio: Blob | ArrayBuffer): Promise<TranscriptionResult>;
  synthesize(text: string): Promise<Blob | ArrayBuffer>;
  scorePronunciation(audio: Blob | ArrayBuffer, targetText: string): Promise<PronunciationScore>;
}
