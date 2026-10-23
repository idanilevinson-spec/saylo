import { describe, expect, it } from "vitest";
import { pcmChunks, pcmToWav, rateSsml } from "./pcm";

describe("pcmToWav", () => {
  it("puts a 16 kHz mono 16-bit WAV header in front of the samples", async () => {
    const pcm = new Uint8Array([1, 2, 3, 4]).buffer;
    const wav = new Uint8Array(await pcmToWav(pcm).arrayBuffer());
    const view = new DataView(wav.buffer);
    const text = (from: number) => String.fromCharCode(...wav.slice(from, from + 4));
    expect(wav.length).toBe(48);
    expect(text(0)).toBe("RIFF");
    expect(text(8)).toBe("WAVE");
    expect(view.getUint32(24, true)).toBe(16000);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(4);
    expect([...wav.slice(44)]).toEqual([1, 2, 3, 4]);
  });
});

describe("pcmChunks", () => {
  it("splits without losing bytes", () => {
    const chunks = pcmChunks(new Uint8Array(13000).buffer);
    expect(chunks.map((c) => c.length)).toEqual([6000, 6000, 1000]);
  });
});

describe("rateSsml", () => {
  it("escapes the text and puts the speed in the synthesis", () => {
    expect(rateSsml("Tom & <Jerry>", "en-US-AvaNeural", 1)).toContain("Tom &amp; &lt;Jerry&gt;");
    expect(rateSsml("Hi", "v", 1)).not.toContain("prosody");
    expect(rateSsml("Hi", "v", 0.75)).toContain('<prosody rate="-25%">Hi</prosody>');
    expect(rateSsml("Hi", "v", 1.25)).toContain('<prosody rate="+25%">Hi</prosody>');
  });
});
