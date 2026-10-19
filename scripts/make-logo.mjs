// Builds the reversed logo used on the dark header and footer
// (public/brand/logo-on-dark.webp) from the original logo: the green wordmark
// and I-beam become white, the red gear stays red. Runs before every build so
// the source of truth stays the single original file.
import { existsSync, copyFileSync } from "node:fs";

const SRC = "public/brand/logo-horizontal.png";
const OUT = "public/brand/logo-on-dark.webp";

try {
  const sharp = (await import("sharp")).default;
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (!a) continue;
    const red = r > g + 50 && r > b + 30;
    if (red) {
      data[i] = Math.min(255, Math.round(r * 1.1 + 20));
    } else {
      data[i] = data[i + 1] = data[i + 2] = 255;
    }
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize(480, 208, { kernel: "lanczos3" })
    .webp({ quality: 88 })
    .toFile(OUT);
  console.log(`make-logo: wrote ${OUT}`);
} catch (e) {
  // Never fail the build over the logo: fall back to an existing file or the original.
  if (!existsSync(OUT)) copyFileSync(SRC, OUT);
  console.warn(`make-logo: skipped (${e instanceof Error ? e.message : e})`);
}
