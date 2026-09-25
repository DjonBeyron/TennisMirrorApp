import { useEffect } from 'react';

/** Не даёт экрану погаснуть, пока `active`. Браузер сам снимает блокировку при уходе в фон. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let released = false;
    navigator.wakeLock.request('screen').then(
      (sentinel) => {
        if (released) void sentinel.release();
        else lock = sentinel;
      },
      () => {},
    );
    return () => {
      released = true;
      lock?.release().catch(() => {});
    };
  }, [active]);
}
