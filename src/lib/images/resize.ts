"use client";

/**
 * Downscales an image file entirely in the browser and returns a JPEG data URL.
 * Progress photos are stored directly on the measurement row, so we keep them
 * modest in size (long edge capped, re-encoded as JPEG) to stay well within
 * row/localStorage limits while remaining clear enough to compare over time.
 */
export async function fileToCompressedDataUrl(
  file: File,
  { maxEdge = 1280, quality = 0.8 }: { maxEdge?: number; quality?: number } = {}
): Promise<string> {
  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);

  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl; // fall back to the original if canvas is unavailable
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image decode failed"));
    img.src = src;
  });
}
