import { usePinch } from '../gestures/usePinch';
import { useZoom } from './useZoom';
import { formatZoom } from './zoom';

/** Щипок по превью и кнопки-пресеты зума. Если камера зум не умеет — ничего не показывает. */
export function ZoomLayer({ track }: { track: MediaStreamTrack }) {
  // Раскладываем результат: в нём есть ref, и линтер считает ref-ом весь объект целиком.
  const { range, presets, value, labelRef, setZoom, onPinch } = useZoom(track);
  const pinch = usePinch(onPinch);
  if (!range) return null;

  return (
    <>
      <div className="gesture-layer" {...pinch} />
      <div className="zoom-bar hud">
        <span className="zoom-value" ref={labelRef}>
          {formatZoom(value)}
        </span>
        <div className="zoom-presets">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              className="zoom-chip"
              data-active={Math.abs(preset - value) < 0.05 || undefined}
              onClick={() => setZoom(preset)}
            >
              {formatZoom(preset)}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
