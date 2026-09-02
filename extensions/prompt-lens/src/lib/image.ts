import type { ImageSource, PendingImage } from '../shared/types';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_EDGE = 1600;
const THUMB_EDGE = 320;

function canvasToDataUrl(
  source: CanvasImageSource,
  width: number,
  height: number,
  maxEdge: number,
  mimeType: string,
  quality: number,
) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d', { alpha: mimeType === 'image/png' });
  if (!context) throw new Error('当前浏览器无法处理这张图片。');
  context.drawImage(source, 0, 0, targetWidth, targetHeight);
  return canvas.toDataURL(mimeType, quality);
}

export async function prepareLocalImage(
  file: File,
  source: Exclude<ImageSource, 'web'>,
): Promise<PendingImage> {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    throw new Error('请选择 JPEG、PNG、WebP 或 GIF 图片。');
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('图片不能超过 10 MB。');
  }

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const src = canvasToDataUrl(
    bitmap,
    width,
    height,
    MAX_EDGE,
    outputType,
    0.88,
  );
  const thumbnailSrc = canvasToDataUrl(
    bitmap,
    width,
    height,
    THUMB_EDGE,
    'image/jpeg',
    0.72,
  );
  bitmap.close();

  return {
    id: crypto.randomUUID(),
    src,
    thumbnailSrc,
    source,
    createdAt: Date.now(),
    fileName: file.name,
    width,
    height,
  };
}

export function pickImageFromClipboard(event: ClipboardEvent) {
  return Array.from(event.clipboardData?.files ?? []).find((file) =>
    file.type.startsWith('image/'),
  );
}
