// Dev-only QA script. Runs the verify checklist from plan.md against http://localhost:8765/.
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`));
page.on('requestfailed', (req) => errors.push(`REQFAIL: ${req.url()} ${req.failure()?.errorText}`));

await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// 1. Initial load — html[lang] and toggle text
const initLang = await page.evaluate(() => document.documentElement.lang);
const initBtn = await page.$eval('#lang-toggle', (el) => el.textContent.trim());

// 2. All 5 cards rendered
const cards = await page.$$eval('[data-course]', (els) => els.map((e) => e.getAttribute('data-course')));

// 3. All thumbnail images loaded (status 200, naturalWidth > 0)
const imgs = await page.$$eval('.thumb-frame img', (els) =>
  els.map((img) => ({ src: img.getAttribute('src'), nat: img.naturalWidth, complete: img.complete }))
);

// 4. Start links + Coming Soon
const starts = await page.$$eval('[data-course] a.btn-ink, [data-course] span.btn-ghost', (els) =>
  els.map((e) => ({ tag: e.tagName, text: e.textContent.trim(), href: e.getAttribute('href') || '', target: e.getAttribute('target') || '' }))
);

// 5. Toggle to en
await page.click('#lang-toggle');
await page.waitForTimeout(400);
const enLang = await page.evaluate(() => document.documentElement.lang);
const enBtn = await page.$eval('#lang-toggle', (el) => el.textContent.trim());
const heroPitchEn = await page.$eval('[data-i18n="hero_pitch"]', (el) => el.textContent.trim().slice(0, 30));

// 6. Persists across reload
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const reloadLang = await page.evaluate(() => document.documentElement.lang);

// Reset to zh for screenshots
await page.click('#lang-toggle');
await page.waitForTimeout(300);

// 7. Done toggle persistence
await page.click('[data-course="qima"] [data-done-btn]');
await page.waitForTimeout(150);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const qimaDone = await page.$eval('[data-course="qima"]', (el) => el.classList.contains('is-done'));
const qimaBtnText = await page.$eval('[data-course="qima"] [data-done-btn]', (el) => el.textContent.trim());

// 8. Responsive screenshots
await page.setViewportSize({ width: 1280, height: 900 });
await page.screenshot({ path: '/tmp/madao-desktop.png', fullPage: true });
await page.setViewportSize({ width: 768, height: 1024 });
await page.screenshot({ path: '/tmp/madao-tablet.png', fullPage: true });
await page.setViewportSize({ width: 375, height: 800 });
await page.screenshot({ path: '/tmp/madao-mobile.png', fullPage: true });

// 9. Clear LS test
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const afterClearLang = await page.evaluate(() => document.documentElement.lang);
const afterClearDone = await page.$eval('[data-course="qima"]', (el) => el.classList.contains('is-done'));

const result = {
  initLang, initBtn,
  cards,
  imgs,
  starts,
  enLang, enBtn, heroPitchEn,
  reloadLang,
  qimaDone, qimaBtnText,
  afterClearLang, afterClearDone,
  errors,
};
console.log(JSON.stringify(result, null, 2));
await browser.close();
