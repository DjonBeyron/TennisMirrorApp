import { otherPack, selectLayerPack, useContent } from '../store/content';
import { useUi } from '../store/ui';
import { IconButton } from '../ui/IconButton';
import { ChevronLeftIcon, ChevronRightIcon, MirrorIcon } from '../ui/icons';
import { OpacitySlider } from './OpacitySlider';
import './overlay.css';

const PACK_NAMES = { local: 'Эталон', recordings: 'Записи' } as const;

/**
 * «Разбор»: управление слоем поверх видео — прозрачность, свои ‹ › по другому разделу и отдельное
 * зеркало слоя (видео под ним не отражается).
 */
export function LayerControls() {
  const pack = useContent((s) => s.pack);
  const { items, index } = useContent(selectLayerPack);
  const goLayer = useContent((s) => s.goLayer);
  const mirror = useUi((s) => s.mirrorLayer);
  const toggleMirror = useUi((s) => s.toggleMirrorLayer);
  const source = PACK_NAMES[otherPack(pack)];

  if (!items.length) {
    return (
      <div className="overlay-controls layer-note">Слой берётся из раздела «{source}» — там пока пусто</div>
    );
  }

  return (
    <div className="overlay-controls">
      <OpacitySlider />
      <div className="tool-group overlay-buttons">
        <IconButton label="Предыдущий слой" disabled={index === 0} onClick={() => goLayer(-1)}>
          <ChevronLeftIcon />
        </IconButton>
        <span className="layer-counter" title={`Слой из раздела «${source}»`}>
          {source} {index + 1}/{items.length}
        </span>
        <IconButton label="Следующий слой" disabled={index >= items.length - 1} onClick={() => goLayer(1)}>
          <ChevronRightIcon />
        </IconButton>
        <IconButton label="Отразить слой" aria-pressed={mirror} onClick={toggleMirror}>
          <MirrorIcon />
        </IconButton>
      </div>
    </div>
  );
}
