// Focused real-browser storage/export integration. Run build:museum and a Vite
// server first, then: node tests/data/browser-check.mjs http://127.0.0.1:4317
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { unzipSync } from 'fflate';

const origin = process.argv[2] || 'http://127.0.0.1:4317';
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || undefined, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined });
const temporary = await mkdtemp(join(tmpdir(), 'couples-data-check-'));
try {
  const editor = await browser.newPage();
  // A blank Vite-served document avoids the editor's own persistence effects.
  await editor.route('**/src/main.tsx', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await editor.goto(`${origin}/index.html`);
  const seeded = await editor.evaluate(async () => {
    const { createDemoProject } = await import('/src/domain/project.ts');
    const storage = await import('/src/storage/index.ts');
    await storage.clearProject();
    const bundle = createDemoProject();
    bundle.project.title = '离线集成：中文 💌';
    bundle.project.letter = '</script><script>window.injected = true</script>\n中文信件';
    await storage.saveProject(bundle);
    return { title: bundle.project.title, coffee: await bundle.blobs.coffee.text() };
  });
  await editor.reload();
  const saved = await editor.evaluate(async () => {
    const storage = await import('/src/storage/index.ts');
    const bundle = await storage.loadProject();
    const previousTitle = bundle.project.title;
    const originalPut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args) {
      const request = originalPut.apply(this, args);
      this.transaction.abort();
      return request;
    };
    let rejected = false;
    try {
      await storage.saveProject({ ...bundle, project: { ...bundle.project, title: 'must not persist' } });
    } catch { rejected = true; }
    finally { IDBObjectStore.prototype.put = originalPut; }
    const afterAbort = await storage.loadProject();
    return { title: bundle.project.title, coffee: await bundle.blobs.coffee.text(), rejected, preserved: afterAbort.project.title === previousTitle };
  });
  assert.equal(saved.title, seeded.title);
  assert.equal(saved.coffee, seeded.coffee);
  assert.equal(saved.rejected, true);
  assert.equal(saved.preserved, true);

  const videoBytes = Array.from(await readFile(new URL('./fixtures/original-rose.webm', import.meta.url)));
  const archive = await editor.evaluate(async videoBytes => {
    const storage = await import('/src/storage/index.ts');
    const { exportMuseum } = await import('/src/export/index.ts');
    const bundle = await storage.loadProject();
    // Valid generated audio/video ensure this checks actual media decoding.
    const wav = new Uint8Array(44 + 8000 * 2);
    const header = new DataView(wav.buffer);
    const write = (offset, text) => [...text].forEach((letter, index) => { wav[offset + index] = letter.charCodeAt(0); });
    write(0, 'RIFF'); header.setUint32(4, wav.length - 8, true); write(8, 'WAVE'); write(12, 'fmt ');
    header.setUint32(16, 16, true); header.setUint16(20, 1, true); header.setUint16(22, 1, true);
    header.setUint32(24, 8000, true); header.setUint32(28, 16000, true); header.setUint16(32, 2, true); header.setUint16(34, 16, true);
    write(36, 'data'); header.setUint32(40, wav.length - 44, true);
    const audio = new Blob([wav], { type: 'audio/wav' });
    const video = new Blob([new Uint8Array(videoBytes)], { type: 'video/webm' });
    const probe = document.createElement('video');
    probe.src = URL.createObjectURL(video);
    await new Promise((resolve, reject) => {
      probe.onloadedmetadata = resolve;
      probe.onerror = () => reject(new Error(`Generated video cannot decode: code ${probe.error?.code}; bytes ${video.size}`));
      setTimeout(() => reject(new Error(`Generated video metadata timed out; bytes ${video.size}`)), 5000);
    });
    URL.revokeObjectURL(probe.src);
    for (const [id, name, blob] of [['audio-test', '原声.wav', audio], ['video-test', '短片.webm', video]]) {
      bundle.project.assets.push({ id, name, mimeType: blob.type, size: blob.size });
      bundle.blobs[id] = blob;
      bundle.project.memories[0].assetIds.push(id);
    }
    const result = await exportMuseum(bundle);
    return Array.from(new Uint8Array(await result.arrayBuffer()));
  }, videoBytes);
  const files = unzipSync(new Uint8Array(archive));
  assert.ok(files.LICENSE?.length > 0);
  assert.ok(files['THIRD_PARTY_NOTICES.md']?.length > 0);
  for (const [name, bytes] of Object.entries(files)) {
    const target = resolve(temporary, name);
    assert.ok(target.startsWith(`${resolve(temporary)}${process.platform === 'win32' ? '\\' : '/'}`));
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, bytes);
  }
  const context = await browser.newContext({ offline: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.fetch = () => { throw new Error('Export attempted a runtime fetch'); };
    indexedDB.open = () => { throw new Error('Export attempted browser storage'); };
  });
  await page.goto(pathToFileURL(join(temporary, 'index.html')).href);
  await page.getByRole('heading', { name: seeded.title, exact: true }).waitFor();
  await page.locator('#our-letter').scrollIntoViewIfNeeded();
  assert.ok((await page.locator('.letter-body').innerText()).includes('</script><script>'));
  assert.equal(await page.evaluate(() => window.injected), undefined);
  await page.locator('img').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
  await page.waitForFunction(() => [...document.querySelectorAll('img')].every(image => image.complete && image.naturalWidth > 0));
  try {
    await page.waitForFunction(() => [...document.querySelectorAll('audio,video')].length === 2 && [...document.querySelectorAll('audio,video')].every(media => media.readyState >= 1), null, { timeout: 5000 });
  } catch (error) {
    console.error(await page.locator('audio,video').evaluateAll(elements => elements.map(media => ({ tag: media.tagName, src: media.currentSrc, readyState: media.readyState, error: media.error?.message, code: media.error?.code }))));
    throw error;
  }
  await page.getByRole('button', { name: '打开一个小惊喜' }).click();
  const firstSurprise = await page.locator('.surprise-note').innerText();
  await page.getByRole('button', { name: '再抽一个约定' }).click();
  assert.notEqual(await page.locator('.surprise-note').innerText(), firstSurprise);
  for (const selector of ['audio', 'video']) {
    await page.locator(selector).evaluate(media => media.play());
    await page.waitForFunction(selector => document.querySelector(selector).currentTime > 0, selector);
    await page.locator(selector).evaluate(media => media.pause());
  }
  await page.getByRole('link', { name: '故事', exact: true }).click();
  assert.ok(page.url().endsWith('#our-story'));
  assert.deepEqual(errors, []);
  await editor.evaluate(async () => {
    const storage = await import('/src/storage/index.ts');
    await storage.clearProject();
    if (await storage.loadProject() !== null) throw new Error('clearProject did not clear the database');
  });
  console.log('PASS: IndexedDB Blob persistence after reload; aborted save preserves previous data; shared runtime at file:// offline; license files; Chinese/script-like text; original SVGs; WAV/WebM playback; navigation and surprise interaction; clearProject.');
} finally {
  await browser.close();
  // Only remove the exact task-owned temporary directory created above.
  assert.equal(dirname(resolve(temporary)), resolve(tmpdir()));
  assert.ok(basename(temporary).startsWith('couples-data-check-'));
  await rm(temporary, { recursive: true, force: true });
}
