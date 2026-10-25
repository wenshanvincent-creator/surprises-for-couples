import { build } from 'vite';
import { fileURLToPath } from 'node:url';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(resolve(root, 'public'), { recursive: true });
for (const name of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) {
  const contents = await readFile(resolve(root, name), 'utf8');
  if (!contents.trim()) throw new Error(`${name} must include the distribution license notices.`);
  await copyFile(resolve(root, name), resolve(root, 'public', name));
}
await build({
  configFile: false,
  root,
  publicDir: false,
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: 'public', emptyOutDir: false, cssCodeSplit: false, minify: true,
    lib: { entry: resolve(root, 'src/recipient/museum.tsx'), name: 'CouplesMuseum', formats: ['iife'], fileName: () => 'museum-runtime.js', cssFileName: 'museum-runtime' },
  },
  esbuild: { jsx: 'automatic' },
});
