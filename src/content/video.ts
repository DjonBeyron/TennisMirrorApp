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

const EVENTS = ['play', 'pause', 'timeupdate', 'loadedmetadata', 'durationchange', 'seeked'] as const;

const read = (video: HTMLVideoElement) => ({
  paused: video.paused,
  time: video.currentTime,
  duration: video.duration || 0,
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
