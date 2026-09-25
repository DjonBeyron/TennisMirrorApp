export type MediaKind = 'video' | 'image';

/** Видео или фото эталона. Пока все элементы — файлы с устройства (локальный пак). */
export interface MediaItem {
  id: string;
  kind: MediaKind;
  name: string;
  blob: Blob;
  addedAt: number;
}
