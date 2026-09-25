import { GlobalTools, HudRestore } from '../layout/Hud';
import { OverlayControls } from '../overlay/OverlayControls';
import { OverlayCopy } from '../overlay/OverlayCopy';
import { useWakeLock } from '../platform/wakeLock';
import { selectOverlayCopy, useUi } from '../store/ui';
import { IconButton } from '../ui/IconButton';
import { FitContainIcon, FitCoverIcon, FlipCameraIcon } from '../ui/icons';
import { Version } from '../ui/Version';
import { CaptureBar } from './CaptureBar';
import { useCamera } from './useCamera';
import { useCapture } from './useCapture';
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

  // Раскладываем по той же причине, что и useCamera.
  const { mode, recording, startedAt, notice, ready, shutter } = useCapture(() => videoRef.current);

  // Эталон поверх камеры на весь экран — его управление стоит в нижней полосе этой панели.
  const overlayHere = useUi((s) => s.solo === 'camera' && s.overlay);
  // «Синхрон»: поверх камеры — копия эталона; пауза и остальное управление — во второй части.
  const overlayCopy = useUi(selectOverlayCopy);
  const overlayControls = overlayHere ? (
    <OverlayControls full />
  ) : overlayCopy ? (
    <OverlayControls full={false} />
  ) : null;
  const captureBar = (
    <CaptureBar
      mode={mode}
      recording={recording}
      startedAt={startedAt}
      notice={notice}
      ready={ready}
      onShutter={() => void shutter()}
    />
  );

  // Фронтальная камера в превью зеркальна, как настоящее зеркало. Запись зеркалом не затрагивается.
  const mirror = (track?.getSettings().facingMode ?? facing) === 'user';

  return (
    <section className="panel panel-camera" aria-label="Камера">
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

      {overlayCopy && <OverlayCopy />}

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

      {track ? (
        <ZoomLayer key={track.id} track={track} above={overlayControls} below={captureBar} />
      ) : (
        <div className="panel-bottom hud">{overlayControls}</div>
      )}

      <div className="panel-bar hud">
        <div className="tool-group">
          {/* Смена камеры останавливает поток — во время записи недоступна. */}
          <IconButton label="Переключить камеру" disabled={recording} onClick={toggleFacing}>
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
