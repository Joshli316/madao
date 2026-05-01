// ============================================
// 码道 MaDao i18n — bilingual toggle
// Pattern adapted from QiMa: localStorage-persisted,
// updates html[lang] in init AND on toggle.
// ============================================

const LS_KEY = 'madao:lang';
let currentLang = 'zh';

const STRINGS = {
  // Header
  brand_cn: { zh: '码道', en: '码道' }, // 码道 stays bilingual-fixed
  brand_en: { zh: 'MaDao', en: 'MaDao' },
  toggle_to_en: { zh: 'EN', en: '中' },

  // Hero
  tagline_cn: { zh: '从零到智能体', en: '从零到智能体' },
  tagline_en: { zh: 'From Zero to Agentic AI', en: 'From Zero to Agentic AI' },
  hero_cn: { zh: '码道', en: '码道' },
  hero_en: { zh: 'The Way of Code', en: 'The Way of Code' },
  hero_pitch: {
    zh: '五门 Claude Code 教程，组成一条由浅入深的路径。从写第一行代码，到搭建你的第一个智能体。每一阶段两种风格——挑你喜欢的那一种。',
    en: 'Five Claude Code tutorials, arranged from beginner to advanced. From your first line of code to your first AI agent. Each stage offers two flavors — pick the one that fits you.',
  },
  hero_cta: { zh: '从这里开始 ↓', en: 'Start Here ↓' },
  hero_meta: { zh: '免费 · 无登录 · 双语', en: 'Free · No login · Bilingual' },

  // Stage labels
  stage_pickone: { zh: '二选一 · 同样起点，不同风格', en: 'Pick one · same level, different vibes' },
  stage_1_cn: { zh: '入门', en: 'Foundations' },
  stage_2_cn: { zh: '练习', en: 'Practice' },
  stage_3_cn: { zh: '进阶', en: 'Advanced' },

  // Card UI
  card_pickif: { zh: '适合你，如果…', en: 'Pick this if…' },
  card_start: { zh: '开始 →', en: 'Start →' },
  card_done: { zh: '完成 ✓', en: 'Done ✓' },
  card_undone: { zh: '已完成 ✓', en: 'Completed ✓' },
  card_soon: { zh: '即将推出', en: 'Coming Soon' },
  card_difficulty: { zh: '难度', en: 'Difficulty' },

  // FAQ
  faq_title: { zh: '常见问题', en: 'FAQ' },
  faq_q1: { zh: '我必须做完五门吗？', en: 'Do I have to finish all five?' },
  faq_a1: {
    zh: '不必。每个阶段挑一门就够了——三门走完，你就走过了从零到 agent 的全程。',
    en: "No. Pick one per stage — three courses end-to-end take you from zero to agentic AI.",
  },
  faq_q2: { zh: '可以跳过某个阶段吗？', en: 'Can I skip a stage?' },
  faq_a2: {
    zh: '可以。如果你已经会写代码，从「智路」直接开始；如果你完全没碰过代码，强烈建议从「起码」或「AI 起」开始。',
    en: "Yes. If you already code, start with AgentPath. If you've never coded, start with QiMa or AiQi.",
  },
  faq_q3: { zh: '一共需要多久？', en: 'How long total?' },
  faq_a3: {
    zh: '走完三门约 4–5 个月，每天 30–60 分钟。可以慢慢来——这是一条路，不是一场比赛。',
    en: 'About 4–5 months for three courses, 30–60 min/day. Take your time — this is a path, not a race.',
  },
  faq_q4: { zh: '为什么有两种风格的入门课？', en: 'Why two flavors per stage?' },
  faq_a4: {
    zh: '因为「最好的课」对每个人不一样。安静温暖的人和爱玩游戏的人需要不同的入口。两条路都到得了同一个目的地。',
    en: 'Because "best course" depends on the person. Quiet warmth and game-driven play are different doorways into the same destination.',
  },
  faq_q5: { zh: '是谁做的这个网站？', en: 'Who built this?' },
  faq_a5: {
    zh: '一个用 Claude Code 自学编程的留学生。这五门教程都是我做的——这个 hub 把它们串成一条路。',
    en: 'A student who learned to code by using Claude Code. I built all five tutorials — this hub strings them into a single path.',
  },

  // Footer
  footer_built: { zh: '用 Claude Code 搭建', en: 'Built with Claude Code' },
  footer_year: { zh: '2026', en: '2026' },
  footer_github: { zh: 'GitHub', en: 'GitHub' },

  // a11y
  a11y_skip: { zh: '跳到主内容', en: 'Skip to main content' },
  a11y_lang_toggle: { zh: '切换到英文', en: 'Switch to Chinese' },
};

export function t(key, params) {
  const entry = STRINGS[key];
  if (!entry) {
    console.warn(`[i18n] Missing key: "${key}"`);
    return key;
  }
  let str = entry[currentLang] || entry['en'] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replaceAll(`{${k}}`, v);
    }
  }
  return str;
}

export function getLanguage() {
  return currentLang;
}

export function setLanguage(lang) {
  if (lang !== 'zh' && lang !== 'en') return;
  currentLang = lang;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  try { localStorage.setItem(LS_KEY, lang); } catch {}
  applyTranslations();
  // Notify listeners (e.g., progress.js to refresh "Done" labels)
  document.dispatchEvent(new CustomEvent('lang:changed', { detail: { lang } }));
}

export function toggleLanguage() {
  setLanguage(currentLang === 'zh' ? 'en' : 'zh');
}

export function initI18n() {
  let stored = null;
  try { stored = localStorage.getItem(LS_KEY); } catch {}
  // Default: Chinese (per CLAUDE.md), unless user previously chose English.
  currentLang = stored === 'en' ? 'en' : 'zh';
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  applyTranslations();
}

export function applyTranslations() {
  const els = document.querySelectorAll('[data-i18n]');
  els.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    el.textContent = t(key);
  });
  const attrEls = document.querySelectorAll('[data-i18n-attr]');
  attrEls.forEach((el) => {
    // format: "attr:key,attr:key"
    const spec = el.getAttribute('data-i18n-attr') || '';
    spec.split(',').map(s => s.trim()).filter(Boolean).forEach((pair) => {
      const [attr, key] = pair.split(':');
      if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
    });
  });
  // Toggle button text shows the OPPOSITE language (per CLAUDE.md: button shows
  // the language you'd switch TO, not current state — wait, CLAUDE.md says
  // "Toggle buttons show the CURRENT state, not the opposite." So in zh mode
  // the button says "中" (current) — but that's confusing. Re-reading CLAUDE.md:
  // "Toggle buttons show the CURRENT state, not the opposite." Means if you're
  // in Chinese, button reads "中". To clarify, we display CURRENT language.
  const toggleBtn = document.getElementById('lang-toggle');
  if (toggleBtn) {
    toggleBtn.textContent = currentLang === 'zh' ? '中' : 'EN';
    toggleBtn.setAttribute('aria-label', t('a11y_lang_toggle'));
  }
}
