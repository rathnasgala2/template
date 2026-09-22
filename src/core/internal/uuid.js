/**
 * A minimal RFC 9562 UUIDv7 generator for `artifactId`. DEC-097's
 * `stableId` pattern requires the version nibble `7` and an `8`/`9`/`a`/`b`
 * variant nibble; `node:crypto`'s `randomUUID()` only produces v4. The
 * decision text is explicit that "equal artifact bytes may have distinct
 * artifact IDs" (DEC-097 section 6), so this value is intentionally not
 * required to be deterministic across two otherwise byte-identical builds.
 */

import { randomBytes } from 'node:crypto';

/**
 * Generate one lowercase canonical UUIDv7 string.
 *
 * @returns {string} a UUIDv7 matching `stableId`'s pattern
 */
export function generateUuidV7() {
  const timestampMs = BigInt(Date.now());
  const random = randomBytes(10);

  const bytes = new Uint8Array(16);
  bytes[0] = Number((timestampMs >> 40n) & 0xffn);
  bytes[1] = Number((timestampMs >> 32n) & 0xffn);
  bytes[2] = Number((timestampMs >> 24n) & 0xffn);
  bytes[3] = Number((timestampMs >> 16n) & 0xffn);
  bytes[4] = Number((timestampMs >> 8n) & 0xffn);
  bytes[5] = Number(timestampMs & 0xffn);
  // Version nibble 7 in the high nibble of byte 6.
  bytes[6] = 0x70 | (random[0] & 0x0f);
  bytes[7] = random[1];
  // Variant bits 10 in the top two bits of byte 8.
  bytes[8] = 0x80 | (random[2] & 0x3f);
  bytes[9] = random[3];
  bytes[10] = random[4];
  bytes[11] = random[5];
  bytes[12] = random[6];
  bytes[13] = random[7];
  bytes[14] = random[8];
  bytes[15] = random[9];

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}
