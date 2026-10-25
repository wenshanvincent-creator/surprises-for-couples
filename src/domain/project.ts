import type { ProjectBundle } from './types';
import { isCalendarDate } from './validation';

function localDate(now: Date): string {
  if (Number.isNaN(now.getTime())) throw new Error('当前日期无效。');
  return `${String(now.getFullYear()).padStart(4, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
function calendarDay(value: string): number {
  if (!isCalendarDate(value)) throw new Error('日期必须是有效的 YYYY-MM-DD 日期。');
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime() / 86_400_000;
}

/** Elapsed local calendar days; the start date itself is day zero. */
export function daysTogether(startDate: string, now = new Date()): number {
  return calendarDay(localDate(now)) - calendarDay(startDate);
}
/** Signed calendar days to this exact date, without annual recurrence. */
export function daysUntil(date: string, now = new Date()): number {
  return calendarDay(date) - calendarDay(localDate(now));
}
export function createBlankProject(): ProjectBundle {
  return {
    project: {
      schemaVersion: 1, id: crypto.randomUUID(), title: '我们的故事', names: ['', ''],
      startDate: localDate(new Date()), dedication: '', letter: '', occasion: null,
      accent: '#A84458', memories: [], surprises: [], assets: [],
    },
    blobs: {},
  };
}

export function createDemoProject(): ProjectBundle {
  const bundle = createBlankProject();
  bundle.project = {
    ...bundle.project, id: 'demo-project', title: '把平凡，收藏成我们', names: ['林予', '陈安'],
    startDate: '2023-05-20', dedication: '世界很大，但我最喜欢的风景，是和你一起的日常。',
    letter: '亲爱的陈安：\n\n有些日子，过的时候没有觉得特别。后来才发现，值得收藏的就是这些小事：你分给我的最后一口蛋糕、下雨时朝我偏过来的伞、走错路后一起笑出声。\n\n谢谢你，让普通的一天也有了被记住的理由。未来还有很多地方想和你一起去，也有很多平常的星期天，想和你一起慢慢过。\n\n下一页，我们一起写。\n\n林予\n\n（人物与故事均为虚构示例）',
    occasion: { title: '下一次一起看日落', date: '2026-12-20' },
    surprises: ['放下手机，去附近散步二十分钟。', '各挑一首歌，讲讲它让你想起的那一天。', '一起做顿晚饭，洗碗的人可以选电影。', '写一张小纸条，藏在对方明天会发现的地方。'],
    memories: [
      { id: 'first-coffee', date: '2023-05-20', title: '故事从一杯咖啡开始', body: '那天我们聊到店员开始收椅子。原本只约了一杯咖啡，后来却想约好很多个明天。', assetIds: ['coffee'] },
      { id: 'sea-weekend', date: '2023-08-12', title: '把周末交给海风', body: '没有详细的行程，只带了两张车票。海边的风很大，你说的话没听清，但笑容记得很清楚。', assetIds: ['sea'] },
      { id: 'rainy-evening', date: '2024-04-06', title: '下雨也要慢慢走', body: '回家的路比平时长了一点。我们在屋檐下等雨停，顺便把晚餐聊成了未来的计划。', assetIds: [] },
      { id: 'home-table', date: '2025-02-14', title: '两个人，一张小餐桌', body: '第一次一起做意面，盐放多了一点。你认真地说，下次就知道了。原来幸福也可以是一个“下次”。', assetIds: ['table'] },
    ],
    assets: [],
  };
  const illustrations = [
    ['coffee', '咖啡与第一封便笺.svg', '#ead8bf', '<ellipse cx="570" cy="470" rx="380" ry="100" fill="#d0b393"/><path d="M340 280h330v190q-160 160-330 0z" fill="#f9f2e7"/><ellipse cx="505" cy="280" rx="165" ry="48" fill="#593d31"/><path d="M670 310q160-20 120 120q-30 60-120 25" fill="none" stroke="#f9f2e7" stroke-width="35"/><rect x="60" y="360" width="220" height="160" rx="6" fill="#fff8ed" transform="rotate(-12 170 440)"/><path d="M105 410h120m-120 30h90m-90 30h110" stroke="#bc9290" stroke-width="8"/>'],
    ['sea', '周末的海.svg', '#d6e7e6', '<circle cx="830" cy="150" r="65" fill="#f3dca5"/><path d="M0 300q300-70 600 0t600 0v400H0" fill="#84b3b6"/><path d="M0 390q300-70 600 0t600 0" fill="none" stroke="#e7f5ef" stroke-width="15"/><path d="M0 510q450-80 1200 30v160H0" fill="#e5d4b5"/><path d="M410 420l60-160 60 160z" fill="#b66f72"/><path d="M480 430h130l-25 28h-85z" fill="#f8eee0"/>'],
    ['table', '两个人的晚餐.svg', '#e3c9be', '<path d="M0 350h1200v350H0" fill="#b47e6c"/><ellipse cx="370" cy="440" rx="210" ry="100" fill="#f7eddd"/><ellipse cx="830" cy="440" rx="210" ry="100" fill="#f7eddd"/><path d="M270 430q100-100 200 0m-190 30q100-100 190 0m-160 25q75-85 145-5" fill="none" stroke="#d5ad5c" stroke-width="16"/><path d="M730 430q100-100 200 0m-190 30q100-100 190 0m-160 25q75-85 145-5" fill="none" stroke="#d5ad5c" stroke-width="16"/><path d="M580 300h40v-110h-40z" fill="#f9edce"/><ellipse cx="600" cy="170" rx="13" ry="28" fill="#f3b15f"/>'],
  ];
  for (const [id, name, background, drawing] of illustrations) {
    const blob = new Blob([`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700"><rect width="1200" height="700" fill="${background}"/>${drawing}</svg>`], { type: 'image/svg+xml' });
    bundle.project.assets.push({ id, name, mimeType: blob.type, size: blob.size });
    bundle.blobs[id] = blob;
  }
  return bundle;
}
