// Pre-builds every photo in public/images as WebP at a few widths, into
// public/img, and writes src/lib/image-manifest.json listing the widths made
// for each photo. The site then serves these as plain static files that the
// Hostinger CDN caches, instead of resizing photos on the server per request.
//
// Run after adding or replacing photos in public/images:
//   node scripts/make-images.mjs
// Photos uploaded through the admin panel are not affected.
import { readdir, mkdir, stat, writeFile } from "node:fs/promises";
import { join, relative, extname, dirname } from "node:path";
import sharp from "sharp";

const SRC = "public/images";
const OUT = "public/img";
const WIDTHS = [480, 828, 1200, 1920];
const QUALITY = 68;

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(jpe?g|png|webp)$/i.test(e.name)) yield p;
  }
}

const manifest = {};
let made = 0, skipped = 0;
for await (const file of walk(SRC)) {
  const rel = relative(SRC, file).split("\\").join("/");
  const base = rel.slice(0, -extname(rel).length);
  const { width } = await sharp(file).metadata();
  const widths = [...new Set(WIDTHS.filter((w) => w < width).concat(Math.min(width, WIDTHS.at(-1))))].sort((a, b) => a - b);
  const srcStat = await stat(file);
  for (const w of widths) {
    const out = join(OUT, `${base}-${w}.webp`);
    const done = await stat(out).catch(() => null);
    if (done && done.mtimeMs >= srcStat.mtimeMs) { skipped++; continue; }
    await mkdir(dirname(out), { recursive: true });
    await sharp(file).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: QUALITY, effort: 5 }).toFile(out);
    made++;
  }
  manifest[`/images/${rel}`] = widths;
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await writeFile("src/lib/image-manifest.json", JSON.stringify(sorted, null, 1) + "\n");
console.log(`make-images: ${Object.keys(sorted).length} photos, ${made} files written, ${skipped} up to date`);
