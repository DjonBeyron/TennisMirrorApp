import { useEffect, useState, type ChangeEvent } from 'react';
import { useContent } from '../store/content';
import { IconButton } from '../ui/IconButton';
import { PauseIcon, PlayIcon, StepBackIcon, StepForwardIcon } from '../ui/icons';

/** Шаг «кадр назад/вперёд»: частоту кадров файла браузер не сообщает, берём типичные 30 к/с. */
const FRAME_S = 1 / 30;
const EVENTS = ['play', 'pause', 'timeupdate', 'loadedmetadata', 'durationchange', 'seeked'] as const;

function formatTime(t: number): string {
  if (!Number.isFinite(t)) return '0:00.0';
  const minutes = Math.floor(t / 60);
  return `${minutes}:${(t - minutes * 60).toFixed(1).padStart(4, '0')}`;
}

const formatSpeed = (speed: number) => `${speed}×`;

// Видео меняем через функции вне компонента: линтер React не разрешает менять props напрямую.

/** Скорость выставляем и как текущую, и как «по умолчанию»: загрузка файла сбрасывает текущую. */
function applySpeed(video: HTMLVideoElement, speed: number) {
  video.defaultPlaybackRate = speed;
  video.playbackRate = speed;
}

function seek(video: HTMLVideoElement, time: number) {
  video.currentTime = Math.min(video.duration || 0, Math.max(0, time));
}

/** Пауза, кадр назад/вперёд, скорость и перемотка для текущего видео эталона. */
export function VideoControls({ video }: { video: HTMLVideoElement }) {
  const speed = useContent((s) => s.speed);
  const cycleSpeed = useContent((s) => s.cycleSpeed);
  const [paused, setPaused] = useState(video.paused);
  const [time, setTime] = useState(video.currentTime);
  const [duration, setDuration] = useState(video.duration || 0);

  useEffect(() => {
    const sync = () => {
      setPaused(video.paused);
      setTime(video.currentTime);
      setDuration(video.duration || 0);
    };
    EVENTS.forEach((name) => video.addEventListener(name, sync));
    return () => EVENTS.forEach((name) => video.removeEventListener(name, sync));
  }, [video]);

  useEffect(() => {
    const apply = () => applySpeed(video, speed);
    apply();
    video.addEventListener('loadedmetadata', apply);
    return () => video.removeEventListener('loadedmetadata', apply);
  }, [video, speed]);

  function togglePlay() {
    if (video.paused) void video.play();
    else video.pause();
  }

  function step(delta: number) {
    video.pause();
    seek(video, video.currentTime + delta);
  }

  function scrub(e: ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value);
    seek(video, t);
    setTime(t);
  }

  return (
    <div className="video-controls hud">
      <div className="vc-scrub-row">
        <span className="vc-time">{formatTime(time)}</span>
        <input
          type="range"
          className="vc-scrub"
          aria-label="Перемотка"
          min={0}
          max={duration}
          step={0.01}
          value={Math.min(time, duration)}
          onChange={scrub}
        />
        <span className="vc-time">{formatTime(duration)}</span>
      </div>
      <div className="vc-buttons">
        <IconButton label="Кадр назад" onClick={() => step(-FRAME_S)}>
          <StepBackIcon />
        </IconButton>
        <IconButton label={paused ? 'Воспроизвести' : 'Пауза'} onClick={togglePlay}>
          {paused ? <PlayIcon /> : <PauseIcon />}
        </IconButton>
        <IconButton label="Кадр вперёд" onClick={() => step(FRAME_S)}>
          <StepForwardIcon />
        </IconButton>
        <button
          type="button"
          className="speed-chip"
          aria-label="Скорость воспроизведения"
          onClick={cycleSpeed}
        >
          {formatSpeed(speed)}
        </button>
      </div>
    </div>
  );
}
