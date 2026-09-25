import { useEffect, useState } from 'react';
import { useUi, type CaptureMode } from '../store/ui';
import { canRecord } from './useRecorder';
import './capture.css';

function RecTimer({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(startedAt);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  return (
    <span className="rec-timer" role="timer">
      <span className="rec-dot" />
      {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
    </span>
  );
}

interface Props {
  mode: CaptureMode;
  recording: boolean;
  startedAt: number | null;
  notice: string | null;
  ready: boolean;
  onShutter: () => void;
}

/** Нижняя строка панели камеры: «Видео / Фото», кнопка съёмки и таймер записи. */
export function CaptureBar({ mode, recording, startedAt, notice, ready, onShutter }: Props) {
  const setMode = useUi((s) => s.setCaptureMode);
  const shutterLabel = mode === 'photo' ? 'Сделать фото' : recording ? 'Остановить запись' : 'Начать запись';

  return (
    <>
      {notice && (
        <div className="notice" role="status">
          {notice}
        </div>
      )}
      <div className="capture-bar">
        <div className="seg" role="radiogroup" aria-label="Что снимать">
          <button
            type="button"
            role="radio"
            aria-checked={mode === 'video'}
            disabled={recording || !canRecord()}
            onClick={() => setMode('video')}
          >
            Видео
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={mode === 'photo'}
            disabled={recording}
            onClick={() => setMode('photo')}
          >
            Фото
          </button>
        </div>
        <button
          type="button"
          className="shutter"
          data-mode={mode}
          data-recording={recording || undefined}
          aria-label={shutterLabel}
          title={shutterLabel}
          disabled={!ready}
          onClick={onShutter}
        />
        <div className="capture-side">
          {recording && startedAt !== null && <RecTimer startedAt={startedAt} />}
        </div>
      </div>
    </>
  );
}
