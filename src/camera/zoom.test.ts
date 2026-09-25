import { describe, expect, it } from 'vitest';
import { clampZoom, formatZoom, zoomPresets, zoomRange } from './zoom';

describe('zoomRange', () => {
  it('нет zoom в возможностях — нет зума', () => {
    expect(zoomRange(undefined)).toBeNull();
    expect(zoomRange({})).toBeNull();
    expect(zoomRange({ zoom: { min: 1, max: 1 } })).toBeNull();
  });

  it('шаг по умолчанию 0.1', () => {
    expect(zoomRange({ zoom: { min: 1, max: 4 } })).toEqual({ min: 1, max: 4, step: 0.1 });
  });
});

describe('clampZoom', () => {
  const range = { min: 1, max: 4, step: 0.1 };

  it('держит значение в диапазоне', () => {
    expect(clampZoom(0.2, range)).toBe(1);
    expect(clampZoom(9, range)).toBe(4);
  });

  it('округляет до шага камеры', () => {
    expect(clampZoom(2.345, range)).toBe(2.3);
    expect(clampZoom(2.37, { min: 1, max: 4, step: 0.25 })).toBe(2.25);
  });
});

describe('zoomPresets', () => {
  it('планшет с зумом до 4×', () => {
    expect(zoomPresets({ min: 1, max: 4, step: 0.1 })).toEqual([1, 2, 3]);
  });

  it('тройная камера iPhone', () => {
    expect(zoomPresets({ min: 0.5, max: 15, step: 0.1 })).toEqual([0.5, 1, 2, 3, 5]);
  });

  it('минимум не круглый — он первым', () => {
    expect(zoomPresets({ min: 1.2, max: 8, step: 0.1 })).toEqual([1.2, 2, 3, 5]);
  });
});

describe('formatZoom', () => {
  it('подписи как в родной камере', () => {
    expect(formatZoom(0.5)).toBe('0.5×');
    expect(formatZoom(2)).toBe('2×');
    expect(formatZoom(2.34)).toBe('2.3×');
  });
});
