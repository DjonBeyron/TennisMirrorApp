import { useRef, useState } from 'react';
import type { PinchPhase } from '../gestures/usePinch';
import { VIDEO_BASE } from './useCamera';
import { clampZoom, formatZoom, zoomPresets, zoomRange } from './zoom';

/**
 * Нативный зум трека. Компонент с этим хуком создаётся заново для каждого трека (key={track.id}),
 * поэтому диапазон читается один раз. Во время щипка подпись меняется напрямую через ref,
 * в state попадает итоговое значение.
 */
export function useZoom(track: MediaStreamTrack) {
  const [range] = useState(() => zoomRange(track.getCapabilities?.()));
  const [value, setValue] = useState(() => track.getSettings().zoom ?? range?.min ?? 1);
  const labelRef = useRef<HTMLSpanElement>(null);
  const live = useRef(value);
  const pinchStart = useRef(value);
  const pending = useRef<number | null>(null);
  const busy = useRef(false);

  // Пока камера применяет предыдущее значение, копим только последнее.
  async function apply(zoom: number) {
    pending.current = zoom;
    if (busy.current) return;
    busy.current = true;
    while (pending.current !== null) {
      const next = pending.current;
      pending.current = null;
      try {
        await track.applyConstraints({ ...VIDEO_BASE, advanced: [{ zoom: next }] });
      } catch {
        // Трек мог остановиться (смена камеры, уход в фон) — просто пропускаем.
      }
    }
    busy.current = false;
  }

  function setZoom(zoom: number) {
    if (!range) return;
    const z = clampZoom(zoom, range);
    live.current = z;
    setValue(z);
    void apply(z);
  }

  function onPinch(scale: number, phase: PinchPhase) {
    if (!range) return;
    if (phase === 'start') {
      pinchStart.current = live.current;
      return;
    }
    if (phase === 'end') {
      setValue(live.current);
      return;
    }
    const z = clampZoom(pinchStart.current * scale, range);
    if (z === live.current) return;
    live.current = z;
    if (labelRef.current) labelRef.current.textContent = formatZoom(z);
    void apply(z);
  }

  return { range, presets: range ? zoomPresets(range) : [], value, labelRef, setZoom, onPinch };
}
