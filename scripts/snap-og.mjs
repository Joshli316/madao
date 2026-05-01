#!/usr/bin/env node
// Generate the Open Graph card at public/og.png (1200x630).
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'public/og.png');

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=JetBrains+Mono:wght@500&family=Noto+Serif+SC:wght@600;700&display=swap" rel="stylesheet">
<style>
html,body{margin:0;padding:0;width:1200px;height:630px;overflow:hidden;}
body{
  position:relative;
  background:#FAF6EE;
  background-image:
    repeating-linear-gradient(45deg, transparent 0 22px, rgba(26,26,26,0.025) 22px 23px),
    repeating-linear-gradient(-45deg, transparent 0 22px, rgba(26,26,26,0.025) 22px 23px);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  font-family:'Noto Serif SC',serif;color:#1A1A1A;
}
.dot{position:absolute;top:60px;right:80px;width:64px;height:64px;border-radius:9999px;background:#D9534F;}
.path-label{font-family:'JetBrains Mono',monospace;font-size:18px;letter-spacing:0.4em;text-transform:uppercase;color:#6B6B6B;margin-bottom:18px;}
.title{font-size:240px;font-weight:700;letter-spacing:0.04em;line-height:1;margin:0;}
.title em{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;color:#3A3A3A;font-size:120px;margin-left:20px;}
.tagline{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:48px;color:#3A3A3A;margin-top:32px;}
.zh{font-family:'Noto Serif SC',serif;font-style:normal;font-size:36px;color:#1A1A1A;margin-top:8px;letter-spacing:0.06em;}
.row{position:absolute;bottom:48px;left:80px;right:80px;display:flex;justify-content:space-between;align-items:center;
  font-family:'JetBrains Mono',monospace;font-size:18px;letter-spacing:0.18em;text-transform:uppercase;color:#6B6B6B;}
.row .pill{border:1.5px solid #1A1A1A;color:#1A1A1A;padding:8px 14px;}
hr{border:0;border-top:1.5px solid #1A1A1A;width:120px;margin:0 auto;}
</style></head><body>
  <span class="dot"></span>
  <p class="path-label">A Path · 一条路</p>
  <h1 class="title">码道 <em>MaDao</em></h1>
  <hr style="margin-top:36px">
  <p class="tagline">From Zero to Agentic AI</p>
  <p class="zh">从零到智能体</p>
  <div class="row">
    <span>5 Tutorials · 5 门课</span>
    <span class="pill">madao-cc.pages.dev</span>
  </div>
</body></html>`;

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.setContent(html, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await mkdir(dirname(OUT), { recursive: true });
await page.screenshot({ path: OUT, type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log(`saved ${OUT}`);
