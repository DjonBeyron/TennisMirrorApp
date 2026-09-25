// Математика увеличения и сдвига контента. Координаты — от центра сцены, в CSS-пикселях.

export interface Point {
  x: number;
  y: number;
}

/** Масштаб s и сдвиг (x, y) слоя с контентом: transform: translate(x, y) scale(s). */
export interface View {
  s: number;
  x: number;
  y: number;
}

export const IDENTITY: View = { s: 1, x: 0, y: 0 };
export const MAX_SCALE = 5;
/** Доля ширины, на которую надо протащить слайд, чтобы перелистнуть. */
export const SWIPE_RATIO = 0.2;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Масштаб 1…5; при увеличении контент нельзя утащить так, чтобы за краем показалась пустота. */
export function clampView(view: View, width: number, height: number): View {
  const s = clamp(view.s, 1, MAX_SCALE);
  const maxX = ((s - 1) * width) / 2;
  const maxY = ((s - 1) * height) / 2;
  // `+ 0` превращает -0 в 0, чтобы в transform не появлялось «-0px».
  return { s, x: clamp(view.x, -maxX, maxX) + 0, y: clamp(view.y, -maxY, maxY) + 0 };
}

/**
 * Щипок: масштаб меняется в `ratio` раз от начала жеста, а точка контента под серединой
 * между пальцами остаётся под ней же — как в «Фото». Движение пальцев заодно двигает контент.
 */
export function pinchView(start: View, startMid: Point, mid: Point, ratio: number): View {
  const s = clamp(start.s * ratio, 1, MAX_SCALE);
  const k = s / start.s;
  return { s, x: mid.x - k * (startMid.x - start.x), y: mid.y - k * (startMid.y - start.y) };
}

/** Почти без увеличения — считаем, что увеличения нет. */
export const isIdentity = (view: View) => view.s < 1.02;

/** Куда перелистнуть после свайпа: 1 — вперёд (палец влево), -1 — назад, 0 — остаться. */
export function swipeDirection(dx: number, width: number, canPrev: boolean, canNext: boolean): -1 | 0 | 1 {
  if (Math.abs(dx) < width * SWIPE_RATIO) return 0;
  if (dx < 0) return canNext ? 1 : 0;
  return canPrev ? -1 : 0;
}
