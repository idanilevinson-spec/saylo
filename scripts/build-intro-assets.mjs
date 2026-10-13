// Cuts the launch intro's pieces out of the real logo (public/logo-source.jpg)
// so the intro animates the brand itself rather than a redrawn copy:
//   public/intro/mark.png  the speech bubble, with its three dots removed
//                          (the intro draws them itself, as a typing indicator)
//   public/intro/sayl.png  "sayl" as an alpha mask, tinted per theme in CSS
//   public/intro/o.png     the gradient "o", in its own colours
//   public/intro/tagline.png  "SPEAK. LEARN. GROW." as an alpha mask
// The logo sits on white, so each piece is un-composited from white into real
// transparency (alpha from the darkest channel), which keeps the anti-aliased
// edges clean on the dark theme too.
//
// Run: node scripts/build-intro-assets.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/logo-source.jpg";
const OUT = "public/intro";

// Measured on the 1254px source.
const MARK = { left: 432, top: 262, width: 394, height: 382 };
const WORD = { left: 238, top: 626, right: 1018, bottom: 898 };
const O_LEFT = 835; // gap between "l" (ends 828) and "o" (starts 841)
const TAGLINE = { left: 314, top: 920, width: 638, height: 42 };

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;

const isBlue = (r, g, b) => b - r > 60 && b > 150;

function cut({ left, top, width, height }, keep, mode) {
  const out = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = ((top + y) * W + (left + x)) * 3;
      let r = data[i], g = data[i + 1], b = data[i + 2];
      const o = (y * width + x) * 4;
      const ink = Math.max(255 - r, 255 - g, 255 - b);
      if (ink < 16 || !keep(r, g, b, left + x, top + y)) continue;
      const a = ink / 255;
      if (mode === "mask") {
        out[o] = out[o + 1] = out[o + 2] = 0;
      } else {
        out[o] = Math.round(255 - (255 - r) / a);
        out[o + 1] = Math.round(255 - (255 - g) / a);
        out[o + 2] = Math.round(255 - (255 - b) / a);
      }
      out[o + 3] = ink;
    }
  }
  return sharp(out, { raw: { width, height, channels: 4 } });
}

await mkdir(OUT, { recursive: true });

// The bubble only: navy pixels (the dots, and the top of the "l" below) go.
// Anti-aliased edge pixels between blue and white are kept by saturation.
const bubble = (r, g, b) => isBlue(r, g, b) || (b - r > 25 && r > 90);
await cut(MARK, bubble).png().toFile(`${OUT}/mark.png`);

const wordBox = { left: WORD.left, top: WORD.top, width: WORD.right - WORD.left, height: WORD.bottom - WORD.top };
// "sayl": everything navy left of the "o", minus the bubble's tail.
await cut(
  { ...wordBox, width: O_LEFT - WORD.left },
  (r, g, b) => !bubble(r, g, b),
  "mask",
).png().toFile(`${OUT}/sayl.png`);
await cut({ ...wordBox, left: O_LEFT, width: WORD.right - O_LEFT }, () => true).png().toFile(`${OUT}/o.png`);
await cut(TAGLINE, () => true, "mask").png().toFile(`${OUT}/tagline.png`);

console.log("intro assets written to", OUT);
