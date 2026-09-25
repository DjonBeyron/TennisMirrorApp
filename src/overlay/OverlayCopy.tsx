import { useCallback, useEffect, useRef, useState } from 'react';
import { syncVideo, togglePlay } from '../content/video';
import { useMediaGestures } from '../gestures/useMediaGestures';
import { mediaUrl } from '../packs/mediaUrl';
import type { MediaItem } from '../packs/types';
import { selectCurrent, selectCurrentVideo, useContent } from '../store/content';
import { useUi } from '../store/ui';
import './overlay.css';

interface Props {
  item: MediaItem;
  /** Видео эталона во второй части — главное; копия повторяет его паузу, перемотку и скорость. */
  master: HTMLVideoElement | null;
  mirror: boolean;
}

function CopyStage({ item, master, mirror }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const [copy, setCopy] = useState<HTMLVideoElement | null>(null);
  const copyRef = useCallback((el: HTMLVideoElement | null) => setCopy(el), []);

  // Совмещение копии с фигурой — свои жесты, независимо от вида эталона во второй части.
  const gestures = useMediaGestures({
    stageRef,
    stripRef,
    zoomRef,
    resetKey: item.id,
    canPrev: false,
    canNext: false,
    align: true,
    onSwipe: () => {},
    onTap: () => {
      if (master) togglePlay(master);
    },
  });

  useEffect(() => {
    if (master && copy) return syncVideo(master, copy);
  }, [master, copy]);

  return (
    <div className="stage overlay-copy" ref={stageRef} {...gestures}>
      <div ref={stripRef} />
      <div className="zoom-layer" ref={zoomRef} data-mirror={mirror || undefined}>
        {item.kind === 'video' ? (
          <video
            ref={copyRef}
            className="media"
            src={mediaUrl(item)}
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
          />
        ) : (
          <img className="media" src={mediaUrl(item)} alt="" draggable={false} />
        )}
      </div>
    </div>
  );
}

/**
 * «Синхрон»: копия текущего эталона поверх камеры. Главный — эталон во второй части: пауза, кадр ±1,
 * перемотка и скорость там сразу повторяются здесь. Тап по копии ставит на паузу оба.
 */
export function OverlayCopy() {
  const current = useContent(selectCurrent);
  const master = useContent(selectCurrentVideo);
  const mirror = useUi((s) => s.mirrorContent);
  if (!current) return null;
  return <CopyStage key={current.id} item={current} master={master} mirror={mirror} />;
}
