#!/usr/bin/env node
// ============================================
// 码道 MaDao — Thumbnail snapper
// • Live courses: visit URL, save 1600x900 PNG.
// • Unreleased courses: render an inline "Coming Soon" placeholder.
// Run: npm run snap (or: node scripts/snap-thumbs.mjs)
// ============================================

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'public/thumbs');

const TARGETS = [
  { id: 'qima',      url: 'https://claude-code-launch.pages.dev/' },
  { id: 'aiqi',      url: 'https://aiqi.pages.dev/' },
  { id: 'codefu',    url: 'https://codefu.pages.dev/' },
  { id: 'codeplay',  url: 'https://codequest-b1p.pages.dev/' },
  { id: 'agentpath', url: 'https://agentpath.pages.dev/' },
];

const PLACEHOLDERS = []; // all 5 are live now — keep for future use

const VIEWPORT = { width: 1600, height: 900 };

const placeholderHtml = ({ cn, py }) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=JetBrains+Mono:wght@500&family=Noto+Serif+SC:wght@600&display=swap" rel="stylesheet">
<style>
html,body{margin:0;padding:0;width:1600px;height:900px;overflow:hidden;}
body{
  background:#FAF6EE;
  background-image:repeating-linear-gradient(45deg,#FAF6EE,#FAF6EE 22px,#F3EDE0 22px,#F3EDE0 44px);
  display:flex;align-items:center;justify-content:center;flex-direction:column;
  font-family:'Noto Serif SC',serif;color:#1A1A1A;
}
.title{font-size:220px;font-weight:600;letter-spacing:0.04em;line-height:1;}
.title em{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;color:#3A3A3A;font-size:120px;margin-left:16px;}
.soon{margin-top:40px;font-family:'JetBrains Mono',monospace;font-size:32px;letter-spacing:0.4em;text-transform:uppercase;
  background:#1A1A1A;color:#FAF6EE;padding:12px 28px;}
.dot{position:absolute;top:80px;right:120px;width:48px;height:48px;border-radius:9999px;background:#D9534F;}
</style></head><body>
  <span class="dot"></span>
  <div class="title">${cn} <em>${py}</em></div>
  <div class="soon">Coming Soon · 即将推出</div>
</body></html>`;

async function snapLive(page, target) {
  const file = resolve(OUT, `${target.id}.png`);
  console.log(`→ ${target.id}: ${target.url}`);
  await page.goto(target.url, { waitUntil: 'networkidle', timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: file, type: 'png', fullPage: false,
    clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
  });
  console.log(`  saved ${file}`);
}

async function snapPlaceholder(page, target) {
  const file = resolve(OUT, `${target.id}.png`);
  console.log(`→ ${target.id}: (placeholder)`);
  await page.setContent(placeholderHtml(target), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200); // let webfonts settle
  await page.screenshot({
    path: file, type: 'png',
    clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
  });
  console.log(`  saved ${file}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  // deviceScaleFactor=1 keeps PNGs under ~600KB while staying sharp at the
  // ~460x260 display size used by the cards (still ~3.5x oversampled).
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: 'light',
  });
  const page = await ctx.newPage();
  for (const t of TARGETS) {
    try { await snapLive(page, t); }
    catch (e) { console.error(`  ✗ ${t.id} failed: ${e.message}`); }
  }
  for (const t of PLACEHOLDERS) {
    try { await snapPlaceholder(page, t); }
    catch (e) { console.error(`  ✗ ${t.id} failed: ${e.message}`); }
  }
  await browser.close();
  console.log('done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
