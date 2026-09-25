import { enterFullscreen, exitFullscreen } from '../platform/fullscreen';
import { useUi } from '../store/ui';
import { IconButton } from '../ui/IconButton';
import { CollapseIcon, ExpandIcon, EyeIcon, EyeOffIcon, SwapIcon } from '../ui/icons';

/** Общие кнопки в правом верхнем углу. Когда они скрыты, остаётся одна полупрозрачная — вернуть. */
export function Hud() {
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
    <>
      <div className="top-bar hud">
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
      <IconButton className="hud-restore" label="Показать кнопки" onClick={toggleHud}>
        <EyeIcon />
      </IconButton>
    </>
  );
}
