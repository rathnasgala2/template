/**
 * A richer `build-input:2.0.0` fixture for S2-T06's own acceptance/golden
 * tests: two authors, a publication profile, one `page`-kind custom page,
 * and enough `article`-kind content — spread across two tags, one series and
 * two calendar years — to exercise every generated page kind
 * (`internal/page-kinds.js`): `profile`, `author`, `article`, `page`,
 * `index` (including pagination), `tag` (root and leaf), `series` (root and
 * leaf) and `archive` (root and leaf).
 *
 * Built by extending `loadCanonicalBuildInput()`'s already schema-valid
 * single-content fixture, rather than authoring a second complete
 * `build-input` from scratch, so every field this helper does not
 * deliberately vary (`repository`, `packages`, `appearance`, …) stays
 * identical to the upstream package's own canonical example.
 */

import {
  applyCurrentRenderPolicy,
  loadCanonicalBuildInput,
} from './schema-fixtures.js';

/**
 * @param {number} n a small non-negative integer
 * @returns {string} a deterministic, schema-valid UUIDv7-shaped `stableId`
 */
function stableId(n) {
  const suffix = String(n).padStart(12, '0');
  return `019c0000-0000-7000-8000-${suffix}`;
}

/**
 * @returns {Promise<Record<string, unknown>>} a fresh rich fixture
 */
export async function buildRichFixture() {
  const buildInput = /** @type {any} */ (await loadCanonicalBuildInput());

  const secondAuthorId = stableId(2);
  buildInput.authors.push({
    id: secondAuthorId,
    displayName: 'fixture-author-2',
    biography: 'A second fixture author.',
    pronouns: 'they/them',
    links: [{ type: 'github', uri: 'https://github.com/fixture-author-2' }],
    localized: [],
    sourcePath: 'content/authors/fixture-2.md',
    sourceDigest:
      'sha256:0000000000000000000000000000000000000000000000000000000000000002',
  });

  buildInput.publication.profile = {
    route: '/about',
    body: {
      sourcePath: 'content/about.md',
      sourceDigest:
        'sha256:0000000000000000000000000000000000000000000000000000000000000003',
      bodyMediaType: 'text/html',
      body: '<p>About this publication.</p>',
      bodyDigest:
        'sha256:0000000000000000000000000000000000000000000000000000000000000000',
      renderPolicy: {
        name: 'placeholder',
        version: '0.0.0',
        digest:
          'sha256:0000000000000000000000000000000000000000000000000000000000000000',
      },
    },
  };

  const [templateRecord] = buildInput.content;

  /**
   * @param {object} overrides frontmatter/body overrides for the cloned
   *   record
   * @returns {Record<string, unknown>}
   */
  function cloneContentRecord(overrides) {
    const clone = JSON.parse(JSON.stringify(templateRecord));
    for (const [key, value] of Object.entries(overrides.frontmatter)) {
      if (value === undefined) {
        delete clone.frontmatter[key];
      } else {
        clone.frontmatter[key] = value;
      }
    }
    if (overrides.body !== undefined) clone.body = overrides.body;
    return clone;
  }

  buildInput.content = [
    cloneContentRecord({
      frontmatter: {
        id: stableId(1),
        kind: 'article',
        title: 'First article',
        slug: 'first-article',
        route: undefined,
        tags: ['alpha'],
        series: 'story',
        seriesOrder: 2,
        publishedAt: '2025-01-10T09:00:00.000Z',
        createdAt: '2025-01-10T09:00:00.000Z',
      },
      body: 'first article body',
    }),
    cloneContentRecord({
      frontmatter: {
        id: stableId(3),
        kind: 'article',
        title: 'Second article',
        slug: 'second-article',
        tags: ['alpha', 'beta'],
        series: 'story',
        seriesOrder: 1,
        publishedAt: '2025-06-01T09:00:00.000Z',
        createdAt: '2025-06-01T09:00:00.000Z',
        authorIds: [secondAuthorId],
      },
      body: 'second article body',
    }),
    cloneContentRecord({
      frontmatter: {
        id: stableId(4),
        kind: 'article',
        title: 'Unlisted article',
        slug: 'unlisted-article',
        tags: ['beta'],
        series: undefined,
        seriesOrder: undefined,
        status: 'unlisted',
        publishedAt: '2026-02-02T09:00:00.000Z',
        createdAt: '2026-02-02T09:00:00.000Z',
      },
      body: 'unlisted article body',
    }),
    cloneContentRecord({
      frontmatter: {
        id: stableId(5),
        kind: 'page',
        title: 'Contact',
        slug: 'contact',
        tags: [],
        series: undefined,
        seriesOrder: undefined,
        publishedAt: '2025-01-01T09:00:00.000Z',
        createdAt: '2025-01-01T09:00:00.000Z',
      },
      body: 'contact page body',
    }),
  ];
  for (const record of buildInput.content) {
    record.resolvedAuthorIds = record.frontmatter.authorIds;
  }

  await applyCurrentRenderPolicy(buildInput);
  return buildInput;
}

/** The edition kinds, with the id offset each gets in {@link editionRecord}. */
const EDITION_KIND_OFFSET = Object.freeze({
  QUICK_READ: 1,
  STANDARD: 2,
  DEEP_DIVE: 3,
});

/**
 * A normalized `kind: "edition"` content record restating `original`: the
 * article's authors and language, its own id, slug, source path and body, and
 * the `edition` object the schema requires. The record is not yet part of any
 * build input; call {@link addEditions} to add records and refresh digests.
 *
 * @param {any} original the article's content record
 * @param {'QUICK_READ' | 'STANDARD' | 'DEEP_DIVE'} kind the edition's depth
 * @param {{frontmatter?: Record<string, unknown>, body?: string}} [overrides]
 *   front-matter fields and body to set on the record
 * @returns {Record<string, any>} the edition record
 */
export function editionRecord(original, kind, overrides = {}) {
  const offset = EDITION_KIND_OFFSET[kind];
  const segment = kind.toLowerCase().replace('_', '-');
  const slug = original.frontmatter.slug;
  const record = JSON.parse(JSON.stringify(original));
  record.frontmatter = {
    ...record.frontmatter,
    id: stableId(300 + offset),
    kind: 'edition',
    slug: `${slug}-${segment}`,
    route: undefined,
    hero: undefined,
    socialImage: undefined,
    series: undefined,
    seriesOrder: undefined,
    tags: [],
    redirects: [],
    edition: {
      of: slug,
      kind,
      sourceDigest: `sha256:${'ab'.repeat(32)}`,
      generation: {
        provider: 'anthropic',
        model: 'claude-sonnet-5-5',
        generationId: stableId(400 + offset),
      },
      approvedAt: '2026-10-09T10:00:00.000Z',
    },
    ...overrides.frontmatter,
  };
  record.sourcePath = `content/${slug}.edition.${segment}.md`;
  record.body = overrides.body ?? `<p>The ${segment} edition.</p>`;
  delete record.media;
  return record;
}

/**
 * Add edition records to a build input and refresh what depends on them (the
 * resolved author ids and every body digest).
 *
 * @param {any} buildInput the build input, mutated in place
 * @param {readonly Record<string, any>[]} records the edition records
 * @returns {Promise<any>} the same build input
 */
export async function addEditions(buildInput, records) {
  buildInput.content.push(...records);
  for (const record of buildInput.content) {
    record.resolvedAuthorIds = record.frontmatter.authorIds;
  }
  await applyCurrentRenderPolicy(buildInput);
  return buildInput;
}

export { stableId };
