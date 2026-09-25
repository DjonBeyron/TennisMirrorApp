import { createStore, del, set, values } from 'idb-keyval';
import type { MediaItem, MediaKind } from './types';

// Файлы, выбранные на устройстве, лежат в IndexedDB — после перезапуска их не нужно выбирать заново.
const store = createStore('tennis-mirror', 'local-media');

const VIDEO_EXT = /\.(mp4|m4v|mov|webm)$/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|heic|heif|avif)$/i;

/** Тип файла; у части файлов на Android MIME пустой — тогда смотрим на расширение. */
export function kindOf(file: { type: string; name: string }): MediaKind | null {
  if (file.type.startsWith('video/') || (!file.type && VIDEO_EXT.test(file.name))) return 'video';
  if (file.type.startsWith('image/') || (!file.type && IMAGE_EXT.test(file.name))) return 'image';
  return null;
}

export async function loadLocalItems(): Promise<MediaItem[]> {
  const items = await values<MediaItem>(store);
  return items.sort((a, b) => a.addedAt - b.addedAt);
}

/** Сохраняет подходящие файлы (видео и фото), остальные пропускает. */
export async function addLocalFiles(files: File[]): Promise<MediaItem[]> {
  const now = Date.now();
  const items = files.flatMap((file, i): MediaItem[] => {
    const kind = kindOf(file);
    return kind ? [{ id: crypto.randomUUID(), kind, name: file.name, blob: file, addedAt: now + i }] : [];
  });
  await Promise.all(items.map((item) => set(item.id, item, store)));
  // Просим браузер не удалять данные сайта при нехватке места (особенно важно на iOS).
  navigator.storage?.persist?.().catch(() => {});
  return items;
}

export const removeLocalItem = (id: string) => del(id, store);
