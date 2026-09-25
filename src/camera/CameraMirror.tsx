import { useEffect, useRef } from 'react';
import { useCameraStream } from '../store/camera';
import { useUi } from '../store/ui';

/**
 * Второе превью камеры для режима «две камеры»: тот же поток, что и в панели камеры,
 * поэтому камера не открывается повторно, а зум общий. Зеркало и кадрирование — как у основного.
 */
export function CameraMirror() {
  const stream = useCameraStream((s) => s.stream);
  const facing = useUi((s) => s.facing);
  const fit = useUi((s) => s.cameraFit);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    if (stream) video.play().catch(() => {});
  }, [stream]);

  const track = stream?.getVideoTracks()[0];
  const mirror = (track?.getSettings().facingMode ?? facing) === 'user';

  return (
    <video
      ref={videoRef}
      className="camera-video"
      data-fit={fit}
      data-mirror={mirror || undefined}
      autoPlay
      muted
      playsInline
      disablePictureInPicture
    />
  );
}
