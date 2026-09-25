import { GlobalTools, HudRestore } from '../layout/Hud';
import { useWakeLock } from '../platform/wakeLock';
import { useUi } from '../store/ui';
import { IconButton } from '../ui/IconButton';
import { FitContainIcon, FitCoverIcon, FlipCameraIcon } from '../ui/icons';
import { Version } from '../ui/Version';
import { useCamera } from './useCamera';
import { ZoomLayer } from './ZoomLayer';
import './camera.css';

export function CameraPanel() {
  const facing = useUi((s) => s.facing);
  const fit = useUi((s) => s.cameraFit);
  const toggleFacing = useUi((s) => s.toggleFacing);
  const toggleFit = useUi((s) => s.toggleCameraFit);
  // Результат хука раскладываем: в нём есть ref, и линтер считает ref-ом весь объект целиком.
  const { videoRef, status, track, error, retry } = useCamera(facing);
  useWakeLock(status === 'live');

  // Фронтальная камера в превью зеркальна, как настоящее зеркало. Запись зеркалом не затрагивается.
  const mirror = (track?.getSettings().facingMode ?? facing) === 'user';

  return (
    <section className="panel panel-camera" aria-label="Камера" data-fit={fit}>
      <video
        ref={videoRef}
        className="camera-video"
        data-mirror={mirror || undefined}
        autoPlay
        muted
        playsInline
        disablePictureInPicture
      />

      {status !== 'live' && (
        <div className="camera-message">
          {status === 'error' ? error : 'Включаю камеру…'}
          {status === 'error' && (
            <button type="button" className="text-btn" onClick={retry}>
              Повторить
            </button>
          )}
        </div>
      )}

      {track && <ZoomLayer key={track.id} track={track} />}

      <div className="panel-bar hud">
        <div className="tool-group">
          <IconButton label="Переключить камеру" onClick={toggleFacing}>
            <FlipCameraIcon />
          </IconButton>
          <IconButton label={fit === 'contain' ? 'Кадр на всю панель' : 'Кадр целиком'} onClick={toggleFit}>
            {fit === 'contain' ? <FitCoverIcon /> : <FitContainIcon />}
          </IconButton>
        </div>
        <GlobalTools />
      </div>
      <HudRestore />
      <Version />
    </section>
  );
}
