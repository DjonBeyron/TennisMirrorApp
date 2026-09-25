// Доля экрана, которую занимает камера. Границы — чтобы ни одна панель не схлопнулась.
export const SPLIT_MIN = 0.15;
export const SPLIT_MAX = 0.85;
export const SPLIT_DEFAULT = 0.5;

export function clampSplit(value: number): number {
  return Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, value));
}

/**
 * Новая доля камеры при перетаскивании разделителя.
 * `cameraFirst` — камера стоит первой по оси (сверху в портрете, слева в альбоме):
 * тогда сдвиг разделителя вперёд увеличивает камеру, иначе уменьшает.
 */
export function dragSplit(start: number, deltaPx: number, totalPx: number, cameraFirst: boolean): number {
  if (totalPx <= 0) return clampSplit(start);
  const delta = deltaPx / totalPx;
  return clampSplit(start + (cameraFirst ? delta : -delta));
}
