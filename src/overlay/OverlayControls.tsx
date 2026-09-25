import { togglePlay, useVideoState } from '../content/video';
import { selectCount, selectCurrent, selectCurrentVideo, useContent } from '../store/content';
import { useUi } from '../store/ui';
import { IconButton } from '../ui/IconButton';
import { MirrorIcon, PauseIcon, PlayIcon } from '../ui/icons';
import { OpacitySlider } from './OpacitySlider';
import './overlay.css';

function PlayButton({ video }: { video: HTMLVideoElement }) {
  const { paused } = useVideoState(video);
  return (
    <IconButton label={paused ? 'Воспроизвести эталон' : 'Пауза'} onClick={() => togglePlay(video)}>
      {paused ? <PlayIcon /> : <PauseIcon />}
    </IconButton>
  );
}

/**
 * Управление наложенным эталоном: прозрачность. `full` — камера на весь экран: ещё пауза и зеркало,
 * ведь полосы кнопок эталона там скрыты. Листать — кнопками ‹ › у краёв (ContentNav).
 */
export function OverlayControls({ full }: { full: boolean }) {
  const count = useContent(selectCount);
  const current = useContent(selectCurrent);
  const video = useContent(selectCurrentVideo);
  const mirror = useUi((s) => s.mirrorContent);
  const toggleMirror = useUi((s) => s.toggleMirrorContent);
  if (!count) return null;

  return (
    <div className="overlay-controls">
      <OpacitySlider />
      {full && (
        <div className="tool-group overlay-buttons">
          {video && <PlayButton key={current?.id} video={video} />}
          <IconButton label="Отразить эталон" aria-pressed={mirror} onClick={toggleMirror}>
            <MirrorIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
}
