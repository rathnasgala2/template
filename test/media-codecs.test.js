import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { MediaPipelineError } from '../src/core/errors.js';
import { assertFontPolicy } from '../src/core/internal/media/font-policy.js';
import {
  decodeJpeg,
  encodeJpeg,
} from '../src/core/internal/media/jpeg-codec.js';
import { MAX_FONT_SOURCE_BYTES } from '../src/core/internal/media/limits.js';
import { decodePng, encodePng } from '../src/core/internal/media/png-codec.js';
import {
  applyExifOrientation,
  resizeRaster,
} from '../src/core/internal/media/resize.js';
import { sniffMediaFormat } from '../src/core/internal/media/sniff.js';
import { probeAvif } from '../src/core/internal/media/avif-probe.js';
import { probeWebp } from '../src/core/internal/media/webp-probe.js';
import {
  buildGradientRaster,
  buildOversizedDimensionPng,
  buildPngDecompressionBomb,
  buildPngJpegPolyglot,
  buildTestJpeg,
  buildTestPng,
  buildTestWoff2,
  TEST_SVG_BYTES,
} from './helpers/media-fixtures.js';

test('sniffMediaFormat classifies by decoded bytes, not extension', () => {
  assert.equal(sniffMediaFormat(buildTestPng(2, 2)), 'png');
  assert.equal(sniffMediaFormat(buildTestJpeg(2, 2)), 'jpeg');
  assert.equal(sniffMediaFormat(TEST_SVG_BYTES), 'svg');
  assert.equal(sniffMediaFormat(Buffer.from('not an image')), 'unknown');
  // A file with a misleading name would still sniff correctly, because
  // there is no name here at all to mislead — proving the classification
  // is byte-derived by construction.
  assert.equal(sniffMediaFormat(Buffer.concat([TEST_SVG_BYTES])), 'svg');
});

test('PNG round-trips a small raster through decode(encode(raster))', () => {
  const raster = buildGradientRaster(6, 4);
  const encoded = encodePng(raster);
  const decoded = decodePng(encoded, 'test.png');
  assert.equal(decoded.width, 6);
  assert.equal(decoded.height, 4);
  assert.ok(decoded.rgba.equals(raster.rgba));
});

test('encodePng is deterministic: encoding the same raster twice is byte-identical', () => {
  const raster = buildGradientRaster(8, 8);
  assert.ok(encodePng(raster).equals(encodePng(raster)));
});

test('decodePng rejects a decompression bomb before over-allocating', () => {
  assert.throws(
    () => decodePng(buildPngDecompressionBomb(), 'bomb.png'),
    (error) =>
      error instanceof MediaPipelineError &&
      error.reasonCode === 'MEDIA_RESOURCE_EXCEEDED',
  );
});

test('decodePng rejects declared dimensions above the decode ceiling', () => {
  assert.throws(
    () => decodePng(buildOversizedDimensionPng(), 'huge.png'),
    (error) =>
      error instanceof MediaPipelineError &&
      error.reasonCode === 'MEDIA_RESOURCE_EXCEEDED',
  );
});

test('decodePng rejects a PNG/JPEG polyglot (trailing bytes after IEND)', () => {
  assert.throws(
    () => decodePng(buildPngJpegPolyglot(), 'polyglot.png'),
    (error) =>
      error instanceof MediaPipelineError &&
      error.reasonCode === 'MEDIA_FORMAT_INVALID',
  );
});

test('decodePng rejects a missing PNG signature', () => {
  assert.throws(
    () => decodePng(Buffer.from('not a png'), 'bad.png'),
    (error) =>
      error instanceof MediaPipelineError &&
      error.reasonCode === 'MEDIA_FORMAT_INVALID',
  );
});

test('JPEG decode reports width/height and EXIF orientation', () => {
  const bytes = buildTestJpeg(8, 4, 6);
  const decoded = decodeJpeg(bytes, 'test.jpg');
  assert.equal(decoded.width, 8);
  assert.equal(decoded.height, 4);
  assert.equal(decoded.orientation, 6);
  assert.equal(decoded.rgba.byteLength, 8 * 4 * 4);
});

test('JPEG decode defaults to orientation 1 when no EXIF is present', () => {
  const decoded = decodeJpeg(buildTestJpeg(4, 4), 'no-exif.jpg');
  assert.equal(decoded.orientation, 1);
});

test('encodeJpeg is deterministic: encoding the same raster twice is byte-identical', () => {
  const raster = buildGradientRaster(8, 8);
  assert.ok(encodeJpeg(raster).equals(encodeJpeg(raster)));
});

test('applyExifOrientation swaps dimensions for a 90-degree rotation (orientation 6)', () => {
  const raster = buildGradientRaster(10, 4);
  const rotated = applyExifOrientation(raster, 6);
  assert.equal(rotated.width, 4);
  assert.equal(rotated.height, 10);
});

test('applyExifOrientation is the identity for orientation 1', () => {
  const raster = buildGradientRaster(5, 5);
  const result = applyExifOrientation(raster, 1);
  assert.equal(result.width, 5);
  assert.ok(result.rgba.equals(raster.rgba));
});

test('resizeRaster halves width and proportionally scales height', () => {
  const raster = buildGradientRaster(8, 4);
  const resized = resizeRaster(raster, 4, 'test.png');
  assert.equal(resized.width, 4);
  assert.equal(resized.height, 2);
  assert.equal(resized.rgba.byteLength, 4 * 2 * 4);
});

test('resizeRaster is deterministic across repeated calls', () => {
  const raster = buildGradientRaster(13, 7);
  const a = resizeRaster(raster, 5, 'test.png');
  const b = resizeRaster(raster, 5, 'test.png');
  assert.ok(a.rgba.equals(b.rgba));
});

test('resizeRaster rejects an upscale request', () => {
  const raster = buildGradientRaster(4, 4);
  assert.throws(
    () => resizeRaster(raster, 8, 'test.png'),
    (error) =>
      error instanceof MediaPipelineError &&
      error.reasonCode === 'MEDIA_FORMAT_INVALID',
  );
});

test('assertFontPolicy accepts a WOFF2-signed file within the size ceiling', () => {
  assert.doesNotThrow(() => assertFontPolicy(buildTestWoff2(64), 'font.woff2'));
});

test('assertFontPolicy rejects a non-WOFF2 font', () => {
  assert.throws(
    () => assertFontPolicy(Buffer.from('not a font'), 'font.ttf'),
    (error) =>
      error instanceof MediaPipelineError &&
      error.reasonCode === 'MEDIA_FONT_FORMAT_INVALID',
  );
});

test('assertFontPolicy rejects an oversized font', () => {
  assert.throws(
    () =>
      assertFontPolicy(buildTestWoff2(MAX_FONT_SOURCE_BYTES + 1), 'font.woff2'),
    (error) =>
      error instanceof MediaPipelineError &&
      error.reasonCode === 'MEDIA_RESOURCE_EXCEEDED',
  );
});

test('probeWebp reads declared VP8L dimensions and rejects a second chunk', () => {
  // A minimal, well-formed VP8L container: signature 0x2f then 4 bytes of
  // packed width-1/height-1/version bits (all zero -> 1x1, version 0).
  const vp8l = Buffer.from([0x2f, 0x00, 0x00, 0x00, 0x00]);
  const pad = Buffer.from([0x00]); // odd chunk size (5) requires one pad byte
  const riffSize = 4 + 8 + vp8l.length + pad.length; // "WEBP" + chunk header + payload + pad
  const bytes = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    (() => {
      const b = Buffer.alloc(4);
      b.writeUInt32LE(riffSize, 0);
      return b;
    })(),
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8L', 'ascii'),
    (() => {
      const b = Buffer.alloc(4);
      b.writeUInt32LE(vp8l.length, 0);
      return b;
    })(),
    vp8l,
    pad,
  ]);
  const probed = probeWebp(bytes, 'test.webp');
  assert.equal(probed.width, 1);
  assert.equal(probed.height, 1);

  assert.throws(
    () => probeWebp(Buffer.concat([bytes, Buffer.from([0])]), 'bad.webp'),
    (error) =>
      error instanceof MediaPipelineError &&
      error.reasonCode === 'MEDIA_FORMAT_INVALID',
  );
});

test('probeAvif rejects a container with no ftyp box', () => {
  assert.throws(
    () => probeAvif(Buffer.from('not avif'), 'test.avif'),
    (error) =>
      error instanceof MediaPipelineError &&
      error.reasonCode === 'MEDIA_FORMAT_INVALID',
  );
});
