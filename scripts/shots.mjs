// Full-page screenshots with lazy images loaded, for visual review.
// BASE_URL=http://localhost:3000 node scripts/shots.mjs / /services 390
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
let pw;
try {
  pw = require("playwright");
} catch {
  pw = require("/home/claude/.npm-global/lib/node_modules/playwright");
}
const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const args = process.argv.slice(2);
const width = Number(args.find((a) => /^\d+$/.test(a)) ?? 1440);
const paths = args.filter((a) => a.startsWith("/"));
mkdirSync("test-results/shots", { recursive: true });
const browser = await pw.chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width, height: 900 } });
for (const p of paths) {
  await page.goto(BASE + p, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(400);
  const file = `test-results/shots/${width}${p === "/" ? "-home" : p.replace(/\//g, "-")}.png`;
  await page.screenshot({ path: file, fullPage: true });
  console.log(file);
}
await browser.close();
