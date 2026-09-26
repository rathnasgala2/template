/**
 * Bounded AVIF (ISOBMFF) container validation and declared-dimension
 * extraction.
 *
 * Scope decision (documented, not silently assumed, and identical in spirit
 * to `webp-probe.js`): this module walks the ISOBMFF box structure closely
 * enough to confirm an `ftyp` box with major brand `avif`, locate the
 * `meta` box, and read the primary item's `ispe` (image spatial extents)
 * property for declared width/height, but it does not run a full AV1
 * bitstream decode. This renderer's closed passive-theme-asset decoder
 * requires a complete single-frame AV1 decode for *passive theme assets*;
 * an equivalent from-scratch AV1 decoder for *author media* is out of
 * proportion to this module's scope, flagged to the orchestrator as a
 * follow-up. AVIF is therefore admitted as a *source* reference
 * (recorded, digest-verified, dimension-bounded) with no generated
 * responsive derivative; its original bytes pass through as the sole asset
 * entry, exactly like WebP.
 *
 * The box walk is bounded: at most 4,096 boxes are visited (matching this
 * renderer's own container-structure isolation bound for the binary
 * decoder family) and every box's declared size is checked against the
 * remaining buffer length before it is used to slice, so a malformed or
 * adversarial box table cannot cause an out-of-bounds read or an unbounded
 * walk.
 */

import { MediaPipelineError } from '../../errors.js';
import { assertDimensionsWithinCeiling } from './limits.js';

const MAX_BOXES_VISITED = 4096;

/**
 * Walk one ISOBMFF box list, bounded, yielding `{type, start, end}` for each
 * top-level box.
 *
 * @param {Buffer} bytes the buffer to walk
 * @param {number} start the offset to begin walking at
 * @param {number} end the exclusive offset to stop walking at
 * @param {{count: number}} budget a shared box-count budget, mutated
 * @param {string} referencePath the source path, for error messages
 * @returns {{type: string, start: number, end: number}[]} the boxes found
 */
function walkBoxes(bytes, start, end, budget, referencePath) {
  /** @type {{type: string, start: number, end: number}[]} */
  const boxes = [];
  let offset = start;
  while (offset < end) {
    if (offset + 8 > end) {
      throw new MediaPipelineError(
        'MEDIA_FORMAT_INVALID',
        'truncated ISOBMFF box header',
        referencePath,
      );
    }
    budget.count += 1;
    if (budget.count > MAX_BOXES_VISITED) {
      throw new MediaPipelineError(
        'MEDIA_RESOURCE_EXCEEDED',
        'AVIF container exceeds the admitted box-count ceiling',
        referencePath,
      );
    }
    const size = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii');
    if (size < 8 || offset + size > end) {
      throw new MediaPipelineError(
        'MEDIA_FORMAT_INVALID',
        `ISOBMFF box "${type}" has an invalid or overflowing size`,
        referencePath,
      );
    }
    boxes.push({ type, start: offset, end: offset + size });
    offset += size;
  }
  return boxes;
}

/**
 * Validate an AVIF container and return its declared primary-item
 * dimensions.
 *
 * @param {Buffer} bytes complete AVIF file bytes
 * @param {string} referencePath the source path, for error messages
 * @returns {{width: number, height: number}} the declared dimensions
 */
export function probeAvif(bytes, referencePath) {
  const budget = { count: 0 };
  const topLevel = walkBoxes(bytes, 0, bytes.length, budget, referencePath);
  const ftyp = topLevel.find((box) => box.type === 'ftyp');
  if (!ftyp) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'missing ftyp box',
      referencePath,
    );
  }
  const majorBrand = bytes
    .subarray(ftyp.start + 8, ftyp.start + 12)
    .toString('ascii');
  if (majorBrand !== 'avif') {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      `unsupported ftyp major brand "${majorBrand}"; only "avif" is admitted`,
      referencePath,
    );
  }

  const meta = topLevel.find((box) => box.type === 'meta');
  if (!meta) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'missing meta box',
      referencePath,
    );
  }
  // `meta` is a full box: 4 bytes of version/flags precede its child boxes.
  const metaChildren = walkBoxes(
    bytes,
    meta.start + 12,
    meta.end,
    budget,
    referencePath,
  );
  const iprp = metaChildren.find((box) => box.type === 'iprp');
  if (!iprp) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'missing iprp box',
      referencePath,
    );
  }
  const iprpChildren = walkBoxes(
    bytes,
    iprp.start + 8,
    iprp.end,
    budget,
    referencePath,
  );
  const ipco = iprpChildren.find((box) => box.type === 'ipco');
  if (!ipco) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'missing ipco box',
      referencePath,
    );
  }
  const ipcoChildren = walkBoxes(
    bytes,
    ipco.start + 8,
    ipco.end,
    budget,
    referencePath,
  );
  const ispe = ipcoChildren.find((box) => box.type === 'ispe');
  if (!ispe || ispe.end - ispe.start < 20) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'missing or malformed ispe property',
      referencePath,
    );
  }
  // ispe is a full box: 4 bytes header + 4 bytes version/flags, then two
  // 32-bit big-endian dimensions.
  const width = bytes.readUInt32BE(ispe.start + 12);
  const height = bytes.readUInt32BE(ispe.start + 16);

  assertDimensionsWithinCeiling(width, height, referencePath, 'AVIF');
  return { width, height };
}
