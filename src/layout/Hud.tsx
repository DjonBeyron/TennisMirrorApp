import { enterFullscreen, exitFullscreen } from '../platform/fullscreen';
import { useUi } from '../store/ui';
import { IconButton } from '../ui/IconButton';
import { CollapseIcon, ExpandIcon, EyeIcon, EyeOffIcon, SwapIcon } from '../ui/icons';

/** Общие кнопки раскладки. Стоят в полосе панели камеры, чтобы при повороте не залезать на эталон. */
export function GlobalTools() {
  const mode = useUi((s) => s.mode);
  const toggleSwapped = useUi((s) => s.toggleSwapped);
  const toggleCameraMode = useUi((s) => s.toggleCameraMode);
  const toggleHud = useUi((s) => s.toggleHud);

  function onCameraMode() {
    if (mode === 'split') enterFullscreen();
    else exitFullscreen();
    toggleCameraMode();
  }

  return (
    <div className="tool-group">
      {mode === 'split' && (
        <IconButton label="Поменять местами камеру и контент" onClick={toggleSwapped}>
          <SwapIcon className="rotate-landscape" />
        </IconButton>
      )}
      <IconButton
        label={mode === 'camera' ? 'Вернуть контент' : 'Камера на весь экран'}
        onClick={onCameraMode}
      >
        {mode === 'camera' ? <CollapseIcon /> : <ExpandIcon />}
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
