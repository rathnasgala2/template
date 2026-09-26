/**
 * Deterministic RGBA8 box-filter downscale for responsive derivative
 * generation.
 *
 * IEEE 754 double-precision arithmetic is fully deterministic — the same
 * inputs always produce the same bit pattern on any conforming engine — so
 * this box filter (unlike a lossy codec's own pixel decode, which is
 * implementation-dependent) is safe to use directly for the
 * two-clean-build byte-equality requirement: the same source raster and the
 * same target width always produce the same resized raster, and therefore,
 * fed through this pipeline's own deterministic encoders, the same
 * derivative bytes.
 */

import { MediaPipelineError } from '../../errors.js';

/**
 * Downscale an RGBA8 raster to exactly `targetWidth` pixels wide, preserving
 * aspect ratio (target height is `round(height * targetWidth / width)`,
 * floored to at least one pixel). Never upscales: the caller is responsible
 * for only requesting widths at or below the source width.
 *
 * @param {{width: number, height: number, rgba: Buffer}} raster the source
 *   raster
 * @param {number} targetWidth the desired output width, in pixels
 * @param {string} referencePath the source path, for error messages
 * @returns {{width: number, height: number, rgba: Buffer}} the resized
 *   raster
 */
export function resizeRaster(
  { width, height, rgba },
  targetWidth,
  referencePath,
) {
  if (targetWidth < 1 || targetWidth > width) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      `derivative width ${targetWidth} is not between 1 and the source width ${width}`,
      referencePath,
    );
  }
  if (targetWidth === width) {
    return { width, height, rgba: Buffer.from(rgba) };
  }
  const targetHeight = Math.max(1, Math.round((height * targetWidth) / width));
  const out = Buffer.alloc(targetWidth * targetHeight * 4);

  for (let oy = 0; oy < targetHeight; oy += 1) {
    const y0 = (oy * height) / targetHeight;
    const y1 = ((oy + 1) * height) / targetHeight;
    const sy0 = Math.floor(y0);
    const sy1 = Math.max(sy0 + 1, Math.ceil(y1));
    for (let ox = 0; ox < targetWidth; ox += 1) {
      const x0 = (ox * width) / targetWidth;
      const x1 = ((ox + 1) * width) / targetWidth;
      const sx0 = Math.floor(x0);
      const sx1 = Math.max(sx0 + 1, Math.ceil(x1));

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let count = 0;
      for (let sy = sy0; sy < sy1 && sy < height; sy += 1) {
        for (let sx = sx0; sx < sx1 && sx < width; sx += 1) {
          const i = (sy * width + sx) * 4;
          r += rgba[i];
          g += rgba[i + 1];
          b += rgba[i + 2];
          a += rgba[i + 3];
          count += 1;
        }
      }
      const outIndex = (oy * targetWidth + ox) * 4;
      out[outIndex] = Math.round(r / count);
      out[outIndex + 1] = Math.round(g / count);
      out[outIndex + 2] = Math.round(b / count);
      out[outIndex + 3] = Math.round(a / count);
    }
  }

  return { width: targetWidth, height: targetHeight, rgba: out };
}

/**
 * Rotate/flip an RGBA8 raster to normalize an EXIF orientation value to `1`
 * (identity).
 *
 * @param {{width: number, height: number, rgba: Buffer}} raster the source
 *   raster
 * @param {number} orientation an EXIF orientation value, `1..8`
 * @returns {{width: number, height: number, rgba: Buffer}} the
 *   orientation-normalized raster
 */
export function applyExifOrientation({ width, height, rgba }, orientation) {
  if (orientation === 1) return { width, height, rgba };

  const swapDimensions = orientation >= 5;
  const outWidth = swapDimensions ? height : width;
  const outHeight = swapDimensions ? width : height;
  const out = Buffer.alloc(outWidth * outHeight * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [dx, dy] = mapOrientedCoordinate(x, y, width, height, orientation);
      const srcIndex = (y * width + x) * 4;
      const dstIndex = (dy * outWidth + dx) * 4;
      out[dstIndex] = rgba[srcIndex];
      out[dstIndex + 1] = rgba[srcIndex + 1];
      out[dstIndex + 2] = rgba[srcIndex + 2];
      out[dstIndex + 3] = rgba[srcIndex + 3];
    }
  }

  return { width: outWidth, height: outHeight, rgba: out };
}

/**
 * Map one source pixel coordinate through an EXIF orientation transform.
 *
 * @param {number} x source x
 * @param {number} y source y
 * @param {number} width source width
 * @param {number} height source height
 * @param {number} orientation an EXIF orientation value, `2..8`
 * @returns {[number, number]} the destination `[x, y]` coordinate
 */
function mapOrientedCoordinate(x, y, width, height, orientation) {
  switch (orientation) {
    case 2:
      return [width - 1 - x, y]; // flip horizontal
    case 3:
      return [width - 1 - x, height - 1 - y]; // rotate 180
    case 4:
      return [x, height - 1 - y]; // flip vertical
    case 5:
      return [y, x]; // transpose
    case 6:
      return [height - 1 - y, x]; // rotate 90 CW
    case 7:
      return [height - 1 - y, width - 1 - x]; // transverse
    case 8:
      return [y, width - 1 - x]; // rotate 270 CW
    default:
      return [x, y];
  }
}
