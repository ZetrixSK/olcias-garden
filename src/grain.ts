/** How strongly the grain shows. */
const STRENGTH = 0.22;

/**
 * A small tile of paper grain, generated once so no image asset is needed. Each speck is a touch of
 * shade, as see-through as the grain is dark: laid plainly over the garden it darkens it exactly as
 * multiplying by the grain would, without asking the phone to blend the whole screen on every frame.
 */
export function grainDataUrl(size = 160): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    // the paper's brightness here, 200-255 of 255 (and a hair warmer), as an amount of shade
    const v = 200 + Math.random() * 55;
    const shade = 1 - (v * 0.973) / 255;
    img.data[i] = 34;
    img.data[i + 1] = 22;
    img.data[i + 2] = 12;
    img.data[i + 3] = Math.round(shade * STRENGTH * 255);
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
}
