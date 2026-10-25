// Generate an original 64x64 solid rose video. No third-party source footage.
// node tests/data/fixtures/generate-video.mjs /absolute/path/to/ffmpeg
import { deflateSync } from 'node:zlib';
import { writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const size = Buffer.alloc(4); size.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([size, body, crc]);
}
const header = Buffer.alloc(13);
header.writeUInt32BE(64, 0); header.writeUInt32BE(64, 4); header[8] = 8; header[9] = 2;
const rows = Buffer.alloc(64 * (64 * 3 + 1));
for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
  const offset = y * 193 + 1 + x * 3;
  rows[offset] = 168; rows[offset + 1] = 68; rows[offset + 2] = 88;
}
const png = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]);
const source = fileURLToPath(new URL('./source.png', import.meta.url));
const output = fileURLToPath(new URL('./original-rose.webm', import.meta.url));
writeFileSync(source, png);
try {
  const result = spawnSync(process.argv[2] || 'ffmpeg', ['-hide_banner', '-loop', '1', '-framerate', '10', '-i', source, '-t', '1', '-c:v', 'libvpx', '-pix_fmt', 'yuv420p', '-b:v', '100k', '-an', '-y', output], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`ffmpeg exited with ${result.status}`);
} finally { rmSync(source); }
