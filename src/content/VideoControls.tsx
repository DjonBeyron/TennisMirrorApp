import { useState, type ChangeEvent } from 'react';
import { useContent } from '../store/content';
import { IconButton } from '../ui/IconButton';
import { PauseIcon, PlayIcon, StepBackIcon, StepForwardIcon } from '../ui/icons';
import { seek, togglePlay, useVideoState } from './video';

/** Шаг «кадр назад/вперёд»: частоту кадров файла браузер не сообщает, берём типичные 30 к/с. */
const FRAME_S = 1 / 30;

function formatTime(t: number): string {
  if (!Number.isFinite(t)) return '0:00.0';
  const minutes = Math.floor(t / 60);
  return `${minutes}:${(t - minutes * 60).toFixed(1).padStart(4, '0')}`;
}

const formatSpeed = (speed: number) => `${speed}×`;

/** Пауза, кадр назад/вперёд, скорость и перемотка для текущего видео эталона. */
export function VideoControls({ video }: { video: HTMLVideoElement }) {
  const speed = useContent((s) => s.speed);
  const cycleSpeed = useContent((s) => s.cycleSpeed);
  const { paused, time, duration } = useVideoState(video);
  // Пока тянем ползунок, показываем его значение: событие seeked приходит с задержкой.
  const [dragTime, setDragTime] = useState<number | null>(null);

  function step(delta: number) {
    video.pause();
    seek(video, video.currentTime + delta);
  }

  function scrub(e: ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value);
    setDragTime(t);
    seek(video, t);
  }

  const shown = dragTime ?? time;
  const endDrag = () => setDragTime(null);

  return (
    <div className="video-controls">
      <div className="vc-scrub-row">
        <span className="vc-time">{formatTime(shown)}</span>
        <input
          type="range"
          className="vc-scrub"
          aria-label="Перемотка"
          min={0}
          max={duration}
          step={0.01}
          value={Math.min(shown, duration)}
          onChange={scrub}
          onPointerUp={endDrag}
          onKeyUp={endDrag}
          onBlur={endDrag}
        />
        <span className="vc-time">{formatTime(duration)}</span>
      </div>
      <div className="vc-buttons">
        <IconButton label="Кадр назад" onClick={() => step(-FRAME_S)}>
          <StepBackIcon />
        </IconButton>
        <IconButton
          className="vc-play"
          label={paused ? 'Воспроизвести' : 'Пауза'}
          onClick={() => togglePlay(video)}
        >
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
