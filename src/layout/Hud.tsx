import { enterFullscreen, exitFullscreen } from '../platform/fullscreen';
import { useUi, type Layout, type Space } from '../store/ui';
import { IconButton } from '../ui/IconButton';
import { EyeIcon, EyeOffIcon, LayersIcon, SwapIcon } from '../ui/icons';

/**
 * «1 | 2» — сколько частей экрана показывать. Стоит в полосе каждой части: «1» оставляет на экране
 * только её, «2» возвращает обе. Скрытая часть не пересоздаётся (камера не перезапускается).
 */
export function SpacesSwitch({ space }: { space: Space }) {
  const solo = useUi((s) => s.solo);
  const setSolo = useUi((s) => s.setSolo);

  function show(next: Space | null) {
    if (next === solo) return;
    if (next) enterFullscreen();
    else exitFullscreen();
    setSolo(next);
  }

  return (
    <div className="seg" role="radiogroup" aria-label="Сколько частей показывать">
      <button
        type="button"
        role="radio"
        aria-checked={solo === space}
        aria-label="Одна часть — только эта"
        title="Только эта часть"
        onClick={() => show(space)}
      >
        1
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={solo === null}
        aria-label="Две части"
        title="Обе части"
        onClick={() => show(null)}
      >
        2
      </button>
    </div>
  );
}

/** Когда на экране одна часть: показать вместо неё другую. */
export function OtherSpaceButton({ to }: { to: Space }) {
  const setSolo = useUi((s) => s.setSolo);
  return (
    <IconButton label="Показать другую часть" onClick={() => setSolo(to)}>
      <SwapIcon className="rotate-landscape" />
    </IconButton>
  );
}

export function HideButton() {
  const toggleHud = useUi((s) => s.toggleHud);
  return (
    <IconButton label="Скрыть кнопки" onClick={toggleHud}>
      <EyeOffIcon />
    </IconButton>
  );
}

const LAYOUTS: { id: Layout; label: string }[] = [
  { id: 'split', label: 'Рядом' },
  { id: 'dual', label: '2 камеры' },
  { id: 'sync', label: 'Синхрон' },
  { id: 'review', label: 'Разбор' },
];

/**
 * Раскладка двух частей — системный выпадающий список: четыре варианта кнопками в полосу не помещаются.
 * «Рядом» — камера и эталон; «2 камеры» — во второй части камера с эталоном поверх; «Синхрон» — эталон
 * поверх камеры и тот же эталон рядом; «Разбор» — без камеры: одно видео в обеих частях, во второй слой.
 */
export function LayoutSwitch() {
  const layout = useUi((s) => s.layout);
  const setLayout = useUi((s) => s.setLayout);
  return (
    <label className="layout-select layout-switch">
      <select aria-label="Раскладка" value={layout} onChange={(e) => setLayout(e.target.value as Layout)}>
        {LAYOUTS.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Кнопки раскладки в полосе камеры: поменять местами (или показать другую часть), раскладка,
 * наложение, «1 | 2», скрыть.
 */
export function GlobalTools() {
  const cameraSolo = useUi((s) => s.solo === 'camera');
  // Кнопка наложения — там, где эталон ложится поверх этой камеры: одна камера на весь экран или «Синхрон».
  // В «Разборе» камеры нет — слоем управляет вторая часть.
  const overlayHere = useUi(
    (s) => s.layout !== 'review' && (s.solo === 'camera' || (s.solo === null && s.layout === 'sync')),
  );
  const overlay = useUi((s) => s.overlay);
  const toggleSwapped = useUi((s) => s.toggleSwapped);
  const toggleOverlay = useUi((s) => s.toggleOverlay);

  return (
    <div className="tool-group">
      {cameraSolo ? (
        <OtherSpaceButton to="content" />
      ) : (
        <IconButton label="Поменять местами части" onClick={toggleSwapped}>
          <SwapIcon className="rotate-landscape" />
        </IconButton>
      )}
      {!cameraSolo && <LayoutSwitch />}
      {overlayHere && (
        <IconButton label="Эталон поверх камеры" aria-pressed={overlay} onClick={toggleOverlay}>
          <LayersIcon />
        </IconButton>
      )}
      <SpacesSwitch space="camera" />
      <HideButton />
    </div>
  );
}

/** Единственная кнопка, видимая при скрытых кнопках, — вернуть их. */
export function HudRestore() {
  const toggleHud = useUi((s) => s.toggleHud);
  return (
    <IconButton className="hud-restore" label="Показать кнопки" onClick={toggleHud}>
      <EyeIcon />
    </IconButton>
  );
}
