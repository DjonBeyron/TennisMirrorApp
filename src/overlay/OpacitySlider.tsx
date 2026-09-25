import { OPACITY_MIN, useUi } from '../store/ui';
import { OpacityIcon } from '../ui/icons';
import './overlay.css';

/**
 * Ползунок прозрачности наложенного эталона. Значение попадает в CSS-переменную на корне (store/ui.ts),
 * поэтому движение ползунка перерисовывает только его самого.
 */
export function OpacitySlider() {
  const opacity = useUi((s) => s.overlayOpacity);
  const setOpacity = useUi((s) => s.setOverlayOpacity);
  return (
    <label className="opacity-slider">
      <OpacityIcon />
      <input
        type="range"
        aria-label="Прозрачность эталона"
        min={OPACITY_MIN}
        max={1}
        step={0.05}
        value={opacity}
        onChange={(e) => setOpacity(Number(e.target.value))}
      />
      <span className="opacity-value">{Math.round(opacity * 100)}%</span>
    </label>
  );
}
