import type { MediaItem } from './types';

// Ссылки blob: на файлы. Создаются один раз на элемент и освобождаются только при его удалении,
// поэтому их можно спокойно брать во время рендера.
const urls = new Map<string, string>();

export function mediaUrl(item: MediaItem): string {
  let url = urls.get(item.id);
  if (!url) {
    url = URL.createObjectURL(item.blob);
    urls.set(item.id, url);
  }
  return url;
}

export function releaseMediaUrl(id: string) {
  const url = urls.get(id);
  if (!url) return;
  URL.revokeObjectURL(url);
  urls.delete(id);
}
