import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The share card for links sent on WhatsApp, Instagram and the like:
// the Saylo mark, one clear Hebrew title, a line under it, and an optional
// big badge (a level or a questionnaire). Same dark ground and blue as the
// site. Rendered by next/og at build time.

export const OG_SIZE = { width: 1200, height: 630 };

const BLUE = "#4d9eff";
const INK = "#04122b";
const BG = "#0b0c0f";
const FG = "#f3efe4";
const MUTED = "#a39c8c";

// Satori (behind next/og) has no bidi support: it draws every string left
// to right, so Hebrew comes out mirrored. We do the bidi by hand: each word
// is reversed for display, except runs of Latin letters and digits, which
// keep their own order; the words are then laid out right to left.
const LTR_RUN = /[A-Za-z0-9.:/]+/g;

export function visualWord(word: string): string {
  if (!/[֐-׿]/.test(word)) return word;
  const parts: string[] = [];
  let last = 0;
  for (const m of word.matchAll(LTR_RUN)) {
    if (m.index > last) parts.push([...word.slice(last, m.index)].reverse().join(""));
    parts.push(m[0]);
    last = m.index + m[0].length;
  }
  if (last < word.length) parts.push([...word.slice(last)].reverse().join(""));
  return parts.reverse().join("");
}

function RtlText({ text, style }: { text: string; style: Record<string, unknown> }) {
  const fontSize = style.fontSize as number;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row-reverse",
        flexWrap: "wrap",
        columnGap: Math.round(fontSize * 0.28),
        ...style,
      }}
    >
      {text.split(/\s+/).map((w, i) => (
        <span key={i}>{visualWord(w)}</span>
      ))}
    </div>
  );
}

export async function shareCard({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) {
  const [bold, black, logo] = await Promise.all([
    readFile(join(process.cwd(), "src/app/fonts/Rubik-700.ttf")),
    readFile(join(process.cwd(), "src/app/fonts/Rubik-900.ttf")),
    readFile(join(process.cwd(), "public/logo-mark.png"), "base64"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BG,
          fontFamily: "Rubik",
        }}
      >
        <div style={{ display: "flex", flex: 1, padding: "64px 72px 0", gap: 48, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: FG }}>saylo</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:image/png;base64,${logo}`} width={64} height={64} style={{ borderRadius: 14 }} alt="" />
            </div>
            <RtlText
              text={title}
              style={{ marginTop: 44, fontSize: title.length > 26 ? 64 : 76, fontWeight: 900, color: FG, lineHeight: 1.1 }}
            />
            <RtlText text={subtitle} style={{ marginTop: 22, fontSize: 32, fontWeight: 700, color: MUTED, lineHeight: 1.35 }} />
          </div>
          {badge && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 300,
                height: 300,
                borderRadius: 28,
                background: BLUE,
                color: INK,
                fontSize: badge.length > 2 ? 110 : 150,
                fontWeight: 900,
              }}
            >
              {badge}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 96,
            marginTop: 40,
            padding: "0 72px",
            background: BLUE,
            color: INK,
            fontSize: 30,
            fontWeight: 900,
          }}
        >
          <div style={{ display: "flex" }}>saylolearn.com</div>
          <div style={{ display: "flex" }}>Speak. Learn. Grow.</div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Rubik", data: bold, weight: 700, style: "normal" },
        { name: "Rubik", data: black, weight: 900, style: "normal" },
      ],
    },
  );
}
