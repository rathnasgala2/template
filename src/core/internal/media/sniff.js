/**
 * Media-type sniffing from decoded bytes, never from a file extension or a
 * caller-declared media type: media type is established from
 * decoded bytes, not extension.
 *
 * SVG is deliberately excluded from this sniffer's admitted output set: SVG
 * is never processed as author media. Any byte
 * sequence recognizable as SVG/XML is classified `'svg'` here specifically
 * so the caller can reject it with a distinct, explicit
 * `MEDIA_SVG_REJECTED` reason rather than falling through to a generic
 * "unrecognized format" error.
 */

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

/**
 * @param {Buffer} bytes candidate file bytes
 * @returns {boolean} true when `bytes` starts with the exact PNG signature
 */
function isPng(bytes) {
  return bytes.length >= 8 && bytes.subarray(0, 8).equals(PNG_SIGNATURE);
}

/**
 * @param {Buffer} bytes candidate file bytes
 * @returns {boolean} true when `bytes` starts with the JPEG SOI marker and a
 *   second marker byte `0xff`
 */
function isJpeg(bytes) {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  );
}

/**
 * @param {Buffer} bytes candidate file bytes
 * @returns {boolean} true when `bytes` is a `RIFF....WEBP` container
 */
function isWebp(bytes) {
  return (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  );
}

/**
 * @param {Buffer} bytes candidate file bytes
 * @returns {boolean} true when `bytes` starts with an ISOBMFF `ftyp` box
 *   whose major brand is `avif`
 */
function isAvif(bytes) {
  if (bytes.length < 12) return false;
  if (bytes.subarray(4, 8).toString('ascii') !== 'ftyp') return false;
  return bytes.subarray(8, 12).toString('ascii') === 'avif';
}

/**
 * Detect whether `bytes` looks like SVG/XML markup, scanning only the first
 * 4096 bytes (bounded: this classification exists purely to reject, never to
 * parse). A byte-order mark, XML declaration, comment or a bare `<svg` root
 * element are all treated as SVG for rejection purposes; this is
 * intentionally over-inclusive.
 *
 * @param {Buffer} bytes candidate file bytes
 * @returns {boolean} true when `bytes` looks like SVG/XML markup
 */
function looksLikeSvg(bytes) {
  const head = bytes.subarray(0, 4096).toString('utf8').trimStart();
  return (
    head.startsWith('﻿') ||
    head.startsWith('<?xml') ||
    head.startsWith('<!--') ||
    head.startsWith('<svg') ||
    /<svg[\s>]/i.test(head.slice(0, 512))
  );
}

/**
 * @typedef {'png' | 'jpeg' | 'webp' | 'avif' | 'svg' | 'unknown'} SniffedFormat
 */

/**
 * Classify raw file bytes into a decoded-byte-derived format label.
 *
 * @param {Buffer} bytes raw candidate file bytes
 * @returns {SniffedFormat} the sniffed format
 */
export function sniffMediaFormat(bytes) {
  if (looksLikeSvg(bytes)) return 'svg';
  if (isPng(bytes)) return 'png';
  if (isJpeg(bytes)) return 'jpeg';
  if (isWebp(bytes)) return 'webp';
  if (isAvif(bytes)) return 'avif';
  return 'unknown';
}

/** @type {Readonly<Record<'png' | 'jpeg' | 'webp' | 'avif', string>>} */
export const MEDIA_TYPE_BY_FORMAT = Object.freeze({
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
});
