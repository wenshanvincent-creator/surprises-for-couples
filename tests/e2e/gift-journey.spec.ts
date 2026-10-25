import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { unzipSync, strFromU8 } from 'fflate';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const title = '给我们的中文纪念册';
const dangerousText = '雨天 </script><script>window.__injected=true</script><img src=x onerror="window.__injected=true"> & 一起回家';

function wav(): Buffer {
  const samples = 8_000;
  const bytes = Buffer.alloc(44 + samples * 2);
  bytes.write('RIFF'); bytes.writeUInt32LE(bytes.length - 8, 4); bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(8_000, 24); bytes.writeUInt32LE(16_000, 28);
  bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34); bytes.write('data', 36);
  bytes.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) bytes.writeInt16LE(Math.round(Math.sin(i * 2 * Math.PI * 220 / 8_000) * 2_000), 44 + i * 2);
  return bytes;
}

async function saved(page: Page) {
  await expect(page.locator('.save-indicator')).toHaveText('已保存在此浏览器');
}

async function makeGift(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: '从空白开始', exact: true }).click();
  await page.getByRole('button', { name: '确认替换', exact: true }).click();
  await page.getByLabel('礼物的名字', { exact: true }).fill(title);
  await page.getByLabel('你的名字', { exact: true }).fill('小林');
  await page.getByLabel('对方的名字', { exact: true }).fill('小陈');
  await page.getByLabel('故事开始的那天').fill('2024-02-29');
  await page.getByRole('button', { name: '回忆与相册' }).click();
  await page.getByRole('button', { name: '添加第一段回忆' }).click();
  await page.getByLabel('回忆标题', { exact: true }).fill('一起走过的雨天');
  await page.getByLabel('发生的日期').fill('2024-03-01');
  await page.getByLabel('那天的故事').fill(dangerousText);
  const video = await readFile(new URL('./fixtures/original-colors.webm', import.meta.url));
  await page.getByLabel('选择回忆附件').setInputFiles([
    { name: '原创像素.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=', 'base64') },
    { name: '原创声音.wav', mimeType: 'audio/wav', buffer: wav() },
    { name: '原创色块.webm', mimeType: 'video/webm', buffer: video },
  ]);
  const sourceVideo = page.locator('.attachment video');
  await expect.poll(() => sourceVideo.evaluate((element: HTMLVideoElement) => element.readyState)).toBeGreaterThanOrEqual(2);
  await sourceVideo.evaluate(async (element: HTMLVideoElement) => { await element.play(); });
  await expect.poll(() => sourceVideo.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0);
  await sourceVideo.evaluate((element: HTMLVideoElement) => element.pause());
  await page.getByRole('button', { name: '小惊喜', exact: true }).click();
  await page.getByRole('button', { name: '添加一个约定' }).click();
  await page.getByLabel('约定 1', { exact: true }).fill('一起去河边散步');
  await saved(page);
}

async function download(page: Page, label: string, info: TestInfo): Promise<string> {
  await page.getByRole('button', { name: '导出礼物' }).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('dialog').getByRole('button', { name: new RegExp(label) }).click();
  const result = await pending;
  const path = info.outputPath(result.suggestedFilename());
  await result.saveAs(path);
  return path;
}

test('edit, save, refresh, preview, and restore a backup without losing media', async ({ page }, info) => {
  await makeGift(page);
  await page.reload();
  await expect(page.getByLabel('礼物的名字', { exact: true })).toHaveValue(title);
  await page.getByRole('button', { name: '预览礼物', exact: true }).click();
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await expect(page.getByText(dangerousText, { exact: true })).toBeVisible();
  await expect(page.locator('audio')).toHaveCount(1);
  await expect(page.locator('video')).toHaveCount(1);
  await page.getByRole('button', { name: '打开一个小惊喜', exact: true }).click();
  await expect(page.getByText('一起去河边散步', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '返回编辑' }).click();
  const backup = await download(page, '可编辑备份', info);
  const files = unzipSync(await readFile(backup));
  const project = JSON.parse(strFromU8(files['project.json']));
  expect(project.names).toEqual(['小林', '小陈']);
  expect(project.memories[0].body).toBe(dangerousText);
  expect(project.assets).toHaveLength(3);
  expect(Object.keys(files).filter(name => name.startsWith('media/'))).toHaveLength(3);

  await page.getByLabel('礼物的名字', { exact: true }).fill('保留当前版本');
  await saved(page);
  await page.getByLabel('选择可编辑备份').setInputFiles({ name: 'broken.zip', mimeType: 'application/zip', buffer: Buffer.from('not a zip') });
  await expect(page.getByRole('alert')).toContainText('导入失败');
  await page.reload();
  await expect(page.getByLabel('礼物的名字', { exact: true })).toHaveValue('保留当前版本');
  await page.getByLabel('选择可编辑备份').setInputFiles(backup);
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await expect(page.getByLabel('礼物的名字', { exact: true })).toHaveValue('保留当前版本');
  await page.getByLabel('选择可编辑备份').setInputFiles(backup);
  await page.getByRole('button', { name: '确认替换', exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(page.getByLabel('礼物的名字', { exact: true })).toHaveValue(title);
  await page.getByRole('button', { name: '回忆与相册' }).click();
  await expect(page.getByLabel('那天的故事')).toHaveValue(dangerousText);
  await expect(page.locator('.attachment')).toHaveCount(3);
});

test('extracted museum works at file:// offline and treats dangerous text as text', async ({ page, browser }, info) => {
  await makeGift(page);
  const archive = await download(page, '离线回忆馆', info);
  const files = unzipSync(await readFile(archive));
  expect(strFromU8(files['LICENSE'])).toContain('Copyright (c) 2026 wenshanvincent-creator');
  expect(strFromU8(files['THIRD_PARTY_NOTICES.md'])).toContain('Copyright (c) Meta Platforms, Inc. and affiliates.');
  expect(strFromU8(files['THIRD_PARTY_NOTICES.md'])).toContain('Permission is hereby granted');
  const directory = info.outputPath('museum');
  for (const [name, bytes] of Object.entries(files)) {
    const destination = resolve(directory, name);
    expect(destination.startsWith(resolve(directory) + sep)).toBeTruthy();
    await mkdir(dirname(destination), { recursive: true }); await writeFile(destination, bytes);
  }
  const offline = await browser.newContext({ offline: true, viewport: { width: 390, height: 844 } });
  try {
  const gift = await offline.newPage();
  const failures: string[] = [];
  const remoteRequests: string[] = [];
  gift.on('pageerror', error => failures.push(error.message));
  gift.on('request', request => { if (/^https?:/.test(request.url())) remoteRequests.push(request.url()); });
  await gift.goto(pathToFileURL(resolve(directory, 'index.html')).href);
  await expect(gift.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await expect(gift.getByText(dangerousText, { exact: true })).toHaveText(dangerousText);
  expect(await gift.evaluate(() => (window as Window & { __injected?: boolean }).__injected)).toBeUndefined();
  await expect.poll(() => gift.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  for (const selector of ['audio', 'video']) {
    const media = gift.locator(selector);
    await expect.poll(() => media.evaluate((element: HTMLMediaElement) => element.readyState)).toBeGreaterThanOrEqual(1);
    await media.evaluate(async (element: HTMLMediaElement) => { await element.play(); });
    await expect.poll(() => media.evaluate((element: HTMLMediaElement) => element.currentTime)).toBeGreaterThan(0);
    await media.evaluate((element: HTMLMediaElement) => element.pause());
  }
  await gift.getByRole('button', { name: '打开一个小惊喜', exact: true }).click();
  await expect(gift.getByText('一起去河边散步', { exact: true })).toBeVisible();
  await gift.getByRole('link', { name: '信件', exact: true }).click();
  await expect(gift).toHaveURL(/#our-letter$/);
  await gift.getByRole('button', { name: '查看照片：原创像素.png', exact: true }).click();
  await expect(gift.getByRole('dialog')).toBeVisible();
  await gift.keyboard.press('Escape');
  await expect(gift.getByRole('dialog')).not.toBeVisible();
  for (const width of [320, 390, 768, 1440]) {
    await gift.setViewportSize({ width, height: 900 });
    expect(await gift.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(failures).toEqual([]);
  expect(remoteRequests).toEqual([]);
  } finally { await offline.close(); }

  const markdown = unzipSync(await readFile(await download(page, 'Markdown 记忆库', info)));
  expect(strFromU8(markdown['README.md'])).toContain(title);
  const memoryPath = Object.keys(markdown).find(name => /^memories\/.+\.md$/.test(name))!;
  expect(strFromU8(markdown[memoryPath])).toContain('&lt;/script&gt;');
  expect(strFromU8(markdown[memoryPath])).toContain('../media/');
});
