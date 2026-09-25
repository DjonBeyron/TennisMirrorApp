// Увеличивает patch-версию в package.json и package-lock.json. Вызывается git-хуком перед каждым коммитом
// (.githooks/pre-commit), поэтому версия в углу экрана меняется с каждым изменением.
import { readFileSync, writeFileSync } from 'node:fs';

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, data) => writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);

const pkg = readJson('package.json');
const [major, minor, patch] = pkg.version.split('.').map(Number);
const version = `${major}.${minor}.${patch + 1}`;
pkg.version = version;
writeJson('package.json', pkg);

try {
  const lock = readJson('package-lock.json');
  lock.version = version;
  if (lock.packages?.['']) lock.packages[''].version = version;
  writeJson('package-lock.json', lock);
} catch {
  // Без lock-файла достаточно package.json.
}

console.log(`Версия приложения: ${version}`);
