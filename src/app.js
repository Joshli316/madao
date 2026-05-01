// ============================================
// 码道 MaDao — entry
// ============================================

import { initI18n, applyTranslations, toggleLanguage } from './i18n.js';
import { renderStages } from './render.js';
import { initProgress } from './progress.js';

function init() {
  initI18n();
  const stagesEl = document.getElementById('stages');
  renderStages(stagesEl);
  applyTranslations();
  initProgress();

  const toggle = document.getElementById('lang-toggle');
  if (toggle) toggle.addEventListener('click', () => toggleLanguage());

  // Smooth-scroll nicety for the hero CTA
  document.querySelectorAll('[data-scroll-to]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const sel = el.getAttribute('data-scroll-to');
      if (!sel) return;
      const target = document.querySelector(sel);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
