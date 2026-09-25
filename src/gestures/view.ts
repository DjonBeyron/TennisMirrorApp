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
/** При наложении эталон можно уменьшить: фигура в ролике бывает крупнее вашей в кадре. */
export const ALIGN_MIN_SCALE = 0.3;
/** Сколько пикселей эталона остаётся на экране, как далеко его ни утащи. */
const ALIGN_KEEP_PX = 24;
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
 * Выравнивание эталона поверх камеры: масштаб 0.3…5, сдвиг свободный, но хотя бы 24 px эталона
 * остаются на экране — иначе его не вернуть пальцем.
 */
export function clampAlign(view: View, width: number, height: number): View {
  const s = clamp(view.s, ALIGN_MIN_SCALE, MAX_SCALE);
  const maxX = Math.max(0, ((s + 1) * width) / 2 - ALIGN_KEEP_PX);
  const maxY = Math.max(0, ((s + 1) * height) / 2 - ALIGN_KEEP_PX);
  return { s, x: clamp(view.x, -maxX, maxX) + 0, y: clamp(view.y, -maxY, maxY) + 0 };
}

/**
 * Щипок: масштаб меняется в `ratio` раз от начала жеста, а точка контента под серединой
 * между пальцами остаётся под ней же — как в «Фото». Движение пальцев заодно двигает контент.
 */
export function pinchView(start: View, startMid: Point, mid: Point, ratio: number, minScale = 1): View {
  const s = clamp(start.s * ratio, minScale, MAX_SCALE);
  const k = s / start.s;
  return { s, x: mid.x - k * (startMid.x - start.x), y: mid.y - k * (startMid.y - start.y) };
}

/** Без увеличения и сдвига (с точностью до пары процентов и полупикселя). */
export const isIdentity = (view: View) =>
  Math.abs(view.s - 1) < 0.02 && Math.abs(view.x) < 0.5 && Math.abs(view.y) < 0.5;

/** Увеличено — один палец двигает контент, а не листает. */
export const isZoomedIn = (view: View) => view.s > 1.02;

/** Куда перелистнуть после свайпа: 1 — вперёд (палец влево), -1 — назад, 0 — остаться. */
export function swipeDirection(dx: number, width: number, canPrev: boolean, canNext: boolean): -1 | 0 | 1 {
  if (Math.abs(dx) < width * SWIPE_RATIO) return 0;
  if (dx < 0) return canNext ? 1 : 0;
  return canPrev ? -1 : 0;
}
