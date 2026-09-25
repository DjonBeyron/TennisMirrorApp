import { useRef, type PointerEvent } from 'react';
import { useUi } from '../store/ui';
import { SPLIT_DEFAULT, dragSplit } from './split';

const DOUBLE_TAP_MS = 300;
const TAP_SLOP_PX = 6;

interface Drag {
  pointerId: number;
  app: HTMLElement;
  landscape: boolean;
  startPos: number;
  startSplit: number;
  total: number;
  value: number;
  moved: boolean;
}

function applySplit(app: HTMLElement, value: number) {
  app.style.setProperty('--split', String(value));
}

/**
 * Линия между камерой и контентом. Во время перетаскивания меняется только CSS-переменная
 * `--split` на корне (в requestAnimationFrame) — React не перерисовывается.
 * В store попадает итоговое значение. Двойной тап — сброс 50/50.
 */
export function Divider() {
  const drag = useRef<Drag | null>(null);
  const frame = useRef(0);
  const lastTap = useRef(0);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const app = el.parentElement;
    if (!app) return;
    const landscape = matchMedia('(orientation: landscape)').matches;
    const rect = app.getBoundingClientRect();
    const { split } = useUi.getState();
    el.setPointerCapture(e.pointerId);
    el.dataset.dragging = '';
    drag.current = {
      pointerId: e.pointerId,
      app,
      landscape,
      startPos: landscape ? e.clientX : e.clientY,
      startSplit: split,
      total: landscape ? rect.width : rect.height,
      value: split,
      moved: false,
    };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const delta = (d.landscape ? e.clientX : e.clientY) - d.startPos;
    if (Math.abs(delta) > TAP_SLOP_PX) d.moved = true;
    d.value = dragSplit(d.startSplit, delta, d.total, !useUi.getState().swapped);
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      applySplit(d.app, d.value);
    });
  }

  function finish(e: PointerEvent<HTMLDivElement>, cancelled: boolean) {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    drag.current = null;
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    delete e.currentTarget.dataset.dragging;

    if (d.moved) {
      applySplit(d.app, d.value);
      useUi.getState().setSplit(d.value);
      return;
    }
    if (cancelled) return;
    if (e.timeStamp - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      applySplit(d.app, SPLIT_DEFAULT);
      useUi.getState().setSplit(SPLIT_DEFAULT);
    } else {
      lastTap.current = e.timeStamp;
    }
  }

  return (
    <div
      className="divider"
      role="separator"
      aria-label="Граница камеры и контента. Двойной тап — поровну"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => finish(e, false)}
      onPointerCancel={(e) => finish(e, true)}
    />
  );
}
