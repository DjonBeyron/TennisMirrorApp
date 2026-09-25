import { describe, expect, it } from 'vitest';
import { SYNC_DRIFT_S, syncVideo } from './video';

/** Минимальная замена <video>: состояние и события, без декодирования. */
class FakeVideo extends EventTarget {
  paused = true;
  currentTime = 0;
  playbackRate = 1;
  defaultPlaybackRate = 1;
  async play() {
    this.paused = false;
    this.dispatchEvent(new Event('play'));
  }
  pause() {
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  }
  seek(time: number) {
    this.currentTime = time;
    this.dispatchEvent(new Event('seeked'));
  }
  tick(time: number) {
    this.currentTime = time;
    this.dispatchEvent(new Event('timeupdate'));
  }
}

const pair = () => {
  const master = new FakeVideo();
  const copy = new FakeVideo();
  const stop = syncVideo(master as unknown as HTMLVideoElement, copy as unknown as HTMLVideoElement);
  return { master, copy, stop };
};

describe('syncVideo — одна пауза на два видео', () => {
  it('пуск и пауза главного повторяет копия, на паузе кадр совпадает', async () => {
    const { master, copy } = pair();
    await master.play();
    expect(copy.paused).toBe(false);
    master.tick(2.34);
    master.pause();
    expect(copy.paused).toBe(true);
    expect(copy.currentTime).toBe(2.34);
  });

  it('перемотка и кадр ±1 на паузе переносятся точно', () => {
    const { master, copy } = pair();
    master.seek(1.5);
    expect(copy.currentTime).toBe(1.5);
    master.seek(1.5 + 1 / 30);
    expect(copy.currentTime).toBeCloseTo(1.5 + 1 / 30);
  });

  it('скорость общая', () => {
    const { master, copy } = pair();
    master.playbackRate = 0.25;
    master.dispatchEvent(new Event('ratechange'));
    expect(copy.playbackRate).toBe(0.25);
    expect(copy.defaultPlaybackRate).toBe(0.25);
  });

  it('на ходу мелкое расхождение не трогаем, большое подтягиваем', async () => {
    const { master, copy } = pair();
    await master.play();
    copy.currentTime = 3;
    master.tick(3 + SYNC_DRIFT_S / 2);
    expect(copy.currentTime).toBe(3);
    master.tick(3 + SYNC_DRIFT_S * 2);
    expect(copy.currentTime).toBe(3 + SYNC_DRIFT_S * 2);
  });

  it('после отписки копия больше не повторяет', async () => {
    const { master, copy, stop } = pair();
    stop();
    await master.play();
    expect(copy.paused).toBe(true);
  });
});
