import { selectCount, selectIndex, useContent } from '../store/content';
import { IconButton } from '../ui/IconButton';
import { ChevronLeftIcon, ChevronRightIcon } from '../ui/icons';

/**
 * Маленькие ‹ › у краёв второй части: листать эталоны и записи. Работают во всех режимах, в том числе
 * при наложении, где свайп занят выравниванием. На первом и последнем элементе лишняя кнопка скрыта.
 */
export function ContentNav() {
  const index = useContent(selectIndex);
  const count = useContent(selectCount);
  const go = useContent((s) => s.go);

  return (
    <>
      {index > 0 && (
        <IconButton className="content-nav content-nav-prev hud" label="Предыдущий" onClick={() => go(-1)}>
          <ChevronLeftIcon />
        </IconButton>
      )}
      {index < count - 1 && (
        <IconButton className="content-nav content-nav-next hud" label="Следующий" onClick={() => go(1)}>
          <ChevronRightIcon />
        </IconButton>
      )}
    </>
  );
}
