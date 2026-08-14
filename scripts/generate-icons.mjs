/**
 * Generates PWA icon PNGs from the molecule logo.
 * Run: node scripts/generate-icons.mjs  (requires devDependency: sharp)
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve("public/icons");
await mkdir(outDir, { recursive: true });

const logo = (pad, bg = "#f6f3ec", fg = "#211e19") => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${pad ? 0 : 116}" fill="${bg}"/>
  <g transform="translate(${pad ? 116 : 96}, ${pad ? 116 : 96}) scale(${pad ? 8.75 : 10})">
    <circle cx="9" cy="10" r="3.2" fill="${fg}"/>
    <circle cx="22" cy="7" r="2.4" stroke="${fg}" stroke-width="1.8" fill="none"/>
    <circle cx="13" cy="23" r="2.4" stroke="${fg}" stroke-width="1.8" fill="none"/>
    <circle cx="24" cy="21" r="3.2" fill="${fg}"/>
    <path d="M11.8 11.4 20 8m-9 12.8 1.6-8.6M15.3 22l6-1.2"
      stroke="${fg}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  </g>
</svg>`;

const targets = [
  { file: "icon-192.png", size: 192, maskable: false },
  { file: "icon-512.png", size: 512, maskable: false },
  { file: "apple-touch-icon.png", size: 180, maskable: true },
  { file: "maskable-512.png", size: 512, maskable: true },
];

for (const t of targets) {
  await sharp(Buffer.from(logo(t.maskable)))
    .resize(t.size, t.size)
    .png()
    .toFile(path.join(outDir, t.file));
  console.log("wrote", t.file);
}
