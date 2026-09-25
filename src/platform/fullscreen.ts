// Системный полноэкранный режим — только где он есть (Android). На iPhone его нет:
// там «на весь экран» — это раскладка на весь вьюпорт в установленной PWA.

export function enterFullscreen() {
  const root = document.documentElement;
  if (document.fullscreenElement || !root.requestFullscreen) return;
  root.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
}

export function exitFullscreen() {
  if (!document.fullscreenElement) return;
  document.exitFullscreen().catch(() => {});
}
