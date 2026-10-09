/**
 * Editions: repository documents of `kind: "edition"` that restate one
 * article at another depth (a quick read, a standard edition, a deep dive).
 *
 * An edition is an ordinary rendered document, not a module: the build input
 * already carries it as a `content[]` record whose front matter names the
 * article it restates (`edition.of`, the article's slug) and its depth
 * (`edition.kind`). Whether the edition is current (generated from the
 * article's present text) is decided upstream, before the build input exists,
 * so an edition that arrives here is rendered as given.
 *
 * What this renderer does with one:
 *
 * - it renders at `<article route>/<segment>` where the segment is
 *   `quick-read`, `standard` or `deep-dive`, built from `edition.of`
 *   ({@link editionRoute}), so `/post` has `/post/quick-read` beside it;
 * - its `<link rel="canonical">` names the article and its robots directive is
 *   `noindex, follow`, so the article stays the indexed reference;
 * - it never appears in a listing, tag or series page, a feed, the sitemap, the
 *   search index or the `llms` documents (each of those selects `kind:
 *   "article"` / `"page"` records, or skips `noindex` pages);
 * - the article and each of its editions carry the same accessible selector,
 *   a `<nav aria-label="Editions">` of links in the core `edition-selector`
 *   slot, listing the original and each edition that exists, the current page
 *   marked `aria-current="page"`; an edition page also carries a one-line
 *   label saying the page is a generated edition and the original is the
 *   reference.
 *
 * Styling is the base layer's: the selector uses the existing pill hooks, so
 * the published theme styling contract does not change.
 *
 * An edition that cannot be placed is a malformed build input and fails closed
 * before anything is written ({@link resolveEditions}).
 */

import { BuildInputValidationError } from '../errors.js';
import { icon } from './icons.js';
import { escapeHtml, renderSlot } from './skeleton.js';

/** @typedef {'QUICK_READ' | 'STANDARD' | 'DEEP_DIVE'} EditionKind */

/**
 * One edition placed beside its article.
 *
 * @typedef {object} EditionEntry
 * @property {import('../../../types/index.d.ts').ContentBuildRecord} record
 *   the edition document
 * @property {import('../../../types/index.d.ts').ContentBuildRecord} original
 *   the article it restates
 * @property {EditionKind} kind its depth
 * @property {string} route its un-joined route
 */

/**
 * Every edition of a build input.
 *
 * @typedef {object} EditionResolution
 * @property {ReadonlyMap<import('../../../types/index.d.ts').ContentBuildRecord, EditionEntry>} byRecord
 *   each edition record's placement
 * @property {ReadonlyMap<import('../../../types/index.d.ts').ContentBuildRecord, readonly EditionEntry[]>} byOriginal
 *   each article's editions, in selector order (quick read, standard, deep dive)
 */

/**
 * The edition kinds in the order the selector lists them.
 *
 * @type {readonly EditionKind[]}
 */
export const EDITION_KINDS = Object.freeze([
  'QUICK_READ',
  'STANDARD',
  'DEEP_DIVE',
]);

/** @type {Readonly<Record<EditionKind, string>>} */
const EDITION_SEGMENTS = Object.freeze({
  QUICK_READ: 'quick-read',
  STANDARD: 'standard',
  DEEP_DIVE: 'deep-dive',
});

/** @type {Readonly<Record<EditionKind, string>>} */
const EDITION_LABEL_KEYS = Object.freeze({
  QUICK_READ: 'editionQuickReadLabel',
  STANDARD: 'editionStandardLabel',
  DEEP_DIVE: 'editionDeepDiveLabel',
});

/** Where a reader of an edition diagnostic finds the rule. */
const DOCUMENTATION_URL = 'https://github.com/rathnasgala2/template#editions';

/**
 * @param {{of: string, kind: EditionKind}} edition an edition's front-matter
 *   `edition` object
 * @returns {string} the edition's un-joined route, `/<of>/<segment>`
 */
export function editionRoute(edition) {
  return `/${edition.of}/${EDITION_SEGMENTS[edition.kind]}`;
}

/**
 * @param {EditionKind} kind an edition kind
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} messages
 *   the resolved message catalog
 * @returns {string} the kind's plain-text label ("Quick read")
 */
export function editionKindLabel(kind, messages) {
  return /** @type {string} */ (messages[EDITION_LABEL_KEYS[kind]]);
}

/**
 * @param {string} code the diagnostic code
 * @param {number} index the record's index in `content`
 * @param {string} sourcePath the record's repository source path
 * @param {string} remediation what the author or producer should change
 * @returns {Record<string, string>} one diagnostic, shaped like a schema
 *   validation diagnostic
 */
function diagnostic(code, index, sourcePath, remediation) {
  return {
    code,
    severity: 'ERROR',
    instancePointer: `/content/${index}`,
    actualValueClass: 'object',
    rule: 'template:edition',
    sourcePath,
    remediation,
    documentationUrl: DOCUMENTATION_URL,
  };
}

/**
 * Place every edition beside the article it restates, before anything is
 * written. Fails closed with one diagnostic per edition that cannot be placed:
 * its `edition.of` names no `kind: "article"` document in this build
 * (`EDITION_ORIGINAL_UNRESOLVED`), two editions share an article and a depth
 * (`EDITION_DUPLICATE`), or its route is already another document's route or
 * redirect (`EDITION_ROUTE_CONFLICT`).
 *
 * @param {readonly import('../../../types/index.d.ts').ContentBuildRecord[]} content
 *   the build input's `content[]`
 * @param {(frontmatter: import('../../../types/index.d.ts').ContentFrontmatterNormalized) => string} routeOf
 *   a document's own un-joined route
 * @returns {EditionResolution} every edition's placement
 * @throws {BuildInputValidationError} when an edition cannot be placed
 */
export function resolveEditions(content, routeOf) {
  /** @type {Map<string, import('../../../types/index.d.ts').ContentBuildRecord>} */
  const articles = new Map();
  /** @type {Set<string>} */
  const occupied = new Set();
  for (const record of content) {
    const { frontmatter } = record;
    if (frontmatter.kind === 'edition') continue;
    if (frontmatter.kind === 'article') articles.set(frontmatter.slug, record);
    occupied.add(routeOf(frontmatter));
    for (const source of frontmatter.redirects) occupied.add(source);
  }

  /** @type {Map<import('../../../types/index.d.ts').ContentBuildRecord, EditionEntry>} */
  const byRecord = new Map();
  /** @type {Map<import('../../../types/index.d.ts').ContentBuildRecord, EditionEntry[]>} */
  const byOriginal = new Map();
  /** @type {Set<string>} */
  const claimed = new Set();
  /** @type {Record<string, string>[]} */
  const diagnostics = [];

  content.forEach((record, index) => {
    const { frontmatter } = record;
    if (frontmatter.kind !== 'edition') return;
    const { edition } = frontmatter;
    const original = edition ? articles.get(edition.of) : undefined;
    if (!edition || !original) {
      diagnostics.push(
        diagnostic(
          'EDITION_ORIGINAL_UNRESOLVED',
          index,
          record.sourcePath,
          `The edition ${record.sourcePath} restates "${edition?.of ?? ''}", which is not an article in this build. Publish the article with it, or remove the edition.`,
        ),
      );
      return;
    }
    const route = editionRoute(edition);
    if (occupied.has(route)) {
      diagnostics.push(
        diagnostic(
          'EDITION_ROUTE_CONFLICT',
          index,
          record.sourcePath,
          `The edition ${record.sourcePath} would render at ${route}, which another document already uses. Rename or move that document.`,
        ),
      );
      return;
    }
    if (claimed.has(route)) {
      diagnostics.push(
        diagnostic(
          'EDITION_DUPLICATE',
          index,
          record.sourcePath,
          `The article "${edition.of}" already has a ${edition.kind} edition. Keep one.`,
        ),
      );
      return;
    }
    claimed.add(route);
    /** @type {EditionEntry} */
    const entry = { record, original, kind: edition.kind, route };
    byRecord.set(record, entry);
    byOriginal.set(original, [...(byOriginal.get(original) ?? []), entry]);
  });

  if (diagnostics.length > 0) throw new BuildInputValidationError(diagnostics);

  for (const [original, entries] of byOriginal) {
    byOriginal.set(
      original,
      entries.sort(
        (a, b) => EDITION_KINDS.indexOf(a.kind) - EDITION_KINDS.indexOf(b.kind),
      ),
    );
  }
  return { byRecord, byOriginal };
}

/**
 * The editions a reader is offered next to an article: every published one,
 * plus the one being read. An `unlisted` edition stays reachable by its own
 * address but is not advertised.
 *
 * @param {readonly EditionEntry[] | undefined} entries every edition of the
 *   article, in selector order
 * @param {EditionEntry | undefined} current the edition being read, if any
 * @returns {EditionEntry[]} the editions to list
 */
export function listedEditions(entries, current) {
  return (entries ?? []).filter(
    (entry) =>
      entry === current || entry.record.frontmatter.status === 'published',
  );
}

/**
 * Render the `edition-selector` slot for an article or one of its editions.
 *
 * @param {object} options rendering options
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
 *   the resolved message catalog
 * @param {string} options.originalHref the article's joined route
 * @param {readonly EditionEntry[]} options.entries the editions to list, in
 *   selector order ({@link listedEditions})
 * @param {EditionEntry | undefined} options.current the edition being read;
 *   `undefined` on the article itself
 * @param {(route: string) => string} options.site joins a route with the
 *   public base path
 * @returns {string} the slot, or an empty string when there is no edition to
 *   offer (a slot with nothing to say is not rendered)
 */
export function renderEditionSelector({
  messages,
  originalHref,
  entries,
  current,
  site,
}) {
  if (entries.length === 0) return '';
  const text = (/** @type {string} */ key) =>
    escapeHtml(/** @type {string} */ (messages[key]));
  const item = (
    /** @type {string} */ href,
    /** @type {string} */ label,
    /** @type {string} */ iconName,
    /** @type {boolean} */ isCurrent,
  ) =>
    `<li><a class="g-pill" href="${escapeHtml(href)}"${isCurrent ? ' aria-current="page"' : ''}>` +
    `${icon(iconName)}<span>${label}</span></a></li>`;
  const links = [
    item(originalHref, text('editionOriginalLabel'), 'pen', !current),
    ...entries.map((entry) =>
      item(
        site(entry.route),
        escapeHtml(editionKindLabel(entry.kind, messages)),
        'sparkle',
        entry === current,
      ),
    ),
  ].join('');
  return renderSlot('edition-selector', {
    html:
      `<nav aria-label="${text('editionsNavigationLabel')}"><ul class="g-pills">${links}</ul></nav>` +
      (current
        ? `<p class="g-label">${icon('sparkle')}${text('editionNoticeLabel')}</p>`
        : ''),
  });
}
