import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SPLIT_DEFAULT } from '../layout/split';

/**
 * split — камера и эталон рядом; dual — камера в обеих частях (во второй можно наложить эталон);
 * sync — камера с эталоном поверх и тот же эталон рядом, пауза и перемотка у них общие;
 * review — разбор без камеры: одно видео в обеих частях на общем таймлайне, во второй поверх — слой.
 */
export type Layout = 'split' | 'dual' | 'sync' | 'review';
/** Часть экрана: камера или вторая часть (эталон, а в dual — камера с наложенным эталоном). */
export type Space = 'camera' | 'content';
export type Facing = 'user' | 'environment';
/** contain — кадр целиком с полями; cover — на всю панель с обрезкой краёв. */
export type Fit = 'contain' | 'cover';
/** Что снимает кнопка съёмки. */
export type CaptureMode = 'video' | 'photo';

export const OPACITY_MIN = 0.1;

interface UiState {
  layout: Layout;
  /** Одна часть на весь экран, вторая скрыта (null — видны обе). Выход возвращает прежнюю раскладку. */
  solo: Space | null;
  /** Эталон поверх камеры: при «только камера» — поверх неё, в dual — во второй части. */
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
  /** Зеркалить слой поверх видео в «Разборе» — отдельно от самого видео (эталон левши на записи правши). */
  mirrorLayer: boolean;
  captureMode: CaptureMode;
  setSplit: (split: number) => void;
  setOverlayOpacity: (opacity: number) => void;
  toggleSwapped: () => void;
  setLayout: (layout: Layout) => void;
  /** Одна часть на весь экран (camera | content) или обе (null). */
  setSolo: (solo: Space | null) => void;
  toggleOverlay: () => void;
  toggleHud: () => void;
  toggleFacing: () => void;
  toggleCameraFit: () => void;
  toggleMirrorContent: () => void;
  toggleMirrorLayer: () => void;
  setCaptureMode: (mode: CaptureMode) => void;
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      layout: 'split',
      solo: null,
      overlay: true,
      overlayOpacity: 0.5,
      hud: true,
      split: SPLIT_DEFAULT,
      swapped: false,
      facing: 'user',
      cameraFit: 'contain',
      mirrorContent: false,
      mirrorLayer: false,
      captureMode: 'video',
      setSplit: (split) => set({ split }),
      setOverlayOpacity: (opacity) => set({ overlayOpacity: Math.min(1, Math.max(OPACITY_MIN, opacity)) }),
      toggleSwapped: () => set((s) => ({ swapped: !s.swapped })),
      setLayout: (layout) => set({ layout }),
      setSolo: (solo) => set({ solo }),
      toggleOverlay: () => set((s) => ({ overlay: !s.overlay })),
      toggleHud: () => set((s) => ({ hud: !s.hud })),
      toggleFacing: () => set((s) => ({ facing: s.facing === 'user' ? 'environment' : 'user' })),
      toggleCameraFit: () => set((s) => ({ cameraFit: s.cameraFit === 'contain' ? 'cover' : 'contain' })),
      toggleMirrorContent: () => set((s) => ({ mirrorContent: !s.mirrorContent })),
      toggleMirrorLayer: () => set((s) => ({ mirrorLayer: !s.mirrorLayer })),
      setCaptureMode: (captureMode) => set({ captureMode }),
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
        mirrorLayer: s.mirrorLayer,
        captureMode: s.captureMode,
      }),
    },
  ),
);

type Ui = Pick<UiState, 'layout' | 'solo' | 'overlay'>;

/**
 * Под эталоном камера: «только камера» или «две камеры». Тогда эталон виден только наложением.
 * В «Разборе» камеры нет: видео во второй части видно всегда и не становится полупрозрачным.
 */
const cameraUnderContent = (s: Ui) => s.layout !== 'review' && (s.solo === 'camera' || s.layout === 'dual');

/** Эталон лежит поверх камеры (и получает прозрачность и жесты выравнивания). */
export const selectOverlayActive = (s: Ui) => s.overlay && cameraUnderContent(s);

/** Эталон виден: в режиме «рядом» всегда, поверх камеры — только если включено наложение. */
export const selectContentVisible = (s: Ui) => (cameraUnderContent(s) ? s.overlay : true);

/** Вторая часть показывает камеру (режим «две камеры»), если не открыта одна камера на весь экран. */
export const selectCameraInContent = (s: Ui) => s.layout === 'dual' && s.solo !== 'camera';

/**
 * «Синхрон» с обеими частями: в панели камеры поверх неё — копия эталона из второй части, синхронная с ним.
 * Если на экране одна камера, копия не нужна: эталон второй части сам ложится поверх камеры.
 */
export const selectOverlayCopy = (s: Ui) => s.layout === 'sync' && s.solo === null && s.overlay;

/** «Разбор»: в первой части вместо камеры — копия видео из второй, на общем таймлайне. */
export const selectReviewCopy = (s: Ui) => s.layout === 'review' && s.solo !== 'content';

/** «Разбор»: во второй части поверх видео — слой (элемент из другого раздела). */
export const selectReviewLayer = (s: Ui) => s.layout === 'review' && s.overlay && s.solo !== 'camera';

// Прозрачность — CSS-переменная на корне документа: слайдер меняет её без перерисовки всего приложения.
if (typeof document !== 'undefined') {
  const applyOpacity = (opacity: number) =>
    document.documentElement.style.setProperty('--overlay-opacity', String(opacity));
  applyOpacity(useUi.getState().overlayOpacity);
  useUi.subscribe((s, prev) => {
    if (s.overlayOpacity !== prev.overlayOpacity) applyOpacity(s.overlayOpacity);
  });
}
