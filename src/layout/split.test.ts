import { describe, expect, it } from 'vitest';
import { SPLIT_MAX, SPLIT_MIN, clampSplit, dragSplit } from './split';

describe('clampSplit', () => {
  it('держит долю в границах', () => {
    expect(clampSplit(0)).toBe(SPLIT_MIN);
    expect(clampSplit(1)).toBe(SPLIT_MAX);
    expect(clampSplit(0.4)).toBe(0.4);
  });
});

describe('dragSplit', () => {
  it('камера первой: сдвиг вперёд увеличивает камеру', () => {
    expect(dragSplit(0.5, 100, 1000, true)).toBeCloseTo(0.6);
  });

  it('камера второй (swap): сдвиг вперёд уменьшает камеру', () => {
    expect(dragSplit(0.5, 100, 1000, false)).toBeCloseTo(0.4);
  });

  it('не выходит за границы', () => {
    expect(dragSplit(0.5, 900, 1000, true)).toBe(SPLIT_MAX);
    expect(dragSplit(0.5, 900, 1000, false)).toBe(SPLIT_MIN);
  });

  it('нулевой размер контейнера не ломает долю', () => {
    expect(dragSplit(0.3, 50, 0, true)).toBe(0.3);
  });
});
