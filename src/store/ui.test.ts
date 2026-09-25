import { describe, expect, it } from 'vitest';
import { selectContentVisible, selectMode, selectOverlayActive } from './ui';

const ui = (layout: 'split' | 'dual', fullscreen: boolean, overlay: boolean) => ({
  layout,
  fullscreen,
  overlay,
});

describe('режимы экрана', () => {
  it('на весь экран — режим camera, выход возвращает раскладку', () => {
    expect(selectMode(ui('dual', true, false))).toBe('camera');
    expect(selectMode(ui('dual', false, false))).toBe('dual');
  });

  it('рядом с камерой эталон виден всегда и не накладывается', () => {
    expect(selectContentVisible(ui('split', false, false))).toBe(true);
    expect(selectOverlayActive(ui('split', false, true))).toBe(false);
  });

  it('в dual и на весь экран эталон виден только наложением', () => {
    expect(selectContentVisible(ui('dual', false, false))).toBe(false);
    expect(selectContentVisible(ui('dual', false, true))).toBe(true);
    expect(selectOverlayActive(ui('dual', false, true))).toBe(true);
    expect(selectContentVisible(ui('split', true, false))).toBe(false);
    expect(selectOverlayActive(ui('split', true, true))).toBe(true);
  });
});
