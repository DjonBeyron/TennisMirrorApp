import { useCallback, useEffect, useRef, useState } from 'react';
import { syncVideo, togglePlay } from '../content/video';
import { useMediaGestures } from '../gestures/useMediaGestures';
import { mediaUrl } from '../packs/mediaUrl';
import type { MediaItem } from '../packs/types';
import { selectCurrent, selectCurrentVideo, selectLayerItem, useContent } from '../store/content';
import { useUi } from '../store/ui';
import './overlay.css';

interface Props {
  item: MediaItem;
  /** Главное видео во второй части: копия повторяет его паузу, перемотку, кадр ±1 и скорость. */
  master: HTMLVideoElement | null;
  mirror: boolean;
  /** Совмещение с фигурой: сдвиг одним пальцем и масштаб 0.3–5×; иначе обычное увеличение 1–5×. */
  align: boolean;
  className: string;
}

/**
 * Видео или фото, синхронное с главным видео эталона. Жесты свои (вид не зависит от второй части),
 * тап ставит на паузу главное видео — а значит, и все его копии.
 */
function SyncedMedia({ item, master, mirror, align, className }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const [copy, setCopy] = useState<HTMLVideoElement | null>(null);
  const copyRef = useCallback((el: HTMLVideoElement | null) => setCopy(el), []);

  const gestures = useMediaGestures({
    stageRef,
    stripRef,
    zoomRef,
    resetKey: item.id,
    canPrev: false,
    canNext: false,
    align,
    onSwipe: () => {},
    onTap: () => {
      if (master) togglePlay(master);
    },
  });

  useEffect(() => {
    if (master && copy) return syncVideo(master, copy);
  }, [master, copy]);

  return (
    <div className={`stage ${className}`} ref={stageRef} {...gestures}>
      <div ref={stripRef} />
      <div className="zoom-layer" ref={zoomRef} data-mirror={mirror || undefined}>
        {item.kind === 'video' ? (
          <video
            ref={copyRef}
            className="media"
            src={mediaUrl(item)}
            // Без главного видео (во второй части фото) слой-видео просто играет само.
            autoPlay={!master}
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

/** «Синхрон»: копия текущего эталона поверх камеры, синхронная с эталоном во второй части. */
export function OverlayCopy() {
  const current = useContent(selectCurrent);
  const master = useContent(selectCurrentVideo);
  const mirror = useUi((s) => s.mirrorContent);
  if (!current) return null;
  return (
    <SyncedMedia
      key={current.id}
      item={current}
      master={master}
      mirror={mirror}
      align
      className="overlay-copy"
    />
  );
}

/** «Разбор», первая часть: вместо камеры — то же видео, что во второй части, на общем таймлайне. */
export function ReviewCopy() {
  const current = useContent(selectCurrent);
  const master = useContent(selectCurrentVideo);
  const mirror = useUi((s) => s.mirrorContent);
  if (!current) return <div className="review-copy review-empty">Выберите видео во второй части</div>;
  return (
    <SyncedMedia
      key={current.id}
      item={current}
      master={master}
      mirror={mirror}
      align={false}
      className="review-copy"
    />
  );
}

/** «Разбор», вторая часть: слой поверх видео — текущий элемент другого раздела, на том же таймлайне. */
export function ReviewLayer() {
  const layer = useContent(selectLayerItem);
  const master = useContent(selectCurrentVideo);
  const mirror = useUi((s) => s.mirrorLayer);
  if (!layer) return null;
  return (
    <SyncedMedia key={layer.id} item={layer} master={master} mirror={mirror} align className="review-layer" />
  );
}
