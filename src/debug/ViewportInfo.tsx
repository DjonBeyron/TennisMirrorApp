import { useEffect, useState } from 'react';

// Временная диагностика размеров экрана: iOS в установленной PWA считает высоту по-разному.
// Уберём, когда раскладка подтвердится на iPhone и планшете.

function safeArea(): [number, number] {
  const el = document.createElement('div');
  el.style.cssText =
    'position:fixed;visibility:hidden;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)';
  document.body.append(el);
  const cs = getComputedStyle(el);
  const result: [number, number] = [parseFloat(cs.paddingTop), parseFloat(cs.paddingBottom)];
  el.remove();
  return result;
}

function measure(): string[] {
  const app = document.querySelector('.app')?.getBoundingClientRect();
  const vv = window.visualViewport;
  const [top, bottom] = safeArea();
  const standalone = matchMedia('(display-mode: standalone)').matches;
  const r = Math.round;
  return [
    `v${__APP_VERSION__} · ${__APP_COMMIT__} · ${standalone ? 'PWA' : 'браузер'}`,
    `экран ${screen.width}×${screen.height} · окно ${innerWidth}×${innerHeight}`,
    `app ${r(app?.width ?? 0)}×${r(app?.height ?? 0)} · html ${document.documentElement.clientHeight}`,
    `vv ${r(vv?.height ?? 0)} сдвиг ${r(vv?.offsetTop ?? 0)} · safe ↑${top} ↓${bottom}`,
  ];
}

export function ViewportInfo() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const update = () => setLines(measure());
    // iOS может поменять размеры уже после запуска — перемеряем сразу, через секунду и при изменениях.
    const timers = [setTimeout(update, 0), setTimeout(update, 1000)];
    addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      timers.forEach(clearTimeout);
      removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);

  return <pre className="viewport-info">{lines.join('\n')}</pre>;
}
