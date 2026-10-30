import fs from "node:fs/promises";
import sharp from "sharp";
const iconSource = "public/brand/borido-mark-monochrome.png";
for (const [file, size] of [
  ["favicon.png", 256],
  ["favicon-16.png", 16],
  ["favicon-32.png", 32],
  ["apple-touch-icon.png", 180],
]) {
  await sharp(iconSource)
    .resize(size, size)
    .png()
    .toFile("public/" + file);
}
const png = await sharp(iconSource).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header[6] = 32;
header[7] = 32;
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);
await fs.writeFile("public/favicon.ico", Buffer.concat([header, png]));
const logo = await sharp("public/brand/borido-mark-monochrome.png")
  .resize(240, 240)
  .png()
  .toBuffer();
const text = Buffer.from(
  `<svg width="1200" height="630"><rect width="1200" height="630" fill="#191919"/><text x="600" y="430" text-anchor="middle" font-family="sans-serif" font-size="64" font-weight="700" fill="white">BORIDO</text><text x="600" y="490" text-anchor="middle" font-family="sans-serif" font-size="25" fill="#cccccc">Open Buddhist Content</text></svg>`,
);
await sharp(text)
  .composite([{ input: logo, left: 480, top: 100 }])
  .png()
  .toFile("public/og-image.png");
console.log(
  "BORIDO icons and sharing image generated from the supplied logo originals.",
);
