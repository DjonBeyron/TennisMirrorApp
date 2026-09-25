import { describe, expect, it } from 'vitest';
import { kindOf } from './localPack';

describe('kindOf', () => {
  it('по MIME-типу', () => {
    expect(kindOf({ type: 'video/quicktime', name: 'IMG_0001.MOV' })).toBe('video');
    expect(kindOf({ type: 'image/jpeg', name: 'photo.jpg' })).toBe('image');
    expect(kindOf({ type: 'application/pdf', name: 'doc.pdf' })).toBeNull();
  });

  it('без MIME — по расширению', () => {
    expect(kindOf({ type: '', name: 'forehand.MP4' })).toBe('video');
    expect(kindOf({ type: '', name: 'grip.webp' })).toBe('image');
    expect(kindOf({ type: '', name: 'notes.txt' })).toBeNull();
  });
});
