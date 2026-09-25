// Подключает git-хуки проекта из .githooks/. Запускается автоматически после `npm install` (скрипт prepare).
// Без git (например, в сборке без репозитория) молча ничего не делает.
import { execSync } from 'node:child_process';

try {
  execSync('git config core.hooksPath .githooks', { stdio: 'ignore' });
} catch {
  // Нет git или это не репозиторий — хуки не нужны.
}
