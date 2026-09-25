import { useUi } from '../store/ui';
import { IconButton } from '../ui/IconButton';
import { SwapIcon } from '../ui/icons';

export function Hud() {
  const toggleSwapped = useUi((s) => s.toggleSwapped);
  return (
    <div className="hud">
      <IconButton label="Поменять местами камеру и контент" onClick={toggleSwapped}>
        <SwapIcon className="rotate-landscape" />
      </IconButton>
    </div>
  );
}
