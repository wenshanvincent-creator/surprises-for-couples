import { afterEach, describe, expect, it, vi } from 'vitest';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { createBlankProject, createDemoProject, daysTogether, daysUntil } from '../../src/domain/project';
import { validateBundle } from '../../src/domain/validation';
import { exportBackup, exportMarkdown, exportMuseum, importBackup } from '../../src/export';
import type { ProjectBundle } from '../../src/domain/types';

async function unpack(blob: Blob) { return unzipSync(new Uint8Array(await blob.arrayBuffer())); }
function packed(files: Record<string, Uint8Array>) { return new Blob([new Uint8Array(zipSync(files))]); }
function fixture(): ProjectBundle {
  const bundle = createBlankProject();
  const bytes = new Uint8Array([0, 255, 128, 10, 13, 240, 159, 146, 140]);
  const blob = new Blob([bytes], { type: 'image/png' });
  bundle.project.names = ['林予', '陈安 💌'];
  bundle.project.title = '中文与 emoji 的纪念册';
  bundle.project.assets = [{ id: 'photo-1', name: '../../私密照片 "&<>.png', mimeType: blob.type, size: blob.size }];
  bundle.project.memories = [{ id: 'first-memory', date: '2024-02-29', title: '第一次见面 💌', body: '中文正文\n第二行', assetIds: ['photo-1'] }];
  bundle.blobs['photo-1'] = blob;
  return bundle;
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('portable backups', () => {
  it('round-trips Unicode, metadata, and every binary byte without using source filenames as paths', async () => {
    const source = fixture();
    const archive = await exportBackup(source);
    const result = await importBackup(archive);
    expect(result.project).toEqual(source.project);
    expect(result.blobs['photo-1'].type).toBe('image/png');
    expect(new Uint8Array(await result.blobs['photo-1'].arrayBuffer())).toEqual(new Uint8Array(await source.blobs['photo-1'].arrayBuffer()));
    expect(Object.keys(await unpack(archive)).sort()).toEqual(['manifest.json', 'media/0001.png', 'project.json']);
  });

  it('round-trips all original SVG demo media', async () => {
    const source = createDemoProject();
    const result = await importBackup(await exportBackup(source));
    expect(result.project).toEqual(source.project);
    for (const asset of source.project.assets) expect(await result.blobs[asset.id].text()).toBe(await source.blobs[asset.id].text());
  });

  it.each(['../stolen.txt', 'media/../outside.png', '/absolute.txt', 'C:\\stolen.txt', 'media\\outside.png'])('rejects unsafe archive entry %s', async path => {
    const files = await unpack(await exportBackup(fixture()));
    files[path] = strToU8('unsafe');
    await expect(importBackup(packed(files))).rejects.toThrow(/路径/);
  });

  it.each([
    ['future schema', (project: any) => { project.schemaVersion = 2; }],
    ['invalid date', (project: any) => { project.startDate = '2023-02-29'; }],
    ['missing media reference', (project: any) => { project.memories[0].assetIds = ['missing']; }],
    ['duplicate memory IDs', (project: any) => { project.memories.push(project.memories[0]); }],
    ['wrong media size', (project: any) => { project.assets[0].size += 1; }],
    ['CSS injection', (project: any) => { project.accent = 'url(x)'; }],
  ])('rejects %s without modifying the source project or accessing persistence', async (_label, mutate) => {
    const source = fixture();
    const unchanged = structuredClone(source.project);
    const files = await unpack(await exportBackup(source));
    const project = JSON.parse(strFromU8(files['project.json']));
    mutate(project);
    files['project.json'] = strToU8(JSON.stringify(project));
    const database = { open: vi.fn(() => { throw new Error('Import must not access storage'); }) };
    vi.stubGlobal('indexedDB', database);
    await expect(importBackup(packed(files))).rejects.toThrow();
    expect(source.project).toEqual(unchanged);
    expect(database.open).not.toHaveBeenCalled();
  });

  it('rejects missing media, malformed JSON, and non-ZIP files', async () => {
    const files = await unpack(await exportBackup(fixture()));
    delete files['media/0001.png'];
    await expect(importBackup(packed(files))).rejects.toThrow(/清单|媒体/);
    files['project.json'] = strToU8('{broken');
    await expect(importBackup(packed(files))).rejects.toThrow(/JSON/);
    await expect(importBackup(new Blob(['not a ZIP']))).rejects.toThrow(/ZIP/);
  });

  it('detects same-size binary corruption and modified valid project text with SHA-256', async () => {
    const archive = await exportBackup(fixture());
    const mediaFiles = await unpack(archive);
    mediaFiles['media/0001.png'][0] ^= 0xff;
    await expect(importBackup(packed(mediaFiles))).rejects.toThrow(/媒体校验失败/);
    const projectFiles = await unpack(archive);
    const project = JSON.parse(strFromU8(projectFiles['project.json']));
    project.title = 'Changed title';
    projectFiles['project.json'] = strToU8(JSON.stringify(project));
    await expect(importBackup(packed(projectFiles))).rejects.toThrow(/项目数据校验失败/);
  });

  it('rejects declared oversized entries before decompression', async () => {
    const source = new Uint8Array(await (await exportBackup(fixture())).arrayBuffer());
    // Change the central directory's original size to exceed the JSON boundary.
    const view = new DataView(source.buffer);
    for (let offset = 0; offset < source.length - 46; offset++) {
      if (view.getUint32(offset, true) === 0x02014b50) { view.setUint32(offset + 24, 60 * 1024 * 1024, true); break; }
    }
    await expect(importBackup(new Blob([source]))).rejects.toThrow(/大小限制/);
  });

  it('reports missing or inconsistent live blob data rather than exporting success', async () => {
    const source = fixture();
    delete source.blobs['photo-1'];
    await expect(exportBackup(source)).rejects.toThrow(/缺少媒体/);
    source.blobs['photo-1'] = new Blob(['wrong'], { type: 'image/png' });
    expect(() => validateBundle(source)).toThrow(/不符/);
  });
});

describe('human-readable exports', () => {
  it('escapes HTML and link syntax, preserves Unicode and gives media safe relative paths', async () => {
    const source = fixture();
    source.project.memories[0].body = '<script>alert(1)</script>\n[evil](javascript:alert(1))\n中文 💌';
    const files = await unpack(await exportMarkdown(source));
    const memory = strFromU8(files['memories/memory-first-memory.md']);
    expect(memory).toContain('&lt;script&gt;');
    expect(memory).not.toContain('<script>');
    expect(memory).toContain('\\[evil\\]\\(javascript:alert\\(1\\)\\)');
    expect(memory).toContain('中文 💌');
    expect(memory).toContain('(../media/0001.png)');
    expect(strFromU8(files['timeline.md'])).toContain('(memories/memory-first-memory.md)');
    expect(files['media/0001.png']).toEqual(new Uint8Array(await source.blobs['photo-1'].arrayBuffer()));
  });

  it('packages the shared runtime byte-for-byte and escapes script-like content inside embedded data', async () => {
    const source = fixture();
    source.project.title = '</title><script>bad()</script>';
    source.project.letter = '</script><script>alert("中文")</script>\u2028';
    const js = 'window.sharedRecipientRuntime = true;';
    const css = 'body{color:#a84458}';
    const license = 'MIT License\nCopyright original authors';
    const notices = 'Third-party runtime licenses';
    const fetchMock = vi.fn(async (path: string) => new Response(path.endsWith('.js') ? js : path.endsWith('.css') ? css : path.endsWith('LICENSE') ? license : notices));
    vi.stubGlobal('fetch', fetchMock);
    const files = await unpack(await exportMuseum(source));
    const html = strFromU8(files['index.html']);
    expect(strFromU8(files['museum-runtime.js'])).toBe(js);
    expect(strFromU8(files['museum-runtime.css'])).toBe(css);
    expect(strFromU8(files['LICENSE'])).toBe(license);
    expect(strFromU8(files['THIRD_PARTY_NOTICES.md'])).toBe(notices);
    expect(html).toContain('&lt;/title&gt;');
    expect(html).not.toContain('<script>alert');
    expect(html).toContain('\\u003c/script\\u003e');
    const encodedProps = html.match(/window\.__COUPLES_DATA__=(.*);<\/script>/)![1];
    const props = JSON.parse(encodedProps);
    expect(props.project).toEqual(source.project);
    expect(props.assetUrls).toEqual({ 'photo-1': 'media/0001.png' });
    expect(html).toContain('<script src="./museum-runtime.js"></script>');
    expect(html).not.toMatch(/type="module"|fetch\(|https?:\/\//);
  });

  it.each([new Response('missing', { status: 404 }), new Response('<!doctype html><html>SPA fallback</html>')])('fails visibly when runtime assets are missing', async response => {
    vi.stubGlobal('fetch', vi.fn(async () => response.clone()));
    await expect(exportMuseum(fixture())).rejects.toThrow(/离线展示文件/);
  });

  it('does not produce an archive when bundled runtime license files are missing', async () => {
    vi.stubGlobal('fetch', vi.fn(async (path: string) => path.endsWith('LICENSE') ? new Response('missing', { status: 404 }) : new Response('valid runtime file')));
    await expect(exportMuseum(fixture())).rejects.toThrow(/LICENSE/);
  });
});

describe('calendar days', () => {
  it('uses local calendar fields across leap days and signed past/future dates', () => {
    const now = new Date(2024, 2, 1, 0, 10);
    expect(daysTogether('2024-02-28', now)).toBe(2);
    expect(daysTogether('2024-03-01', now)).toBe(0);
    expect(daysUntil('2024-03-02', now)).toBe(1);
    expect(daysUntil('2024-02-29', now)).toBe(-1);
    expect(daysTogether('2024-03-02', now)).toBe(-1);
  });
  it.each(['America/New_York', 'Pacific/Auckland', 'Asia/Shanghai'])('ignores time-of-day and daylight saving offsets in %s', timezone => {
    const previous = process.env.TZ;
    process.env.TZ = timezone;
    try {
      expect(daysTogether('2024-03-09', new Date(2024, 2, 11, 0, 5))).toBe(2);
      expect(daysTogether('2024-11-02', new Date(2024, 10, 4, 23, 55))).toBe(2);
      expect(daysUntil('2025-01-01', new Date(2024, 11, 31, 23, 59))).toBe(1);
    } finally { process.env.TZ = previous; }
  });
  it.each(['2023-02-29', '2024-02-30', '2024-13-01', '0000-01-01', '2024-1-01', ''])('rejects invalid date %s', date => {
    expect(() => daysTogether(date)).toThrow(/日期/);
  });
  it('handles years below 100 without Date.UTC century shifting', () => {
    const now = new Date(0);
    now.setFullYear(50, 0, 2);
    expect(daysTogether('0050-01-01', now)).toBe(1);
  });
});
