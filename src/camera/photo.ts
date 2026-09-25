/**
 * Снимок текущего кадра камеры в JPEG. Кадр берётся без зеркала превью — как в записи видео;
 * нативный зум в нём уже есть.
 */
export async function capturePhoto(video: HTMLVideoElement): Promise<Blob | null> {
  const { videoWidth: width, videoHeight: height } = video;
  if (!width || !height) return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.drawImage(video, 0, 0, width, height);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
}
