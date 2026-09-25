import { mediaStore } from './mediaStore';
import type { MediaItem, MediaKind } from './types';

/** Эталоны — файлы, выбранные на устройстве. Имя базы прежнее: уже выбранные файлы сохраняются. */
export const localPack = mediaStore('tennis-mirror', 'local-media');

const VIDEO_EXT = /\.(mp4|m4v|mov|webm)$/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|heic|heif|avif)$/i;

/** Тип файла; у части файлов на Android MIME пустой — тогда смотрим на расширение. */
export function kindOf(file: { type: string; name: string }): MediaKind | null {
  if (file.type.startsWith('video/') || (!file.type && VIDEO_EXT.test(file.name))) return 'video';
  if (file.type.startsWith('image/') || (!file.type && IMAGE_EXT.test(file.name))) return 'image';
  return null;
}

/** Подходящие файлы (видео и фото) превращает в элементы пака, остальные пропускает. */
export function filesToItems(files: File[], now = Date.now()): MediaItem[] {
  return files.flatMap((file, i): MediaItem[] => {
    const kind = kindOf(file);
    return kind ? [{ id: crypto.randomUUID(), kind, name: file.name, blob: file, addedAt: now + i }] : [];
  });
}
