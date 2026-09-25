import { useEffect, useRef, type ChangeEvent } from 'react';
import { useContent } from '../store/content';
import { useUi } from '../store/ui';
import { IconButton } from '../ui/IconButton';
import { MirrorIcon, PlusIcon, TrashIcon } from '../ui/icons';
import { ContentStage } from './ContentStage';
import './content.css';

/** Панель эталона: видео и фото с устройства, листаются свайпом. */
export function ContentPanel() {
  const loaded = useContent((s) => s.loaded);
  const count = useContent((s) => s.items.length);
  const index = useContent((s) => s.index);
  const current = useContent((s) => s.items[s.index]);
  const load = useContent((s) => s.load);
  const add = useContent((s) => s.add);
  const remove = useContent((s) => s.remove);
  const mirror = useUi((s) => s.mirrorContent);
  const toggleMirror = useUi((s) => s.toggleMirrorContent);
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
    <section className="panel panel-content" aria-label="Контент">
      {count > 0 ? (
        <>
          <ContentStage />
          <div className="panel-bar hud">
            <div className="tool-group">
              <IconButton label="Добавить видео или фото" onClick={pickFiles}>
                <PlusIcon />
              </IconButton>
              <IconButton label="Отразить эталон" aria-pressed={mirror} onClick={toggleMirror}>
                <MirrorIcon />
              </IconButton>
              <IconButton label="Удалить из приложения" onClick={onDelete}>
                <TrashIcon />
              </IconButton>
              <span className="content-counter">
                {index + 1} / {count}
              </span>
            </div>
          </div>
        </>
      ) : (
        loaded && (
          <div className="content-empty">
            Добавьте видео или фото эталона с устройства
            <button type="button" className="text-btn" onClick={pickFiles}>
              Выбрать файлы
            </button>
            <a href="/probe.html">Проверка камеры</a>
          </div>
        )
      )}
      <input ref={inputRef} type="file" accept="video/*,image/*" multiple hidden onChange={onFiles} />
    </section>
  );
}
