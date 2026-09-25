import { create } from 'zustand';

/**
 * Живой поток камеры. Открывает его панель камеры (useCamera), а второе превью в режиме «две камеры»
 * подключается к тому же потоку — камера открывается один раз, зум общий.
 */
export const useCameraStream = create<{ stream: MediaStream | null }>()(() => ({ stream: null }));
