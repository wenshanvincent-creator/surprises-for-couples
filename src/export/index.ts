import { strToU8, unzipSync, zipSync } from 'fflate';
import type { Zippable } from 'fflate';
import type { ProjectBundle, RecipientProps } from '../domain/types';
import { LIMITS, MEDIA_EXTENSIONS, validateBundle, validateProject } from '../domain/validation';

const FORMAT = 'surprises-for-couples-backup';
const decoder = new TextDecoder('utf-8', { fatal: true });
const mediaPath = (index: number, mimeType: string) => `media/${String(index + 1).padStart(4, '0')}.${MEDIA_EXTENSIONS[mimeType]}`;
const json = (value: unknown) => strToU8(JSON.stringify(value, null, 2));

async function checksum(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function zip(files: Zippable): Blob {
  const bytes = zipSync(files, { level: 6 });
  if (bytes.byteLength > LIMITS.archiveBytes) throw new Error('导出档案超过 256 MiB，请减少媒体后重试。');
  return new Blob([new Uint8Array(bytes)], { type: 'application/zip' });
}

async function mediaFiles(bundle: ProjectBundle): Promise<{ files: Zippable; assetUrls: Record<string, string>; contents: Record<string, Uint8Array> }> {
  const files: Zippable = Object.create(null);
  const assetUrls: Record<string, string> = Object.create(null);
  const contents: Record<string, Uint8Array> = Object.create(null);
  for (const [index, asset] of bundle.project.assets.entries()) {
    const path = mediaPath(index, asset.mimeType);
    assetUrls[asset.id] = path;
    contents[path] = new Uint8Array(await bundle.blobs[asset.id].arrayBuffer());
    files[path] = [contents[path], { level: 0 }];
  }
  return { files, assetUrls, contents };
}

/** Portable source archive. Media bytes are preserved without transcoding. */
export async function exportBackup(input: ProjectBundle): Promise<Blob> {
  const bundle = validateBundle(input);
  const { files, assetUrls, contents } = await mediaFiles(bundle);
  const project = json(bundle.project);
  if (project.length > LIMITS.jsonBytes) throw new Error('项目文本超过 5 MiB，请缩短内容后重试。');
  files['project.json'] = project;
  const assets = [];
  for (const asset of bundle.project.assets) {
    const path = assetUrls[asset.id];
    assets.push({ id: asset.id, path, sha256: await checksum(contents[path]) });
  }
  files['manifest.json'] = json({ format: FORMAT, version: 1, project: 'project.json', projectSha256: await checksum(project), assets });
  return zip(files);
}

function parseJson(bytes: Uint8Array | undefined, label: string): unknown {
  if (!bytes) throw new Error(`档案缺少${label}。`);
  try { return JSON.parse(decoder.decode(bytes)); }
  catch { throw new Error(`${label}不是有效的 UTF-8 JSON。`); }
}

/** Validate in memory; never opens or mutates the local database. */
export async function importBackup(file: Blob): Promise<ProjectBundle> {
  if (file.size > LIMITS.archiveBytes) throw new Error('备份不能超过 256 MiB。');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const names = new Set<string>();
  let expandedBytes = 0;
  try {
    // Inspect every entry before inflating any content, including duplicate names.
    unzipSync(bytes, { filter(entry) {
      const { name, originalSize } = entry;
      if (!/^(manifest\.json|project\.json|media\/[0-9]{4}\.[a-z0-9]+)$/.test(name) || names.has(name)) {
        throw new Error('备份包含不安全、重复或未知的文件路径。');
      }
      const maximum = name.startsWith('media/') ? LIMITS.assetBytes : LIMITS.jsonBytes;
      if (!Number.isSafeInteger(originalSize) || originalSize < 0 || originalSize > maximum) {
        throw new Error('备份中的文件超过大小限制。');
      }
      expandedBytes += originalSize;
      if (expandedBytes > LIMITS.totalMediaBytes + 2 * LIMITS.jsonBytes || names.size >= LIMITS.assets + 2) {
        throw new Error('备份展开后的内容超过大小或文件数量限制。');
      }
      names.add(name);
      return false;
    } });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('备份')) throw error;
    throw new Error('无法读取 ZIP 备份，文件可能已损坏。');
  }
  let files: Record<string, Uint8Array>;
  try { files = unzipSync(bytes); }
  catch { throw new Error('无法解压 ZIP 备份，文件可能已损坏。'); }
  const manifest = parseJson(files['manifest.json'], '清单') as Record<string, unknown> | null;
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest) || manifest.format !== FORMAT || manifest.version !== 1 || manifest.project !== 'project.json' || !Array.isArray(manifest.assets)) {
    throw new Error('备份清单或版本无效。');
  }
  const project = validateProject(parseJson(files['project.json'], '项目数据'));
  if (manifest.projectSha256 !== await checksum(files['project.json'])) throw new Error('项目数据校验失败，备份可能已损坏。');
  if (manifest.assets.length !== project.assets.length || names.size !== project.assets.length + 2) {
    throw new Error('备份媒体清单与项目不一致。');
  }
  const blobs: Record<string, Blob> = Object.create(null);
  for (const [index, asset] of project.assets.entries()) {
    const record = manifest.assets[index] as Record<string, unknown> | null;
    const expectedPath = mediaPath(index, asset.mimeType);
    if (!record || typeof record !== 'object' || record.id !== asset.id || record.path !== expectedPath || !Object.hasOwn(files, expectedPath)) {
      throw new Error(`备份缺少媒体或媒体路径无效：${asset.name}`);
    }
    const data = files[expectedPath];
    if (data.byteLength !== asset.size) throw new Error(`媒体大小与记录不符：${asset.name}`);
    if (record.sha256 !== await checksum(data)) throw new Error(`媒体校验失败，备份可能已损坏：${asset.name}`);
    blobs[asset.id] = new Blob([new Uint8Array(data)], { type: asset.mimeType });
  }
  return validateBundle({ project, blobs });
}

// Markdown output stays readable while preventing user text from becoming HTML,
// links, images or Markdown headings. Newlines and Unicode remain intact.
function markdown(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([\\`*_{}\[\]()#+.!|~-])/g, '\\$1');
}
function paragraph(value: string): string { return markdown(value).replace(/\r\n?/g, '\n'); }

export async function exportMarkdown(input: ProjectBundle): Promise<Blob> {
  const bundle = validateBundle(input);
  const p = bundle.project;
  const { files, assetUrls } = await mediaFiles(bundle);
  const memoryFiles = p.memories.map(memory => `memories/memory-${memory.id}.md`);
  const timeline = p.memories.map((memory, index) => `- ${memory.date} · [${markdown(memory.title || '未命名回忆')}](${memoryFiles[index]})`).join('\n');
  files['README.md'] = strToU8(`# ${markdown(p.title || '我们的故事')}\n\n${markdown(p.names.join(' & '))}\n\n相识日期：${p.startDate}\n\n${paragraph(p.dedication)}\n\n${p.occasion ? `下一次约定：${markdown(p.occasion.title)} · ${p.occasion.date}\n\n` : ''}[回忆时间线](timeline.md) · [给你的信](letter.md) · [小惊喜](surprises.md)\n\n这是可阅读的 Markdown 纪念册。继续编辑项目请使用单独导出的备份 ZIP。\n`);
  files['timeline.md'] = strToU8(`# 回忆时间线\n\n${timeline || '故事从下一段回忆开始。'}\n`);
  files['letter.md'] = strToU8(`# 给你的信\n\n${paragraph(p.letter)}\n`);
  files['surprises.md'] = strToU8(`# 一起做的小事\n\n${p.surprises.map(value => `- ${paragraph(value).replace(/\n/g, '\n  ')}`).join('\n')}\n`);
  for (const [index, memory] of p.memories.entries()) {
    const attachments = memory.assetIds.map(id => {
      const asset = p.assets.find(asset => asset.id === id)!;
      const label = markdown(asset.name || '媒体附件');
      const url = `../${assetUrls[id]}`;
      return asset.mimeType.startsWith('image/') ? `![${label}](${url})` : `[${label}](${url})`;
    }).join('\n\n');
    files[memoryFiles[index]] = strToU8(`# ${markdown(memory.title || '未命名回忆')}\n\n${memory.date}\n\n${paragraph(memory.body)}\n\n${attachments}\n\n[返回时间线](../timeline.md)\n`);
  }
  return zip(files);
}

function html(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function embeddedJson(value: RecipientProps): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
async function runtimeFile(name: string): Promise<Uint8Array> {
  const response = await fetch(`${import.meta.env.BASE_URL}${name}`);
  if (!response.ok) throw new Error(`无法加载离线展示文件 ${name}，请重新构建应用后重试。`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const text = new TextDecoder().decode(bytes);
  // Static SPA hosts can return index.html with status 200 for missing assets.
  if (!bytes.length || /^\s*(?:<!doctype|<html)/i.test(text)) throw new Error(`离线展示文件 ${name} 缺失，请重新构建应用。`);
  return bytes;
}

export async function exportMuseum(input: ProjectBundle): Promise<Blob> {
  const bundle = validateBundle(input);
  const { files, assetUrls } = await mediaFiles(bundle);
  const [javascript, stylesheet, license, notices] = await Promise.all([
    runtimeFile('museum-runtime.js'), runtimeFile('museum-runtime.css'),
    runtimeFile('LICENSE'), runtimeFile('THIRD_PARTY_NOTICES.md'),
  ]);
  files['museum-runtime.js'] = javascript;
  files['museum-runtime.css'] = stylesheet;
  files['LICENSE'] = license;
  files['THIRD_PARTY_NOTICES.md'] = notices;
  const props: RecipientProps = { project: bundle.project, assetUrls };
  files['index.html'] = strToU8(`<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<meta name="referrer" content="no-referrer">\n<title>${html(bundle.project.title || '我们的故事')}</title>\n<link rel="stylesheet" href="./museum-runtime.css">\n</head>\n<body>\n<div id="root"></div>\n<script>window.__COUPLES_DATA__=${embeddedJson(props)};</script>\n<script src="./museum-runtime.js"></script>\n</body>\n</html>\n`);
  files['打开纪念馆.txt'] = strToU8('请先完整解压 ZIP，再双击 index.html。请保留同目录的展示文件和 media 文件夹。\n此纪念馆可离线浏览；音视频格式的播放能力取决于浏览器。\n继续编辑请使用单独导出的备份 ZIP。\n');
  return zip(files);
}
