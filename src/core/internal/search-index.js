/**
 * Static search index generation.
 *
 * Scope note (documented, not silently assumed): this renderer has no
 * externally fixed search-index document shape to conform to. This module
 * therefore documents its own deterministic shape here, matching this
 * renderer's established style for an unfixed structural
 * decision (see `internal/route-labels.js`'s route-segment grammar and the
 * media pipeline scope decisions in the package README): one JSON document,
 * `{schemaVersion, generatedAt, publication, documents[]}`, sorted by each
 * document's own absolute URL (UTF-8 byte order, this renderer's one
 * deterministic ordering convention throughout — see
 * `internal/source-inventory.js#compareUtf8Bytes`).
 *
 * `generatedAt` is `buildInput.buildEpoch` — a build-input *field*, sourced
 * deterministically from the selected Git commit's own committer timestamp,
 * not read from the wall clock at build time — matching
 * `src/core/manifest.js`'s own `manifest.generatedAt` convention, so two
 * clean builds of the same `build-input` still produce byte-identical index
 * bytes.
 *
 * No runtime search JavaScript accompanies this document: this renderer
 * must read completely with JavaScript disabled, and the appearance
 * controller is the only client-side script it ever admits. This module's
 * only output is the index document's bytes; nothing wires a `<script>` to
 * it.
 *
 * Only actual authored content (`article`/`page` records, `status:
 * "published"`) is indexed — never a synthetic listing page
 * (index/tag/series/archive/profile/author), which has no body text to
 * excerpt and is already reachable through ordinary navigation rather than
 * full-text search.
 */

import { joinBasePathAndRoute } from './route.js';
import { compareUtf8Bytes } from './source-inventory.js';
import { contentLastModified, contentRoute } from './page-kinds.js';

/** @type {number} the excerpt's maximum character length — bounded for the
 * same documented reason `plainText`'s own `description` field is bounded
 * to 500 graphemes elsewhere in this schema family. */
const EXCERPT_MAX_LENGTH = 300;

/**
 * Derive a short plain-text excerpt from an already-sanitized HTML body: a
 * deliberately simple, deterministic tag strip (never a full HTML parser —
 * this is a search-index summary field, not rendered output), collapsing
 * whitespace and bounding the result length.
 *
 * @param {string} html a `renderableBody.body`-shaped, already
 *   render-policy-conformant HTML fragment
 * @returns {string} the bounded plain-text excerpt
 */
function plainTextExcerpt(html) {
  const stripped = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length > EXCERPT_MAX_LENGTH
    ? `${stripped.slice(0, EXCERPT_MAX_LENGTH).trimEnd()}…`
    : stripped;
}

/**
 * Build the deterministic static search index document for one validated
 * `build-input:2.0.0` instance.
 *
 * @param {import('../../../types/index.d.ts').NormalizedBuildInput} validatedInput
 * @returns {string} the exact UTF-8 JSON text, LF-terminated
 */
export function buildSearchIndex(validatedInput) {
  const { publication, content, basePath, baseUrl, buildEpoch } =
    validatedInput;

  /**
   * @param {string} route an un-joined route
   * @returns {string} the absolute `https://` URL
   */
  const absoluteUrl = (route) =>
    new URL(joinBasePathAndRoute(basePath, route), baseUrl).toString();

  const documents = content
    .filter(
      (record) =>
        (record.frontmatter.kind === 'article' ||
          record.frontmatter.kind === 'page') &&
        record.frontmatter.status === 'published',
    )
    .map((record) => {
      const { frontmatter } = record;
      return {
        id: frontmatter.id,
        route: absoluteUrl(contentRoute(frontmatter)),
        kind: frontmatter.kind,
        title: frontmatter.title,
        description: frontmatter.description ?? '',
        excerpt: plainTextExcerpt(record.body),
        language: frontmatter.language,
        tags: [...frontmatter.tags].sort(),
        publishedAt: frontmatter.publishedAt,
        lastModified: contentLastModified(frontmatter),
      };
    })
    .sort((a, b) => compareUtf8Bytes(a.route, b.route));

  const document = {
    schemaVersion: '1',
    generatedAt: buildEpoch,
    publication: {
      title: publication.title,
      canonicalBase: publication.canonicalBase,
    },
    documents,
  };

  return `${JSON.stringify(document)}\n`;
}
