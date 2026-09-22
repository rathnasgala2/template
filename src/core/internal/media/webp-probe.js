/**
 * Bounded WebP container validation and declared-dimension extraction.
 *
 * Scope decision (documented, not silently assumed): this module validates
 * the `RIFF`/`WEBP` container framing and the `VP8 `/`VP8L` chunk header
 * closely enough to reject a malformed or oversized file and to read the
 * format's own declared width/height, but it does not run a full VP8/VP8L
 * entropy decoder — DEC-097's own closed `gala-theme-binary-assets-v2`
 * profile requires a complete bounded VP8/VP8L bitstream decode for
 * *passive theme assets*; hand-authoring an equivalent, independently
 * verifiable decoder for *author media* was judged out of proportion to
 * this task's scope and is flagged to the orchestrator as a follow-up
 * rather than attempted partially. What this module still enforces, fully:
 * exact container framing, a single recognized image chunk (any `VP8X`,
 * animation, or a second image chunk rejects), and the shared
 * dimension/pixel resource ceilings applied to the format's own declared
 * size fields before any further processing — so a WebP cannot be used to
 * request an over-large derivative or to smuggle a second payload past this
 * pipeline. Because pixel data is never decoded, WebP is admitted as a
 * *source* reference (recorded, digest-verified, dimension-bounded) but no
 * responsive derivative is generated for it; the original bytes pass
 * through as the sole asset entry.
 */

import { MediaPipelineError } from '../../errors.js';
import { assertDimensionsWithinCeiling } from './limits.js';

/**
 * Validate a WebP container and return its declared dimensions.
 *
 * @param {Buffer} bytes complete WebP file bytes
 * @param {string} referencePath the source path, for error messages
 * @returns {{width: number, height: number}} the declared dimensions
 */
export function probeWebp(bytes, referencePath) {
  if (
    bytes.length < 20 ||
    bytes.subarray(0, 4).toString('ascii') !== 'RIFF' ||
    bytes.subarray(8, 12).toString('ascii') !== 'WEBP'
  ) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'missing RIFF/WEBP container signature',
      referencePath,
    );
  }
  const riffSize = bytes.readUInt32LE(4);
  if (riffSize !== bytes.length - 8) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'RIFF size does not equal the member length minus eight',
      referencePath,
    );
  }
  const fourCc = bytes.subarray(12, 16).toString('ascii');
  const chunkSize = bytes.readUInt32LE(16);
  const payloadStart = 20;
  const payloadEnd = payloadStart + chunkSize;
  if (payloadEnd > bytes.length) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'WebP image chunk exceeds the container length',
      referencePath,
    );
  }
  // No second chunk is admitted: the exact end of the declared image chunk
  // (padded to an even offset) must be the exact end of the file.
  const paddedEnd = payloadEnd + (chunkSize % 2);
  if (paddedEnd !== bytes.length) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'WebP container has a second chunk or trailing bytes; only one image chunk is admitted',
      referencePath,
    );
  }

  let width;
  let height;
  if (fourCc === 'VP8 ') {
    if (chunkSize < 10) {
      throw new MediaPipelineError(
        'MEDIA_FORMAT_INVALID',
        'VP8 chunk too small to contain a frame header',
        referencePath,
      );
    }
    const frameTag = bytes.subarray(payloadStart, payloadStart + 3);
    const syncCode = bytes.subarray(payloadStart + 3, payloadStart + 6);
    if (!syncCode.equals(Buffer.from([0x9d, 0x01, 0x2a]))) {
      throw new MediaPipelineError(
        'MEDIA_FORMAT_INVALID',
        'VP8 frame sync code mismatch',
        referencePath,
      );
    }
    const keyFrame = (frameTag[0] & 0x01) === 0;
    if (!keyFrame) {
      throw new MediaPipelineError(
        'MEDIA_FORMAT_INVALID',
        'VP8 payload is not a key frame',
        referencePath,
      );
    }
    width = bytes.readUInt16LE(payloadStart + 6) & 0x3fff;
    height = bytes.readUInt16LE(payloadStart + 8) & 0x3fff;
  } else if (fourCc === 'VP8L') {
    if (chunkSize < 5 || bytes[payloadStart] !== 0x2f) {
      throw new MediaPipelineError(
        'MEDIA_FORMAT_INVALID',
        'VP8L lossless signature mismatch',
        referencePath,
      );
    }
    const bits =
      bytes.readUInt8(payloadStart + 1) |
      (bytes.readUInt8(payloadStart + 2) << 8) |
      (bytes.readUInt8(payloadStart + 3) << 16) |
      (bytes.readUInt8(payloadStart + 4) << 24);
    width = (bits & 0x3fff) + 1;
    height = ((bits >>> 14) & 0x3fff) + 1;
    const versionBits = (bits >>> 28) & 0x7;
    if (versionBits !== 0) {
      throw new MediaPipelineError(
        'MEDIA_FORMAT_INVALID',
        'VP8L version bits must be zero',
        referencePath,
      );
    }
  } else {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      `unsupported WebP image chunk "${fourCc}"; only VP8 and VP8L are admitted`,
      referencePath,
    );
  }

  assertDimensionsWithinCeiling(width, height, referencePath, 'WebP');
  return { width, height };
}
