#!/usr/bin/env node
// ============================================
// 码道 MaDao — Smoke test
// Starts a static server on a free port, runs the page in headless Chromium,
// asserts the load + bilingual toggle + Done-toggle invariants, exits 1 on
// any failure. Designed to run on push (CI) and locally via `npm test`.
// ============================================

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.txt':  'text/plain; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
};

function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      let p = decodeURIComponent(url.pathname);
      if (p.endsWith('/')) p += 'index.html';
      const safe = normalize(join(ROOT, p));
      if (!safe.startsWith(ROOT)) { res.statusCode = 403; return res.end('forbidden'); }
      const s = await stat(safe).catch(() => null);
      if (!s || !s.isFile()) { res.statusCode = 404; return res.end('not found'); }
      const buf = await readFile(safe);
      res.setHeader('Content-Type', MIME[extname(safe)] || 'application/octet-stream');
      res.end(buf);
    } catch (e) {
      res.statusCode = 500;
      res.end(String(e));
    }
  });
  return new Promise((ok) => server.listen(0, () => ok({ server, port: server.address().port })));
}

const checks = [];
function assert(name, cond, detail) {
  checks.push({ name, ok: !!cond, detail });
  const tag = cond ? 'PASS' : 'FAIL';
  console.log(`  [${tag}] ${name}${detail ? `  — ${detail}` : ''}`);
}

async function main() {
  const { server, port } = await startServer();
  const baseUrl = `http://127.0.0.1:${port}/`;
  console.log(`smoke-test server: ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const consoleErrors = [];
  const networkFails = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR: ${e.message}`));
  page.on('requestfailed', (req) => networkFails.push(`${req.url()}: ${req.failure()?.errorText}`));

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const initLang = await page.evaluate(() => document.documentElement.lang);
  assert('initial html[lang] is zh-CN', initLang === 'zh-CN', initLang);

  const initBtn = await page.$eval('#lang-toggle', (el) => el.textContent.trim());
  assert('toggle shows current language ("中" in zh)', initBtn === '中', initBtn);

  const cards = await page.$$eval('[data-course]', (els) => els.map((e) => e.getAttribute('data-course')));
  assert('all 5 cards rendered', cards.length === 5 && ['qima','aiqi','codefu','codeplay','agentpath'].every((id) => cards.includes(id)), cards.join(','));

  const imgsLoaded = await page.$$eval('.thumb-frame img', (els) => els.every((img) => img.complete && img.naturalWidth > 0));
  assert('all thumbnails loaded', imgsLoaded);

  const starts = await page.$$eval('[data-course] a.btn-ink', (els) => els.map((e) => ({ href: e.getAttribute('href'), target: e.getAttribute('target') })));
  assert('5 start links present, all open in new tab', starts.length === 5 && starts.every((s) => s.target === '_blank' && /^https:\/\//.test(s.href || '')));

  await page.click('#lang-toggle');
  await page.waitForTimeout(300);
  const enLang = await page.evaluate(() => document.documentElement.lang);
  const enBtn = await page.$eval('#lang-toggle', (el) => el.textContent.trim());
  const heroEn = await page.$eval('[data-i18n="hero_pitch"]', (el) => el.textContent.trim());
  assert('toggle flips to en', enLang === 'en' && enBtn === 'EN');
  assert('hero pitch translates to English', heroEn.startsWith('Five Claude Code'));

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const reloadLang = await page.evaluate(() => document.documentElement.lang);
  assert('language persists across reload', reloadLang === 'en');

  // Reset to zh for done-test
  await page.click('#lang-toggle');
  await page.waitForTimeout(200);

  await page.click('[data-course="qima"] [data-done-btn]');
  await page.waitForTimeout(100);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const isDone = await page.$eval('[data-course="qima"]', (el) => el.classList.contains('is-done'));
  assert('Done toggle persists across reload', isDone);

  // Clean up: clear localStorage and verify state resets
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const cleared = await page.$eval('[data-course="qima"]', (el) => el.classList.contains('is-done'));
  assert('clearing localStorage resets Done state', !cleared);

  // Filter out expected noise: favicon 404 in dev, font CDN failures in offline CI
  const errs = consoleErrors.filter((e) =>
    !/favicon/i.test(e) &&
    !/fonts\.(googleapis|gstatic)\.com/i.test(e) &&
    !/Refused to load/i.test(e)
  );
  assert('no unexpected console errors', errs.length === 0, errs.join(' | '));

  await browser.close();
  server.close();

  const failed = checks.filter((c) => !c.ok);
  console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
  if (failed.length > 0) {
    console.log('\nFAILURES:');
    failed.forEach((f) => console.log(`  - ${f.name}${f.detail ? ` (${f.detail})` : ''}`));
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
