import { useEffect, useRef, type ChangeEvent } from 'react';
import { CameraMirror } from '../camera/CameraMirror';
import { OverlayControls } from '../overlay/OverlayControls';
import { selectCurrent, selectCurrentVideo, useContent } from '../store/content';
import { selectContentVisible, selectOverlayActive, useUi } from '../store/ui';
import { IconButton } from '../ui/IconButton';
import { LayersIcon, MirrorIcon, PlusIcon, TrashIcon } from '../ui/icons';
import { ContentStage } from './ContentStage';
import { VideoControls } from './VideoControls';
import './content.css';

/**
 * Панель эталона: видео и фото с устройства. В режиме «две камеры» под эталоном — второе превью камеры,
 * а эталон накладывается поверх него (включается кнопкой, прозрачность — ползунком).
 */
export function ContentPanel() {
  const loaded = useContent((s) => s.loaded);
  const count = useContent((s) => s.items.length);
  const index = useContent((s) => s.index);
  const current = useContent(selectCurrent);
  const video = useContent(selectCurrentVideo);
  const load = useContent((s) => s.load);
  const add = useContent((s) => s.add);
  const remove = useContent((s) => s.remove);
  const dual = useUi((s) => s.layout === 'dual' && !s.fullscreen);
  const split = useUi((s) => s.layout === 'split');
  const overlay = useUi((s) => s.overlay);
  const overlayActive = useUi(selectOverlayActive);
  const visible = useUi(selectContentVisible);
  const mirror = useUi((s) => s.mirrorContent);
  const toggleMirror = useUi((s) => s.toggleMirrorContent);
  const toggleOverlay = useUi((s) => s.toggleOverlay);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void load();
  }, [load]);

  const pickFiles = () => inputRef.current?.click();

  function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])];
    e.target.value = ''; // тот же файл можно будет выбрать снова
    if (files.length) void add(files);
  }

  function onDelete() {
    if (current && confirm(`Удалить «${current.name}» из приложения? Файл на устройстве останется.`)) {
      void remove(current.id);
    }
  }

  return (
    <section className="panel panel-content" aria-label="Эталон">
      {dual && <CameraMirror />}
      {count > 0 && <ContentStage />}
      {count === 0 && loaded && split && (
        <div className="content-empty">
          Добавьте видео или фото эталона с устройства
          <button type="button" className="text-btn" onClick={pickFiles}>
            Выбрать файлы
          </button>
          <a href="/probe.html">Проверка камеры</a>
        </div>
      )}

      <div className="panel-bar hud">
        <div className="tool-group">
          <IconButton label="Добавить видео или фото" onClick={pickFiles}>
            <PlusIcon />
          </IconButton>
          {count > 0 && (
            <>
              <IconButton label="Отразить эталон" aria-pressed={mirror} onClick={toggleMirror}>
                <MirrorIcon />
              </IconButton>
              <IconButton label="Удалить из приложения" onClick={onDelete}>
                <TrashIcon />
              </IconButton>
              <span className="content-counter">
                {index + 1} / {count}
              </span>
            </>
          )}
        </div>
        {dual && (
          <div className="tool-group">
            <IconButton label="Эталон поверх камеры" aria-pressed={overlay} onClick={toggleOverlay}>
              <LayersIcon />
            </IconButton>
          </div>
        )}
      </div>

      <div className="panel-bottom hud">
        {overlayActive && <OverlayControls full={false} />}
        {visible && video && current && <VideoControls key={current.id} video={video} />}
      </div>

      <input ref={inputRef} type="file" accept="video/*,image/*" multiple hidden onChange={onFiles} />
    </section>
  );
}
