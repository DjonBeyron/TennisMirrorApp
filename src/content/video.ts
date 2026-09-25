import { useEffect, useState } from 'react';

// Видео эталона меняем через эти функции: линтер React не разрешает менять props и параметры хуков напрямую.

export function togglePlay(video: HTMLVideoElement) {
  if (video.paused) void video.play();
  else video.pause();
}

export function seek(video: HTMLVideoElement, time: number) {
  video.currentTime = Math.min(video.duration || 0, Math.max(0, time));
}

/** Скорость выставляем и как текущую, и как «по умолчанию»: загрузка файла сбрасывает текущую. */
export function applySpeed(video: HTMLVideoElement, speed: number) {
  video.defaultPlaybackRate = speed;
  video.playbackRate = speed;
}

/**
 * У webm из MediaRecorder в Chrome нет длительности (Infinity), и перемотка не работает. Обход:
 * прыгнуть далеко вперёд — браузер дочитает файл и узнает длительность, — и вернуться в начало.
 */
export function fixInfiniteDuration(video: HTMLVideoElement): () => void {
  let fixing = false;
  const onMetadata = () => {
    if (video.duration !== Infinity) return;
    fixing = true;
    video.currentTime = 1e101;
  };
  const onDuration = () => {
    if (!fixing || !Number.isFinite(video.duration)) return;
    fixing = false;
    video.currentTime = 0;
  };
  video.addEventListener('loadedmetadata', onMetadata);
  video.addEventListener('durationchange', onDuration);
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onMetadata();
  return () => {
    video.removeEventListener('loadedmetadata', onMetadata);
    video.removeEventListener('durationchange', onDuration);
  };
}

/** На ходу копии можно отстать на долю секунды: чаще подтягивать — видео будет дёргаться. */
export const SYNC_DRIFT_S = 0.15;

type SyncTarget = Pick<
  HTMLVideoElement,
  | 'paused'
  | 'currentTime'
  | 'playbackRate'
  | 'defaultPlaybackRate'
  | 'play'
  | 'pause'
  | 'addEventListener'
  | 'removeEventListener'
>;

/**
 * Копия повторяет главное видео: пуск и пауза, перемотка, кадр ±1, скорость. На паузе кадр совпадает
 * точно, на ходу расхождение больше SYNC_DRIFT_S подтягивается. Возвращает отписку.
 */
export function syncVideo(master: SyncTarget, copy: SyncTarget): () => void {
  const align = () => {
    const limit = master.paused ? 0.001 : SYNC_DRIFT_S;
    if (Math.abs(copy.currentTime - master.currentTime) > limit) copy.currentTime = master.currentTime;
  };
  const onPlay = () => {
    align();
    copy.play().catch(() => {});
  };
  const onPause = () => {
    copy.pause();
    copy.currentTime = master.currentTime;
  };
  const onRate = () => {
    copy.defaultPlaybackRate = master.playbackRate;
    copy.playbackRate = master.playbackRate;
  };
  const handlers: [string, () => void][] = [
    ['play', onPlay],
    ['pause', onPause],
    ['seeked', align],
    ['timeupdate', align],
    ['ratechange', onRate],
  ];
  handlers.forEach(([name, fn]) => master.addEventListener(name, fn));
  onRate();
  if (master.paused) onPause();
  else onPlay();
  return () => handlers.forEach(([name, fn]) => master.removeEventListener(name, fn));
}

const EVENTS = ['play', 'pause', 'timeupdate', 'loadedmetadata', 'durationchange', 'seeked'] as const;

const read = (video: HTMLVideoElement) => ({
  paused: video.paused,
  time: video.currentTime,
  duration: Number.isFinite(video.duration) ? video.duration : 0,
});

/** Пауза, время и длительность видео; обновляется по событиям элемента (timeupdate ~4 раза в секунду). */
export function useVideoState(video: HTMLVideoElement) {
  const [state, setState] = useState(() => read(video));

  useEffect(() => {
    const sync = () => setState(read(video));
    EVENTS.forEach((name) => video.addEventListener(name, sync));
    return () => EVENTS.forEach((name) => video.removeEventListener(name, sync));
  }, [video]);

  return state;
}
