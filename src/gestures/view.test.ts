import { describe, expect, it } from 'vitest';
import { IDENTITY, MAX_SCALE, clampView, pinchView, swipeDirection, type Point, type View } from './view';

/** Где на экране окажется точка контента q (локальная, от центра слоя) при данном виде. */
const screenOf = (v: View, q: Point) => ({ x: v.x + v.s * q.x, y: v.y + v.s * q.y });

describe('pinchView', () => {
  it('точка под пальцами остаётся под ними', () => {
    const mid = { x: 40, y: -20 };
    const view = pinchView(IDENTITY, mid, mid, 2);
    expect(view.s).toBe(2);
    const q = { x: 40, y: -20 }; // при IDENTITY под mid лежит локальная точка mid
    expect(screenOf(view, q)).toEqual(mid);
  });

  it('движение пальцев двигает контент вместе с ними', () => {
    const view = pinchView(IDENTITY, { x: 0, y: 0 }, { x: 30, y: 10 }, 1);
    expect(view).toEqual({ s: 1, x: 30, y: 10 });
  });

  it('масштаб не выходит за 1…5', () => {
    expect(pinchView(IDENTITY, { x: 0, y: 0 }, { x: 0, y: 0 }, 0.3).s).toBe(1);
    expect(pinchView({ s: 4, x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, 3).s).toBe(MAX_SCALE);
  });
});

describe('clampView', () => {
  it('без увеличения сдвигать некуда', () => {
    expect(clampView({ s: 1, x: 50, y: -50 }, 400, 300)).toEqual({ s: 1, x: 0, y: 0 });
  });

  it('при ×2 край контента не отходит от края сцены', () => {
    expect(clampView({ s: 2, x: 500, y: -500 }, 400, 300)).toEqual({ s: 2, x: 200, y: -150 });
  });
});

describe('swipeDirection', () => {
  it('короткий свайп не листает', () => {
    expect(swipeDirection(-50, 400, true, true)).toBe(0);
  });

  it('палец влево — вперёд, вправо — назад', () => {
    expect(swipeDirection(-100, 400, true, true)).toBe(1);
    expect(swipeDirection(100, 400, true, true)).toBe(-1);
  });

  it('на краях дальше не листает', () => {
    expect(swipeDirection(-100, 400, true, false)).toBe(0);
    expect(swipeDirection(100, 400, false, true)).toBe(0);
  });
});
