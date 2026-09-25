import { useEffect, useState } from 'react';
import { recordingItem } from '../packs/recordings';
import type { MediaKind } from '../packs/types';
import { useCameraStream } from '../store/camera';
import { useContent } from '../store/content';
import { useUi } from '../store/ui';
import { capturePhoto } from './photo';
import { canRecord, useRecorder } from './useRecorder';

/** Сколько висит подсказка «Сохранено» (без анимации: просто появляется и исчезает). */
const NOTICE_MS = 2500;

/**
 * Кнопка съёмки: видео (старт/стоп) или фото. Готовое сохраняется в «Записи» — там его можно
 * открыть рядом с эталоном или поверх камеры и отправить в галерею.
 */
export function useCapture(getVideo: () => HTMLVideoElement | null) {
  const stream = useCameraStream((s) => s.stream);
  const chosen = useUi((s) => s.captureMode);
  const addRecording = useContent((s) => s.addRecording);
  const [notice, setNotice] = useState<string | null>(null);
  const mode = canRecord() ? chosen : 'photo';

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  async function save(blob: Blob, kind: MediaKind) {
    try {
      await addRecording(recordingItem(blob, kind));
      setNotice(kind === 'video' ? 'Видео сохранено в «Записи»' : 'Фото сохранено в «Записи»');
    } catch {
      setNotice('Не удалось сохранить — возможно, не хватает места');
    }
  }

  const { recording, startedAt, start, stop } = useRecorder(stream, (blob) => void save(blob, 'video'));

  async function shutter() {
    if (mode === 'video') return recording ? stop() : start();
    const video = getVideo();
    const blob = video && (await capturePhoto(video));
    if (blob) await save(blob, 'image');
  }

  return { mode, recording, startedAt, notice, ready: stream !== null, shutter };
}
