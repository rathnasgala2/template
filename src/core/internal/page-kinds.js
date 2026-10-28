/**
 * Page-kind assembly: builds every generated page's
 * `<main>` content, breadcrumb trail and route from a validated
 * `build-input:2.0.0` instance, and the shared site chrome (header, primary
 * navigation, footer) every page kind is composed with through
 * `internal/skeleton.js`'s {@link import('./skeleton.js').renderPageBody}.
 *
 * Page kinds this module produces:
 *
 * - `profile` — the publication's own optional profile page
 *   (`publication.profile`);
 * - `policy` — the two legal pages, `/terms` and `/privacy`
 *   (`internal/policy-pages.js`): the site's own text (`build-input.policies`,
 *   else the shipped defaults) followed by the template-owned Galascribe
 *   section; indexable but never searched, fed or listed in `llms`;
 * - `author` — one page per entry in `build-input.authors` (this array is
 *   already exactly the set of authors referenced by the selected content,
 *   publication contact or footer card — never an unreferenced author), at
 *   `/authors/<id>`;
 * - `article` / `page` — one page per `content[]` record, at its own
 *   `contentFrontmatterNormalized` route;
 * - an `edition` record (`kind: "edition"`, `internal/editions.js`) is an
 *   article page too, for the page-kind hook: it renders at
 *   `<article>/quick-read`, `/standard` or `/deep-dive`, names the article as
 *   its canonical URL, is `noindex, follow`, and never enters a listing;
 * - `index` — a paginated reverse-chronological listing of every
 *   `status: "published"` `kind: "article"` record (an `unlisted` record is
 *   reachable only by its own direct route or an authored navigation entry,
 *   never through a generated listing — the ordinary meaning of "unlisted");
 * - `tag` / `series` — one listing page per distinct authored tag/series
 *   value, plus one `/tags`/`/series` root page linking to each, present only
 *   when at least one record declares that field;
 * - `archive` — one listing page per UTC calendar year (from `publishedAt`),
 *   plus one `/archive` root page linking to each year.
 *
 * The `error` page kind ({@link renderErrorPageBody}) is exported as a pure
 * function, not wired into any generated route here: the one generated
 * `404.html` artifact is assembled elsewhere, which this module's own scope
 * notes forbid touching. That module composes its `404.html` from this same
 * function.
 *
 * Every generated page's own `route` field (see {@link GeneratedPage}) is an
 * un-joined `canonicalRoute`, in the same convention `internal/index.js`
 * already uses for content pages: the caller joins it with `basePath` via
 * `internal/route.js`'s `joinBasePathAndRoute` before route projection. Every
 * *link href* this module writes into a page's own body (breadcrumbs, tag and
 * series listings, pagination controls) is, by contrast, already joined with
 * `basePath` here, because it is read back only as literal HTML text, never
 * re-joined by a caller. This mirrors the navigation normalization rule: an
 * *authored* navigation item's route is used exactly as authored, never
 * synthesized or rewritten (so `internal/skeleton.js`'s navigation renderer
 * never joins it), while every route this renderer itself derives (every
 * page kind here) is basePath-joined at the point it becomes link text,
 * exactly like the redirect/content route projection elsewhere in this
 * renderer.
 *
 * Every listing here is a deliberately scoped decision this module documents
 * rather than assumes: page size, sort tie-break and the tag/series/archive
 * root pages have no externally fixed specification this renderer conforms
 * to verbatim.
 */

import {
  escapeHtml,
  renderBreadcrumbs,
  renderPagination,
  renderSlot,
  unescapeHtml,
} from './skeleton.js';
import {
  createComponents,
  createMediaImage,
  extractH2Headings,
  plainText,
  renderImage,
  renderNewsletterPanel,
} from './components.js';
import {
  editionKindLabel,
  editionRoute,
  listedEditions,
  renderEditionSelector,
  resolveEditions,
} from './editions.js';
import { renderGalascribeSection, resolvePolicyPages } from './policy-pages.js';
import { truncateAtWord } from './seo.js';
import { cardMediaOf } from './first-body-image.js';
import { createStructuredData } from './structured-data.js';
import { icon } from './icons.js';
import {
  interactionsActive,
  renderInteractionsSection,
} from './interactions.js';
import { renderShareGroup } from './share.js';
import { getMessages } from './messages.js';
import {
  languageLabel,
  languageSegment,
  localizeAuthor,
  resolveTranslations,
} from './translations.js';
import { resolveTextDirection } from './text-direction.js';
import {
  deriveAuthorSlugs,
  deriveSeriesSegments,
  deriveTagSegments,
  routeSegmentForLabel,
} from './route-labels.js';
import { derivePublicBasePath, joinPublicRoute } from './route.js';
import {
  assertSupportedComposition,
  EDITORIAL_COMPOSITION,
} from './template-composition.js';

/** Listing page size (index and per-year archive pages). Scoped decision:
 * this renderer has no externally fixed page size; 10 is a deterministic,
 * documented default with no author-facing configuration surface.
 * @type {number} */
export const LISTING_PAGE_SIZE = 10;

/**
 * The semantic template-owned attribute this renderer sets on every
 * generated page's `<body>`: `contracts/theme-styling-contract.jcs` exposes
 * this as a public theme hook, one per {@link PAGE_KIND_VALUES} entry, so a
 * theme can vary presentation by page kind — e.g. a different article vs.
 * listing background — without the template ever promoting a
 * private/incidental selector. This attribute is a deliberate addition,
 * introduced specifically because the published styling contract needs a
 * page-kind-targeting hook.
 *
 * @type {string}
 */
export const PAGE_KIND_ATTRIBUTE = 'data-gala-page-kind';

/**
 * Every value {@link PAGE_KIND_ATTRIBUTE} may carry: every {@link GeneratedPage}
 * `kind` plus the synthetic `error` kind (`internal/index.js`'s always-present
 * generated `404.html`), sorted by UTF-8 bytes (this renderer's own
 * attribute-value sort convention throughout).
 *
 * @type {readonly string[]}
 */
export const PAGE_KIND_VALUES = Object.freeze(
  [
    'archive',
    'article',
    'author',
    'error',
    'index',
    'page',
    'policy',
    'profile',
    'series',
    'tag',
  ].sort(),
);

/**
 * @param {import('../../../types/index.d.ts').ContentFrontmatterNormalized} frontmatter
 * @returns {string} the record's own canonical route (un-joined); an
 *   edition's is derived from the article it restates, never authored
 */
export function contentRoute(frontmatter) {
  if (frontmatter.kind === 'edition' && frontmatter.edition) {
    return editionRoute(frontmatter.edition);
  }
  if (frontmatter.route) return frontmatter.route;
  if (frontmatter.translationOf) {
    return `/${languageSegment(frontmatter.language)}/${frontmatter.translationOf}`;
  }
  return `/${frontmatter.slug}`;
}

/**
 * Split an array into fixed-size, order-preserving pages.
 *
 * @template T
 * @param {readonly T[]} items items, already in final display order
 * @param {number} pageSize maximum items per page (at least 1)
 * @returns {T[][]} one array per page, always at least one (possibly empty)
 *   page
 */
function paginate(items, pageSize) {
  if (items.length === 0) return [[]];
  /** @type {T[][]} */
  const pages = [];
  for (let index = 0; index < items.length; index += pageSize) {
    pages.push(items.slice(index, index + pageSize));
  }
  return pages;
}

/**
 * @typedef {object} GeneratedPage
 * @property {'profile' | 'policy' | 'author' | 'article' | 'page' | 'index' | 'tag' | 'series' | 'archive'} kind
 * @property {string} route an un-joined `canonicalRoute` (caller joins with
 *   `basePath`)
 * @property {string} [canonicalRoute] the un-joined route the page's
 *   `<link rel="canonical">` names when it is not the page's own (an edition
 *   names its article)
 * @property {string} title the page's `<title>` text
 * @property {string} language the page's BCP-47 language tag
 * @property {{language: string, route: string}[]} [alternates] every
 *   language variant of the page's group, itself included (un-joined routes);
 *   absent outside a group
 * @property {{language: string, route: string}[]} [variants] every variant
 *   of the page's group, `seo.noindex` ones included (the language switcher)
 * @property {string} [xDefaultRoute] the group's primary, the `x-default`
 *   alternate (un-joined route)
 * @property {string} [direction] the page's resolved base text direction (assigned by buildGeneratedPages's own return mapping)
 * @property {string} bodyHtml the page's complete `<main>` inner HTML
 *   (breadcrumb included), containing exactly one `<h1>`
 * @property {string} [description] an optional plain-text
 *   description this page's SEO/Open-Graph/Twitter `<meta>` tags are built
 *   from (never HTML, never the sanitized body — a distinct authored or
 *   publication-level plain-text field)
 * @property {string} [documentTitle] the `<title>` element text
 *   (`<Page> | <Publication>`; the home page is
 *   `<Publication> – <tagline>`); `title` stays the bare page name used for
 *   `og:title` and structured data
 * @property {string} [jsonLd] the page's one embed-safe JSON-LD document
 *   (see `internal/structured-data.js`)
 * @property {string} [socialImageAlt] alternative text for the social image
 * @property {{publishedTime: string, modifiedTime?: string, authorUrls: string[], tags: string[]}} [articleMeta]
 *   the `article:*` Open Graph facts of an article page
 * @property {'website' | 'article' | 'profile'} [ogType]
 *   the Open Graph `og:type` this page kind maps to; defaults to `'website'`
 *   when omitted
 * @property {{path: string, sourceDigest: string} | undefined} [socialImageRef]
 *   an optional `resolvedFile` reference this page's
 *   social image is resolved from (the caller, `src/core/index.js`, is the
 *   one place that can turn this into an absolute derivative URL, because
 *   only it has run the media pipeline and knows the derivative
 *   output path a given `sourceDigest` produced)
 * @property {boolean} [interactionBearing] whether this page carries the
 *   reader-interactions section (article pages when the module is on)
 * @property {string} [socialTitle] the `og:title`/`twitter:title` when it
 *   differs from `title` (`seo.title`)
 * @property {string} [canonicalUrl] an absolute canonical URL overriding the
 *   page's own (`seo.canonicalUrl`); such a page is left out of the sitemap
 * @property {string} [robotsContent] an optional
 *   `<meta name="robots">` content value (e.g. `'noindex, follow'` for
 *   `status: "unlisted"` content); omitted entirely for ordinarily indexable
 *   pages, matching this renderer's "documented, not silently assumed" style
 *   elsewhere — every page kind's robots decision is made once, here, rather
 *   than re-derived by every later consumer (sitemap, search index)
 * @property {string} [lastModified] an optional
 *   `rfc3339` timestamp the generated sitemap's `<lastmod>` for this page is
 *   drawn from — always derived from authored content timestamps
 *   (`publishedAt`/`updatedAt`), never build time. Omitted
 *   for a page kind with no natural underlying timestamp (`profile`, or
 *   an `author` with no published article), which the generated sitemap then emits with no `<lastmod>`
 *   element at all (a sitemap's own `<lastmod>` is optional per the Sitemaps
 *   0.9 protocol).
 */

/**
 * The reverse-chronological, deterministically tie-broken set of every
 * `status: "published"`, `kind: "article"` record — the exact selection and
 * ordering the `index` page kind paginates, and the
 * same selection the generated feeds draw from, so a feed's item order can
 * never drift from the index listing's own order. Extracted to its own
 * export rather than duplicated, since `internal/fs-walk.js`'s duplication
 * gate (`jscpd`, 3%/50 tokens) would otherwise flag a second copy of this
 * sort comparator.
 *
 * @param {readonly import('../../../types/index.d.ts').ContentBuildRecord[]} content
 * @returns {import('../../../types/index.d.ts').ContentBuildRecord[]} the
 *   selected records, most recently published first
 */
export function selectPublishedArticles(content) {
  return content
    .filter(
      (record) =>
        record.frontmatter.kind === 'article' &&
        record.frontmatter.status === 'published',
    )
    .slice()
    .sort((a, b) => {
      if (a.frontmatter.publishedAt !== b.frontmatter.publishedAt) {
        return a.frontmatter.publishedAt < b.frontmatter.publishedAt ? 1 : -1;
      }
      return a.frontmatter.id < b.frontmatter.id ? -1 : 1;
    });
}

/**
 * Whether a record opted out of search engines with `seo.noindex`. Such a
 * record stays listed on the site (cards, archive, tags) but is left out of
 * the sitemap, feeds, `llms.txt` and the search index.
 *
 * @param {import('../../../types/index.d.ts').ContentFrontmatterNormalized} frontmatter
 * @returns {boolean} `true` when the record is `seo.noindex`
 */
export function isSeoNoindex(frontmatter) {
  return frontmatter.seo?.noindex === true;
}

/**
 * The most recent of a content record's own `updatedAt` (when authored) or
 * `publishedAt` — this renderer's one definition of "a content record's own
 * last-modified instant" (the sitemap's `<lastmod>` and the
 * static search index both read this, rather than each re-deriving it).
 *
 * @param {import('../../../types/index.d.ts').ContentFrontmatterNormalized} frontmatter
 * @returns {string} an `rfc3339` timestamp
 */
export function contentLastModified(frontmatter) {
  return frontmatter.updatedAt ?? frontmatter.publishedAt;
}

/**
 * The latest {@link contentLastModified} across a non-empty set of records —
 * this renderer's definition of "a generated listing page's own
 * `<lastmod>`": the most recent authored timestamp
 * among the content actually shown on that page, never build time.
 *
 * @param {readonly import('../../../types/index.d.ts').ContentBuildRecord[]} records
 * @returns {string | undefined} the latest timestamp, or `undefined` for an
 *   empty set
 */
function latestContentTimestamp(records) {
  return records.reduce(
    /** @type {(latest: string | undefined, record: import('../../../types/index.d.ts').ContentBuildRecord) => string} */ (
      latest,
      record,
    ) => {
      const candidate = contentLastModified(record.frontmatter);
      return !latest || candidate > latest ? candidate : latest;
    },
    /** @type {string | undefined} */ (undefined),
  );
}

/**
 * Group records by derived keys, preserving the input order within each
 * bucket.
 *
 * @param {readonly import('../../../types/index.d.ts').ContentBuildRecord[]} records
 * @param {(record: import('../../../types/index.d.ts').ContentBuildRecord) => readonly string[]} keysOf
 * @returns {Map<string, import('../../../types/index.d.ts').ContentBuildRecord[]>}
 */
function groupBy(records, keysOf) {
  /** @type {Map<string, import('../../../types/index.d.ts').ContentBuildRecord[]>} */
  const groups = new Map();
  for (const record of records) {
    for (const key of keysOf(record)) {
      const bucket = groups.get(key) ?? [];
      bucket.push(record);
      groups.set(key, bucket);
    }
  }
  return groups;
}

/** Number of articles after the featured one shown as cards on the home page. */
export const LATEST_CARD_COUNT = 6;
/** Number of related articles shown in "Keep reading". */
export const RELATED_COUNT = 3;
/** Minimum h2 headings an article needs before a contents list renders. */
export const CONTENTS_MIN_HEADINGS = 2;
/** Longest generated or truncated `<meta name="description">`. */
export const DESCRIPTION_MAX = 155;
/** Longest home-page `<title>` before the tagline is shortened. */
export const HOME_TITLE_MAX = 60;
/** Maximum tag pills on the home page. */
const HOME_TAG_PILL_LIMIT = 12;

/**
 * Select the "Keep reading" articles: other published articles ranked by
 * the number of shared tags (most first), then by recency (the input order),
 * at most {@link RELATED_COUNT}.
 *
 * @param {import('../../../types/index.d.ts').ContentBuildRecord} record
 * @param {readonly import('../../../types/index.d.ts').ContentBuildRecord[]} published
 *   every published article, newest first
 * @returns {import('../../../types/index.d.ts').ContentBuildRecord[]}
 */
export function selectRelatedArticles(record, published) {
  const tags = new Set(record.frontmatter.tags);
  return published
    .filter((other) => other.frontmatter.id !== record.frontmatter.id)
    .map((other, order) => ({
      other,
      order,
      shared: other.frontmatter.tags.filter((tag) => tags.has(tag)).length,
    }))
    .sort((a, b) => b.shared - a.shared || a.order - b.order)
    .slice(0, RELATED_COUNT)
    .map((entry) => entry.other);
}

/**
 * The page head already prints the title as the one `<h1>`; a body that opens
 * with an `<h1>` repeating it would show the title twice, so that leading
 * heading is dropped from the rendered article body.
 *
 * @param {string} body sanitized body HTML
 * @param {string} title the record title
 * @returns {string} the body without a leading `<h1>` that equals the title
 */
function dropLeadingTitleHeading(body, title) {
  const match = /^\s*<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>\s*/i.exec(body);
  if (!match) return body;
  const heading = unescapeHtml(match[1].replace(/<[^>]*>/g, ''));
  return normalizeTitleText(heading) === normalizeTitleText(title)
    ? body.slice(match[0].length)
    : body;
}

/**
 * @param {string} value a title or tagline
 * @returns {string} trimmed, whitespace-collapsed, lower-cased for comparison
 */
function normalizeTitleText(value) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * The home page `<title>`: `<Publication> – <tagline>`, with the tagline cut
 * at a word boundary (and an ellipsis) so the whole stays within
 * {@link HOME_TITLE_MAX} characters; the publication name alone when there is
 * no tagline or too little room for a meaningful one.
 *
 * @param {string} name the publication title
 * @param {string | undefined} tagline the publication description
 * @returns {string} the home page title
 */
export function homeDocumentTitle(name, tagline) {
  const separator = ' \u2013 ';
  const line = (tagline ?? '').replace(/\s+/g, ' ').trim();
  if (!line) return name;
  // A tagline that only repeats the name adds nothing to the title.
  if (normalizeTitleText(line) === normalizeTitleText(name)) return name;
  if (Array.from(`${name}${separator}${line}`).length <= HOME_TITLE_MAX) {
    return `${name}${separator}${line}`;
  }
  const room = HOME_TITLE_MAX - Array.from(`${name}${separator}`).length - 1;
  if (room < 12) return name;
  const clipped = Array.from(line).slice(0, room).join('');
  const cut = /\s/.test(clipped) ? clipped.replace(/\s+\S*$/, '') : clipped;
  return `${name}${separator}${cut.replace(/[\s,;:.\u2013-]+$/, '')}\u2026`;
}

/**
 * Build every generated page (every kind except `error`) from a validated
 * `build-input:2.0.0` instance.
 *
 * @param {import('../../../types/index.d.ts').NormalizedBuildInput} validatedInput
 * @param {object} options rendering options
 * @param {(body: string) => string} options.pageBody turns a body into its
 *   page form (every image naming its media derivatives, lazily loaded)
 * @param {import('./editions.js').EditionResolution} [options.editions] where
 *   each edition sits beside its article; resolved from the build input when
 *   the caller has not already done so
 * @param {readonly {path: string, mediaType: string}[]} [options.mediaAssets]
 *   the media pipeline's finished `assets` list, used to resolve every
 *   image reference (hero, avatar) to its emitted URL; an image with no
 *   processed derivative renders as the placeholder/monogram fallback
 * @param {Readonly<Record<string, {width: number, height: number}>>} [options.mediaDimensions]
 *   the media pipeline's pixel dimensions per derivative path
 * @param {import('../../../types/index.d.ts').InteractionsModule} [options.interactions]
 *   the validated interactions module; when set, every article page carries
 *   the interactions section and is interaction-bearing
 * @param {import('../../../types/index.d.ts').AnalyticsModule} [options.analytics]
 *   the validated analytics module; when set, the Galascribe section of both
 *   policy pages carries the analytics and consent paragraph
 * @param {import('./translations.js').TranslationResolution} [options.translations]
 *   the language-variant resolution (default: resolved from `content`)
 * @param {import('./route.js').RouteNormalizationProfile} [options.routeProfile]
 *   the route normalization profile deciding every emitted page URL's form
 *   (default `directory-index`)
 * @param {unknown} [options.composition] the schema-validated structural
 *   composition selected by the theme; defaults to Editorial only for
 *   theme-less renderer use
 * @returns {GeneratedPage[]} every generated page, in a stable, deterministic
 *   order
 */
export function buildGeneratedPages(validatedInput, options) {
  const { publication, authors, content, basePath, baseUrl } = validatedInput;
  const composition = assertSupportedComposition(
    options.composition ?? EDITORIAL_COMPOSITION,
  );
  /**
   * Preserve every content region while giving each article direction its
   * own reading sequence and semantic container.
   *
   * @param {{head: string, cover: string, toc: string, prose: string, foot: string}} parts
   * @returns {string}
   */
  const articleStructure = ({ head, cover, toc, prose, foot }) => {
    /**
     * @param {string} contents rendered article regions
     * @param {string} [element] semantic wrapper element
     * @returns {string}
     */
    const grid = (contents, element = 'div') =>
      `<${element} class="g-wrap g-article-grid">${contents}</${element}>`;
    if (composition.profile === 'newsletter') {
      return `<section>${head}${cover}${grid(prose + toc, 'section')}${foot}</section>`;
    }
    if (composition.profile === 'visual') {
      return `<div>${cover}${head}${grid(prose + toc)}</div>${foot}`;
    }
    if (composition.profile === 'personal') {
      return `<section>${head}${cover}${grid(prose)}${toc ? grid(toc, 'section') : ''}${foot}</section>`;
    }
    if (composition.profile === 'developer') {
      return `<div>${head}${cover}${grid(toc + prose, 'section')}${foot}</div>`;
    }
    return head + cover + grid(toc + prose) + foot;
  };
  const interactionsModule = interactionsActive(options.interactions)
    ? options.interactions
    : undefined;
  const publicBasePath = derivePublicBasePath(baseUrl, basePath);
  const routeProfile = options.routeProfile ?? 'directory-index';
  const translations =
    options.translations ??
    resolveTranslations(content, publication.defaultLanguage);
  const defaultMessages = getMessages(publication.defaultLanguage);
  let messages = defaultMessages;
  const authorsById = new Map(authors.map((author) => [author.id, author]));
  const editions = options.editions ?? resolveEditions(content, contentRoute);

  /**
   * @param {string} route an un-joined route
   * @returns {string} the `basePath`-joined absolute route
   */
  const site = (route) => joinPublicRoute(publicBasePath, route, routeProfile);
  // Decided once from the site's whole label set, so a segment moves only when
  // the label set does (D8).
  const tagSegments = deriveTagSegments(content);
  const seriesSegments = deriveSeriesSegments(content);
  const tagSegment = (/** @type {string} */ tag) =>
    tagSegments.get(tag) ?? routeSegmentForLabel(tag);
  const seriesSegment = (/** @type {string} */ name) =>
    seriesSegments.get(name) ?? routeSegmentForLabel(name);
  const tagHref = (/** @type {string} */ tag) =>
    site(`/tags/${tagSegment(tag)}`);
  const seriesHref = (/** @type {string} */ series) =>
    site(`/series/${seriesSegment(series)}`);
  const recordHref = (
    /** @type {import('../../../types/index.d.ts').ContentBuildRecord} */ record,
  ) => site(contentRoute(record.frontmatter));
  const authorSlugs = deriveAuthorSlugs(authors);
  const authorRoute = (
    /** @type {import('../../../types/index.d.ts').AuthorNormalized} */ author,
  ) => `/authors/${authorSlugs.get(author.id) ?? author.id}`;
  const authorHref = (
    /** @type {import('../../../types/index.d.ts').AuthorNormalized} */ author,
  ) => site(authorRoute(author));
  const mediaImage = createMediaImage({
    mediaAssets: options.mediaAssets ?? [],
    publicBasePath,
    mediaDimensions: options.mediaDimensions,
  });
  /**
   * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} catalog
   * @returns {ReturnType<typeof createComponents>}
   */
  const createUi = (catalog) =>
    createComponents({
      messages: catalog,
      site,
      mediaImage,
      authorHref,
      authorsById,
      recordHref,
      tagHref,
      // A tag only unlisted posts carry has no listing page: plain text.
      hasTagPage: (tag) => tagSegments.has(tag),
      variantsOf: translations.variantsOf,
      languageLabel: (tag) => languageLabel(tag, translations.languages),
      localizeAuthor: translations.active
        ? (author, record) =>
            localizeAuthor(author, record.frontmatter.language)
        : undefined,
    });
  /** @type {Map<unknown, ReturnType<typeof createUi>>} */
  const uiByCatalog = new Map();
  let ui = createUi(messages);
  uiByCatalog.set(messages, ui);
  let { text, call, chip, langChips, byline, card, avatar } = ui;
  /**
   * Render the following pages' chrome strings in a page's own language: its
   * catalog when it has one, else the site's.
   *
   * @param {string} language a BCP-47 tag
   */
  const useChrome = (language) => {
    // Per-page catalogs apply only to sites with language variants.
    messages = getMessages(
      translations.active ? language : publication.defaultLanguage,
    );
    ui = uiByCatalog.get(messages) ?? createUi(messages);
    uiByCatalog.set(messages, ui);
    ({ text, call, chip, langChips, byline, card, avatar } = ui);
    homeStep = {
      label: /** @type {string} */ (messages.homeLinkLabel),
      route: site('/'),
    };
  };

  const msg = (/** @type {string} */ key, /** @type {string[]} */ ...args) =>
    /** @type {(...a: string[]) => string} */ (messages[key])(...args);
  const publicationTitle = publication.title;
  /**
   * @param {string} name a bare page name
   * @returns {string} `<Page> | <Publication>`
   */
  const documentTitleOf = (name) => `${name} | ${publicationTitle}`;
  const absolute = (/** @type {string} */ joinedRoute) =>
    new URL(joinedRoute, baseUrl).toString();
  const absoluteImage = (
    /** @type {{path: string, sourceDigest: string} | undefined} */ ref,
  ) => {
    const image = mediaImage(ref);
    return image ? { ...image, url: absolute(image.url) } : undefined;
  };
  const sd = createStructuredData({
    publication,
    absolute,
    brandMark: absoluteImage(validatedInput.appearance.brandMark),
    // The ids hang off the public site root, base path included.
    siteUrl: absolute(site('/')),
    sameAs: publication.socialLinks.flatMap((entry) => {
      const uri = /** @type {Record<string, unknown>} */ (entry)?.uri;
      return typeof uri === 'string' ? [uri] : [];
    }),
  });
  /** The publication-default social image and its alt, when one is set. */
  const defaultSocial = publication.defaultImage
    ? {
        socialImageRef: publication.defaultImage,
        socialImageAlt: publicationTitle,
      }
    : {};
  /**
   * @param {import('../../../types/index.d.ts').ContentBuildRecord} record
   * @returns {{socialImageRef?: {path: string, sourceDigest: string}, socialImageAlt?: string}}
   */
  const socialOfContent = (record) => {
    const fm = record.frontmatter;
    const media = cardMediaOf(record);
    return fm.socialImage
      ? { socialImageRef: fm.socialImage, socialImageAlt: fm.title }
      : media
        ? {
            socialImageRef: media.file,
            socialImageAlt:
              media.role === 'informative' && media.alt ? media.alt : fm.title,
          }
        : defaultSocial;
  };
  /**
   * @param {import('../../../types/index.d.ts').ContentBuildRecord} record
   * @returns {string} the page description: `seo.description`, else the
   *   subtitle, else the body's opening words (heading text skipped)
   */
  const contentDescription = (record) =>
    record.frontmatter.seo?.description ||
    record.frontmatter.description ||
    // Heading text is not a sentence: skip it for the fallback. A body of
    // headings only falls back to the whole text, then to the site's own
    // description, so no page is left without a meta description.
    truncateAtWord(
      plainText(record.body.replace(/<h[1-6][\s>][\s\S]*?<\/h[1-6]>/gi, ' ')) ||
        plainText(record.body),
      DESCRIPTION_MAX,
    ) ||
    truncateAtWord(publication.description, DESCRIPTION_MAX) ||
    record.frontmatter.title;

  const text0 = (/** @type {string} */ key) =>
    /** @type {string} */ (messages[key]);
  let homeStep = {
    label: /** @type {string} */ (messages.homeLinkLabel),
    route: site('/'),
  };
  const crumbs = (
    /** @type {import('./skeleton.js').BreadcrumbStep[][]} */ ...groups
  ) => renderBreadcrumbs({ trail: [homeStep, ...groups.flat()], messages });

  // A group of language variants is listed once, by its primary.
  const allPublishedArticles = selectPublishedArticles(content);
  const publishedArticles = allPublishedArticles.filter(translations.isListed);
  /**
   * The articles a page's pager and "Keep reading" draw from: the listed
   * ones, each in the page's own language when its group has a variant in it.
   *
   * @param {import('../../../types/index.d.ts').ContentBuildRecord} record
   * @returns {import('../../../types/index.d.ts').ContentBuildRecord[]}
   */
  const poolFor = (record) => {
    if (!translations.active) return publishedArticles;
    return publishedArticles.map((listed) =>
      variantIn(listed, record.frontmatter.language),
    );
  };
  /**
   * @param {import('../../../types/index.d.ts').ContentBuildRecord} listed a listed record
   * @param {string} language a BCP-47 tag
   * @returns {import('../../../types/index.d.ts').ContentBuildRecord} the
   *   group's variant in that language, else the listed record itself
   */
  function variantIn(listed, language) {
    const wanted = language.toLowerCase();
    return (
      translations
        .variantsOf(listed)
        .find((v) => v.frontmatter.language.toLowerCase() === wanted) ?? listed
    );
  }
  // A tag or series carried by any member of a group lists the group (shown
  // by its primary).
  /**
   * @param {import('../../../types/index.d.ts').ContentBuildRecord} r
   * @param {(f: import('../../../types/index.d.ts').ContentFrontmatterNormalized) => readonly string[]} pick
   * @returns {string[]}
   */
  const unionOf = (r, pick) => [
    ...new Set(translations.variantsOf(r).flatMap((v) => pick(v.frontmatter))),
  ];
  const byTag = groupBy(publishedArticles, (r) => unionOf(r, (f) => f.tags));
  const bySeries = groupBy(
    content.filter(
      (r) =>
        r.frontmatter.kind !== 'edition' &&
        r.frontmatter.status === 'published' &&
        translations.isListed(r),
    ),
    (r) => unionOf(r, (f) => (f.series ? [f.series] : [])),
  );
  /**
   * @param {import('../../../types/index.d.ts').ContentBuildRecord} r
   * @param {string} name
   * @returns {number}
   */
  const seriesOrderIn = (r, name) =>
    translations
      .variantsOf(r)
      .find((v) => v.frontmatter.series === name && v.frontmatter.seriesOrder)
      ?.frontmatter.seriesOrder ?? 0;
  for (const [name, bucket] of bySeries) {
    bucket.sort((a, b) => seriesOrderIn(a, name) - seriesOrderIn(b, name));
  }
  /**
   * The members of a series as the given record's language shows them.
   *
   * @param {string | undefined} series
   * @param {import('../../../types/index.d.ts').ContentBuildRecord} record
   * @returns {import('../../../types/index.d.ts').ContentBuildRecord[] | undefined}
   */
  const seriesMembersFor = (series, record) =>
    series
      ? bySeries
          .get(series)
          ?.map((member) => variantIn(member, record.frontmatter.language))
      : undefined;
  const sortedTags = [...byTag.keys()].sort();
  const sortedSeries = [...bySeries.keys()].sort();
  const byYear = groupBy(publishedArticles, (r) => [
    r.frontmatter.publishedAt.slice(0, 4),
  ]);
  const sortedYears = [...byYear.keys()].sort().reverse();

  /**
   * @param {import('../../../types/index.d.ts').ContentBuildRecord} record
   * @returns {string | undefined} "Part N of M" when the record is a
   *   published member of its series
   */
  const partLabelOf = (record) => {
    const series = record.frontmatter.series;
    const members = seriesMembersFor(series, record);
    const index = members ? members.indexOf(record) : -1;
    return members && index >= 0
      ? /** @type {(a: string, b: string) => string} */ (
          messages.seriesPartLabel
        )(String(index + 1), String(members.length))
      : undefined;
  };
  /**
   * @param {import('../../../types/index.d.ts').ContentBuildRecord} record
   * @param {'grid' | 'row'} [variant]
   * @param {number} [headingLevel] the title's heading level
   * @returns {string}
   */
  const cardOf = (record, variant = 'grid', headingLevel = 3) =>
    card(record, { partLabel: partLabelOf(record), headingLevel }, variant);

  /**
   * @param {string} href
   * @param {string} label
   * @param {number | undefined} count
   * @param {string} iconName
   * @param {boolean} [current]
   * @returns {string}
   */
  const pill = (href, label, count, iconName, current = false) =>
    `<li><a class="g-pill" href="${escapeHtml(href)}"${current ? ' aria-current="page"' : ''}>${icon(iconName)}` +
    `<span>${escapeHtml(label)}</span>` +
    (count === undefined ? '' : `<span class="g-pill-count">${count}</span>`) +
    `</a></li>`;
  /**
   * @param {string} [currentTag]
   * @returns {string}
   */
  const tagPills = (currentTag = '') =>
    `<ul class="g-pills">${sortedTags
      .map((tag) =>
        pill(
          tagHref(tag),
          tag,
          byTag.get(tag)?.length,
          'hash',
          tag === currentTag,
        ),
      )
      .join('')}</ul>`;

  /**
   * The header block shared by tag, series, archive and author pages and
   * their root listings.
   *
   * @param {object} head
   * @param {string} head.breadcrumbHtml
   * @param {string} head.kicker the label before the count
   * @param {number | undefined} head.count article count
   * @param {string} head.title the page's `<h1>` text
   * @param {string} [head.descriptionHtml] already-rendered intro markup
   * @param {string} [head.markHtml] a leading avatar instead of an icon
   * @param {string} [head.iconName]
   * @param {string} [head.extraHtml] markup after the intro (pills)
   * @returns {string}
   */
  const listingHead = ({
    breadcrumbHtml,
    kicker,
    count,
    title,
    descriptionHtml = '',
    markHtml,
    iconName = 'hash',
    extraHtml = '',
  }) =>
    `<section class="g-wrap g-topic-hero">${breadcrumbHtml}` +
    `<div class="g-topic-head"><span class="g-topic-icon">${markHtml ?? icon(iconName)}</span>` +
    `<div><p class="g-label">${escapeHtml(kicker)}` +
    (count === undefined
      ? ''
      : `<span class="g-dot" aria-hidden="true"></span>${call('articleCountLabel', String(count))}`) +
    `</p><h1>${escapeHtml(title)}</h1></div></div>` +
    descriptionHtml +
    extraHtml +
    `</section>`;

  /**
   * @param {readonly import('../../../types/index.d.ts').ContentBuildRecord[]} items
   * @param {string} [afterHtml] markup after the list (pagination)
   * @returns {string}
   */
  const rowList = (items, afterHtml = '') => {
    const grid = composition.listingLayout === 'image-grid';
    const issueCards = composition.listingLayout === 'issues';
    const datedRows = composition.listingLayout === 'dated-rows';
    const outer =
      composition.profile === 'personal' || composition.profile === 'developer'
        ? 'div'
        : 'section';
    const contents =
      items.length > 0
        ? datedRows
          ? `<div class="g-list g-dated-list">${items
              .map(
                (record) =>
                  `<div class="g-dated-row"><time class="g-date-stamp" datetime="${escapeHtml(record.frontmatter.publishedAt)}">` +
                  `${call('formatDate', record.frontmatter.publishedAt)}</time>${cardOf(record, 'row', 2)}</div>`,
              )
              .join('')}</div>`
          : `<div class="${grid ? 'g-grid' : 'g-list'}">${items
              .map((record) =>
                cardOf(record, grid || issueCards ? 'grid' : 'row', 2),
              )
              .join('')}</div>`
        : `<p>${text('emptyListingLabel')}</p>`;
    return `<${outer} class="g-wrap g-section" data-gala-listing-layout="${composition.listingLayout}">${contents}${afterHtml}</${outer}>`;
  };

  /**
   * One listing page's metadata: bare title, `<title>`, description,
   * social image and JSON-LD.
   *
   * @param {object} spec
   * @param {string} spec.name the bare page name
   * @param {string} spec.description the meta description
   * @param {string} spec.route the un-joined route
   * @param {readonly {label: string, route?: string}[]} [spec.parents]
   *   breadcrumb steps between home and this page (joined routes)
   * @param {string} [spec.language] the page's language (default: the
   *   publication's)
   * @returns {Pick<GeneratedPage, 'title' | 'documentTitle' | 'description' | 'ogType' | 'socialImageRef' | 'socialImageAlt' | 'jsonLd'>}
   */
  const listingMeta = ({
    name,
    description,
    route,
    parents = [],
    language = publication.defaultLanguage,
  }) => ({
    title: name,
    documentTitle: documentTitleOf(name),
    description,
    ogType: 'website',
    ...defaultSocial,
    jsonLd: sd.serialize(
      sd.collection({
        name,
        description,
        url: absolute(site(route)),
        language,
        trail: [homeStep, ...parents, { label: name, route: site(route) }],
      }),
    ),
  });

  const newsletterHtml = renderNewsletterPanel({
    newsletter: publication.newsletter,
    messages,
  });

  /** @type {GeneratedPage[]} */
  const pages = [];

  if (publication.profile) {
    pages.push({
      kind: 'profile',
      route: publication.profile.route,
      title: publication.title,
      documentTitle: documentTitleOf(text0('aboutPageTitle')),
      language: publication.defaultLanguage,
      description: publication.description,
      ogType: 'website',
      ...defaultSocial,
      jsonLd: sd.serialize(
        sd.webPage({
          name: publication.title,
          description: publication.description,
          url: absolute(site(publication.profile.route)),
          language: publication.defaultLanguage,
          trail: [
            homeStep,
            {
              label: text0('aboutPageTitle'),
              route: site(publication.profile.route),
            },
          ],
        }),
      ),
      bodyHtml:
        `<article class="g-article"><div class="g-wrap g-article-head">` +
        `<h1>${escapeHtml(publication.title)}</h1></div>` +
        `<div class="g-wrap g-article-grid"><div class="g-prose">${options.pageBody(publication.profile.body.body)}</div></div></article>`,
    });
  }

  const galascribeSection = renderGalascribeSection({
    publicationName: publication.title,
    authoredText: validatedInput.policies !== undefined,
    interactionsOn: Boolean(interactionsModule),
    analytics: options.analytics,
  });
  for (const policy of resolvePolicyPages(validatedInput.policies)) {
    pages.push({
      kind: 'policy',
      route: policy.route,
      title: policy.title,
      documentTitle: documentTitleOf(policy.title),
      language: publication.defaultLanguage,
      description: publication.description,
      robotsContent: 'index, follow',
      ...defaultSocial,
      jsonLd: sd.serialize(
        sd.webPage({
          name: policy.title,
          description: publication.description,
          url: absolute(site(policy.route)),
          language: publication.defaultLanguage,
          trail: [homeStep, { label: policy.title, route: site(policy.route) }],
        }),
      ),
      // The title is the one `<h1>`; the site's own text goes in as an
      // article or page body does, then the template-owned section.
      bodyHtml:
        `<article class="g-article"><div class="g-wrap g-article-head">${crumbs([{ label: policy.title }])}` +
        `<h1>${escapeHtml(policy.title)}</h1></div>` +
        `<div class="g-wrap g-article-grid"><div class="g-prose">` +
        options.pageBody(dropLeadingTitleHeading(policy.body, policy.title)) +
        `${galascribeSection}</div></div></article>`,
    });
  }

  for (const author of authors) {
    const authored = publishedArticles.filter((record) =>
      translations
        .variantsOf(record)
        .some((variant) => variant.frontmatter.authorIds.includes(author.id)),
    );
    const links =
      author.links.length > 0
        ? `<ul class="g-social">${author.links
            .map((link) => {
              const label = escapeHtml(link.label ?? link.uri);
              return `<li><a class="g-icon-btn" href="${escapeHtml(link.uri)}" aria-label="${label}" title="${label}">${icon('upright')}</a></li>`;
            })
            .join('')}</ul>`
        : '';
    const intro =
      (author.pronouns
        ? `<p class="g-label">${escapeHtml(author.pronouns)}</p>`
        : '') +
      (author.biography
        ? `<p class="g-dek">${escapeHtml(author.biography)}</p>`
        : '') +
      links;
    const authorHead = listingHead({
      breadcrumbHtml: crumbs(
        [{ label: /** @type {string} */ (messages.authorsSectionLabel) }],
        [{ label: author.displayName }],
      ),
      kicker: /** @type {string} */ (messages.authorKickerLabel),
      count: authored.length,
      title: author.displayName,
      descriptionHtml: intro,
      markHtml: avatar(author),
    });
    const authoredList = rowList(authored);
    const authorContents =
      composition.profile === 'newsletter'
        ? `<section>${authorHead}${authoredList}</section>`
        : composition.profile === 'visual'
          ? `<div>${authorHead}<section>${authoredList}</section></div>`
          : composition.profile === 'personal'
            ? `<section>${authorHead}<div>${authoredList}</div></section>`
            : composition.profile === 'developer'
              ? `<div>${authorHead}<div>${authoredList}</div></div>`
              : authorHead + authoredList;
    pages.push({
      kind: 'author',
      route: authorRoute(author),
      title: author.displayName,
      documentTitle: documentTitleOf(author.displayName),
      language: publication.defaultLanguage,
      description:
        truncateAtWord(author.biography, DESCRIPTION_MAX) ||
        msg('authorPageDescription', author.displayName, publicationTitle),
      ogType: 'profile',
      lastModified: latestContentTimestamp(authored),
      ...(author.avatar
        ? {
            socialImageRef: author.avatar,
            socialImageAlt: author.displayName,
          }
        : defaultSocial),
      jsonLd: sd.serialize(
        sd.profile({
          name: author.displayName,
          description: author.biography || undefined,
          url: absolute(authorHref(author)),
          language: publication.defaultLanguage,
          image: absoluteImage(author.avatar),
          sameAs: author.links.map((link) => link.uri),
        }),
      ),
      bodyHtml:
        `<div data-gala-author-layout="${composition.authorLayout}">` +
        authorContents +
        `</div>`,
    });
  }

  /**
   * @param {import('../../../types/index.d.ts').ContentBuildRecord} record
   * @returns {{alternates?: {language: string, route: string}[], variants?: {language: string, route: string}[], xDefaultRoute?: string}}
   */
  const alternatesOf = (record) => {
    const group = translations.groupOf.get(record);
    if (
      !group ||
      group.members.length < 2 ||
      record.frontmatter.kind !== 'article'
    ) {
      return {};
    }
    const routed = (/** @type {typeof group.members} */ members) =>
      members.map((member) => ({
        language: member.frontmatter.language,
        route: contentRoute(member.frontmatter),
      }));
    // Alternates must be reciprocal: a `seo.noindex` member neither carries
    // nor receives them.
    const indexable = group.members.filter(
      (member) => !isSeoNoindex(member.frontmatter),
    );
    return {
      variants: routed(group.members),
      ...(isSeoNoindex(record.frontmatter) || indexable.length < 2
        ? {}
        : {
            alternates: routed(indexable),
            ...(isSeoNoindex(group.primary.frontmatter)
              ? {}
              : { xDefaultRoute: contentRoute(group.primary.frontmatter) }),
          }),
    };
  };
  for (const record of content) {
    const { frontmatter } = record;
    useChrome(frontmatter.language);
    const isArticle = frontmatter.kind === 'article';
    // An edition restates `original`; a document that is not one is its own.
    const edition = editions.byRecord.get(record);
    const isEdition = edition !== undefined;
    const original = edition?.original ?? record;
    // An edition with no cover of its own wears its article's.
    const heroMedia = isEdition
      ? (frontmatter.hero ?? original.frontmatter.hero)
      : frontmatter.hero;
    const hero = mediaImage(heroMedia?.file);
    const headings = extractH2Headings(record.body);
    const contents =
      headings.length >= CONTENTS_MIN_HEADINGS
        ? `<ol class="g-toc-list">${headings
            .map(
              (heading) =>
                `<li><a href="#${escapeHtml(heading.id)}" data-toc="${escapeHtml(heading.id)}">${escapeHtml(heading.text)}</a></li>`,
            )
            .join('')}</ol>`
        : '';
    const firstTag = original.frontmatter.tags[0];
    const trail = [
      ...((isArticle || isEdition) && firstTag && tagSegments.has(firstTag)
        ? [{ label: firstTag, route: tagHref(firstTag) }]
        : []),
      ...(edition
        ? [
            { label: original.frontmatter.title, route: recordHref(original) },
            { label: editionKindLabel(edition.kind, messages) },
          ]
        : [{ label: frontmatter.title }]),
    ];
    const partLabel = partLabelOf(record);
    const series = frontmatter.series;
    const seriesTag = series
      ? `<a class="g-series-tag" href="${escapeHtml(seriesHref(series))}">${icon('book')}` +
        (partLabel
          ? `${escapeHtml(partLabel)}<span class="g-dot" aria-hidden="true"></span>`
          : '') +
        `${escapeHtml(series)}</a>`
      : '';
    // The post's canonical URL, as the page's own canonical link names it.
    const share = renderShareGroup({
      sharing: publication.sharing,
      title: frontmatter.title,
      url: frontmatter.seo?.canonicalUrl || absolute(recordHref(record)),
      messages,
    });
    // The article and each of its editions offer the same selector.
    const editionSelector = renderEditionSelector({
      messages,
      originalHref: recordHref(original),
      entries: listedEditions(editions.byOriginal.get(original), edition),
      current: edition,
      site,
    });
    const head =
      `<div class="g-wrap g-article-head">${renderBreadcrumbs({ trail: [homeStep, ...trail], messages })}` +
      (isArticle
        ? `<div class="g-article-labels">${firstTag ? chip(firstTag) : ''}${seriesTag}</div>`
        : '') +
      `<h1>${escapeHtml(frontmatter.title)}</h1>` +
      (frontmatter.description
        ? `<p class="g-dek">${escapeHtml(frontmatter.description)}</p>`
        : '') +
      (isArticle || isEdition
        ? `<div class="g-article-meta">${byline(record, true)}${isArticle ? langChips(record) : ''}${isArticle ? share : ''}</div>`
        : '') +
      editionSelector +
      `</div>`;
    const cover = hero
      ? `<figure class="${composition.articleLayout === 'full-bleed' ? 'g-article-cover g-article-cover-full-bleed' : 'g-wrap g-article-cover'}">${renderImage({ image: hero, alt: heroMedia?.role === 'decorative' ? '' : (heroMedia?.alt ?? ''), priority: true })}</figure>`
      : '';
    const tocNav = contents
      ? `<nav class="g-toc" aria-label="${text('onThisPageLabel')}"><p class="g-label">${icon('list')}${text('onThisPageLabel')}</p>${contents}</nav>`
      : '';
    const tocMobile = contents
      ? `<details class="g-toc-mobile"><summary>${icon('list')}${text('onThisPageLabel')}</summary>${contents}</details>`
      : '';
    const tags =
      isArticle && frontmatter.tags.length > 0
        ? `<ul class="g-tags" aria-label="${text('tagListLabel')}">${frontmatter.tags
            .map((tag) =>
              tagSegments.has(tag)
                ? `<li><a class="g-tag" href="${escapeHtml(tagHref(tag))}">${icon('hash')}${escapeHtml(tag)}</a></li>`
                : `<li><span class="g-tag">${icon('hash')}${escapeHtml(tag)}</span></li>`,
            )
            .join('')}</ul>`
        : '';
    const prose =
      `<div class="g-prose">${tocMobile}` +
      renderSlot('article-preamble') +
      options.pageBody(
        dropLeadingTitleHeading(record.body, frontmatter.title),
      ) +
      tags +
      renderSlot('article-end') +
      renderSlot('article-footer-ad', { collapsed: true }) +
      `</div>`;

    let foot = '';
    let after = '';
    let interactions = '';
    if (isArticle) {
      const authorCards = ui
        .recordAuthors(record)
        .map(
          (author) =>
            `<section class="g-author-card" aria-label="${text('aboutTheAuthorLabel')}">${avatar(author)}<div>` +
            `<p class="g-label">${text('writtenByLabel')}</p>` +
            `<p class="g-author-name"><a href="${escapeHtml(authorHref(author))}">${escapeHtml(author.displayName)}</a></p>` +
            (author.biography
              ? `<p class="g-author-bio">${escapeHtml(author.biography)}</p>`
              : '') +
            `</div></section>`,
        )
        .join('');
      const members = seriesMembersFor(series, record);
      const seriesBox =
        series && members && members.includes(record)
          ? `<section class="g-series-box" aria-label="${escapeHtml(series)}"><p class="g-label">${icon('book')}${escapeHtml(series)}</p><ol class="g-series-list">` +
            members
              .map((member, index) => {
                const here = member === record;
                return (
                  `<li${here ? ' aria-current="true"' : ''}><a href="${escapeHtml(recordHref(member))}">` +
                  `<span class="g-series-n">${index + 1}</span><span>${escapeHtml(member.frontmatter.title)}</span>` +
                  (here
                    ? `<span class="g-series-here">${text('youAreHereLabel')}</span>`
                    : '') +
                  `</a></li>`
                );
              })
              .join('') +
            `</ol></section>`
          : '';
      const pool = poolFor(record);
      const position = pool.indexOf(record);
      const newer = position > 0 ? pool[position - 1] : undefined;
      const older = position >= 0 ? pool[position + 1] : undefined;
      const pagerLink = (
        /** @type {import('../../../types/index.d.ts').ContentBuildRecord} */ target,
        /** @type {boolean} */ isOlder,
      ) =>
        `<a class="g-pager-link${isOlder ? ' g-pager-next' : ''}" rel="${isOlder ? 'next' : 'prev'}" href="${escapeHtml(recordHref(target))}">` +
        `<span class="g-label">${isOlder ? `${text('olderArticleLabel')}${icon('arrow')}` : `${icon('back')}${text('newerArticleLabel')}`}</span>` +
        `<span>${escapeHtml(target.frontmatter.title)}</span></a>`;
      const pager =
        newer || older
          ? `<nav class="g-pager" aria-label="${text('moreArticlesNavigationLabel')}">${newer ? pagerLink(newer, false) : ''}${older ? pagerLink(older, true) : ''}</nav>`
          : '';
      interactions = interactionsModule
        ? renderInteractionsSection({
            module: interactionsModule,
            messages,
            publicationId: publication.id,
            contentId: frontmatter.id,
            canonicalUrl: absolute(recordHref(record)),
          })
        : '';
      foot = `<div class="g-wrap g-article-foot">${authorCards}${interactions}${seriesBox}${pager}</div>`;
      const related = selectRelatedArticles(record, poolFor(record));
      after =
        related.length > 0
          ? `<section class="g-wrap g-section" aria-labelledby="related-title"><div class="g-section-head">` +
            `<h2 id="related-title">${text('keepReadingHeading')}</h2>` +
            (firstTag && tagSegments.has(firstTag)
              ? `<a class="g-more" href="${escapeHtml(tagHref(firstTag))}">${call('moreInTagLabel', firstTag)}${icon('arrow')}</a>`
              : '') +
            `</div><div class="g-grid">${related.map((r) => cardOf(r)).join('')}</div></section>`
          : '';
    }
    // An edition keeps its own title and canonicalises to its article, so only
    // `seo.description` applies to it.
    const seoTitle = isEdition
      ? undefined
      : frontmatter.seo?.title || undefined;
    const seoCanonical = isEdition
      ? undefined
      : frontmatter.seo?.canonicalUrl || undefined;
    const ownUrl = absolute(recordHref(record));
    // JSON-LD names the same URL the canonical link does.
    const graphUrl = seoCanonical ?? ownUrl;
    const recordAuthors = ui.recordAuthors(record);
    const articleTrail = [
      homeStep,
      ...trail.slice(0, -1),
      {
        label: trail.at(-1)?.label ?? frontmatter.title,
        route: recordHref(record),
      },
    ];
    // An edition with no social image of its own shares its article's.
    const social = socialOfContent(
      isEdition && !frontmatter.socialImage && !frontmatter.hero
        ? original
        : record,
    );
    const articleGraph = isArticle
      ? sd.article({
          url: graphUrl,
          headline: frontmatter.title,
          description: contentDescription(record),
          image: absoluteImage(socialOfContent(record).socialImageRef),
          datePublished: frontmatter.publishedAt,
          dateModified: contentLastModified(frontmatter),
          language: frontmatter.language,
          authors: recordAuthors.map((author) => ({
            name: author.displayName,
            url: absolute(authorHref(author)),
            sameAs: author.links.map((link) => link.uri),
          })),
          tags: frontmatter.tags,
          series: series
            ? { name: series, url: absolute(seriesHref(series)) }
            : undefined,
          trail: articleTrail,
        })
      : sd.webPage({
          name: frontmatter.title,
          description: contentDescription(record),
          url: graphUrl,
          language: frontmatter.language,
          trail: articleTrail,
          dateModified: contentLastModified(frontmatter),
        });
    pages.push({
      // An edition is an article page for the page-kind hook.
      kind: frontmatter.kind === 'edition' ? 'article' : frontmatter.kind,
      route: contentRoute(frontmatter),
      canonicalRoute: edition ? contentRoute(original.frontmatter) : undefined,
      title: frontmatter.title,
      documentTitle: documentTitleOf(
        edition
          ? msg(
              'editionPageTitle',
              frontmatter.title,
              editionKindLabel(edition.kind, messages),
            )
          : (seoTitle ?? frontmatter.title),
      ),
      socialTitle: seoTitle,
      canonicalUrl: seoCanonical,
      language: frontmatter.language,
      ...alternatesOf(record),
      description: contentDescription(record),
      ogType: isArticle || isEdition ? 'article' : 'website',
      ...social,
      jsonLd: sd.serialize(articleGraph),
      articleMeta: isArticle
        ? {
            publishedTime: frontmatter.publishedAt,
            modifiedTime: frontmatter.updatedAt,
            authorUrls: recordAuthors.map((author) =>
              absolute(authorHref(author)),
            ),
            tags: [...frontmatter.tags],
          }
        : undefined,
      // An edition is never indexed: its article is the reference.
      robotsContent:
        isEdition ||
        frontmatter.status === 'unlisted' ||
        isSeoNoindex(frontmatter)
          ? 'noindex, follow'
          : undefined,
      interactionBearing: Boolean(interactions),
      lastModified: contentLastModified(frontmatter),
      bodyHtml:
        `<article class="g-article" data-gala-article-layout="${composition.articleLayout}">${isArticle || isEdition ? '<div class="g-progress" aria-hidden="true"></div>' : ''}` +
        `${articleStructure({ head, cover, toc: tocNav, prose, foot })}</article>` +
        after +
        (isArticle ? newsletterHtml : ''),
    });
  }

  useChrome(publication.defaultLanguage);

  // Index: page 1 is the home page (featured, tag pills, latest cards, series
  // card, newsletter); every index page carries a slice of the older
  // articles with pagination.
  const [featured, ...rest] = publishedArticles;
  const latest = rest.slice(0, LATEST_CARD_COUNT);
  const older = rest.slice(LATEST_CARD_COUNT);
  const indexPages = paginate(older, LISTING_PAGE_SIZE);
  const indexRoute = (/** @type {number} */ n) =>
    site(n === 1 ? '/' : `/page/${n}`);
  const seriesName = publishedArticles.find((r) => r.frontmatter.series)
    ?.frontmatter.series;
  const seriesParts = (seriesName ? bySeries.get(seriesName) : undefined) ?? [];
  const homeFeatured = featured
    ? (() => {
        const fm = featured.frontmatter;
        const cardMedia = cardMediaOf(featured);
        const hero = mediaImage(cardMedia?.file);
        const href = escapeHtml(recordHref(featured));
        return (
          `<section class="g-wrap g-hero" aria-labelledby="hero-title">` +
          `<div class="g-hero-media">` +
          (hero
            ? renderImage({
                image: hero,
                alt:
                  cardMedia?.role === 'decorative'
                    ? ''
                    : (cardMedia?.alt ?? ''),
                priority: true,
              })
            : `<span class="g-card-placeholder">${icon('sparkle')}</span>`) +
          `</div><div class="g-hero-body"><p class="g-eyebrow"><span class="g-badge">${icon('sparkle')}${text('featuredLabel')}</span>` +
          (fm.tags[0] ? chip(fm.tags[0]) : '') +
          langChips(featured) +
          `</p><h2 id="hero-title"><a href="${href}">${escapeHtml(fm.title)}</a></h2>` +
          (fm.description
            ? `<p class="g-dek">${escapeHtml(fm.description)}</p>`
            : '') +
          byline(featured) +
          `<a class="g-btn" href="${href}">${text('readEssayLabel')}${icon('arrow')}</a></div></section>`
        );
      })()
    : `<section class="g-wrap g-topic-hero"><h2>${text('indexHeading')}</h2><p>${text('emptyListingLabel')}</p></section>`;
  const homeHeading = `<h1 class="g-sr">${escapeHtml(publicationTitle)}</h1>`;
  const homeTags =
    sortedTags.length > 0
      ? `<section class="g-wrap g-topic-strip" aria-label="${text('browseByTagLabel')}"><ul class="g-pills">${[
          ...sortedTags,
        ]
          .sort(
            (a, b) =>
              (byTag.get(b)?.length ?? 0) - (byTag.get(a)?.length ?? 0) ||
              (a < b ? -1 : 1),
          )
          .slice(0, HOME_TAG_PILL_LIMIT)
          .map((tag) => pill(tagHref(tag), tag, byTag.get(tag)?.length, 'hash'))
          .join('')}</ul></section>`
      : '';
  const homeLatest =
    latest.length > 0
      ? `<section class="g-wrap g-section" aria-labelledby="latest-title"><div class="g-section-head"><h2 id="latest-title">${text('latestHeading')}</h2>` +
        `<a class="g-more" href="${escapeHtml(site('/archive'))}">${text('archiveSectionLabel')}${icon('arrow')}</a></div>` +
        `<div class="g-grid">${latest.map((r) => cardOf(r)).join('')}</div></section>`
      : '';
  const homeSeries =
    seriesName && seriesParts.length > 0
      ? `<section class="g-wrap g-section"><div class="g-series-card">` +
        `<p class="g-label">${icon('book')}${text('seriesCardLabel')}<span class="g-dot" aria-hidden="true"></span>${call('partsCountLabel', String(seriesParts.length))}</p>` +
        `<h2><a href="${escapeHtml(seriesHref(seriesName))}">${escapeHtml(seriesName)}</a></h2>` +
        `<ol class="g-series-list">${seriesParts
          .map(
            (member, index) =>
              `<li><a href="${escapeHtml(recordHref(member))}"><span class="g-series-n">${index + 1}</span><span>${escapeHtml(member.frontmatter.title)}</span></a></li>`,
          )
          .join('')}</ol>` +
        `<a class="g-btn" href="${escapeHtml(recordHref(seriesParts[0]))}">${text('startSeriesLabel')}${icon('arrow')}</a></div></section>`
      : '';
  indexPages.forEach((items, pageIndex) => {
    const pageNumber = pageIndex + 1;
    const pagination = renderPagination({
      currentPage: pageNumber,
      totalPages: indexPages.length,
      routeForPage: indexRoute,
      messages,
    });
    const moreList =
      items.length > 0
        ? `<section class="g-wrap g-section"><div class="g-section-head"><h2>${text('moreArticlesHeading')}</h2></div>` +
          `<div class="g-list">${items.map((r) => cardOf(r, 'row')).join('')}</div>${pagination}</section>`
        : '';
    const homeParts =
      composition.profile === 'newsletter'
        ? homeHeading +
          homeTags +
          homeFeatured +
          homeLatest +
          moreList +
          homeSeries +
          newsletterHtml
        : composition.profile === 'visual'
          ? homeHeading +
            homeFeatured +
            homeLatest +
            homeSeries +
            homeTags +
            moreList +
            newsletterHtml
          : composition.profile === 'personal'
            ? homeHeading +
              homeLatest +
              homeFeatured +
              moreList +
              homeTags +
              homeSeries +
              newsletterHtml
            : composition.profile === 'developer'
              ? homeHeading +
                homeTags +
                homeLatest +
                homeSeries +
                homeFeatured +
                moreList +
                newsletterHtml
              : homeHeading +
                homeFeatured +
                homeTags +
                homeLatest +
                homeSeries +
                moreList +
                newsletterHtml;
    const bodyHtml =
      pageNumber === 1
        ? `<div data-gala-home-layout="${composition.homeLayout}">${homeParts}</div>`
        : listingHead({
            breadcrumbHtml: crumbs([
              { label: /** @type {string} */ (messages.indexHeading) },
            ]),
            kicker: /** @type {(c: string, t: string) => string} */ (
              messages.pageStatusLabel
            )(String(pageNumber), String(indexPages.length)),
            count: undefined,
            title: /** @type {string} */ (messages.indexHeading),
            iconName: 'layers',
          }) + rowList(items, pagination);
    const indexTitle =
      pageNumber === 1
        ? publicationTitle
        : `${text0('indexHeading')} \u2013 ${msg('pageStatusLabel', String(pageNumber), String(indexPages.length))}`;
    const indexUrl = absolute(indexRoute(pageNumber));
    pages.push({
      kind: 'index',
      route: pageNumber === 1 ? '/' : `/page/${pageNumber}`,
      title: indexTitle,
      documentTitle:
        pageNumber === 1
          ? homeDocumentTitle(publicationTitle, publication.description)
          : documentTitleOf(indexTitle),
      language: publication.defaultLanguage,
      description:
        pageNumber === 1
          ? publication.description
          : msg('indexPageDescription', publicationTitle),
      ogType: 'website',
      ...defaultSocial,
      jsonLd: sd.serialize(
        pageNumber === 1
          ? sd.home({
              posts: publishedArticles.slice(0, 10).map((record) => ({
                url: absolute(recordHref(record)),
                headline: record.frontmatter.title,
                datePublished: record.frontmatter.publishedAt,
              })),
            })
          : sd.collection({
              name: indexTitle,
              description: msg('indexPageDescription', publicationTitle),
              url: indexUrl,
              language: publication.defaultLanguage,
              trail: [
                homeStep,
                { label: indexTitle, route: indexRoute(pageNumber) },
              ],
            }),
      ),
      lastModified: latestContentTimestamp(
        pageNumber === 1
          ? publishedArticles.slice(0, 1 + LATEST_CARD_COUNT)
          : items,
      ),
      bodyHtml,
    });
  });

  if (sortedTags.length > 0) {
    pages.push({
      kind: 'tag',
      route: '/tags',
      ...listingMeta({
        name: text0('tagsSectionLabel'),
        description: msg(
          'tagsRootDescription',
          String(sortedTags.length),
          publicationTitle,
        ),
        route: '/tags',
      }),
      language: publication.defaultLanguage,
      lastModified: latestContentTimestamp(publishedArticles),
      bodyHtml: listingHead({
        breadcrumbHtml: crumbs([
          { label: /** @type {string} */ (messages.tagsSectionLabel) },
        ]),
        kicker: /** @type {string} */ (messages.tagKickerLabel),
        count: undefined,
        title: /** @type {string} */ (messages.tagsSectionLabel),
        extraHtml: tagPills(),
      }),
    });
  }
  for (const tag of sortedTags) {
    const items =
      /** @type {import('../../../types/index.d.ts').ContentBuildRecord[]} */ (
        byTag.get(tag)
      );
    pages.push({
      kind: 'tag',
      route: `/tags/${tagSegment(tag)}`,
      ...listingMeta({
        name: msg('tagPageTitle', tag),
        description: msg(
          'tagPageDescription',
          String(items.length),
          tag,
          publicationTitle,
        ),
        route: `/tags/${tagSegment(tag)}`,
        parents: [{ label: text0('tagsSectionLabel'), route: site('/tags') }],
      }),
      language: publication.defaultLanguage,
      lastModified: latestContentTimestamp(items),
      bodyHtml:
        listingHead({
          breadcrumbHtml: crumbs(
            [
              {
                label: /** @type {string} */ (messages.tagsSectionLabel),
                route: site('/tags'),
              },
            ],
            [{ label: tag }],
          ),
          kicker: /** @type {string} */ (messages.tagKickerLabel),
          count: items.length,
          title: tag,
          extraHtml: tagPills(tag),
        }) + rowList(items),
    });
  }

  if (sortedSeries.length > 0) {
    pages.push({
      kind: 'series',
      route: '/series',
      ...listingMeta({
        name: text0('seriesSectionLabel'),
        description: msg(
          'seriesRootDescription',
          String(sortedSeries.length),
          publicationTitle,
        ),
        route: '/series',
      }),
      language: publication.defaultLanguage,
      lastModified: latestContentTimestamp([...bySeries.values()].flat()),
      bodyHtml: listingHead({
        breadcrumbHtml: crumbs([
          { label: /** @type {string} */ (messages.seriesSectionLabel) },
        ]),
        kicker: /** @type {string} */ (messages.seriesKickerLabel),
        count: undefined,
        title: /** @type {string} */ (messages.seriesSectionLabel),
        iconName: 'book',
        extraHtml: `<ul class="g-pills">${sortedSeries
          .map((name) =>
            pill(seriesHref(name), name, bySeries.get(name)?.length, 'book'),
          )
          .join('')}</ul>`,
      }),
    });
  }
  for (const name of sortedSeries) {
    const items =
      /** @type {import('../../../types/index.d.ts').ContentBuildRecord[]} */ (
        bySeries.get(name)
      );
    pages.push({
      kind: 'series',
      route: `/series/${seriesSegment(name)}`,
      ...listingMeta({
        name,
        description: msg(
          'seriesPageDescription',
          String(items.length),
          name,
          publicationTitle,
        ),
        route: `/series/${seriesSegment(name)}`,
        parents: [
          { label: text0('seriesSectionLabel'), route: site('/series') },
        ],
      }),
      language: publication.defaultLanguage,
      lastModified: latestContentTimestamp(items),
      bodyHtml:
        listingHead({
          breadcrumbHtml: crumbs(
            [
              {
                label: /** @type {string} */ (messages.seriesSectionLabel),
                route: site('/series'),
              },
            ],
            [{ label: name }],
          ),
          kicker: /** @type {string} */ (messages.seriesKickerLabel),
          count: items.length,
          title: name,
          iconName: 'book',
        }) + rowList(items),
    });
  }

  if (sortedYears.length > 0) {
    pages.push({
      kind: 'archive',
      route: '/archive',
      ...listingMeta({
        name: text0('archiveSectionLabel'),
        description: msg(
          'archiveRootDescription',
          String(publishedArticles.length),
          publicationTitle,
        ),
        route: '/archive',
      }),
      language: publication.defaultLanguage,
      lastModified: latestContentTimestamp(publishedArticles),
      bodyHtml: listingHead({
        breadcrumbHtml: crumbs([
          { label: /** @type {string} */ (messages.archiveSectionLabel) },
        ]),
        kicker: /** @type {string} */ (messages.archiveKickerLabel),
        count: publishedArticles.length,
        title: /** @type {string} */ (messages.archiveSectionLabel),
        iconName: 'layers',
        extraHtml: `<ul class="g-pills">${sortedYears
          .map((year) =>
            pill(
              site(`/archive/${year}`),
              year,
              byYear.get(year)?.length,
              'layers',
            ),
          )
          .join('')}</ul>`,
      }),
    });
  }
  for (const year of sortedYears) {
    const items =
      /** @type {import('../../../types/index.d.ts').ContentBuildRecord[]} */ (
        byYear.get(year)
      );
    const yearPages = paginate(items, LISTING_PAGE_SIZE);
    const yearRoute = (/** @type {number} */ n) =>
      n === 1 ? `/archive/${year}` : `/archive/${year}/page/${n}`;
    yearPages.forEach((pageItems, pageIndex) => {
      const pageNumber = pageIndex + 1;
      pages.push({
        kind: 'archive',
        route: yearRoute(pageNumber),
        ...listingMeta({
          name:
            pageNumber === 1
              ? msg('archivePageTitle', year)
              : `${msg('archivePageTitle', year)} \u2013 ${msg('pageStatusLabel', String(pageNumber), String(yearPages.length))}`,
          description: msg(
            'archivePageDescription',
            String(items.length),
            year,
            publicationTitle,
          ),
          route: yearRoute(pageNumber),
          parents: [
            { label: text0('archiveSectionLabel'), route: site('/archive') },
          ],
        }),
        language: publication.defaultLanguage,
        lastModified: latestContentTimestamp(pageItems),
        bodyHtml:
          listingHead({
            breadcrumbHtml: crumbs(
              [
                {
                  label: /** @type {string} */ (messages.archiveSectionLabel),
                  route: site('/archive'),
                },
              ],
              [{ label: year }],
            ),
            kicker: /** @type {string} */ (messages.archiveKickerLabel),
            count: items.length,
            title: year,
            iconName: 'layers',
          }) +
          rowList(
            pageItems,
            renderPagination({
              currentPage: pageNumber,
              totalPages: yearPages.length,
              routeForPage: (n) => site(yearRoute(n)),
              messages,
            }),
          ),
      });
    });
  }

  // One section per non-default language with a published article: its own
  // chrome catalog, every article of the language newest first (no grouping).
  for (const section of translations.sections) {
    useChrome(section.language);
    const items = allPublishedArticles.filter(
      (r) => languageSegment(r.frontmatter.language) === section.segment,
    );
    const name = languageLabel(section.language, translations.languages);
    const sectionPages = paginate(items, LISTING_PAGE_SIZE);
    const sectionRoute = (/** @type {number} */ n) =>
      n === 1 ? `/${section.segment}` : `/${section.segment}/page/${n}`;
    sectionPages.forEach((pageItems, pageIndex) => {
      const pageNumber = pageIndex + 1;
      pages.push({
        kind: 'index',
        route: sectionRoute(pageNumber),
        ...listingMeta({
          name:
            pageNumber === 1
              ? name
              : `${name} \u2013 ${msg('pageStatusLabel', String(pageNumber), String(sectionPages.length))}`,
          description: msg(
            'languageIndexDescription',
            String(items.length),
            name,
            publicationTitle,
          ),
          route: sectionRoute(pageNumber),
          language: section.language,
        }),
        language: section.language,
        lastModified: latestContentTimestamp(pageItems),
        bodyHtml:
          listingHead({
            breadcrumbHtml: crumbs([{ label: name }]),
            kicker: /** @type {string} */ (messages.languageKickerLabel),
            count: items.length,
            title: name,
            iconName: 'layers',
          }) +
          rowList(
            pageItems,
            renderPagination({
              currentPage: pageNumber,
              totalPages: sectionPages.length,
              routeForPage: (n) => site(sectionRoute(n)),
              messages,
            }),
          ),
      });
    });
  }
  useChrome(publication.defaultLanguage);

  return pages.map((page) => ({
    ...page,
    direction: resolveTextDirection(page.language),
  }));
}

/**
 * Render the `error` page kind's `<main>` body. This is
 * a pure function with no route/build-input dependency, exported for a
 * caller elsewhere (the generated `404.html`, assembled outside this module)
 * and for this repository's own structural/golden tests.
 *
 * @param {object} options rendering options
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
 *   the resolved message catalog
 * @param {string} options.homeRoute the publication's own (already joined)
 *   home route
 * @returns {string} the error page's `<main>` inner HTML, starting with
 *   exactly one `<h1>`
 */
export function renderErrorPageBody({ messages, homeRoute }) {
  const heading = escapeHtml(/** @type {string} */ (messages.errorPageHeading));
  const body = escapeHtml(/** @type {string} */ (messages.errorPageBody));
  const returnLabel = escapeHtml(
    /** @type {string} */ (messages.errorPageReturnHomeLabel),
  );
  return (
    `<section class="g-wrap g-topic-hero"><h1>${heading}</h1>` +
    `<p class="g-dek">${body}</p>` +
    `<p><a class="g-btn" href="${escapeHtml(homeRoute)}">${returnLabel}${icon('arrow')}</a></p></section>`
  );
}
