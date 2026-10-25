import type { Asset, Memory, Project, ProjectBundle } from './types';

export const LIMITS = {
  archiveBytes: 256 * 1024 * 1024,
  totalMediaBytes: 250 * 1024 * 1024,
  assetBytes: 50 * 1024 * 1024,
  jsonBytes: 5 * 1024 * 1024,
  memories: 1000,
  assets: 500,
} as const;

export const MEDIA_EXTENSIONS: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
  'image/webp': 'webp', 'image/avif': 'avif', 'image/svg+xml': 'svg',
  'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg',
  'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/webm': 'webm',
  'audio/flac': 'flac', 'video/mp4': 'mp4', 'video/webm': 'webm',
  'video/ogg': 'ogv', 'video/quicktime': 'mov',
};

function fail(message: string): never { throw new Error(message); }
function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${label}格式无效。`);
  return value as Record<string, unknown>;
}
function string(value: unknown, label: string, max = 200_000): string {
  if (typeof value !== 'string' || value.length > max) fail(`${label}必须是文本，且不能超过 ${max} 个字符。`);
  return value;
}
function id(value: unknown, label: string): string {
  const result = string(value, label, 100);
  if (!/^[a-zA-Z0-9_-]+$/.test(result)) fail(`${label}只能包含字母、数字、下划线与连字符。`);
  return result;
}
function array(value: unknown, label: string, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) fail(`${label}格式无效或数量超过 ${max}。`);
  return value;
}
export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}
function date(value: unknown, label: string): string {
  const result = string(value, label, 10);
  if (!isCalendarDate(result)) fail(`${label}必须是有效的 YYYY-MM-DD 日期。`);
  return result;
}
function unique(values: string[], label: string): void {
  if (new Set(values).size !== values.length) fail(`${label}包含重复 ID。`);
}

export function validateProject(value: unknown): Project {
  const p = object(value, '项目');
  if (p.schemaVersion !== 1) fail('不支持此项目版本，请使用兼容的应用版本。');
  const names = array(p.names, '两个人的名字', 2);
  if (names.length !== 2) fail('项目必须包含两个人的名字。');
  const assets: Asset[] = array(p.assets, '媒体', LIMITS.assets).map((value) => {
    const a = object(value, '媒体');
    const mimeType = string(a.mimeType, '媒体类型', 100);
    if (!Object.hasOwn(MEDIA_EXTENSIONS, mimeType)) fail(`不支持的媒体类型：${mimeType}`);
    if (typeof a.size !== 'number' || !Number.isSafeInteger(a.size) || a.size < 0 || a.size > LIMITS.assetBytes) {
      fail('单个媒体必须小于或等于 50 MiB。');
    }
    return { id: id(a.id, '媒体 ID'), name: string(a.name, '媒体名称', 1024), mimeType, size: a.size };
  });
  unique(assets.map(a => a.id), '媒体');
  if (assets.reduce((size, a) => size + a.size, 0) > LIMITS.totalMediaBytes) fail('媒体总大小不能超过 250 MiB。');
  const assetIds = new Set(assets.map(a => a.id));
  const memories: Memory[] = array(p.memories, '回忆', LIMITS.memories).map((value) => {
    const m = object(value, '回忆');
    const refs = array(m.assetIds, '回忆媒体', LIMITS.assets).map(value => id(value, '媒体引用'));
    unique(refs, '回忆媒体');
    if (refs.some(ref => !assetIds.has(ref))) fail('回忆引用了不存在的媒体。');
    return { id: id(m.id, '回忆 ID'), date: date(m.date, '回忆日期'), title: string(m.title, '回忆标题', 500), body: string(m.body, '回忆正文'), assetIds: refs };
  });
  unique(memories.map(m => m.id), '回忆');
  const accent = string(p.accent, '主题色', 7);
  if (!/^#[0-9a-fA-F]{6}$/.test(accent)) fail('主题色必须是六位十六进制颜色。');
  const occasion = p.occasion === null ? null : object(p.occasion, '纪念日');
  return {
    schemaVersion: 1, id: id(p.id, '项目 ID'), title: string(p.title, '项目标题', 500),
    names: [string(names[0], '名字', 200), string(names[1], '名字', 200)],
    startDate: date(p.startDate, '相识日期'), dedication: string(p.dedication, '献词'),
    letter: string(p.letter, '信'), accent, memories, assets,
    occasion: occasion ? { title: string(occasion.title, '纪念日标题', 500), date: date(occasion.date, '纪念日日期') } : null,
    surprises: array(p.surprises, '惊喜', 250).map(value => string(value, '惊喜', 10_000)),
  };
}

export function validateBundle(value: ProjectBundle): ProjectBundle {
  const project = validateProject(value.project);
  if (new TextEncoder().encode(JSON.stringify(project, null, 2)).byteLength > LIMITS.jsonBytes) fail('项目文本不能超过 5 MiB。');
  object(value.blobs, '媒体内容');
  const blobs: Record<string, Blob> = Object.create(null);
  for (const asset of project.assets) {
    if (!Object.hasOwn(value.blobs, asset.id)) fail(`缺少媒体：${asset.name}`);
    const blob = value.blobs[asset.id];
    if (!(blob instanceof Blob) || blob.size !== asset.size || blob.type !== asset.mimeType) {
      fail(`媒体内容与记录不符：${asset.name}`);
    }
    blobs[asset.id] = blob;
  }
  return { project, blobs };
}
