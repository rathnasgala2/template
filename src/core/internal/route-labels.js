/**
 * Deterministic route-segment derivation for generated listing pages (tag,
 * series, archive) from an authored `plainLabel`.
 *
 * `contentFrontmatterNormalized.tags`/`.series` are `plainLabel` values:
 * normalized Unicode text, 1..80 graphemes, with no further route-safety
 * constraint (checked against
 * `node_modules/@rathnasgala2/schemas/schemas/build-input.schema.json`'s
 * `plainLabel` `$def` — no ASCII/slug pattern, unlike `contentFrontmatterNormalized.slug`,
 * which the schema already restricts to `^[a-z0-9]+(?:-[a-z0-9]+)*$`). A tag
 * or series label can therefore contain spaces, uppercase letters, or any
 * non-Latin script.
 *
 * `route.js` already documents that this renderer's route projection
 * deliberately excludes a full Unicode percent-encoding and
 * collision-resolution engine (out of scope; it only ever projects
 * already-schema-validated `canonicalRoute` values, never derives a route
 * from an arbitrary label). This module makes the same scoped choice for
 * the one new case it introduces — turning an arbitrary label into a route
 * segment — and closes the collision risk a lossy ASCII-only slug would
 * otherwise introduce (two distinct Unicode labels both losing all their
 * characters to filtering) by always appending a short, deterministic content
 * hash of the exact label. Two distinct labels can therefore never collide on
 * the same generated route, even when their readable prefixes are identical
 * or both empty.
 */

import { createHash } from 'node:crypto';

/**
 * @param {string} label the raw label
 * @returns {string} its lowercase ASCII-only readable prefix (may be empty)
 */
function asciiReadablePrefix(label) {
  const lower = label.normalize('NFC').toLowerCase();
  let out = '';
  let lastWasSeparator = true;
  for (const character of lower) {
    if (/[a-z0-9]/u.test(character)) {
      out += character;
      lastWasSeparator = false;
    } else if (!lastWasSeparator) {
      out += '-';
      lastWasSeparator = true;
    }
  }
  return out.replace(/-+$/u, '').slice(0, 48);
}

/**
 * Derive a deterministic, collision-free, route-safe segment for an
 * arbitrary authored label (a tag, a series name, or any other `plainLabel`
 * used to generate a listing page route).
 *
 * @param {string} label the raw authored label
 * @returns {string} a lowercase ASCII route segment: an optional readable
 *   prefix followed by a 10-character hexadecimal content hash of the exact
 *   label
 */
export function routeSegmentForLabel(label) {
  const hash = createHash('sha256')
    .update(label, 'utf8')
    .digest('hex')
    .slice(0, 10);
  const prefix = asciiReadablePrefix(label);
  return prefix.length > 0 ? `${prefix}-${hash}` : hash;
}
