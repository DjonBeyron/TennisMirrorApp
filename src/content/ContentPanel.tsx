import { useEffect, useRef, type ChangeEvent } from 'react';
import { CameraMirror } from '../camera/CameraMirror';
import { HideButton, HudRestore, OtherSpaceButton, SpacesSwitch } from '../layout/Hud';
import { LayerControls } from '../overlay/LayerControls';
import { OverlayControls } from '../overlay/OverlayControls';
import { ReviewLayer } from '../overlay/SyncedMedia';
import { shareOrDownload } from '../platform/share';
import { selectCount, selectCurrent, selectCurrentVideo, selectIndex, useContent } from '../store/content';
import {
  selectCameraInContent,
  selectContentVisible,
  selectOverlayActive,
  selectReviewLayer,
  useUi,
} from '../store/ui';
import { IconButton } from '../ui/IconButton';
import { LayersIcon, MirrorIcon, PlusIcon, ShareIcon, TrashIcon } from '../ui/icons';
import { ContentNav } from './ContentNav';
import { ContentStage } from './ContentStage';
import { PackSwitch } from './PackSwitch';
import { VideoControls } from './VideoControls';
import './content.css';

/**
 * Вторая часть экрана: эталоны с устройства или свои записи («Эталон / Записи»). В режиме «две камеры»
 * под ними — второе превью камеры, а эталон накладывается поверх (кнопкой, прозрачность — ползунком).
 * Как и камеру, эту часть можно развернуть на весь экран.
 */
export function ContentPanel() {
  const loaded = useContent((s) => s.loaded);
  const recordingsPack = useContent((s) => s.pack === 'recordings');
  const count = useContent(selectCount);
  const index = useContent(selectIndex);
  const current = useContent(selectCurrent);
  const video = useContent(selectCurrentVideo);
  const load = useContent((s) => s.load);
  const add = useContent((s) => s.add);
  const remove = useContent((s) => s.remove);
  const dual = useUi(selectCameraInContent);
  // Во второй части сам эталон (не камера): «Рядом» и «Синхрон» — тогда подсказываем, как его добавить.
  const plain = useUi((s) => s.layout !== 'dual');
  // Когда эта часть одна на экране, кнопки «скрыть» и «показать» нужны здесь: полоса камеры скрыта.
  const solo = useUi((s) => s.solo === 'content');
  const overlay = useUi((s) => s.overlay);
  const overlayActive = useUi(selectOverlayActive);
  // «Разбор»: слой поверх видео (элемент другого раздела) и кнопка, чтобы его убрать.
  const reviewLayer = useUi(selectReviewLayer);
  const review = useUi((s) => s.layout === 'review' && s.solo !== 'camera');
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
    if (!current) return;
    // Снятое в приложении есть только здесь; у добавленного с устройства копия остаётся в галерее.
    // Эталоны всегда с устройства (у старых нет пометки imported), записи — пока не помечены иначе.
    const onlyHere = recordingsPack && !current.imported;
    const question = onlyHere
      ? `Удалить запись «${current.name}»? Отменить это нельзя: запись есть только в приложении.`
      : `Удалить «${current.name}» из приложения? Файл на устройстве останется.`;
    if (confirm(question)) void remove(current.id);
  }

  const empty = recordingsPack
    ? 'Записей пока нет. Снимите себя кнопкой съёмки в панели камеры или добавьте видео с устройства.'
    : 'Добавьте видео или фото эталона с устройства';

  return (
    <section className="panel panel-content" aria-label="Эталон">
      {dual && <CameraMirror />}
      {count > 0 && <ContentStage />}
      {reviewLayer && count > 0 && <ReviewLayer />}
      {visible && <ContentNav />}
      {count === 0 && loaded && plain && (
        <div className="content-empty">
          {empty}
          <button type="button" className="text-btn" onClick={pickFiles}>
            Выбрать файлы
          </button>
        </div>
      )}

      <div className="panel-bar hud">
        <div className="tool-group">
          <PackSwitch />
          {/* Добавляет в открытый раздел: в «Записи» тоже можно взять видео из галереи. */}
          <IconButton label="Добавить видео или фото" onClick={pickFiles}>
            <PlusIcon />
          </IconButton>
          {count > 0 && current && (
            <>
              {recordingsPack && (
                <IconButton
                  label="Поделиться или сохранить в галерею"
                  onClick={() => void shareOrDownload(current)}
                >
                  <ShareIcon />
                </IconButton>
              )}
              <IconButton label="Отразить" aria-pressed={mirror} onClick={toggleMirror}>
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
        <div className="tool-group">
          {(dual || review) && (
            <IconButton
              label={review ? 'Слой поверх видео' : 'Эталон поверх камеры'}
              aria-pressed={overlay}
              onClick={toggleOverlay}
            >
              <LayersIcon />
            </IconButton>
          )}
          {solo && <OtherSpaceButton to="camera" />}
          <SpacesSwitch space="content" />
          {solo && <HideButton />}
        </div>
      </div>

      <div className="panel-bottom hud">
        {overlayActive && <OverlayControls full={false} />}
        {reviewLayer && count > 0 && <LayerControls />}
        {visible && video && current && <VideoControls key={current.id} video={video} />}
      </div>

      <HudRestore />
      <input ref={inputRef} type="file" accept="video/*,image/*" multiple hidden onChange={onFiles} />
    </section>
  );
}
