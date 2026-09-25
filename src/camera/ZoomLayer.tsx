import type { ReactNode } from 'react';
import { usePinch } from '../gestures/usePinch';
import { useZoom } from './useZoom';
import { formatZoom } from './zoom';

interface Props {
  track: MediaStreamTrack;
  /** Над зумом — например, управление наложенным эталоном. */
  above?: ReactNode;
  /** Под зумом — строка съёмки. */
  below?: ReactNode;
}

/**
 * Щипок по превью и нижняя полоса панели камеры: `above`, кнопки-пресеты зума, `below`.
 * Если камера зум не умеет — без щипка и пресетов.
 */
export function ZoomLayer({ track, above, below }: Props) {
  // Раскладываем результат: в нём есть ref, и линтер считает ref-ом весь объект целиком.
  const { range, presets, value, labelRef, setZoom, onPinch } = useZoom(track);
  const pinch = usePinch(onPinch);

  return (
    <>
      {range && <div className="gesture-layer" {...pinch} />}
      <div className="panel-bottom hud">
        {above}
        {range && (
          <div className="zoom-bar">
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
        )}
        {below}
      </div>
    </>
  );
}
