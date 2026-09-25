import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SPLIT_DEFAULT } from '../layout/split';

/** split — камера и контент рядом; camera — камера на весь экран. */
export type Mode = 'split' | 'camera';
export type Facing = 'user' | 'environment';
/** contain — кадр целиком с полями; cover — на всю панель с обрезкой краёв. */
export type Fit = 'contain' | 'cover';

interface UiState {
  mode: Mode;
  /** Показаны ли кнопки поверх экрана. */
  hud: boolean;
  /** Доля экрана под камеру, 0.15…0.85. */
  split: number;
  /** «Поменять местами»: контент первым, камера второй. */
  swapped: boolean;
  facing: Facing;
  cameraFit: Fit;
  /** Зеркалить эталон: удобно левше смотреть технику правши. */
  mirrorContent: boolean;
  setSplit: (split: number) => void;
  toggleSwapped: () => void;
  toggleCameraMode: () => void;
  toggleHud: () => void;
  toggleFacing: () => void;
  toggleCameraFit: () => void;
  toggleMirrorContent: () => void;
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      mode: 'split',
      hud: true,
      split: SPLIT_DEFAULT,
      swapped: false,
      facing: 'user',
      cameraFit: 'contain',
      mirrorContent: false,
      setSplit: (split) => set({ split }),
      toggleSwapped: () => set((s) => ({ swapped: !s.swapped })),
      toggleCameraMode: () => set((s) => ({ mode: s.mode === 'camera' ? 'split' : 'camera' })),
      toggleHud: () => set((s) => ({ hud: !s.hud })),
      toggleFacing: () => set((s) => ({ facing: s.facing === 'user' ? 'environment' : 'user' })),
      toggleCameraFit: () => set((s) => ({ cameraFit: s.cameraFit === 'contain' ? 'cover' : 'contain' })),
      toggleMirrorContent: () => set((s) => ({ mirrorContent: !s.mirrorContent })),
    }),
    {
      name: 'tm-ui',
      partialize: ({ split, swapped, facing, cameraFit, mirrorContent }) => ({
        split,
        swapped,
        facing,
        cameraFit,
        mirrorContent,
      }),
    },
  ),
);
