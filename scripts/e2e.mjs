// End-to-end checks for the public site.
//
//   Local (offline, seed content, mocked enquiry backend):
//     CONTENT_SOURCE=seed ENQUIRY_MOCK=1 npm run build && npm start   (port 3000)
//     BASE_URL=http://localhost:3000 node scripts/e2e.mjs
//
//   Against a deployed preview (real backend — creates a real enquiry):
//     BASE_URL=https://<preview>.vercel.app LIVE=1 node scripts/e2e.mjs
//
// Writes screenshots to ./test-results and a JSON report.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require("playwright");
} catch {
  playwright = require(process.env.PLAYWRIGHT_PATH || "/home/claude/.npm-global/lib/node_modules/playwright");
}
const { chromium } = playwright;

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const LIVE = process.env.LIVE === "1";
const OUT = "test-results";
mkdirSync(OUT, { recursive: true });

const PAGES = [
  "/",
  "/about",
  "/services",
  "/services/steel-structures",
  "/services/pipeline-welding",
  "/services/laser-cnc-cutting",
  "/services/storage-containers",
  "/services/stainless-steel",
  "/projects",
  "/projects/taweelah-gas-compressor-station",
  "/quality",
  "/quote",
  "/contact",
  "/privacy",
  "/terms",
  "/blog",
];
const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const results = [];
function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

async function newPage(vp, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, ...opts });
  const page = await ctx.newPage();
  const problems = [];
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`console: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  return { ctx, page, problems };
}

// 1. Every page at three widths: status, console, overflow, headings, images.
for (const vp of VIEWPORTS) {
  for (const path of PAGES) {
    const { ctx, page, problems } = await newPage(vp);
    const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in")));
    const info = await page.evaluate(() => {
      const overflow = document.documentElement.scrollWidth - window.innerWidth;
      const wide = overflow > 1
        ? Array.from(document.querySelectorAll("body *"))
            .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
            .slice(0, 3)
            .map((el) => `${el.tagName}.${String(el.className).slice(0, 40)}`)
        : [];
      return {
        overflow,
        wide,
        h1: document.querySelectorAll("h1").length,
        imgsNoAlt: Array.from(document.images).filter((i) => !i.hasAttribute("alt")).length,
        brokenImgs: Array.from(document.images).filter((i) => i.complete && i.naturalWidth === 0 && i.src).map((i) => i.src).slice(0, 3),
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "",
        robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "",
      };
    });
    const tag = `${vp.name} ${path}`;
    record(`${tag} loads`, res?.status() === 200, `status ${res?.status()}`);
    record(`${tag} no horizontal overflow`, info.overflow <= 1, info.overflow > 1 ? `${info.overflow}px ${info.wide.join(", ")}` : "");
    record(`${tag} one h1`, info.h1 === 1, `h1 count ${info.h1}`);
    record(`${tag} images have alt`, info.imgsNoAlt === 0, info.imgsNoAlt ? `${info.imgsNoAlt} missing` : "");
    record(`${tag} no broken images`, info.brokenImgs.length === 0, info.brokenImgs.join(" "));
    record(`${tag} no console errors`, problems.length === 0, problems.slice(0, 3).join(" | "));
    if (vp.name === "desktop") {
      record(`${path} has title + description`, Boolean(info.title && info.description), info.title);
      record(`${path} has canonical`, Boolean(info.canonical), info.canonical);
    }
    await page.screenshot({ path: `${OUT}/${vp.name}${path === "/" ? "-home" : path.replace(/\//g, "-")}.png`, fullPage: true });
    await ctx.close();
  }
}

// 2. Internal links resolve (collected from every page).
{
  const { ctx, page } = await newPage(VIEWPORTS[2]);
  const links = new Set();
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
    hrefs.filter((h) => h && h.startsWith("/") && !h.startsWith("//")).forEach((h) => links.add(h.split("#")[0]));
  }
  const bad = [];
  for (const href of links) {
    if (!href || href.startsWith("/admin")) continue;
    const r = await page.request.get(BASE + href, { maxRedirects: 5 });
    if (r.status() >= 400) bad.push(`${href} → ${r.status()}`);
  }
  record(`internal links (${links.size}) resolve`, bad.length === 0, bad.join(", "));
  await ctx.close();
}

// 3. Legacy URLs redirect; unknown URLs give a helpful 404.
{
  const { ctx, page } = await newPage(VIEWPORTS[2]);
  for (const [from, to] of [
    ["/about.html", "/about"],
    ["/certifications.html", "/quality"],
    ["/privacy-policy", "/privacy"],
    ["/contact.html", "/contact"],
  ]) {
    const r = await page.request.get(BASE + from, { maxRedirects: 0 });
    record(`redirect ${from}`, [301, 308].includes(r.status()) && (r.headers().location ?? "").endsWith(to), `${r.status()} ${r.headers().location}`);
  }
  const nf = await page.goto(BASE + "/this-page-does-not-exist", { waitUntil: "networkidle" });
  const nfText = await page.textContent("h1");
  record("404 status and page", nf?.status() === 404 && /isn.t on the drawing/i.test(nfText ?? ""), `${nf?.status()} ${nfText}`);
  await ctx.close();
}

// 4. Mobile navigation.
{
  const { ctx, page, problems } = await newPage(VIEWPORTS[0]);
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open menu" }).click();
  const open = await page.locator('dialog[aria-label="Menu"]').evaluate((d) => d.open);
  await page.locator('dialog[aria-label="Menu"]').getByRole("link", { name: "Projects" }).click();
  await page.waitForURL("**/projects");
  record("mobile menu opens and navigates", open && page.url().endsWith("/projects"), page.url());
  record("mobile menu no console errors", problems.length === 0, problems.join(" | "));
  await ctx.close();
}

// 5. Keyboard: first Tab reaches the skip link.
{
  const { ctx, page } = await newPage(VIEWPORTS[2]);
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
  record("skip link is first focus", focused === "Skip to content", focused);
  await ctx.close();
}

// 6. Reduced motion keeps content visible.
{
  const { ctx, page } = await newPage(VIEWPORTS[2], { reducedMotion: "reduce" });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const hidden = await page.evaluate(
    () => Array.from(document.querySelectorAll("[data-reveal]")).filter((el) => getComputedStyle(el).opacity !== "1").length
  );
  record("reduced motion: nothing hidden", hidden === 0, `${hidden} hidden`);
  await ctx.close();
}

// 7. Project filters.
{
  const { ctx, page } = await newPage(VIEWPORTS[2]);
  await page.goto(BASE + "/projects", { waitUntil: "networkidle" });
  const before = await page.locator("main ul li article").count();
  await page.selectOption("#f-sector", { label: "Oil & gas" });
  await page.waitForTimeout(200);
  const after = await page.locator("main ul li article").count();
  const url = page.url();
  record("project filter narrows results", after > 0 && after < before && url.includes("sector="), `${before} → ${after}, ${url}`);
  await page.getByRole("button", { name: "Clear filters" }).click();
  record("project filter clears", (await page.locator("main ul li article").count()) === before);
  await ctx.close();
}

// 8. WhatsApp review step.
{
  const { ctx, page } = await newPage(VIEWPORTS[2]);
  await page.goto(BASE + "/contact", { waitUntil: "networkidle" });
  await page.locator("#whatsapp").getByRole("button", { name: /WhatsApp/ }).click();
  const dialog = page.getByRole("dialog", { name: "Review your WhatsApp message" });
  await dialog.locator("textarea").fill("Test message about a pipe rack");
  const href = await dialog.getByRole("link", { name: "Open WhatsApp" }).getAttribute("href");
  record("WhatsApp dialog lets visitor edit the message", Boolean(href?.startsWith("https://wa.me/971") && href.includes("pipe%20rack")), href ?? "");
  await ctx.close();
}

// 9. Assistant identifies itself and handles being offline / online.
{
  const { ctx, page } = await newPage(VIEWPORTS[2]);
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Project Assistant/ }).click();
  const panel = page.getByRole("dialog", { name: /Al Saqr Project Assistant/ });
  await page.waitForTimeout(800);
  const text = await panel.innerText();
  const identifies = /AI/.test(text) && /not a member of staff/i.test(text);
  const handled = /offline/i.test(text) || /start chat/i.test(text);
  record("assistant identifies as AI and shows a usable state", identifies && handled, handled ? "" : text.slice(0, 200));
  await ctx.close();
}

// 10. Quote form: validation, file rules, submission, reference.
{
  const { ctx, page, problems } = await newPage(VIEWPORTS[0]);
  await page.goto(BASE + "/quote?service=pipeline-welding", { waitUntil: "networkidle" });
  record("quote form preselects service", (await page.inputValue("#q-service")) === "pipeline-welding");

  await page.getByRole("button", { name: "Send request" }).click();
  const summary = page.locator('[role="alert"]').first();
  const summaryText = await summary.innerText();
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("role"));
  record("empty submit shows error summary with focus", /Enter your name/.test(summaryText) && focused === "alert", summaryText.slice(0, 120));

  // Wrong file type is refused before upload.
  await page.setInputFiles("#q-files", { name: "virus.exe", mimeType: "application/x-msdownload", buffer: Buffer.from("MZ") });
  const fileErr = await page.locator("#q-files-err").innerText();
  record("disallowed file type rejected with message", /not a PDF, JPG or PNG/.test(fileErr), fileErr);

  // Oversized file is refused.
  await page.setInputFiles("#q-files", { name: "big.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(11 * 1024 * 1024, 1) });
  const bigErr = await page.locator("#q-files-err").innerText();
  record("oversized file rejected with message", /10 MB/.test(bigErr), bigErr);

  const pdf = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");
  await page.setInputFiles("#q-files", { name: "drawing-A101.pdf", mimeType: "application/pdf", buffer: pdf });
  await page.getByText("Uploaded").first().waitFor({ timeout: 20000 });
  record("valid PDF uploads with progress to 'Uploaded'", true);

  await page.fill("#q-name", "E2E Test Visitor");
  await page.fill("#q-company", "Automated test — please ignore");
  await page.fill("#q-email", "not-an-email");
  await page.fill("#q-location", "Musaffah, Abu Dhabi");
  await page.fill("#q-scope", "Automated end-to-end test of the quote form. Please ignore and delete.");
  await page.check("#q-consent");
  await page.getByRole("button", { name: "Send request" }).click();
  const emailErr = await page.locator("#q-email-err").innerText().catch(() => "");
  record("invalid email caught", /valid email/.test(emailErr), emailErr);

  await page.fill("#q-email", "e2e-test@example.com");
  await page.waitForTimeout(2600); // the form rejects implausibly fast submissions
  await page.getByRole("button", { name: "Send request" }).click();
  await page.waitForURL("**/quote/submitted?ref=*", { timeout: 30000 });
  const ref = await page.locator("p.font-mono.text-3xl, p.font-mono.sm\\:text-4xl").first().innerText();
  const attached = await page.getByText(/file was attached/).waitFor({ timeout: 5000 }).then(() => 1).catch(() => 0);
  record("submission returns a reference", LIVE ? /^ASQ-\d{4}-\d{5}$/.test(ref) : /^TEST-\d+$/.test(ref), ref);
  record("confirmation mentions the attachment", attached === 1);
  record("quote journey no console errors", problems.length === 0, problems.slice(0, 3).join(" | "));
  await page.screenshot({ path: `${OUT}/journey-quote-submitted.png`, fullPage: true });
  await ctx.close();
}

// 11. Confirmation page never fakes success without a reference.
{
  const { ctx, page } = await newPage(VIEWPORTS[2]);
  await page.goto(BASE + "/quote/submitted", { waitUntil: "networkidle" });
  record("confirmation page without reference shows no success", /No request to show/.test(await page.textContent("h1") ?? ""));
  await ctx.close();
}

// 12. robots / sitemap.
{
  const { ctx, page } = await newPage(VIEWPORTS[2]);
  const robots = await (await page.request.get(BASE + "/robots.txt")).text();
  const sitemap = await page.request.get(BASE + "/sitemap.xml");
  const home = await page.request.get(BASE + "/");
  record("robots.txt present", robots.includes("User-Agent") || robots.includes("User-agent"), robots.split("\n").slice(0, 3).join(" / "));
  record("sitemap.xml present", sitemap.status() === 200 && (await sitemap.text()).includes("/services/steel-structures"));
  record("staging sends noindex header", (home.headers()["x-robots-tag"] ?? "").includes("noindex") || process.env.EXPECT_INDEXABLE === "1", home.headers()["x-robots-tag"] ?? "");
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
writeFileSync(`${OUT}/report.json`, JSON.stringify({ base: BASE, live: LIVE, at: new Date().toISOString(), total: results.length, failed: failed.length, results }, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
