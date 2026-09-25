import { togglePlay, useVideoState } from '../content/video';
import { selectCount, selectCurrent, selectCurrentVideo, selectIndex, useContent } from '../store/content';
import { useUi } from '../store/ui';
import { IconButton } from '../ui/IconButton';
import { ChevronLeftIcon, ChevronRightIcon, MirrorIcon, PauseIcon, PlayIcon } from '../ui/icons';
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
 * Управление наложенным эталоном: прозрачность и ‹ › (свайп при наложении занят выравниванием).
 * `full` — на весь экран: ещё пауза и зеркало, ведь свои кнопки панели эталона там скрыты.
 */
export function OverlayControls({ full }: { full: boolean }) {
  const count = useContent(selectCount);
  const index = useContent(selectIndex);
  const current = useContent(selectCurrent);
  const video = useContent(selectCurrentVideo);
  const go = useContent((s) => s.go);
  const mirror = useUi((s) => s.mirrorContent);
  const toggleMirror = useUi((s) => s.toggleMirrorContent);
  if (!count) return null;

  return (
    <div className="overlay-controls">
      <OpacitySlider />
      <div className="tool-group overlay-buttons">
        <IconButton label="Предыдущий эталон" disabled={index === 0} onClick={() => go(-1)}>
          <ChevronLeftIcon />
        </IconButton>
        {full && video && <PlayButton key={current?.id} video={video} />}
        <IconButton label="Следующий эталон" disabled={index >= count - 1} onClick={() => go(1)}>
          <ChevronRightIcon />
        </IconButton>
        {full && (
          <IconButton label="Отразить эталон" aria-pressed={mirror} onClick={toggleMirror}>
            <MirrorIcon />
          </IconButton>
        )}
      </div>
    </div>
  );
}
