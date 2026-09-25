import { createStore, del, set, values } from 'idb-keyval';
import type { MediaItem } from './types';

export interface MediaStore {
  load: () => Promise<MediaItem[]>;
  put: (items: MediaItem[]) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

/**
 * Набор видео и фото в IndexedDB — переживает перезапуск приложения.
 * В idb-keyval у каждой базы одно хранилище, поэтому у каждого набора своя база.
 */
export function mediaStore(dbName: string, storeName: string): MediaStore {
  const store = createStore(dbName, storeName);
  return {
    async load() {
      const items = await values<MediaItem>(store);
      return items.sort((a, b) => a.addedAt - b.addedAt);
    },
    async put(items) {
      await Promise.all(items.map((item) => set(item.id, item, store)));
      // Просим браузер не удалять данные сайта при нехватке места (особенно важно на iOS).
      navigator.storage?.persist?.().catch(() => {});
    },
    remove: (id) => del(id, store),
  };
}
