import { create } from 'zustand';
import { addLocalFiles, loadLocalItems, removeLocalItem } from '../packs/localPack';
import { releaseMediaUrl } from '../packs/mediaUrl';
import type { MediaItem } from '../packs/types';

/** Скорости воспроизведения эталона; кнопка перебирает их по кругу. */
export const SPEEDS = [1, 0.5, 0.25];

interface ContentState {
  items: MediaItem[];
  index: number;
  loaded: boolean;
  speed: number;
  load: () => Promise<void>;
  add: (files: File[]) => Promise<void>;
  remove: (id: string) => Promise<void>;
  go: (direction: 1 | -1) => void;
  cycleSpeed: () => void;
}

export const useContent = create<ContentState>()((set, get) => ({
  items: [],
  index: 0,
  loaded: false,
  speed: 1,

  async load() {
    if (get().loaded) return;
    try {
      set({ items: await loadLocalItems(), loaded: true });
    } catch {
      // IndexedDB недоступна (например, приватный режим) — работаем без сохранённых файлов.
      set({ loaded: true });
    }
  },

  async add(files) {
    const added = await addLocalFiles(files);
    if (!added.length) return;
    // Сразу показываем первый из добавленных.
    set((s) => ({ items: [...s.items, ...added], index: s.items.length }));
  },

  async remove(id) {
    await removeLocalItem(id);
    releaseMediaUrl(id);
    set((s) => {
      const items = s.items.filter((item) => item.id !== id);
      return { items, index: Math.max(0, Math.min(s.index, items.length - 1)) };
    });
  },

  go(direction) {
    set((s) => ({ index: Math.max(0, Math.min(s.items.length - 1, s.index + direction)) }));
  },

  cycleSpeed() {
    set((s) => ({ speed: SPEEDS[(SPEEDS.indexOf(s.speed) + 1) % SPEEDS.length] }));
  },
}));
