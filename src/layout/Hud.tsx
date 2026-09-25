import { enterFullscreen, exitFullscreen } from '../platform/fullscreen';
import { useUi, type Space } from '../store/ui';
import { IconButton } from '../ui/IconButton';
import { DualIcon, EyeIcon, EyeOffIcon, LayersIcon, SwapIcon } from '../ui/icons';

/**
 * «1 | 2» — сколько частей экрана показывать. Стоит в полосе каждой части: «1» оставляет на экране
 * только её, «2» возвращает обе. Скрытая часть не пересоздаётся (камера не перезапускается).
 */
export function SpacesSwitch({ space }: { space: Space }) {
  const solo = useUi((s) => s.solo);
  const setSolo = useUi((s) => s.setSolo);

  function show(next: Space | null) {
    if (next === solo) return;
    if (next) enterFullscreen();
    else exitFullscreen();
    setSolo(next);
  }

  return (
    <div className="seg" role="radiogroup" aria-label="Сколько частей показывать">
      <button
        type="button"
        role="radio"
        aria-checked={solo === space}
        aria-label="Одна часть — только эта"
        title="Только эта часть"
        onClick={() => show(space)}
      >
        1
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={solo === null}
        aria-label="Две части"
        title="Обе части"
        onClick={() => show(null)}
      >
        2
      </button>
    </div>
  );
}

/** Когда на экране одна часть: показать вместо неё другую. */
export function OtherSpaceButton({ to }: { to: Space }) {
  const setSolo = useUi((s) => s.setSolo);
  return (
    <IconButton label="Показать другую часть" onClick={() => setSolo(to)}>
      <SwapIcon className="rotate-landscape" />
    </IconButton>
  );
}

export function HideButton() {
  const toggleHud = useUi((s) => s.toggleHud);
  return (
    <IconButton label="Скрыть кнопки" onClick={toggleHud}>
      <EyeOffIcon />
    </IconButton>
  );
}

/**
 * Кнопки раскладки в полосе камеры: поменять местами (или показать другую часть), две камеры /
 * наложение, «1 | 2», скрыть.
 */
export function GlobalTools() {
  const cameraSolo = useUi((s) => s.solo === 'camera');
  const dual = useUi((s) => s.layout === 'dual');
  const overlay = useUi((s) => s.overlay);
  const toggleSwapped = useUi((s) => s.toggleSwapped);
  const toggleDual = useUi((s) => s.toggleDual);
  const toggleOverlay = useUi((s) => s.toggleOverlay);

  return (
    <div className="tool-group">
      {cameraSolo ? (
        <OtherSpaceButton to="content" />
      ) : (
        <IconButton label="Поменять местами части" onClick={toggleSwapped}>
          <SwapIcon className="rotate-landscape" />
        </IconButton>
      )}
      {!cameraSolo && (
        <IconButton label="Две камеры" aria-pressed={dual} onClick={toggleDual}>
          <DualIcon />
        </IconButton>
      )}
      {cameraSolo && (
        <IconButton label="Эталон поверх камеры" aria-pressed={overlay} onClick={toggleOverlay}>
          <LayersIcon />
        </IconButton>
      )}
      <SpacesSwitch space="camera" />
      <HideButton />
    </div>
  );
}

/** Единственная кнопка, видимая при скрытых кнопках, — вернуть их. */
export function HudRestore() {
  const toggleHud = useUi((s) => s.toggleHud);
  return (
    <IconButton className="hud-restore" label="Показать кнопки" onClick={toggleHud}>
      <EyeIcon />
    </IconButton>
  );
}
