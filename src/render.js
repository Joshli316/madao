// ============================================
// 码道 MaDao — DOM rendering for stages + cards
// Reads from content.js, renders into #stages.
// ============================================

import { COURSES, STAGES, findCourse } from './content.js';
import { t } from './i18n.js';

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function diffDots(level) {
  let out = '';
  for (let i = 1; i <= 5; i++) {
    out += `<span class="diff-dot${i <= level ? ' is-on' : ''}" aria-hidden="true"></span>`;
  }
  return out;
}

function thumbHtml(c) {
  const path = `/${c.thumb}`;
  return `
    <div class="thumb-frame">
      <div class="thumb-placeholder" aria-hidden="true">${escapeHtml(c.cn)} · ${escapeHtml(c.py)}</div>
      <img src="${escapeHtml(path)}" alt="${escapeHtml(c.cn)} ${escapeHtml(c.py)}" loading="lazy">
    </div>`;
}

function startBtn(c) {
  if (!c.live) {
    return `<span class="btn-ghost cursor-default opacity-60" data-i18n="card_soon">即将推出</span>`;
  }
  return `<a class="btn-ink no-underline inline-flex items-center" href="${escapeHtml(c.url)}" target="_blank" rel="noopener" data-i18n="card_start">开始 →</a>`;
}

function doneBtn(c) {
  if (!c.live) return ''; // no progress toggle for unreleased courses
  return `<button class="btn-ghost" data-done-btn aria-pressed="false" data-i18n="card_done">完成 ✓</button>`;
}

function cardHtml(c) {
  const soonBadge = c.live ? '' : `<span class="badge-soon" data-i18n="card_soon">即将推出</span>`;
  return `
    <article class="card flex flex-col" data-course="${escapeHtml(c.id)}">
      ${thumbHtml(c)}
      <div class="p-6 flex-1 flex flex-col gap-4">
        <header class="flex items-baseline justify-between gap-3">
          <h3 class="text-3xl font-bold leading-none">
            <span class="font-serif-cn">${escapeHtml(c.cn)}</span>
            <span class="font-en italic text-2xl text-[var(--color-ink-soft)] ml-1">${escapeHtml(c.py)}</span>
          </h3>
          ${soonBadge}
        </header>
        <p class="text-xl leading-snug">
          <span data-pitch-zh>${escapeHtml(c.pitch.zh)}</span>
          <span data-pitch-en class="font-en italic text-[var(--color-ink-soft)] block text-lg">${escapeHtml(c.pitch.en)}</span>
        </p>
        <p class="text-base text-[var(--color-ink-soft)]">
          <em class="not-italic font-mono text-xs uppercase tracking-widest text-[var(--color-ink-muted)] block mb-1" data-i18n="card_pickif">适合你，如果…</em>
          <span data-pickif>${escapeHtml(c.pickThisIf.zh)}</span>
        </p>
        <ul class="flex flex-wrap gap-x-5 gap-y-1 text-sm font-mono mt-auto">
          <li>· <span data-duration>${escapeHtml(c.duration.zh)}</span></li>
          <li>· <span data-perday>${escapeHtml(c.perDay.zh)}</span></li>
          <li class="flex items-center gap-1">
            · <span data-i18n="card_difficulty">难度</span>
            <span class="ml-1 inline-flex items-center">${diffDots(c.difficulty)}</span>
          </li>
        </ul>
        <div class="flex flex-wrap items-center gap-3 pt-2">
          ${startBtn(c)}
          ${doneBtn(c)}
        </div>
      </div>
    </article>`;
}

function arrowSvg() {
  // Hand-drawn vertical arrow between stages.
  return `
    <div class="my-12 md:my-16 flex justify-center" aria-hidden="true">
      <svg class="hand-arrow" width="60" height="120" viewBox="0 0 60 120" fill="none">
        <path d="M30 4 C 28 28, 34 50, 28 78 C 26 88, 32 96, 30 110"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
        <path d="M16 96 C 22 102, 28 108, 30 114 C 32 108, 38 102, 44 96"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
      </svg>
    </div>`;
}

function stageHtml(stage) {
  const courses = stage.ids.map(findCourse).filter(Boolean);
  const isWide = courses.length === 1;
  const grid = isWide
    ? 'grid grid-cols-1 max-w-2xl mx-auto'
    : 'grid grid-cols-1 md:grid-cols-2 gap-8';
  const subhead = stage.pickOne
    ? `<p class="stage-label mt-2" data-i18n="stage_pickone">二选一 · 同样起点，不同风格</p>`
    : '';
  return `
    <section id="stage-${stage.number}" class="mt-20 md:mt-28">
      <header class="text-center mb-10">
        <p class="stage-label">Stage · ${stage.number}</p>
        <h2 class="mt-2 text-4xl md:text-5xl">
          <span class="font-serif-cn">${escapeHtml(stage.label.zh)}</span>
          <span class="font-en italic text-[var(--color-ink-soft)] ml-2">/ ${escapeHtml(stage.label.en)}</span>
        </h2>
        ${subhead}
      </header>
      <div class="${grid}">
        ${courses.map(cardHtml).join('')}
      </div>
    </section>`;
}

export function renderStages(mountEl) {
  if (!mountEl) return;
  const html = STAGES.map((s, i) =>
    `${stageHtml(s)}${i < STAGES.length - 1 ? arrowSvg() : ''}`
  ).join('');
  mountEl.innerHTML = html;
  // Hide broken thumbnails so the placeholder shows through (CSP-safe — no inline handler)
  mountEl.querySelectorAll('.thumb-frame img').forEach((img) => {
    img.addEventListener('error', () => { img.style.display = 'none'; }, { once: true });
  });
  refreshDynamicI18n();
  document.addEventListener('lang:changed', refreshDynamicI18n);
}

function refreshDynamicI18n() {
  // Pitch text (zh + en shown together — like a zine), but the pickif & duration swap.
  const lang = document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  document.querySelectorAll('[data-course]').forEach((card) => {
    const id = card.getAttribute('data-course');
    const c = COURSES.find((x) => x.id === id);
    if (!c) return;
    const pickEl = card.querySelector('[data-pickif]');
    if (pickEl) pickEl.textContent = c.pickThisIf[lang];
    const durEl = card.querySelector('[data-duration]');
    if (durEl) durEl.textContent = c.duration[lang];
    const perEl = card.querySelector('[data-perday]');
    if (perEl) perEl.textContent = c.perDay[lang];
  });
}
