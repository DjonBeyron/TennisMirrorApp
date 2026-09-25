import { useCallback, useEffect, useRef } from 'react';
import { useMediaGestures } from '../gestures/useMediaGestures';
import { mediaUrl } from '../packs/mediaUrl';
import type { MediaItem } from '../packs/types';
import { selectCurrentVideo, useContent } from '../store/content';
import { selectContentVisible, selectOverlayActive, useUi } from '../store/ui';
import { applySpeed, togglePlay } from './video';

/** Соседний слайд, видный во время свайпа. Видео не декодируем — только подпись. */
function Preview({ item }: { item: MediaItem | undefined }) {
  if (!item) return null;
  if (item.kind === 'image') return <img className="media" src={mediaUrl(item)} alt="" draggable={false} />;
  return <div className="preview-video">{item.name}</div>;
}

/**
 * Лента из трёх ячеек: предыдущий, текущий и следующий эталон. Видео с `src` есть только у текущего.
 * Рядом с камерой свайп листает; поверх камеры жесты выравнивают эталон по фигуре.
 */
export function ContentStage() {
  const items = useContent((s) => s.items);
  const index = useContent((s) => s.index);
  const go = useContent((s) => s.go);
  const speed = useContent((s) => s.speed);
  const setVideo = useContent((s) => s.setVideo);
  const video = useContent(selectCurrentVideo);
  const mirror = useUi((s) => s.mirrorContent);
  const visible = useUi(selectContentVisible);
  const align = useUi(selectOverlayActive);
  const stageRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const videoRef = useCallback((el: HTMLVideoElement | null) => setVideo(el), [setVideo]);

  const current = items[index];
  const gestures = useMediaGestures({
    stageRef,
    stripRef,
    zoomRef,
    resetKey: current?.id,
    canPrev: index > 0,
    canNext: index < items.length - 1,
    align,
    onSwipe: go,
    onTap: () => {
      if (video) togglePlay(video);
    },
  });

  // Эталон не виден (камера на весь экран без наложения, «две камеры» без наложения) — пауза.
  useEffect(() => {
    if (!visible) video?.pause();
  }, [visible, video]);

  useEffect(() => {
    if (!video) return;
    const apply = () => applySpeed(video, speed);
    apply();
    video.addEventListener('loadedmetadata', apply);
    return () => video.removeEventListener('loadedmetadata', apply);
  }, [video, speed]);

  if (!current) return null;

  return (
    <div className="stage" ref={stageRef} {...gestures}>
      <div className="strip" ref={stripRef}>
        <div className="cell">{!align && <Preview item={items[index - 1]} />}</div>
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
        <div className="cell">{!align && <Preview item={items[index + 1]} />}</div>
      </div>
    </div>
  );
}
