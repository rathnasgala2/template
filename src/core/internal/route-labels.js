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
 * characters to filtering) by appending a short, deterministic content hash of
 * the exact label whenever the readable prefix is empty or shared with another
 * label of the site (`deriveLabelSegments`). Two distinct labels can therefore
 * never collide on the same generated route.
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

/**
 * Decide every label's route segment once, from the whole label set.
 * A label whose readable prefix is non-empty and unique (case-insensitive)
 * among the labels uses the prefix alone; a collision (every label sharing
 * the prefix) or an empty prefix keeps the digest-suffixed form of
 * {@link routeSegmentForLabel}. The decision depends only on the set, never
 * on order, so a segment changes only when the label set does. A prefix-only
 * segment that equals another label's digest-suffixed segment also falls
 * back to the suffixed form.
 *
 * @param {Iterable<string>} labels the site's distinct labels of one kind
 * @returns {Map<string, string>} label to route segment
 */
export function deriveLabelSegments(labels) {
  const distinct = [...new Set(labels)];
  /** @type {Map<string, number>} */
  const prefixCounts = new Map();
  for (const label of distinct) {
    const prefix = asciiReadablePrefix(label);
    prefixCounts.set(prefix, (prefixCounts.get(prefix) ?? 0) + 1);
  }
  const suffixed = new Set(
    distinct
      .filter(
        (label) =>
          asciiReadablePrefix(label) === '' ||
          (prefixCounts.get(asciiReadablePrefix(label)) ?? 0) > 1,
      )
      .map((label) => routeSegmentForLabel(label)),
  );
  /** @type {Map<string, string>} */
  const segments = new Map();
  for (const label of distinct) {
    const prefix = asciiReadablePrefix(label);
    const unique = prefix !== '' && prefixCounts.get(prefix) === 1;
    segments.set(
      label,
      unique && !suffixed.has(prefix) ? prefix : routeSegmentForLabel(label),
    );
  }
  return segments;
}

/**
 * @param {readonly import('../../../types/index.d.ts').ContentBuildRecord[]} content
 * @returns {Map<string, string>} each published article tag's route segment
 */
export function deriveTagSegments(content) {
  return deriveLabelSegments(
    content
      .filter(
        (r) =>
          r.frontmatter.kind === 'article' &&
          r.frontmatter.status === 'published',
      )
      .flatMap((r) => r.frontmatter.tags),
  );
}

/**
 * @param {readonly import('../../../types/index.d.ts').ContentBuildRecord[]} content
 * @returns {Map<string, string>} each published series' route segment
 */
export function deriveSeriesSegments(content) {
  return deriveLabelSegments(
    content
      .filter(
        (r) =>
          r.frontmatter.kind !== 'edition' &&
          r.frontmatter.status === 'published' &&
          r.frontmatter.series,
      )
      .map((r) => /** @type {string} */ (r.frontmatter.series)),
  );
}

/**
 * Derive each author's URL segment: a readable slug of the display name
 * (lowercase ASCII, at most 48 characters), stable for a given name. When a
 * name yields no ASCII characters or two authors yield the same slug, the
 * author with the lower id keeps the slug and every other one falls back to
 * its id, so a segment is always unique and a later colliding author never
 * moves an existing author's URL.
 *
 * @param {readonly {id: string, displayName: string}[]} authors
 * @returns {Map<string, string>} author id to URL segment
 */
export function deriveAuthorSlugs(authors) {
  /** @type {Map<string, string>} */
  const slugs = new Map();
  const taken = new Set(authors.map((author) => author.id));
  const ordered = authors.slice().sort((a, b) => (a.id < b.id ? -1 : 1));
  for (const author of ordered) {
    const slug = asciiReadablePrefix(author.displayName);
    if (
      slug !== '' &&
      !taken.has(slug) &&
      ![...slugs.values()].includes(slug)
    ) {
      slugs.set(author.id, slug);
    } else {
      slugs.set(author.id, author.id);
    }
  }
  return slugs;
}
