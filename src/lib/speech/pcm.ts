// Azure gives the video-teacher path raw 16 kHz, 16-bit mono PCM (the
// format the face renderer takes). The same samples are played locally
// through the call's <audio> element, which needs a container: a 44-byte
// WAV header in front of them.
export const VIDEO_PCM_SAMPLE_RATE = 16000;

export function pcmToWav(pcm: ArrayBuffer, sampleRate = VIDEO_PCM_SAMPLE_RATE): Blob {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const write = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  const bytesPerSample = 2;
  write(0, "RIFF");
  view.setUint32(4, 36 + pcm.byteLength, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true); // byte rate
  view.setUint16(32, bytesPerSample, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  write(36, "data");
  view.setUint32(40, pcm.byteLength, true);
  return new Blob([header, pcm], { type: "audio/wav" });
}

// The renderer takes audio in small pieces; ~0.19 s each.
export function pcmChunks(pcm: ArrayBuffer, size = 6000): Uint8Array[] {
  const bytes = new Uint8Array(pcm);
  const out: Uint8Array[] = [];
  for (let i = 0; i < bytes.length; i += size) out.push(bytes.subarray(i, i + size));
  return out;
}

// SSML for a reply at a given speed. With the video teacher the reply has
// to play at 1x (the face is rendered at the recorded pace), so the speed
// goes into the synthesis instead of the player.
export function rateSsml(text: string, voiceName: string, rate: number): string {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  const percent = Math.round((rate - 1) * 100);
  const prosody = percent === 0 ? escaped : `<prosody rate="${percent > 0 ? "+" : ""}${percent}%">${escaped}</prosody>`;
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voiceName}">${prosody}</voice></speak>`;
}
