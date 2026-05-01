// ============================================
// 码道 MaDao — Progress (localStorage only, no auth)
// ============================================

import { t } from './i18n.js';

const KEY_PREFIX = 'madao:done:';

export function isDone(courseId) {
  try { return localStorage.getItem(KEY_PREFIX + courseId) === '1'; }
  catch { return false; }
}

export function setDone(courseId, done) {
  try {
    if (done) localStorage.setItem(KEY_PREFIX + courseId, '1');
    else localStorage.removeItem(KEY_PREFIX + courseId);
  } catch {}
  refreshCard(courseId);
}

export function toggleDone(courseId) {
  setDone(courseId, !isDone(courseId));
}

export function refreshCard(courseId) {
  const card = document.querySelector(`[data-course="${courseId}"]`);
  if (!card) return;
  const done = isDone(courseId);
  card.classList.toggle('is-done', done);
  const btn = card.querySelector('[data-done-btn]');
  if (btn) {
    btn.classList.toggle('is-done', done);
    btn.setAttribute('aria-pressed', done ? 'true' : 'false');
    btn.textContent = done ? t('card_undone') : t('card_done');
  }
}

export function refreshAll() {
  document.querySelectorAll('[data-course]').forEach((card) => {
    const id = card.getAttribute('data-course');
    if (id) refreshCard(id);
  });
}

export function initProgress() {
  refreshAll();
  document.addEventListener('click', (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;
    const btn = target.closest('[data-done-btn]');
    if (!btn) return;
    const card = btn.closest('[data-course]');
    if (!card) return;
    const id = card.getAttribute('data-course');
    if (id) toggleDone(id);
  });
  // Re-render labels when language changes
  document.addEventListener('lang:changed', () => refreshAll());
}
