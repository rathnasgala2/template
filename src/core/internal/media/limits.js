import { MediaPipelineError } from '../../errors.js';

/**
 * Media pipeline resource ceilings: a bounded decoding worker with fixed
 * decompression and resource limits, so a hostile or malformed image/font
 * can never trigger unbounded allocation or a decode bomb.
 *
 * The raster-specific numbers below are this renderer's closed binary-asset
 * bounds, shared between the theme passive-asset decoder profile and the
 * author-media pipeline (which has no separate numeric profile of its own):
 * non-animated raster, width/height each `1..8192`, at most 16,777,216
 * pixels, at most 67,108,864 decoded RGBA8 buffer bytes, source raster at
 * most 16,777,216 bytes, source font at most 4,194,304 bytes. Reusing the
 * same numbers for both call sites, rather than inventing an unrelated set,
 * is a deliberate choice: the physical decode-bomb risk (integer overflow,
 * unbounded allocation) is identical for both.
 *
 * A separate, smaller general per-source-file ceiling (10,485,760 bytes)
 * applies to *every* repository source file regardless of kind, and the
 * smaller declared per-file/package budget always wins. Applied here: the
 * effective per-image source-byte ceiling is `min(16,777,216, 10,485,760)`.
 * The font ceiling (4,194,304) is already smaller than the general cap, so
 * it is unaffected.
 *
 * `MAX_IMAGES_PER_PUBLICATION` and `MAX_TOTAL_MEDIA_BYTES_PER_PUBLICATION`
 * have no externally fixed per-publication *media-specific* aggregate to
 * conform to. These two values are this renderer's own conservative,
 * documented ceilings (well under this renderer's separate, unrelated
 * 50,000-file / 1,073,741,824-byte whole-artifact ceiling), so a publication
 * cannot exhaust the media pipeline's bounded decode budget by sheer
 * reference count even though each individual file is itself bounded.
 */

/** Maximum admitted raster width or height, in pixels, inclusive. */
export const MAX_IMAGE_DIMENSION = 8192;

/** Maximum admitted decoded pixel count (`width * height`). */
export const MAX_IMAGE_PIXELS = 16_777_216;

/** Maximum admitted decoded RGBA8 output buffer size, in bytes. */
export const MAX_DECODED_RGBA_BYTES = 67_108_864;

/**
 * Maximum admitted raster source byte length: the smaller of this
 * renderer's raster-specific cap (16,777,216) and its general
 * per-source-file cap (10,485,760).
 */
export const MAX_IMAGE_SOURCE_BYTES = 10_485_760;

/**
 * Maximum admitted font source byte length (this renderer's binary font
 * cap, already smaller than the general per-source-file cap).
 */
export const MAX_FONT_SOURCE_BYTES = 4_194_304;

/**
 * Maximum distinct image references a single publication's media pipeline
 * will process (implementer-chosen; see module documentation).
 */
export const MAX_IMAGES_PER_PUBLICATION = 2048;

/**
 * Maximum distinct font references a single publication's media pipeline
 * will process. `appearance.fontAssets` is already schema-bounded to at
 * most 8 entries (`resolvedFile[0..8]`); this constant documents that same
 * number as the media pipeline's own font-count ceiling rather than
 * re-deriving it from the schema at runtime.
 */
export const MAX_FONTS_PER_PUBLICATION = 8;

/**
 * Maximum aggregate decoded-plus-derivative byte budget the media pipeline
 * will spend for one publication (implementer-chosen; see module
 * documentation). Comfortably under this renderer's separate, unrelated
 * 1,073,741,824-byte whole-artifact ceiling, which this constant does not
 * replace or relax.
 */
export const MAX_TOTAL_MEDIA_BYTES_PER_PUBLICATION = 268_435_456;

/**
 * Assert that a decoded or declared raster's dimensions are within the
 * shared decode ceilings, shared by every format-specific decoder/probe in
 * this pipeline so the same check (and the same jscpd-flagged duplication
 * it would otherwise create across `png-codec.js`, `webp-probe.js` and
 * `avif-probe.js`) exists exactly once.
 *
 * @param {number} width declared or decoded width, in pixels
 * @param {number} height declared or decoded height, in pixels
 * @param {string} referencePath the source path, for error messages
 * @param {string} formatLabel a short format name for the error message
 *   (for example `"PNG"`, `"WebP"`, `"AVIF"`)
 * @returns {void}
 */
export function assertDimensionsWithinCeiling(
  width,
  height,
  referencePath,
  formatLabel,
) {
  if (
    width < 1 ||
    height < 1 ||
    width > MAX_IMAGE_DIMENSION ||
    height > MAX_IMAGE_DIMENSION ||
    width * height > MAX_IMAGE_PIXELS
  ) {
    throw new MediaPipelineError(
      'MEDIA_RESOURCE_EXCEEDED',
      `${formatLabel} dimensions ${width}x${height} exceed the admitted decode ceiling`,
      referencePath,
    );
  }
}

/**
 * Non-resetting wall-clock budget for one file's bounded decode, in
 * milliseconds. This renderer's closed binary-asset decoder uses a
 * ten-second non-resetting deadline, for the same documented reason as the
 * size/pixel ceilings above.
 */
export const DECODE_DEADLINE_MS = 10_000;

/** Deterministic responsive derivative widths, in pixels, ascending. */
export const DERIVATIVE_WIDTHS = Object.freeze([320, 640, 960, 1280, 1920]);

/** Fixed JPEG derivative encode quality (jpeg-js `quality` option, 0..100). */
export const DERIVATIVE_JPEG_QUALITY = 82;
