// ============================================
// 码道 MaDao — Course metadata
// Single source of truth. Update here, not in HTML.
// ============================================

export const COURSES = [
  {
    id: 'qima',
    cn: '起码',
    py: 'QiMa',
    pitch: { zh: '你的第一行代码', en: 'Your first line of code' },
    pickThisIf: {
      zh: '你想要温暖、不慌不忙的两周入门，中文为主。',
      en: 'You want a warm, unhurried 14-day onboarding, Chinese-first.',
    },
    duration: { zh: '14 天', en: '14 days' },
    perDay: { zh: '30 分钟/天', en: '30 min/day' },
    difficulty: 1,
    url: 'https://claude-code-launch.pages.dev/',
    thumb: 'public/thumbs/qima.png',
    live: true,
  },
  {
    id: 'aiqi',
    cn: 'AI 起',
    py: 'AiQi',
    pitch: { zh: 'AI 时代从这里起', en: 'Begin in the AI era' },
    pickThisIf: {
      zh: '你想要带登录、能跨设备追踪进度的更结构化路径。',
      en: 'You want a structured path with login and cross-device progress tracking.',
    },
    duration: { zh: '14 天', en: '14 days' },
    perDay: { zh: '30 分钟/天', en: '30 min/day' },
    difficulty: 1,
    url: 'https://aiqi.pages.dev/',
    thumb: 'public/thumbs/aiqi.png',
    live: true,
  },
  {
    id: 'codefu',
    cn: '码功',
    py: 'CodeFu',
    pitch: { zh: '修炼你的代码功夫', en: 'Train your code kung fu' },
    pickThisIf: {
      zh: '你刚学完入门，想用游戏化方式巩固词汇和命令。',
      en: 'You just finished a foundations course and want gamified vocabulary and command drills.',
    },
    duration: { zh: '30 天 · 6 个游戏', en: '30 days · 6 games' },
    perDay: { zh: '15 分钟/天', en: '15 min/day' },
    difficulty: 2,
    url: 'https://codefu.pages.dev/',
    thumb: 'public/thumbs/codefu.png',
    live: true,
  },
  {
    id: 'codeplay',
    cn: '码玩',
    py: 'CodePlay',
    pitch: { zh: '用玩耍的方式学代码', en: 'Learn by playing' },
    pickThisIf: {
      zh: '你喜欢更长的关卡式冒险，从入门一路打到面试就绪。',
      en: 'You prefer a longer level-based adventure, from beginner to interview-ready.',
    },
    duration: { zh: '约 9 个世界', en: '~9 worlds' },
    perDay: { zh: '20 分钟/天', en: '20 min/day' },
    difficulty: 2,
    url: '#',
    thumb: 'public/thumbs/codeplay.png',
    live: false, // Not yet deployed — show "Coming Soon"
  },
  {
    id: 'agentpath',
    cn: '智路',
    py: 'AgentPath',
    pitch: { zh: '通往智能体专家的 12 周', en: '12 weeks to becoming an agentic AI pro' },
    pickThisIf: {
      zh: '你已经会写代码，想转型成 AI agent 工程师。',
      en: 'You already code; you want to transition into agentic AI engineering.',
    },
    duration: { zh: '12 周', en: '12 weeks' },
    perDay: { zh: '1 小时/天', en: '1 hr/day' },
    difficulty: 4,
    url: 'https://agentpath.pages.dev/',
    thumb: 'public/thumbs/agentpath.png',
    live: true,
  },
];

export const STAGES = [
  { number: 1, label: { zh: '入门', en: 'Foundations' }, ids: ['qima', 'aiqi'], pickOne: true },
  { number: 2, label: { zh: '练习', en: 'Practice' }, ids: ['codefu', 'codeplay'], pickOne: true },
  { number: 3, label: { zh: '进阶', en: 'Advanced' }, ids: ['agentpath'], pickOne: false },
];

export function findCourse(id) {
  return COURSES.find((c) => c.id === id);
}
