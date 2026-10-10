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
// to right, so Hebrew comes out mirrored. We do a small version of the
// bidi algorithm by hand:
// - an English run (Latin letters and digits, with the spaces and
//   punctuation between them) stays one unit in its own order, so
//   "Wish and If only" doesn't come out as "only If and Wish";
// - Hebrew is reversed character by character;
// - pieces with no space between them ("ו-" + "if", "only" + ":") stay
//   glued, in right-to-left order;
// - the resulting items are laid out right to left and wrap like words.
const HEBREW = /[֐-׿]/;
// Spaces, and " / " or " & " between English words, stay inside the run.
const LTR_RUN = /[A-Za-z0-9](?:[A-Za-z0-9'’./&–-]|\s*[/&+]\s*(?=[A-Za-z0-9])|\s+(?=[A-Za-z0-9]))*/g;

// One item per space-separated chunk of the visual line, in logical order.
export function bidiItems(text: string): string[] {
  const s = text.trim();
  if (!HEBREW.test(s)) return s.split(/\s+/);
  // Split into logical runs: English runs, and everything else.
  const runs: { ltr: boolean; text: string }[] = [];
  let last = 0;
  for (const m of s.matchAll(LTR_RUN)) {
    if (m.index > last) runs.push({ ltr: false, text: s.slice(last, m.index) });
    runs.push({ ltr: true, text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < s.length) runs.push({ ltr: false, text: s.slice(last) });

  // Cut the non-English runs at spaces; whatever touches without a space
  // forms one item.
  const items: { ltr: boolean; text: string }[][] = [[]];
  for (const run of runs) {
    if (run.ltr) {
      items[items.length - 1].push(run);
      continue;
    }
    run.text.split(/(\s+)/).forEach((piece) => {
      if (/^\s+$/.test(piece)) items.push([]);
      else if (piece) items[items.length - 1].push({ ltr: false, text: piece });
    });
  }
  return items
    .filter((parts) => parts.length > 0)
    .map((parts) => {
      // A chunk that is all English reads as typed. Anything else, even
      // English with punctuation after it ("only:"), goes right to left in
      // this right-to-left line, with Hebrew parts mirrored.
      if (parts.every((p) => p.ltr)) return parts.map((p) => p.text).join("");
      return parts
        .map((p) => (p.ltr ? p.text : [...p.text].reverse().join("")))
        .reverse()
        .join("");
    });
}

function RtlText({ text, style }: { text: string; style: Record<string, unknown> }) {
  const fontSize = style.fontSize as number;
  // Text with no Hebrew at all ("there is / there are") is a plain
  // left-to-right line, aligned to the right like the rest of the card.
  const english = !HEBREW.test(text);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: english ? "row" : "row-reverse",
        justifyContent: english ? "flex-end" : "flex-start",
        flexWrap: "wrap",
        columnGap: Math.round(fontSize * 0.28),
        ...style,
      }}
    >
      {bidiItems(text).map((w, i) => (
        <span key={i} style={{ whiteSpace: "pre" }}>
          {w}
        </span>
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
