import { enterFullscreen, exitFullscreen } from '../platform/fullscreen';
import { useUi, type Space } from '../store/ui';
import { IconButton } from '../ui/IconButton';
import { CollapseIcon, DualIcon, ExpandIcon, EyeIcon, EyeOffIcon, LayersIcon, SwapIcon } from '../ui/icons';

/**
 * «Только эта часть» / «показать обе». Есть в полосе кнопок каждой части: любую можно развернуть
 * на весь экран, вторая при этом скрывается, но не пересоздаётся.
 */
export function SoloButton({ space }: { space: Space }) {
  const solo = useUi((s) => s.solo === space);
  const toggleSolo = useUi((s) => s.toggleSolo);

  function onClick() {
    if (solo) exitFullscreen();
    else enterFullscreen();
    toggleSolo(space);
  }

  return (
    <IconButton label={solo ? 'Показать обе части' : 'Только эта часть'} onClick={onClick}>
      {solo ? <CollapseIcon /> : <ExpandIcon />}
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

/** Кнопки раскладки в полосе камеры: поменять местами, две камеры / наложение, эта часть, скрыть. */
export function GlobalTools() {
  const cameraSolo = useUi((s) => s.solo === 'camera');
  const dual = useUi((s) => s.layout === 'dual');
  const overlay = useUi((s) => s.overlay);
  const toggleSwapped = useUi((s) => s.toggleSwapped);
  const toggleDual = useUi((s) => s.toggleDual);
  const toggleOverlay = useUi((s) => s.toggleOverlay);

  return (
    <div className="tool-group">
      {!cameraSolo && (
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
      <SoloButton space="camera" />
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
