import { useRef, type PointerEvent } from 'react';

export type PinchPhase = 'start' | 'move' | 'end';

type Point = { x: number; y: number };
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Щипок двумя пальцами: сообщает масштаб относительно начала жеста (1 — без изменений).
 * Возвращает обработчики pointer-событий для элемента с `touch-action: none`.
 */
export function usePinch(onPinch: (scale: number, phase: PinchPhase) => void) {
  const pointers = useRef(new Map<number, Point>());
  const startDistance = useRef(0);

  const twoPoints = () => [...pointers.current.values()].slice(0, 2);

  function onPointerDown(e: PointerEvent<HTMLElement>) {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = twoPoints();
      startDistance.current = distance(a, b);
      onPinch(1, 'start');
    }
  }

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size < 2 || startDistance.current === 0) return;
    const [a, b] = twoPoints();
    onPinch(distance(a, b) / startDistance.current, 'move');
  }

  function onPointerEnd(e: PointerEvent<HTMLElement>) {
    const wasPinching = pointers.current.size >= 2;
    pointers.current.delete(e.pointerId);
    if (wasPinching && pointers.current.size < 2) {
      startDistance.current = 0;
      onPinch(1, 'end');
    }
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
  };
}
