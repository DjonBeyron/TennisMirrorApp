import { useEffect, useRef, useState } from 'react';
import { pickRecorderType } from '../packs/recordings';

/** ~19 МБ в минуту при 720p: хватает для разбора техники и не забивает память телефона. */
const VIDEO_BITS_PER_SECOND = 2_500_000;
/** Кусок данных раз в секунду: при внезапной остановке теряется не больше секунды. */
const CHUNK_MS = 1000;

export const canRecord = () => typeof MediaRecorder !== 'undefined';

/**
 * Запись видео с потока камеры. Смена режимов и частей экрана поток не трогает — запись идёт дальше.
 * Если поток сменился или остановился (другая камера, уход в фон), запись завершается и сохраняется.
 */
export function useRecorder(stream: MediaStream | null, onVideo: (blob: Blob) => void) {
  const recorder = useRef<MediaRecorder | null>(null);
  const onVideoRef = useRef(onVideo);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    onVideoRef.current = onVideo;
  });

  useEffect(
    () => () => {
      const rec = recorder.current;
      if (rec && rec.state !== 'inactive') rec.stop();
    },
    [stream],
  );

  function start() {
    if (!stream || recorder.current || !canRecord()) return;
    const mimeType = pickRecorderType((type) => MediaRecorder.isTypeSupported(type));
    const rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: VIDEO_BITS_PER_SECOND });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    rec.onstop = () => {
      recorder.current = null;
      setStartedAt(null);
      // Тип без параметров кодека: так его понимают и плеер, и системное меню «Поделиться».
      const type = (rec.mimeType || mimeType || 'video/webm').split(';')[0];
      const blob = new Blob(chunks, { type });
      if (blob.size) onVideoRef.current(blob);
    };
    rec.start(CHUNK_MS);
    recorder.current = rec;
    setStartedAt(Date.now());
  }

  function stop() {
    const rec = recorder.current;
    if (rec && rec.state !== 'inactive') rec.stop();
  }

  return { recording: startedAt !== null, startedAt, start, stop };
}
