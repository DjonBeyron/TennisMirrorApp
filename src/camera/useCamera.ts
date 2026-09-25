import { useEffect, useRef, useState } from 'react';
import { useCameraStream } from '../store/camera';
import type { Facing } from '../store/ui';

/** Разрешение и частота кадров; при applyConstraints их нужно передавать снова, иначе они сбросятся. */
export const VIDEO_BASE: MediaTrackConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 30 },
};

export type CameraStatus = 'starting' | 'live' | 'error';

interface CameraState {
  status: CameraStatus;
  track: MediaStreamTrack | null;
  error: string | null;
}

const STARTING: CameraState = { status: 'starting', track: null, error: null };

async function openCamera(facing: Facing): Promise<MediaStream> {
  const video: MediaTrackConstraints = { ...VIDEO_BASE, facingMode: { ideal: facing } };
  try {
    // Chrome даёт управлять зумом, только если его запросили при открытии камеры.
    return await navigator.mediaDevices.getUserMedia({ video: { ...video, zoom: true }, audio: false });
  } catch {
    return navigator.mediaDevices.getUserMedia({ video, audio: false });
  }
}

function describeError(e: unknown): string {
  const name = e instanceof DOMException ? e.name : '';
  if (name === 'NotAllowedError') return 'Нет доступа к камере — разрешите его в настройках браузера';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'Камера не найдена';
  if (name === 'NotReadableError') return 'Камера занята другим приложением';
  if (!navigator.mediaDevices) return 'Камера доступна только по HTTPS';
  return 'Не удалось включить камеру';
}

const stop = (stream: MediaStream) => stream.getTracks().forEach((t) => t.stop());

/**
 * Живое превью камеры. Поток открывается заново только при смене камеры (фронт/тыл) и после возврата
 * из фона — смена режима, раскладки и поворот его не трогают (видео не размонтируется).
 */
export function useCamera(facing: Facing) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<CameraState>(STARTING);
  const [visible, setVisible] = useState(() => document.visibilityState === 'visible');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    // В фоне камера выключена — экономим батарею.
    if (!visible) return;
    // <video> не размонтируется, поэтому элемент можно запомнить на время эффекта.
    const video = videoRef.current;
    let cancelled = false;
    let stream: MediaStream | null = null;

    openCamera(facing).then(
      (opened) => {
        if (cancelled) return stop(opened);
        stream = opened;
        if (video) {
          video.srcObject = opened;
          video.play().catch(() => {});
        }
        setState({ status: 'live', track: opened.getVideoTracks()[0] ?? null, error: null });
        useCameraStream.setState({ stream: opened });
      },
      (e: unknown) => {
        if (!cancelled) setState({ status: 'error', track: null, error: describeError(e) });
      },
    );

    return () => {
      cancelled = true;
      if (stream) stop(stream);
      useCameraStream.setState({ stream: null });
      if (video) video.srcObject = null;
      setState(STARTING);
    };
  }, [facing, visible, attempt]);

  return { videoRef, ...state, retry: () => setAttempt((n) => n + 1) };
}
