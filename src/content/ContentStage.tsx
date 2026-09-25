import { useCallback, useEffect, useRef, useState } from 'react';
import { useMediaGestures } from '../gestures/useMediaGestures';
import { mediaUrl } from '../packs/mediaUrl';
import type { MediaItem } from '../packs/types';
import { useContent } from '../store/content';
import { useUi } from '../store/ui';
import { VideoControls } from './VideoControls';

/** Соседний слайд, видный во время свайпа. Видео не декодируем — только подпись. */
function Preview({ item }: { item: MediaItem | undefined }) {
  if (!item) return null;
  if (item.kind === 'image') return <img className="media" src={mediaUrl(item)} alt="" draggable={false} />;
  return <div className="preview-video">{item.name}</div>;
}

/**
 * Лента из трёх ячеек: предыдущий, текущий и следующий эталон. Видео с `src` есть только у текущего.
 * Свайп листает, щипок увеличивает, тап — пауза, двойной тап — сброс увеличения.
 */
export function ContentStage() {
  const items = useContent((s) => s.items);
  const index = useContent((s) => s.index);
  const go = useContent((s) => s.go);
  const mirror = useUi((s) => s.mirrorContent);
  const hidden = useUi((s) => s.mode === 'camera');
  const stageRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const videoRef = useCallback((el: HTMLVideoElement | null) => setVideo(el), []);

  const current = items[index];
  const gestures = useMediaGestures({
    stageRef,
    stripRef,
    zoomRef,
    resetKey: current?.id,
    canPrev: index > 0,
    canNext: index < items.length - 1,
    onSwipe: go,
    onTap: () => {
      if (!video) return;
      if (video.paused) void video.play();
      else video.pause();
    },
  });

  // Камера на весь экран: эталон скрыт — ставим видео на паузу.
  useEffect(() => {
    if (hidden) video?.pause();
  }, [hidden, video]);

  if (!current) return null;
  // Пока ref не обновился, `video` может указывать на элемент прошлого слайда.
  const currentVideo = video?.dataset.item === current.id ? video : null;

  return (
    <>
      <div className="stage" ref={stageRef} {...gestures}>
        <div className="strip" ref={stripRef}>
          <div className="cell">
            <Preview item={items[index - 1]} />
          </div>
          <div className="cell">
            <div className="zoom-layer" ref={zoomRef} key={current.id} data-mirror={mirror || undefined}>
              {current.kind === 'video' ? (
                <video
                  ref={videoRef}
                  className="media"
                  data-item={current.id}
                  src={mediaUrl(current)}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                />
              ) : (
                <img className="media" src={mediaUrl(current)} alt={current.name} draggable={false} />
              )}
            </div>
          </div>
          <div className="cell">
            <Preview item={items[index + 1]} />
          </div>
        </div>
      </div>
      {currentVideo && <VideoControls key={current.id} video={currentVideo} />}
    </>
  );
}
