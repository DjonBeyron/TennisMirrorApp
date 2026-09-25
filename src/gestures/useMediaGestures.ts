import { useEffect, useRef, type PointerEvent, type RefObject } from 'react';
import {
  ALIGN_MIN_SCALE,
  IDENTITY,
  clampAlign,
  clampView,
  isIdentity,
  isZoomedIn,
  pinchView,
  swipeDirection,
  type Point,
  type View,
} from './view';

const TAP_MS = 250;
const DOUBLE_TAP_MS = 300;
const MOVE_SLOP_PX = 10;
/** Сопротивление на краях: дальше листать некуда, слайд едет в 4 раза медленнее пальца. */
const EDGE_RESISTANCE = 4;

type Mode = 'idle' | 'swipe' | 'pan' | 'pinch';

// DOM-элемент меняем вне хука: линтер React не разрешает менять то, что пришло в параметрах хука.
function setTransform(el: HTMLElement | null, transform: string) {
  if (el) el.style.transform = transform;
}

interface Options {
  /** Сцена, на которой ловим жесты (touch-action: none). */
  stageRef: RefObject<HTMLElement | null>;
  /** Лента из трёх ячеек (предыдущая, текущая, следующая) — едет за пальцем при свайпе. */
  stripRef: RefObject<HTMLElement | null>;
  /** Слой текущего контента — получает увеличение и сдвиг. */
  zoomRef: RefObject<HTMLElement | null>;
  /** Смена значения (другой слайд) сбрасывает увеличение. */
  resetKey: string | undefined;
  canPrev: boolean;
  canNext: boolean;
  /**
   * Выравнивание эталона поверх камеры: один палец всегда двигает, листания нет,
   * масштаб от 0.3 (фигуру можно уменьшить до своего размера в кадре).
   */
  align: boolean;
  onSwipe: (direction: 1 | -1) => void;
  onTap: () => void;
}

/**
 * Жесты по контенту без перерисовки React: один палец — свайп (или сдвиг, если увеличено или идёт
 * выравнивание), два — щипок, тап — onTap, двойной тап — сброс. Стили пишутся в requestAnimationFrame.
 */
export function useMediaGestures(o: Options) {
  const pointers = useRef(new Map<number, Point>());
  const view = useRef<View>(IDENTITY);
  const mode = useRef<Mode>('idle');
  const start = useRef({ view: IDENTITY, point: { x: 0, y: 0 }, mid: { x: 0, y: 0 }, dist: 1, time: 0 });
  const box = useRef({ left: 0, top: 0, width: 1, height: 1 });
  const swipeDx = useRef(0);
  const moved = useRef(false);
  const lastTap = useRef(0);
  const frame = useRef(0);

  function render() {
    const { s, x, y } = view.current;
    setTransform(o.zoomRef.current, isIdentity(view.current) ? '' : `translate(${x}px, ${y}px) scale(${s})`);
    // Пустой transform возвращает ленту к CSS-положению «текущая ячейка по центру».
    const dx = swipeDx.current;
    setTransform(o.stripRef.current, dx ? `translateX(calc(-100% / 3 + ${dx}px))` : '');
  }

  function schedule() {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      render();
    });
  }

  useEffect(() => {
    view.current = IDENTITY;
    swipeDx.current = 0;
  }, [o.resetKey]);

  // Координаты относительно центра сцены.
  const local = (e: PointerEvent): Point => ({
    x: e.clientX - box.current.left - box.current.width / 2,
    y: e.clientY - box.current.top - box.current.height / 2,
  });

  function twoFingers() {
    const [a, b] = [...pointers.current.values()];
    return { mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, dist: Math.hypot(a.x - b.x, a.y - b.y) || 1 };
  }

  const limit = (v: View) =>
    o.align
      ? clampAlign(v, box.current.width, box.current.height)
      : clampView(v, box.current.width, box.current.height);

  function begin(point: Point, time: number) {
    start.current = { ...start.current, view: view.current, point, time };
    mode.current = o.align || isZoomedIn(view.current) ? 'pan' : 'swipe';
    moved.current = false;
    swipeDx.current = 0;
  }

  function onPointerDown(e: PointerEvent<HTMLElement>) {
    if (pointers.current.size === 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      box.current = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Указатель уже отпущен — ловить нечего.
    }
    pointers.current.set(e.pointerId, local(e));
    if (pointers.current.size === 1) begin(local(e), e.timeStamp);
    if (pointers.current.size === 2) {
      const { mid, dist } = twoFingers();
      start.current = { ...start.current, view: view.current, mid, dist };
      mode.current = 'pinch';
      moved.current = true;
      swipeDx.current = 0;
      schedule();
    }
  }

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (!pointers.current.has(e.pointerId)) return;
    const point = local(e);
    pointers.current.set(e.pointerId, point);

    if (mode.current === 'pinch' && pointers.current.size >= 2) {
      const { mid, dist } = twoFingers();
      const minScale = o.align ? ALIGN_MIN_SCALE : 1;
      view.current = limit(
        pinchView(start.current.view, start.current.mid, mid, dist / start.current.dist, minScale),
      );
      return schedule();
    }

    const dx = point.x - start.current.point.x;
    const dy = point.y - start.current.point.y;
    if (Math.hypot(dx, dy) > MOVE_SLOP_PX) moved.current = true;
    if (!moved.current) return;

    if (mode.current === 'pan') {
      const { view: v } = start.current;
      view.current = limit({ s: v.s, x: v.x + dx, y: v.y + dy });
    } else if (mode.current === 'swipe') {
      const blocked = (dx > 0 && !o.canPrev) || (dx < 0 && !o.canNext);
      swipeDx.current = blocked ? dx / EDGE_RESISTANCE : dx;
    }
    schedule();
  }

  function onPointerEnd(e: PointerEvent<HTMLElement>, cancelled: boolean) {
    if (!pointers.current.delete(e.pointerId)) return;

    if (mode.current === 'pinch') {
      if (isIdentity(view.current)) view.current = IDENTITY;
      // Остался один палец — им можно двигать увеличенный контент, но не листать.
      const rest = [...pointers.current.values()][0];
      if (rest) begin(rest, e.timeStamp);
      moved.current = true;
      mode.current = rest && (o.align || isZoomedIn(view.current)) ? 'pan' : 'idle';
      return render();
    }

    if (pointers.current.size > 0) return;
    const wasSwipe = mode.current === 'swipe';
    const dx = swipeDx.current;
    mode.current = 'idle';
    swipeDx.current = 0;

    if (moved.current || cancelled) {
      render();
      const direction = wasSwipe ? swipeDirection(dx, box.current.width, o.canPrev, o.canNext) : 0;
      if (direction) o.onSwipe(direction);
      return;
    }
    if (e.timeStamp - start.current.time > TAP_MS) return;

    // Тап сразу переключает паузу; двойной тап переключает её дважды (итог тот же) и сбрасывает увеличение.
    o.onTap();
    if (e.timeStamp - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      view.current = IDENTITY;
      render();
    } else {
      lastTap.current = e.timeStamp;
    }
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: (e: PointerEvent<HTMLElement>) => onPointerEnd(e, false),
    onPointerCancel: (e: PointerEvent<HTMLElement>) => onPointerEnd(e, true),
  };
}
