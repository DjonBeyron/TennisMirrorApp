import { create } from 'zustand';
import { filesToItems, localPack } from '../packs/localPack';
import type { MediaStore } from '../packs/mediaStore';
import { releaseMediaUrl } from '../packs/mediaUrl';
import { recordingsPack } from '../packs/recordings';
import type { MediaItem } from '../packs/types';

/** Скорости воспроизведения эталона; кнопка перебирает их по кругу. */
export const SPEEDS = [1, 0.5, 0.25];

/** local — эталоны с устройства; recordings — записи, снятые в приложении. */
export type PackId = 'local' | 'recordings';

interface Pack {
  items: MediaItem[];
  index: number;
}

const STORES: Record<PackId, MediaStore> = { local: localPack, recordings: recordingsPack };
const EMPTY: Pack = { items: [], index: 0 };
const clampIndex = (index: number, items: MediaItem[]) => Math.max(0, Math.min(index, items.length - 1));

interface ContentState {
  /** Какой раздел показан во второй части экрана. */
  pack: PackId;
  packs: Record<PackId, Pack>;
  loaded: boolean;
  speed: number;
  /** Элемент <video> текущего слайда: им управляют и вторая часть, и панель камеры при наложении. */
  video: HTMLVideoElement | null;
  setVideo: (video: HTMLVideoElement | null) => void;
  setPack: (pack: PackId) => void;
  load: () => Promise<void>;
  /** Файлы с устройства — в раздел, который сейчас открыт («Эталон» или «Записи»). */
  add: (files: File[]) => Promise<void>;
  /** Новая запись — в «Записи»; показанный раздел не меняется, чтобы не сбить наложенный эталон. */
  addRecording: (item: MediaItem) => Promise<void>;
  remove: (id: string) => Promise<void>;
  go: (direction: 1 | -1) => void;
  /** Листать слой «Разбора» — элементы другого раздела, не того, что показан во второй части. */
  goLayer: (direction: 1 | -1) => void;
  cycleSpeed: () => void;
}

/** Другой раздел: из него берётся слой поверх видео в «Разборе» (запись в «Записях» — эталон в «Эталоне»). */
export const otherPack = (pack: PackId): PackId => (pack === 'local' ? 'recordings' : 'local');

export const useContent = create<ContentState>()((set, get) => {
  const patch = (id: PackId, change: (pack: Pack) => Pack) =>
    set((s) => ({ packs: { ...s.packs, [id]: change(s.packs[id]) } }));

  return {
    pack: 'local',
    packs: { local: EMPTY, recordings: EMPTY },
    loaded: false,
    speed: 1,
    video: null,
    setVideo: (video) => set({ video }),
    setPack: (pack) => set({ pack }),

    async load() {
      if (get().loaded) return;
      // IndexedDB может быть недоступна (например, приватный режим) — тогда работаем без сохранённого.
      const [local, recordings] = await Promise.all([
        localPack.load().catch(() => []),
        recordingsPack.load().catch(() => []),
      ]);
      set({
        packs: { local: { items: local, index: 0 }, recordings: { items: recordings, index: 0 } },
        loaded: true,
      });
    },

    async add(files) {
      const added = filesToItems(files);
      if (!added.length) return;
      const { pack } = get();
      await STORES[pack].put(added);
      // Сразу показываем первый из добавленных.
      patch(pack, (p) => ({ items: [...p.items, ...added], index: p.items.length }));
    },

    async addRecording(item) {
      await recordingsPack.put([item]);
      patch('recordings', (p) => ({ ...p, items: [...p.items, item] }));
    },

    async remove(id) {
      const { pack } = get();
      await STORES[pack].remove(id);
      releaseMediaUrl(id);
      patch(pack, (p) => {
        const items = p.items.filter((item) => item.id !== id);
        return { items, index: clampIndex(p.index, items) };
      });
    },

    go(direction) {
      patch(get().pack, (p) => ({ ...p, index: clampIndex(p.index + direction, p.items) }));
    },

    goLayer(direction) {
      patch(otherPack(get().pack), (p) => ({ ...p, index: clampIndex(p.index + direction, p.items) }));
    },

    cycleSpeed() {
      set((s) => ({ speed: SPEEDS[(SPEEDS.indexOf(s.speed) + 1) % SPEEDS.length] }));
    },
  };
});

type Content = Pick<ContentState, 'pack' | 'packs' | 'video'>;

export const selectItems = (s: Content) => s.packs[s.pack].items;
export const selectIndex = (s: Content) => s.packs[s.pack].index;
export const selectCount = (s: Content) => s.packs[s.pack].items.length;
export const selectCurrent = (s: Content): MediaItem | undefined => selectItems(s)[selectIndex(s)];

export const selectLayerPack = (s: Content) => s.packs[otherPack(s.pack)];
export const selectLayerItem = (s: Content): MediaItem | undefined =>
  selectLayerPack(s).items[selectLayerPack(s).index];

/** Видео текущего слайда. Пока ref не обновился, в store может лежать элемент прошлого слайда. */
export const selectCurrentVideo = (s: Content) =>
  s.video && s.video.dataset.item === selectCurrent(s)?.id ? s.video : null;
