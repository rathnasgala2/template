/**
 * Bounded PNG decode and deterministic PNG encode.
 *
 * Decoding is scoped, on purpose, to the common 8-bit-depth author-photo
 * case: color types 0 (grayscale), 2 (truecolor), 3 (palette), 4
 * (grayscale+alpha) and 6 (truecolor+alpha), bit depth 8 only, no
 * interlacing. Any other bit depth, interlace method, or PNG structure this
 * module does not recognize is a `MEDIA_FORMAT_INVALID` rejection — never a
 * best-effort guess — matching the fail-closed posture required throughout
 * this pipeline. This is a deliberately smaller surface than this
 * renderer's own closed passive-theme-asset PNG grammar (which the theme
 * packages use for passive presentation assets); author media only needs a
 * decode path sufficient to bound, re-derive
 * orientation-free pixels from, and re-encode ordinary photographic/graphic
 * uploads.
 *
 * The decompression-bomb defense runs *before* any large allocation: `IHDR`
 * is parsed first and its declared width/height/pixel-count are checked
 * against the shared media ceilings; only then is a byte ceiling computed
 * from those *declared* dimensions and enforced, incrementally, while
 * inflating `IDAT` — so a file that lies about its own decompressed size
 * (small `IHDR`, huge compressed payload) is aborted mid-stream rather than
 * fully materialized first.
 */

import { deflateSync, inflateSync } from 'node:zlib';

import { MediaPipelineError } from '../../errors.js';
import { assertDimensionsWithinCeiling } from './limits.js';

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

/** @type {Readonly<Record<number, number>>} color type -> channel count */
const CHANNELS_BY_COLOR_TYPE = Object.freeze({
  0: 1,
  2: 3,
  3: 1,
  4: 2,
  6: 4,
});

/**
 * Read every PNG chunk in `bytes` after the signature, in file order.
 *
 * @param {Buffer} bytes complete PNG file bytes, signature included
 * @param {string} referencePath the source path, for error messages
 * @returns {{type: string, data: Buffer}[]} chunks in file order
 */
function readChunks(bytes, referencePath) {
  /** @type {{type: string, data: Buffer}[]} */
  const chunks = [];
  let offset = 8;
  while (offset < bytes.length) {
    if (offset + 8 > bytes.length) {
      throw new MediaPipelineError(
        'MEDIA_FORMAT_INVALID',
        'truncated PNG chunk header',
        referencePath,
      );
    }
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii');
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > bytes.length) {
      throw new MediaPipelineError(
        'MEDIA_FORMAT_INVALID',
        'truncated PNG chunk data',
        referencePath,
      );
    }
    chunks.push({ type, data: bytes.subarray(dataStart, dataEnd) });
    offset = dataEnd + 4;
    if (type === 'IEND') break;
  }
  if (offset !== bytes.length) {
    // Defends against a polyglot: bytes appended after the PNG's own IEND
    // (for example a second file's magic bytes) are never silently ignored.
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'trailing bytes after IEND',
      referencePath,
    );
  }
  return chunks;
}

/**
 * Bounded-decode one PNG file's bytes into a raw RGBA8 raster.
 *
 * @param {Buffer} bytes complete PNG file bytes
 * @param {string} referencePath the source path, for error messages
 * @returns {{width: number, height: number, rgba: Buffer}} the decoded
 *   raster
 */
export function decodePng(bytes, referencePath) {
  if (bytes.length < 8 || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'missing PNG signature',
      referencePath,
    );
  }
  const chunks = readChunks(bytes, referencePath);
  const ihdr = chunks[0];
  if (!ihdr || ihdr.type !== 'IHDR' || ihdr.data.length !== 13) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'missing or malformed IHDR',
      referencePath,
    );
  }
  const width = ihdr.data.readUInt32BE(0);
  const height = ihdr.data.readUInt32BE(4);
  const bitDepth = ihdr.data.readUInt8(8);
  const colorType = ihdr.data.readUInt8(9);
  const compressionMethod = ihdr.data.readUInt8(10);
  const filterMethod = ihdr.data.readUInt8(11);
  const interlaceMethod = ihdr.data.readUInt8(12);

  assertDimensionsWithinCeiling(width, height, referencePath, 'PNG');
  if (
    bitDepth !== 8 ||
    !(colorType in CHANNELS_BY_COLOR_TYPE) ||
    compressionMethod !== 0 ||
    filterMethod !== 0 ||
    interlaceMethod !== 0
  ) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      `unsupported PNG IHDR (bitDepth=${bitDepth}, colorType=${colorType}, interlace=${interlaceMethod})`,
      referencePath,
    );
  }

  const channels = CHANNELS_BY_COLOR_TYPE[colorType];
  const bytesPerPixel = channels;
  const rowBytes = width * bytesPerPixel;
  const expectedRawBytes = height * (1 + rowBytes);

  /** @type {Buffer | undefined} */
  let palette;
  /** @type {Buffer | undefined} */
  let paletteAlpha;
  const idatParts = [];
  for (const chunk of chunks) {
    if (chunk.type === 'PLTE') palette = chunk.data;
    else if (chunk.type === 'tRNS') paletteAlpha = chunk.data;
    else if (chunk.type === 'IDAT') idatParts.push(chunk.data);
  }
  if (colorType === 3 && !palette) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'palette color type without PLTE chunk',
      referencePath,
    );
  }
  if (idatParts.length === 0) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'no IDAT chunk present',
      referencePath,
    );
  }

  const compressed = Buffer.concat(idatParts);
  let raw;
  try {
    // `maxOutputLength` bounds allocation to the exact size this IHDR can
    // ever legitimately decompress to; a file whose compressed stream would
    // produce more than that is a decompression-bomb attempt and is
    // rejected before the extra bytes are ever materialized.
    raw = inflateSync(compressed, { maxOutputLength: expectedRawBytes });
  } catch {
    throw new MediaPipelineError(
      'MEDIA_RESOURCE_EXCEEDED',
      'PNG IDAT stream exceeds its declared decompressed size or is malformed',
      referencePath,
    );
  }
  if (raw.length !== expectedRawBytes) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'PNG IDAT decompressed to an unexpected byte count',
      referencePath,
    );
  }

  const rgba = Buffer.alloc(width * height * 4);
  let previousRow = Buffer.alloc(rowBytes);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (1 + rowBytes);
    const filterType = raw[rowStart];
    const rowData = raw.subarray(rowStart + 1, rowStart + 1 + rowBytes);
    const currentRow = Buffer.alloc(rowBytes);
    unfilterRow(
      filterType,
      rowData,
      previousRow,
      currentRow,
      bytesPerPixel,
      referencePath,
    );
    writeRowToRgba(
      rgba,
      y,
      width,
      currentRow,
      colorType,
      palette,
      paletteAlpha,
    );
    previousRow = currentRow;
  }

  return { width, height, rgba };
}

/**
 * Reverse one PNG scanline filter in place into `out`.
 *
 * @param {number} filterType the row's leading filter-type byte
 * @param {Buffer} row the filtered row bytes (no filter-type byte)
 * @param {Buffer} previousRow the previous row's already-unfiltered bytes
 * @param {Buffer} out destination buffer for the unfiltered row
 * @param {number} bpp bytes per whole pixel
 * @param {string} referencePath the source path, for error messages
 * @returns {void}
 */
function unfilterRow(filterType, row, previousRow, out, bpp, referencePath) {
  for (let i = 0; i < row.length; i += 1) {
    const a = i >= bpp ? out[i - bpp] : 0;
    const b = previousRow[i];
    const c = i >= bpp ? previousRow[i - bpp] : 0;
    let value = row[i];
    if (filterType === 0) {
      // none
    } else if (filterType === 1) {
      value = (value + a) & 0xff;
    } else if (filterType === 2) {
      value = (value + b) & 0xff;
    } else if (filterType === 3) {
      value = (value + Math.floor((a + b) / 2)) & 0xff;
    } else if (filterType === 4) {
      value = (value + paeth(a, b, c)) & 0xff;
    } else {
      throw new MediaPipelineError(
        'MEDIA_FORMAT_INVALID',
        `unsupported PNG scanline filter type ${filterType}`,
        referencePath,
      );
    }
    out[i] = value;
  }
}

/**
 * The PNG Paeth predictor.
 *
 * @param {number} a left byte
 * @param {number} b above byte
 * @param {number} c upper-left byte
 * @returns {number} the predicted byte value
 */
function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/**
 * Expand one unfiltered PNG row into the destination RGBA8 raster.
 *
 * @param {Buffer} rgba the full-image RGBA8 destination buffer
 * @param {number} y the row index
 * @param {number} width the image width in pixels
 * @param {Buffer} row the row's unfiltered channel bytes
 * @param {number} colorType the PNG color type
 * @param {Buffer | undefined} palette `PLTE` chunk bytes, for color type 3
 * @param {Buffer | undefined} paletteAlpha `tRNS` chunk bytes, for color
 *   type 3
 * @returns {void}
 */
function writeRowToRgba(rgba, y, width, row, colorType, palette, paletteAlpha) {
  const rowOffset = y * width * 4;
  for (let x = 0; x < width; x += 1) {
    const out = rowOffset + x * 4;
    if (colorType === 0) {
      const gray = row[x];
      rgba[out] = gray;
      rgba[out + 1] = gray;
      rgba[out + 2] = gray;
      rgba[out + 3] = 255;
    } else if (colorType === 2) {
      const i = x * 3;
      rgba[out] = row[i];
      rgba[out + 1] = row[i + 1];
      rgba[out + 2] = row[i + 2];
      rgba[out + 3] = 255;
    } else if (colorType === 3) {
      const index = row[x];
      const p = index * 3;
      rgba[out] = palette?.[p] ?? 0;
      rgba[out + 1] = palette?.[p + 1] ?? 0;
      rgba[out + 2] = palette?.[p + 2] ?? 0;
      rgba[out + 3] = paletteAlpha?.[index] ?? 255;
    } else if (colorType === 4) {
      const i = x * 2;
      const gray = row[i];
      rgba[out] = gray;
      rgba[out + 1] = gray;
      rgba[out + 2] = gray;
      rgba[out + 3] = row[i + 1];
    } else {
      const i = x * 4;
      rgba[out] = row[i];
      rgba[out + 1] = row[i + 1];
      rgba[out + 2] = row[i + 2];
      rgba[out + 3] = row[i + 3];
    }
  }
}

/**
 * @param {string} type four-character chunk type
 * @param {Buffer} data chunk payload bytes
 * @returns {Buffer} the complete length-prefixed, CRC-suffixed chunk
 */
function encodeChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput) >>> 0, 0);
  return Buffer.concat([length, typeBytes, data, crc]);
}

/** @type {number[] | undefined} */
let crcTable;

/**
 * @param {Buffer} buffer bytes to checksum
 * @returns {number} the CRC-32 (ISO 3309 / PNG) checksum
 */
function crc32(buffer) {
  if (!crcTable) {
    crcTable = [];
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = crcTable[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Deterministically encode an RGBA8 raster as a minimal truecolor+alpha PNG:
 * one `IHDR`, one "filter type 0 (none)" `IDAT` stream at a fixed zlib
 * level/strategy, one `IEND`. No ancillary chunk (no metadata) is ever
 * emitted, stripping nonessential metadata
 * from every output this renderer produces.
 *
 * @param {{width: number, height: number, rgba: Buffer}} raster the raster
 *   to encode
 * @returns {Buffer} the complete PNG file bytes
 */
export function encodePng({ width, height, rgba }) {
  const rowBytes = width * 4;
  const raw = Buffer.alloc(height * (1 + rowBytes));
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (1 + rowBytes);
    raw[rowStart] = 0; // filter type: none
    rgba.copy(raw, rowStart + 1, y * rowBytes, y * rowBytes + rowBytes);
  }
  const idatData = deflateSync(raw, { level: 9, strategy: 0 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // color type: truecolor + alpha
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  return Buffer.concat([
    PNG_SIGNATURE,
    encodeChunk('IHDR', ihdr),
    encodeChunk('IDAT', idatData),
    encodeChunk('IEND', Buffer.alloc(0)),
  ]);
}
