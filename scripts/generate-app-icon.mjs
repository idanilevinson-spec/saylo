import sharp from "sharp";
import { mkdir } from "node:fs/promises";

// Source for capacitor-assets: a flat, alpha-free 1024x1024 App Store icon
// (Apple rejects any icon with an alpha channel) and a simple centered
// splash screen, generated from the existing logo. capacitor-assets scans
// resources/icon.png and resources/splash.png by default.
await mkdir("resources", { recursive: true });

await sharp("public/logo-source.jpg")
  .resize(1024, 1024)
  .flatten({ background: "#ffffff" })
  .png()
  .toFile("resources/icon.png");

await sharp({
  create: { width: 2732, height: 2732, channels: 3, background: "#f6f9fd" },
})
  .composite([{ input: await sharp("public/logo-source.jpg").resize(800, 800).toBuffer(), gravity: "center" }])
  .png()
  .toFile("resources/splash.png");

console.log("Generated resources/icon.png and resources/splash.png");
