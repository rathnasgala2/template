/**
 * Bounded GIF container validation and declared-dimension extraction.
 *
 * Scope decision (documented, not silently assumed, and identical in spirit
 * to `webp-probe.js` and `avif-probe.js`): GIF is validated, never decoded
 * or re-encoded. This renderer carries no GIF encoder, so an animated GIF
 * cannot be resized without losing its animation; GIF is therefore admitted
 * as a *source* reference (recorded, digest-verified, dimension-bounded)
 * with no generated responsive derivative, and its original bytes pass
 * through unmodified as the sole asset entry. Because the bytes are never
 * rewritten, any comment or application extension the file carries is
 * served as authored.
 *
 * What this module enforces, fully: the exact `GIF87a`/`GIF89a` signature;
 * the logical screen's declared width/height, and every frame's declared
 * width/height, within the shared dimension/pixel ceilings; every colour
 * table, extension and image-data sub-block chain inside the buffer; a
 * known block introducer for every block; at least one image; and the
 * trailer as the file's exact last byte (no trailing payload, so a GIF
 * cannot smuggle a second file past this pipeline). Animation is admitted.
 *
 * The walk is bounded: at most 4,096 top-level blocks are visited (the same
 * container-structure bound `avif-probe.js` applies to boxes), and every
 * sub-block chain advances by at least one byte per step, so a malformed or
 * adversarial file cannot cause an out-of-bounds read or an unbounded walk.
 */

import { MediaPipelineError } from '../../errors.js';
import { assertDimensionsWithinCeiling } from './limits.js';

const MAX_BLOCKS_VISITED = 4096;
const HEADER_BYTES = 6;
const LOGICAL_SCREEN_DESCRIPTOR_BYTES = 7;
const IMAGE_DESCRIPTOR_BYTES = 9;
const EXTENSION_INTRODUCER = 0x21;
const IMAGE_SEPARATOR = 0x2c;
const TRAILER = 0x3b;
/** LZW codes are at most 12 bits wide, so the minimum code size is at most 11. */
const MAX_LZW_MINIMUM_CODE_SIZE = 11;

/**
 * @param {string} message what is malformed
 * @param {string} referencePath the source path, for error messages
 * @returns {MediaPipelineError} a `MEDIA_FORMAT_INVALID` rejection
 */
function malformed(message, referencePath) {
  return new MediaPipelineError('MEDIA_FORMAT_INVALID', message, referencePath);
}

/**
 * The byte length of a colour table whose packed field is `packed`, or `0`
 * when its presence flag (bit 7) is clear.
 *
 * @param {number} packed the descriptor's packed field
 * @returns {number} the table's byte length
 */
function colorTableBytes(packed) {
  return (packed & 0x80) === 0 ? 0 : 3 * 2 ** ((packed & 0x07) + 1);
}

/**
 * Skip one data sub-block chain (size byte, that many bytes, repeated until
 * a zero-size terminator), returning the offset just past the terminator.
 *
 * @param {Buffer} bytes the GIF bytes
 * @param {number} offset the offset of the chain's first size byte
 * @param {string} referencePath the source path, for error messages
 * @returns {number} the offset after the chain's terminator
 */
function skipSubBlocks(bytes, offset, referencePath) {
  let cursor = offset;
  for (;;) {
    if (cursor >= bytes.length) {
      throw malformed('GIF data sub-blocks run past the end', referencePath);
    }
    const size = bytes[cursor];
    cursor += 1;
    if (size === 0) return cursor;
    cursor += size;
  }
}

/**
 * Validate a GIF file and return its logical screen dimensions.
 *
 * @param {Buffer} bytes complete GIF file bytes
 * @param {string} referencePath the source path, for error messages
 * @returns {{width: number, height: number}} the declared dimensions
 */
export function probeGif(bytes, referencePath) {
  const signature = bytes.subarray(0, HEADER_BYTES).toString('ascii');
  if (
    bytes.length < HEADER_BYTES + LOGICAL_SCREEN_DESCRIPTOR_BYTES + 1 ||
    (signature !== 'GIF87a' && signature !== 'GIF89a')
  ) {
    throw malformed('missing GIF87a/GIF89a signature', referencePath);
  }
  const width = bytes.readUInt16LE(HEADER_BYTES);
  const height = bytes.readUInt16LE(HEADER_BYTES + 2);
  assertDimensionsWithinCeiling(width, height, referencePath, 'GIF');

  let cursor =
    HEADER_BYTES +
    LOGICAL_SCREEN_DESCRIPTOR_BYTES +
    colorTableBytes(bytes[HEADER_BYTES + 4]);
  let images = 0;
  for (let visited = 0; visited < MAX_BLOCKS_VISITED; visited += 1) {
    if (cursor >= bytes.length) {
      throw malformed('GIF ends without a trailer', referencePath);
    }
    const introducer = bytes[cursor];
    if (introducer === TRAILER) {
      if (images === 0) {
        throw malformed('GIF carries no image', referencePath);
      }
      if (cursor + 1 !== bytes.length) {
        throw malformed(
          'GIF has bytes after its trailer; no trailing payload is admitted',
          referencePath,
        );
      }
      return { width, height };
    }
    if (introducer === EXTENSION_INTRODUCER) {
      // Introducer, label, then the extension's own data sub-blocks.
      cursor = skipSubBlocks(bytes, cursor + 2, referencePath);
    } else if (introducer === IMAGE_SEPARATOR) {
      if (cursor + IMAGE_DESCRIPTOR_BYTES + 1 > bytes.length) {
        throw malformed('GIF image descriptor is truncated', referencePath);
      }
      assertDimensionsWithinCeiling(
        bytes.readUInt16LE(cursor + 5),
        bytes.readUInt16LE(cursor + 7),
        referencePath,
        'GIF frame',
      );
      cursor += IMAGE_DESCRIPTOR_BYTES + 1 + colorTableBytes(bytes[cursor + 9]);
      const lzwMinimumCodeSize = bytes[cursor];
      if (
        lzwMinimumCodeSize === undefined ||
        lzwMinimumCodeSize < 1 ||
        lzwMinimumCodeSize > MAX_LZW_MINIMUM_CODE_SIZE
      ) {
        throw malformed(
          'GIF image data has no valid LZW minimum code size',
          referencePath,
        );
      }
      cursor = skipSubBlocks(bytes, cursor + 1, referencePath);
      images += 1;
    } else {
      throw malformed(
        `unknown GIF block introducer 0x${introducer.toString(16)}`,
        referencePath,
      );
    }
  }
  throw malformed(
    `GIF has more than ${MAX_BLOCKS_VISITED} blocks`,
    referencePath,
  );
}
