export type MediaKind = 'video' | 'image';

/** Видео или фото: эталон с устройства, снятое в приложении или добавленное в «Записи» из галереи. */
export interface MediaItem {
  id: string;
  kind: MediaKind;
  name: string;
  blob: Blob;
  addedAt: number;
  /**
   * Файл добавлен с устройства, а не снят в приложении. Важно для «Записей»: снятое есть только здесь,
   * а у добавленного копия остаётся в галерее. У старых записей поля нет — они сняты в приложении.
   */
  imported?: boolean;
}
