// Правило проекта: не больше 400 строк в любом файле кода (включая CSS и HTML, которые ESLint не видит).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const MAX = 400;
const EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.css', '.html']);
const SKIP = new Set(['node_modules', 'dist', 'dev-dist']);
const bad = [];

(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name) || name.startsWith('.')) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (EXT.has(extname(path))) {
      const text = readFileSync(path, 'utf8');
      const lines = text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
      if (lines > MAX) bad.push(`${path}: ${lines}`);
    }
  }
})('.');

if (bad.length) {
  console.error(`Файлы длиннее ${MAX} строк:\n${bad.join('\n')}`);
  process.exit(1);
}
console.log(`check-lines: все файлы не длиннее ${MAX} строк`);
