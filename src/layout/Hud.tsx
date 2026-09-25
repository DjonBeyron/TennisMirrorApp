import { enterFullscreen, exitFullscreen } from '../platform/fullscreen';
import { useUi } from '../store/ui';
import { IconButton } from '../ui/IconButton';
import { CollapseIcon, DualIcon, ExpandIcon, EyeIcon, EyeOffIcon, LayersIcon, SwapIcon } from '../ui/icons';

/** Общие кнопки раскладки. Стоят в полосе панели камеры, чтобы при повороте не залезать на эталон. */
export function GlobalTools() {
  const fullscreen = useUi((s) => s.fullscreen);
  const dual = useUi((s) => s.layout === 'dual');
  const overlay = useUi((s) => s.overlay);
  const toggleSwapped = useUi((s) => s.toggleSwapped);
  const toggleDual = useUi((s) => s.toggleDual);
  const toggleFullscreen = useUi((s) => s.toggleFullscreen);
  const toggleOverlay = useUi((s) => s.toggleOverlay);
  const toggleHud = useUi((s) => s.toggleHud);

  function onFullscreen() {
    if (fullscreen) exitFullscreen();
    else enterFullscreen();
    toggleFullscreen();
  }

  return (
    <div className="tool-group">
      {!fullscreen && (
        <IconButton label="Поменять местами камеру и эталон" onClick={toggleSwapped}>
          <SwapIcon className="rotate-landscape" />
        </IconButton>
      )}
      {!fullscreen && (
        <IconButton label="Две камеры" aria-pressed={dual} onClick={toggleDual}>
          <DualIcon />
        </IconButton>
      )}
      {fullscreen && (
        <IconButton label="Эталон поверх камеры" aria-pressed={overlay} onClick={toggleOverlay}>
          <LayersIcon />
        </IconButton>
      )}
      <IconButton
        label={fullscreen ? 'Выйти из полноэкранного режима' : 'Камера на весь экран'}
        onClick={onFullscreen}
      >
        {fullscreen ? <CollapseIcon /> : <ExpandIcon />}
      </IconButton>
      <IconButton label="Скрыть кнопки" onClick={toggleHud}>
        <EyeOffIcon />
      </IconButton>
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
