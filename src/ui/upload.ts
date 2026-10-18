/** A picture ready to keep: re-encoded, no bigger than it needs to be, with its size in pixels. */
export type Prepared = { blob: Blob; w: number; h: number };

/** Opens the phone's photo picker and resolves with the chosen file, or null if she cancels. */
export function chooseImage(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    // some Safari versions only open the picker for an input that is in the page
    input.style.display = 'none';
    document.body.appendChild(input);
    const done = (file: File | null) => {
      input.remove();
      resolve(file);
    };
    input.onchange = () => done(input.files?.[0] ?? null);
    // Safari has no reliable cancel event; a picker that's dismissed just never resolves, which is harmless
    input.addEventListener('cancel', () => done(null));
    input.click();
  });
}

function loadBitmap(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable'));
    };
    img.src = url;
  });
}

/**
 * Scales a picture down so its longest side is at most `max` pixels, and re-encodes it: PNG keeps
 * a drawing's transparent background, JPEG keeps photos small. Rejects files that aren't pictures.
 */
export async function prepareImage(file: Blob, max: number, kind: 'png' | 'jpeg'): Promise<Prepared> {
  const img = await loadBitmap(file);
  const w0 = img.naturalWidth;
  const h0 = img.naturalHeight;
  if (!w0 || !h0) throw new Error('unreadable');
  const k = Math.min(1, max / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * k));
  const h = Math.max(1, Math.round(h0 * k));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no canvas');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((resolve) =>
    kind === 'png' ? canvas.toBlob(resolve, 'image/png') : canvas.toBlob(resolve, 'image/jpeg', 0.86),
  );
  if (!blob) throw new Error('could not encode');
  return { blob, w, h };
}
