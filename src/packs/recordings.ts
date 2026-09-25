import { mediaStore } from './mediaStore';
import type { MediaItem, MediaKind } from './types';

/** «Мои записи» — видео и фото, снятые в приложении. Живут только здесь, пока их не сохранили «Поделиться». */
export const recordingsPack = mediaStore('tennis-mirror-recordings', 'items');

/** Форматы записи в порядке предпочтения: mp4 играет везде и нормально перематывается. */
export const RECORDER_TYPES = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];

export const pickRecorderType = (isSupported: (type: string) => boolean) => RECORDER_TYPES.find(isSupported);

export function extensionFor(mime: string): string {
  if (mime.startsWith('video/mp4')) return 'mp4';
  if (mime.startsWith('video/webm')) return 'webm';
  if (mime.startsWith('image/jpeg')) return 'jpg';
  return 'bin';
}

const pad = (n: number) => String(n).padStart(2, '0');

/** «TennisMirror 2026-09-24 18-30-05.mp4» — по местному времени; так же называется файл при сохранении. */
export function recordingName(mime: string, date: Date): string {
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
  return `TennisMirror ${day} ${time}.${extensionFor(mime)}`;
}

export function recordingItem(blob: Blob, kind: MediaKind, date = new Date()): MediaItem {
  return {
    id: crypto.randomUUID(),
    kind,
    name: recordingName(blob.type, date),
    blob,
    addedAt: date.getTime(),
  };
}
