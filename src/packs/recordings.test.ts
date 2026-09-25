import { describe, expect, it } from 'vitest';
import { extensionFor, pickRecorderType, recordingName } from './recordings';

describe('формат записи', () => {
  it('предпочитает mp4', () => {
    expect(pickRecorderType(() => true)).toBe('video/mp4;codecs=avc1');
  });

  it('без mp4 — webm (старый Chrome на Android)', () => {
    expect(pickRecorderType((t) => t.startsWith('video/webm'))).toBe('video/webm;codecs=vp9');
  });

  it('ничего не поддерживается — undefined, браузер выберет сам', () => {
    expect(pickRecorderType(() => false)).toBeUndefined();
  });

  it('расширение по MIME-типу', () => {
    expect(extensionFor('video/mp4;codecs=avc1')).toBe('mp4');
    expect(extensionFor('video/webm;codecs=vp9')).toBe('webm');
    expect(extensionFor('image/jpeg')).toBe('jpg');
  });
});

describe('recordingName', () => {
  it('дата и время по местному времени', () => {
    const date = new Date(2026, 8, 24, 18, 30, 5);
    expect(recordingName('video/mp4', date)).toBe('TennisMirror 2026-09-24 18-30-05.mp4');
    expect(recordingName('image/jpeg', date)).toBe('TennisMirror 2026-09-24 18-30-05.jpg');
  });
});
