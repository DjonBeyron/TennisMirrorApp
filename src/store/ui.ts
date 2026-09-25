import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SPLIT_DEFAULT } from '../layout/split';

interface UiState {
  /** Доля экрана под камеру, 0.15…0.85. */
  split: number;
  /** «Поменять местами»: контент первым, камера второй. */
  swapped: boolean;
  setSplit: (split: number) => void;
  toggleSwapped: () => void;
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      split: SPLIT_DEFAULT,
      swapped: false,
      setSplit: (split) => set({ split }),
      toggleSwapped: () => set((s) => ({ swapped: !s.swapped })),
    }),
    { name: 'tm-ui', partialize: ({ split, swapped }) => ({ split, swapped }) },
  ),
);
