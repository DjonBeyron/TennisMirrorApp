import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SPLIT_DEFAULT } from '../layout/split';

/** split — камера и эталон рядом; dual — камера в обеих половинах (во второй можно наложить эталон). */
export type Layout = 'split' | 'dual';
/** Итоговый режим экрана: раскладка или камера на весь экран. */
export type Mode = Layout | 'camera';
export type Facing = 'user' | 'environment';
/** contain — кадр целиком с полями; cover — на всю панель с обрезкой краёв. */
export type Fit = 'contain' | 'cover';

export const OPACITY_MIN = 0.1;

interface UiState {
  layout: Layout;
  /** Камера на весь экран поверх раскладки; выход возвращает прежнюю раскладку. */
  fullscreen: boolean;
  /** Эталон поверх камеры: на весь экран — поверх неё, в dual — во второй половине. */
  overlay: boolean;
  /** Непрозрачность наложенного эталона, 0.1…1. */
  overlayOpacity: number;
  /** Показаны ли кнопки поверх экрана. */
  hud: boolean;
  /** Доля экрана под камеру, 0.15…0.85. */
  split: number;
  /** «Поменять местами»: эталон первым, камера второй. */
  swapped: boolean;
  facing: Facing;
  cameraFit: Fit;
  /** Зеркалить эталон: удобно левше смотреть технику правши. */
  mirrorContent: boolean;
  setSplit: (split: number) => void;
  setOverlayOpacity: (opacity: number) => void;
  toggleSwapped: () => void;
  toggleDual: () => void;
  toggleFullscreen: () => void;
  toggleOverlay: () => void;
  toggleHud: () => void;
  toggleFacing: () => void;
  toggleCameraFit: () => void;
  toggleMirrorContent: () => void;
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      layout: 'split',
      fullscreen: false,
      overlay: true,
      overlayOpacity: 0.5,
      hud: true,
      split: SPLIT_DEFAULT,
      swapped: false,
      facing: 'user',
      cameraFit: 'contain',
      mirrorContent: false,
      setSplit: (split) => set({ split }),
      setOverlayOpacity: (opacity) => set({ overlayOpacity: Math.min(1, Math.max(OPACITY_MIN, opacity)) }),
      toggleSwapped: () => set((s) => ({ swapped: !s.swapped })),
      toggleDual: () => set((s) => ({ layout: s.layout === 'dual' ? 'split' : 'dual' })),
      toggleFullscreen: () => set((s) => ({ fullscreen: !s.fullscreen })),
      toggleOverlay: () => set((s) => ({ overlay: !s.overlay })),
      toggleHud: () => set((s) => ({ hud: !s.hud })),
      toggleFacing: () => set((s) => ({ facing: s.facing === 'user' ? 'environment' : 'user' })),
      toggleCameraFit: () => set((s) => ({ cameraFit: s.cameraFit === 'contain' ? 'cover' : 'contain' })),
      toggleMirrorContent: () => set((s) => ({ mirrorContent: !s.mirrorContent })),
    }),
    {
      name: 'tm-ui',
      partialize: (s) => ({
        layout: s.layout,
        overlay: s.overlay,
        overlayOpacity: s.overlayOpacity,
        split: s.split,
        swapped: s.swapped,
        facing: s.facing,
        cameraFit: s.cameraFit,
        mirrorContent: s.mirrorContent,
      }),
    },
  ),
);

type Ui = Pick<UiState, 'layout' | 'fullscreen' | 'overlay'>;

export const selectMode = (s: Ui): Mode => (s.fullscreen ? 'camera' : s.layout);

/** Эталон лежит поверх камеры (и получает прозрачность и жесты выравнивания). */
export const selectOverlayActive = (s: Ui) => s.overlay && (s.fullscreen || s.layout === 'dual');

/** Эталон виден: рядом с камерой всегда, в остальных режимах — только наложением. */
export const selectContentVisible = (s: Ui) => (s.fullscreen || s.layout === 'dual' ? s.overlay : true);

// Прозрачность — CSS-переменная на корне документа: слайдер меняет её без перерисовки всего приложения.
if (typeof document !== 'undefined') {
  const applyOpacity = (opacity: number) =>
    document.documentElement.style.setProperty('--overlay-opacity', String(opacity));
  applyOpacity(useUi.getState().overlayOpacity);
  useUi.subscribe((s, prev) => {
    if (s.overlayOpacity !== prev.overlayOpacity) applyOpacity(s.overlayOpacity);
  });
}
