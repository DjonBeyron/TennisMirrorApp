// Рисует иконки PWA без зависимостей: чёрный фон, линия раздела экрана, мяч с «отражением» снизу.
// Запуск: node scripts/make-icons.mjs → public/icons/*.png
import { mkdirSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';

const BG = [17, 17, 17];
const LINE = [58, 58, 58];
const BALL_TOP = [255, 122, 26];
const BALL_BOTTOM = [200, 90, 16];

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

function png(size, pixel) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 3 + 1); // первый байт строки — фильтр 0
    for (let x = 0; x < size; x++) raw.set(pixel(x + 0.5, y + 0.5), row + 1 + x * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.set([8, 2, 0, 0, 0], 8); // 8 бит, RGB
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const clamp01 = (v) => Math.min(1, Math.max(0, v));

function icon(size) {
  const c = size / 2;
  const radius = size * 0.26; // внутри безопасной зоны maskable (80 %)
  const half = Math.max(1, size * 0.012);
  return png(size, (x, y) => {
    let color = mix(BG, LINE, clamp01(half - Math.abs(y - c) + 0.5));
    const ball = y < c ? BALL_TOP : BALL_BOTTOM;
    color = mix(color, ball, clamp01(radius - Math.hypot(x - c, y - c) + 0.5));
    return color;
  });
}

mkdirSync('public/icons', { recursive: true });
const files = { 'icon-192.png': 192, 'icon-512.png': 512, 'apple-touch-icon.png': 180, 'favicon-32.png': 32 };
for (const [name, size] of Object.entries(files)) writeFileSync(`public/icons/${name}`, icon(size));
console.log(`Иконки: ${Object.keys(files).join(', ')}`);
