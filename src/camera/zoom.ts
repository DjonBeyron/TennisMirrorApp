// Нативный зум камеры: значения берутся из getCapabilities().zoom конкретного устройства.

export interface ZoomRange {
  min: number;
  max: number;
  step: number;
}

const PRESET_CANDIDATES = [0.5, 1, 2, 3, 5, 10];
const MAX_PRESETS = 5;

/** Диапазон зума трека или null, если камера зум не умеет. */
export function zoomRange(caps: MediaTrackCapabilities | undefined): ZoomRange | null {
  const zoom = caps?.zoom;
  if (!zoom || zoom.max - zoom.min < 0.1) return null;
  return { min: zoom.min, max: zoom.max, step: zoom.step && zoom.step > 0 ? zoom.step : 0.1 };
}

/** Ограничивает значение диапазоном и округляет до шага камеры. */
export function clampZoom(value: number, range: ZoomRange): number {
  const clamped = Math.min(range.max, Math.max(range.min, value));
  const snapped = range.min + Math.round((clamped - range.min) / range.step) * range.step;
  return Number(Math.min(range.max, snapped).toFixed(2));
}

/** Кнопки-пресеты: минимум камеры и «круглые» значения внутри диапазона, как в родной камере. */
export function zoomPresets(range: ZoomRange): number[] {
  const inRange = PRESET_CANDIDATES.filter((v) => v > range.min + 0.05 && v <= range.max + 1e-6);
  return [range.min, ...inRange].slice(0, MAX_PRESETS);
}

export function formatZoom(value: number): string {
  const text = Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
  return `${text}×`;
}
