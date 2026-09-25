import { describe, expect, it } from 'vitest';
import {
  selectCameraInContent,
  selectContentVisible,
  selectOverlayActive,
  selectOverlayCopy,
  type Layout,
  type Space,
} from './ui';

const ui = (layout: Layout, solo: Space | null, overlay: boolean) => ({ layout, solo, overlay });

describe('части экрана и наложение', () => {
  it('в режиме «рядом» эталон виден всегда и не накладывается', () => {
    expect(selectContentVisible(ui('split', null, false))).toBe(true);
    expect(selectOverlayActive(ui('split', null, true))).toBe(false);
  });

  it('эталон на весь экран в режиме «рядом» — обычный, без наложения', () => {
    expect(selectContentVisible(ui('split', 'content', false))).toBe(true);
    expect(selectOverlayActive(ui('split', 'content', true))).toBe(false);
  });

  it('только камера: эталон виден лишь наложением', () => {
    expect(selectContentVisible(ui('split', 'camera', false))).toBe(false);
    expect(selectOverlayActive(ui('split', 'camera', true))).toBe(true);
  });

  it('две камеры: во второй части камера, эталон — наложением', () => {
    expect(selectCameraInContent(ui('dual', null, false))).toBe(true);
    expect(selectContentVisible(ui('dual', null, false))).toBe(false);
    expect(selectOverlayActive(ui('dual', 'content', true))).toBe(true);
  });

  it('две камеры, но на весь экран первая часть — вторая камера не нужна', () => {
    expect(selectCameraInContent(ui('dual', 'camera', true))).toBe(false);
  });
});

describe('синхрон: эталон рядом и тот же эталон поверх камеры', () => {
  it('обе части: вторая — обычный эталон, копия поверх камеры', () => {
    expect(selectContentVisible(ui('sync', null, true))).toBe(true);
    expect(selectOverlayActive(ui('sync', null, true))).toBe(false);
    expect(selectOverlayCopy(ui('sync', null, true))).toBe(true);
    expect(selectCameraInContent(ui('sync', null, true))).toBe(false);
  });

  it('наложение выключено — копии нет', () => {
    expect(selectOverlayCopy(ui('sync', null, false))).toBe(false);
  });

  it('одна камера на весь экран — копия не нужна, эталон ложится поверх сам', () => {
    expect(selectOverlayCopy(ui('sync', 'camera', true))).toBe(false);
    expect(selectOverlayActive(ui('sync', 'camera', true))).toBe(true);
  });
});
