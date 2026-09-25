import type { MediaItem } from '../packs/types';

/**
 * Отдаёт файл наружу: на телефоне — системное меню «Поделиться» (на iPhone там «Сохранить видео»),
 * где его нет — обычное скачивание. Вызывать прямо из обработчика нажатия: share требует жеста пользователя.
 */
export async function shareOrDownload(item: MediaItem): Promise<void> {
  // Тип без параметров: по «video/mp4;codecs=avc1» iOS может не узнать видео и не предложить «Сохранить видео».
  const file = new File([item.blob], item.name, { type: item.blob.type.split(';')[0] });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (e) {
      // Закрыли меню — ничего не делаем; другая ошибка — пробуем скачать.
      if (e instanceof DOMException && e.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
