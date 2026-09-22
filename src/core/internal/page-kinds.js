/**
 * Page-kind assembly (task packet S2-T06): builds every generated page's
 * `<main>` content, breadcrumb trail and route from a validated
 * `build-input:2.0.0` instance, and the shared site chrome (header, primary
 * navigation, footer) every page kind is composed with through
 * `internal/skeleton.js`'s {@link import('./skeleton.js').renderPageBody}.
 *
 * Page kinds this module produces, matching brief S2 section 3's "Required
 * generated outputs" and task packet S2-T06's page-kind list:
 *
 * - `profile` — the publication's own optional profile page
 *   (`publication.profile`);
 * - `author` — one page per entry in `build-input.authors` (DEC-097 section 5:
 *   this array is already exactly the set of authors referenced by the
 *   selected content, publication contact or footer card — never an
 *   unreferenced author), at `/authors/<id>`;
 * - `article` / `page` — one page per `content[]` record, at its own
 *   `contentFrontmatterNormalized` route;
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
 * function, not wired into any generated route here: brief S2 section 3
 * assigns the one generated `404.html` artifact to S2-T08, which this task
 * packet's own scope notes forbid touching. S2-T08 composes its `404.html`
 * from this same function.
 *
 * Every generated page's own `route` field (see {@link GeneratedPage}) is an
 * un-joined `canonicalRoute`, in the same convention `internal/index.js`
 * already uses for content pages: the caller joins it with `basePath` via
 * `internal/route.js`'s `joinBasePathAndRoute` before route projection. Every
 * *link href* this module writes into a page's own body (breadcrumbs, tag and
 * series listings, pagination controls) is, by contrast, already joined with
 * `basePath` here, because it is read back only as literal HTML text, never
 * re-joined by a caller. This mirrors DEC-097 section 5's navigation
 * normalization rule: an *authored* navigation item's route is used exactly
 * as authored, never synthesized or rewritten (so `internal/skeleton.js`'s
 * navigation renderer never joins it), while every route this renderer itself
 * derives (every page kind here) is basePath-joined at the point it becomes
 * link text, exactly like S2-T03's own redirect/content route projection.
 *
 * Every listing here is a deliberately scoped decision this module documents
 * rather than assumes: page size, sort tie-break and the tag/series/archive
 * root pages are not specified verbatim by the brief text this task read.
 */

import {
  escapeHtml,
  renderBreadcrumbs,
  renderPagination,
  renderSlot,
} from './skeleton.js';
import { getMessages } from './messages.js';
import { resolveTextDirection } from './text-direction.js';
import { routeSegmentForLabel } from './route-labels.js';
import { joinBasePathAndRoute } from './route.js';

/** Listing page size (index and per-year archive pages). Scoped decision:
 * the brief does not fix a page size; 10 is a deterministic, documented
 * default with no author-facing configuration surface in S2.
 * @type {number} */
export const LISTING_PAGE_SIZE = 10;

/**
 * The DEC-097-style semantic template-owned attribute this renderer sets on
 * every generated page's `<body>` (S2-T12: `contracts/theme-styling-contract.jcs`
 * exposes this as a public theme hook, one per {@link PAGE_KIND_VALUES}
 * entry, so a theme can vary presentation by page kind — e.g. a different
 * article vs. listing background — without the template ever promoting a
 * private/incidental selector). Scoped decision: this attribute did not
 * exist before S2-T12; it is this task packet's own addition, introduced
 * specifically because the published styling contract needs a
 * page-kind-targeting hook the brief's "every page-kind ... class/attribute"
 * language calls for.
 *
 * @type {string}
 */
export const PAGE_KIND_ATTRIBUTE = 'data-gala-page-kind';

/**
 * Every value {@link PAGE_KIND_ATTRIBUTE} may carry: every {@link GeneratedPage}
 * `kind` plus the synthetic `error` kind (`internal/index.js`'s always-present
 * generated `404.html`), sorted by UTF-8 bytes (DEC-097's own attribute-value
 * sort convention).
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
    'profile',
    'series',
    'tag',
  ].sort(),
);

/**
 * @param {import('../../../types/index.d.ts').ContentFrontmatterNormalized} frontmatter
 * @returns {string} the record's own canonical route (un-joined)
 */
export function contentRoute(frontmatter) {
  return frontmatter.route ?? `/${frontmatter.slug}`;
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
 * Resolve an author's display name by ID, failing closed on a dangling
 * reference (an adapter defect: `resolvedAuthorIds` is schema/DEC-097
 * guaranteed to resolve).
 *
 * @param {ReadonlyMap<string, import('../../../types/index.d.ts').AuthorNormalized>} authorsById
 * @param {string} authorId
 * @returns {import('../../../types/index.d.ts').AuthorNormalized}
 */
function requireAuthor(authorsById, authorId) {
  const author = authorsById.get(authorId);
  if (!author) {
    throw new Error(`internal: no author record for id ${authorId}`);
  }
  return author;
}

/**
 * @typedef {object} GeneratedPage
 * @property {'profile' | 'author' | 'article' | 'page' | 'index' | 'tag' | 'series' | 'archive'} kind
 * @property {string} route an un-joined `canonicalRoute` (caller joins with
 *   `basePath`)
 * @property {string} title the page's `<title>` text
 * @property {string} language the page's BCP-47 language tag
 * @property {string} [direction] the page's resolved base text direction (assigned by buildGeneratedPages's own return mapping)
 * @property {string} bodyHtml the page's complete `<main>` inner HTML,
 *   starting with exactly one `<h1>`
 * @property {string} [breadcrumbHtml] an optional already-rendered breadcrumb
 * @property {string} [description] task packet S2-T08: an optional plain-text
 *   description this page's SEO/Open-Graph/Twitter `<meta>` tags are built
 *   from (never HTML, never the sanitized body — a distinct authored or
 *   publication-level plain-text field)
 * @property {'website' | 'article' | 'profile'} [ogType] task packet S2-T08:
 *   the Open Graph `og:type` this page kind maps to; defaults to `'website'`
 *   when omitted
 * @property {{path: string, sourceDigest: string} | undefined} [socialImageRef]
 *   task packet S2-T08: an optional `resolvedFile` reference this page's
 *   social image is resolved from (the caller, `src/core/index.js`, is the
 *   one place that can turn this into an absolute derivative URL, because
 *   only it has run the S2-T05 media pipeline and knows the derivative
 *   output path a given `sourceDigest` produced)
 * @property {string} [robotsContent] task packet S2-T08: an optional
 *   `<meta name="robots">` content value (e.g. `'noindex, follow'` for
 *   `status: "unlisted"` content); omitted entirely for ordinarily indexable
 *   pages, matching this renderer's "documented, not silently assumed" style
 *   elsewhere — every page kind's robots decision is made once, here, rather
 *   than re-derived by every later consumer (sitemap, search index)
 * @property {string} [lastModified] task packet S2-T08: an optional
 *   `rfc3339` timestamp the generated sitemap's `<lastmod>` for this page is
 *   drawn from — always derived from authored content timestamps
 *   (`publishedAt`/`updatedAt`), never build time (brief S2 section 3:
 *   "sitemap ... `lastmod` from content timestamps not build time"). Omitted
 *   for a page kind with no natural underlying timestamp (`profile`,
 *   `author`), which the generated sitemap then emits with no `<lastmod>`
 *   element at all (a sitemap's own `<lastmod>` is optional per the Sitemaps
 *   0.9 protocol).
 */

/**
 * The reverse-chronological, deterministically tie-broken set of every
 * `status: "published"`, `kind: "article"` record — the exact selection and
 * ordering the `index` page kind paginates, and (task packet S2-T08) the
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
 * The most recent of a content record's own `updatedAt` (when authored) or
 * `publishedAt` — this renderer's one definition of "a content record's own
 * last-modified instant" (task packet S2-T08's sitemap `<lastmod>` and the
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
 * `<lastmod>`" (task packet S2-T08): the most recent authored timestamp
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
 * Build every generated page (every kind except `error`) from a validated
 * `build-input:2.0.0` instance.
 *
 * @param {import('../../../types/index.d.ts').NormalizedBuildInput} validatedInput
 * @returns {GeneratedPage[]} every generated page, in a stable, deterministic
 *   order
 */
export function buildGeneratedPages(validatedInput) {
  const { publication, authors, content, basePath } = validatedInput;
  const messages = getMessages(publication.defaultLanguage);
  const authorsById = new Map(authors.map((author) => [author.id, author]));

  /**
   * @param {string} route an un-joined route
   * @returns {string} the `basePath`-joined absolute route
   */
  const site = (route) => joinBasePathAndRoute(basePath, route);

  /**
   * @param {import('../../../types/index.d.ts').ContentBuildRecord} record
   * @returns {string} one `<li>` summary
   */
  const renderContentSummary = (record) => {
    const { frontmatter } = record;
    const route = escapeHtml(site(contentRoute(frontmatter)));
    const title = escapeHtml(frontmatter.title);
    const authorNames = frontmatter.authorIds
      .map((id) => requireAuthor(authorsById, id).displayName)
      .join(', ');
    const byLine = escapeHtml(
      /** @type {(displayName: string) => string} */ (messages.byLineLabel)(
        authorNames,
      ),
    );
    const time = `<time datetime="${escapeHtml(frontmatter.publishedAt)}">${escapeHtml(frontmatter.publishedAt)}</time>`;
    const tags =
      frontmatter.tags.length > 0
        ? `<ul>${frontmatter.tags
            .map(
              (tag) =>
                `<li><a href="${escapeHtml(site(`/tags/${routeSegmentForLabel(tag)}`))}">${escapeHtml(tag)}</a></li>`,
            )
            .join('')}</ul>`
        : '';
    return (
      `<li><h2><a href="${route}">${title}</a></h2>` +
      `<p>${byLine}</p>${time}${tags}</li>`
    );
  };

  /** @type {GeneratedPage[]} */
  const pages = [];

  if (publication.profile) {
    pages.push({
      kind: 'profile',
      route: publication.profile.route,
      title: publication.title,
      language: publication.defaultLanguage,
      description: publication.description,
      ogType: 'website',
      socialImageRef: publication.defaultImage,
      bodyHtml: `<h1>${escapeHtml(publication.title)}</h1>${publication.profile.body.body}`,
    });
  }

  for (const author of authors) {
    const pronouns = author.pronouns
      ? `<p>${escapeHtml(author.pronouns)}</p>`
      : '';
    const biography = author.biography
      ? `<p>${escapeHtml(author.biography)}</p>`
      : '';
    const links =
      author.links.length > 0
        ? `<ul>${author.links
            .map((link) => {
              const label = escapeHtml(link.label ?? link.uri);
              return `<li><a href="${escapeHtml(link.uri)}">${label}</a></li>`;
            })
            .join('')}</ul>`
        : '';
    const heading = /** @type {(displayName: string) => string} */ (
      messages.aboutAuthorHeading
    )(author.displayName);
    pages.push({
      kind: 'author',
      route: `/authors/${author.id}`,
      title: heading,
      language: publication.defaultLanguage,
      description: author.biography || undefined,
      ogType: 'profile',
      socialImageRef: author.avatar,
      breadcrumbHtml: renderBreadcrumbs({
        trail: [
          {
            label: /** @type {string} */ (messages.homeLinkLabel),
            route: site('/'),
          },
          { label: /** @type {string} */ (messages.authorsSectionLabel) },
          { label: author.displayName },
        ],
        messages,
      }),
      bodyHtml:
        `<h1>${escapeHtml(heading)}</h1>` + pronouns + biography + links,
    });
  }

  for (const record of content) {
    const { frontmatter } = record;
    const authorNames = frontmatter.authorIds
      .map((id) => requireAuthor(authorsById, id).displayName)
      .join(', ');
    const byLine = `<p>${escapeHtml(
      /** @type {(displayName: string) => string} */ (messages.byLineLabel)(
        authorNames,
      ),
    )}</p>`;
    const time = `<time datetime="${escapeHtml(frontmatter.publishedAt)}">${escapeHtml(frontmatter.publishedAt)}</time>`;
    const tags =
      frontmatter.tags.length > 0
        ? `<ul>${frontmatter.tags
            .map(
              (tag) =>
                `<li><a href="${escapeHtml(site(`/tags/${routeSegmentForLabel(tag)}`))}">${escapeHtml(tag)}</a></li>`,
            )
            .join('')}</ul>`
        : '';
    const seriesHtml = frontmatter.series
      ? `<p><a href="${escapeHtml(site(`/series/${routeSegmentForLabel(frontmatter.series)}`))}">${escapeHtml(frontmatter.series)}</a></p>`
      : '';
    const breadcrumbTrail =
      frontmatter.kind === 'article'
        ? [
            {
              label: /** @type {string} */ (messages.homeLinkLabel),
              route: site('/'),
            },
            {
              label: /** @type {string} */ (messages.indexHeading),
              route: site('/'),
            },
            { label: frontmatter.title },
          ]
        : [
            {
              label: /** @type {string} */ (messages.homeLinkLabel),
              route: site('/'),
            },
            { label: frontmatter.title },
          ];
    pages.push({
      kind: frontmatter.kind,
      route: contentRoute(frontmatter),
      title: frontmatter.title,
      language: frontmatter.language,
      description: frontmatter.description,
      ogType: frontmatter.kind === 'article' ? 'article' : 'website',
      socialImageRef: frontmatter.socialImage ?? frontmatter.hero?.file,
      robotsContent:
        frontmatter.status === 'unlisted' ? 'noindex, follow' : undefined,
      lastModified: contentLastModified(frontmatter),
      breadcrumbHtml: renderBreadcrumbs({ trail: breadcrumbTrail, messages }),
      bodyHtml:
        `<article>` +
        renderSlot('article-preamble') +
        `<h1>${escapeHtml(frontmatter.title)}</h1>` +
        byLine +
        time +
        seriesHtml +
        tags +
        record.body +
        renderSlot('article-end') +
        renderSlot('article-footer-ad', { collapsed: true }) +
        `</article>`,
    });
  }

  const publishedArticles = selectPublishedArticles(content);

  const indexPages = paginate(publishedArticles, LISTING_PAGE_SIZE);
  indexPages.forEach((items, pageIndex) => {
    const pageNumber = pageIndex + 1;
    const route = pageNumber === 1 ? '/' : `/page/${pageNumber}`;
    pages.push({
      kind: 'index',
      route,
      title: /** @type {string} */ (messages.indexHeading),
      language: publication.defaultLanguage,
      description: publication.description,
      ogType: 'website',
      socialImageRef: publication.defaultImage,
      lastModified: latestContentTimestamp(items),
      bodyHtml:
        `<h1>${escapeHtml(/** @type {string} */ (messages.indexHeading))}</h1>` +
        `<ul>${items.map((record) => renderContentSummary(record)).join('')}</ul>` +
        renderPagination({
          currentPage: pageNumber,
          totalPages: indexPages.length,
          routeForPage: (n) => site(n === 1 ? '/' : `/page/${n}`),
          messages,
        }),
    });
  });

  /** @type {Map<string, import('../../../types/index.d.ts').ContentBuildRecord[]>} */
  const byTag = new Map();
  for (const record of publishedArticles) {
    for (const tag of record.frontmatter.tags) {
      const bucket = byTag.get(tag) ?? [];
      bucket.push(record);
      byTag.set(tag, bucket);
    }
  }
  const sortedTags = [...byTag.keys()].sort();
  if (sortedTags.length > 0) {
    pages.push({
      kind: 'tag',
      route: '/tags',
      title: /** @type {string} */ (messages.tagsSectionLabel),
      language: publication.defaultLanguage,
      description: publication.description,
      ogType: 'website',
      socialImageRef: publication.defaultImage,
      lastModified: latestContentTimestamp(publishedArticles),
      bodyHtml:
        `<h1>${escapeHtml(/** @type {string} */ (messages.tagsSectionLabel))}</h1>` +
        `<ul>${sortedTags
          .map(
            (tag) =>
              `<li><a href="${escapeHtml(site(`/tags/${routeSegmentForLabel(tag)}`))}">${escapeHtml(tag)}</a></li>`,
          )
          .join('')}</ul>`,
    });
  }
  for (const tag of sortedTags) {
    const items =
      /** @type {import('../../../types/index.d.ts').ContentBuildRecord[]} */ (
        byTag.get(tag)
      );
    const heading = `${/** @type {string} */ (messages.tagIndexLabelPrefix)} ${tag}`;
    pages.push({
      kind: 'tag',
      route: `/tags/${routeSegmentForLabel(tag)}`,
      title: heading,
      language: publication.defaultLanguage,
      ogType: 'website',
      socialImageRef: publication.defaultImage,
      lastModified: latestContentTimestamp(items),
      breadcrumbHtml: renderBreadcrumbs({
        trail: [
          {
            label: /** @type {string} */ (messages.homeLinkLabel),
            route: site('/'),
          },
          {
            label: /** @type {string} */ (messages.tagsSectionLabel),
            route: site('/tags'),
          },
          { label: tag },
        ],
        messages,
      }),
      bodyHtml:
        `<h1>${escapeHtml(heading)}</h1>` +
        `<ul>${items.map((record) => renderContentSummary(record)).join('')}</ul>`,
    });
  }

  /** @type {Map<string, import('../../../types/index.d.ts').ContentBuildRecord[]>} */
  const bySeries = new Map();
  for (const record of content) {
    const series = record.frontmatter.series;
    if (!series || record.frontmatter.status !== 'published') continue;
    const bucket = bySeries.get(series) ?? [];
    bucket.push(record);
    bySeries.set(series, bucket);
  }
  const sortedSeries = [...bySeries.keys()].sort();
  if (sortedSeries.length > 0) {
    pages.push({
      kind: 'series',
      route: '/series',
      title: /** @type {string} */ (messages.seriesSectionLabel),
      language: publication.defaultLanguage,
      description: publication.description,
      ogType: 'website',
      socialImageRef: publication.defaultImage,
      lastModified: latestContentTimestamp([...bySeries.values()].flat()),
      bodyHtml:
        `<h1>${escapeHtml(/** @type {string} */ (messages.seriesSectionLabel))}</h1>` +
        `<ul>${sortedSeries
          .map(
            (series) =>
              `<li><a href="${escapeHtml(site(`/series/${routeSegmentForLabel(series)}`))}">${escapeHtml(series)}</a></li>`,
          )
          .join('')}</ul>`,
    });
  }
  for (const series of sortedSeries) {
    const items =
      /** @type {import('../../../types/index.d.ts').ContentBuildRecord[]} */ (
        bySeries.get(series)
      )
        .slice()
        .sort(
          (a, b) =>
            (a.frontmatter.seriesOrder ?? 0) - (b.frontmatter.seriesOrder ?? 0),
        );
    const heading = `${/** @type {string} */ (messages.seriesIndexLabelPrefix)} ${series}`;
    pages.push({
      kind: 'series',
      route: `/series/${routeSegmentForLabel(series)}`,
      title: heading,
      language: publication.defaultLanguage,
      ogType: 'website',
      socialImageRef: publication.defaultImage,
      lastModified: latestContentTimestamp(items),
      breadcrumbHtml: renderBreadcrumbs({
        trail: [
          {
            label: /** @type {string} */ (messages.homeLinkLabel),
            route: site('/'),
          },
          {
            label: /** @type {string} */ (messages.seriesSectionLabel),
            route: site('/series'),
          },
          { label: series },
        ],
        messages,
      }),
      bodyHtml:
        `<h1>${escapeHtml(heading)}</h1>` +
        `<ol>${items.map((record) => renderContentSummary(record)).join('')}</ol>`,
    });
  }

  /** @type {Map<string, import('../../../types/index.d.ts').ContentBuildRecord[]>} */
  const byYear = new Map();
  for (const record of publishedArticles) {
    const year = record.frontmatter.publishedAt.slice(0, 4);
    const bucket = byYear.get(year) ?? [];
    bucket.push(record);
    byYear.set(year, bucket);
  }
  const sortedYears = [...byYear.keys()].sort().reverse();
  if (sortedYears.length > 0) {
    pages.push({
      kind: 'archive',
      route: '/archive',
      title: /** @type {string} */ (messages.archiveSectionLabel),
      language: publication.defaultLanguage,
      description: publication.description,
      ogType: 'website',
      socialImageRef: publication.defaultImage,
      lastModified: latestContentTimestamp(publishedArticles),
      bodyHtml:
        `<h1>${escapeHtml(/** @type {string} */ (messages.archiveSectionLabel))}</h1>` +
        `<ul>${sortedYears
          .map(
            (year) =>
              `<li><a href="${escapeHtml(site(`/archive/${year}`))}">${escapeHtml(year)}</a></li>`,
          )
          .join('')}</ul>`,
    });
  }
  for (const year of sortedYears) {
    const items =
      /** @type {import('../../../types/index.d.ts').ContentBuildRecord[]} */ (
        byYear.get(year)
      );
    const yearPages = paginate(items, LISTING_PAGE_SIZE);
    yearPages.forEach((pageItems, pageIndex) => {
      const pageNumber = pageIndex + 1;
      const route =
        pageNumber === 1
          ? `/archive/${year}`
          : `/archive/${year}/page/${pageNumber}`;
      const heading = `${/** @type {string} */ (messages.archiveYearLabelPrefix)} ${year}`;
      pages.push({
        kind: 'archive',
        route,
        title: heading,
        language: publication.defaultLanguage,
        ogType: 'website',
        socialImageRef: publication.defaultImage,
        lastModified: latestContentTimestamp(pageItems),
        breadcrumbHtml: renderBreadcrumbs({
          trail: [
            {
              label: /** @type {string} */ (messages.homeLinkLabel),
              route: site('/'),
            },
            {
              label: /** @type {string} */ (messages.archiveSectionLabel),
              route: site('/archive'),
            },
            { label: year },
          ],
          messages,
        }),
        bodyHtml:
          `<h1>${escapeHtml(heading)}</h1>` +
          `<ul>${pageItems.map((record) => renderContentSummary(record)).join('')}</ul>` +
          renderPagination({
            currentPage: pageNumber,
            totalPages: yearPages.length,
            routeForPage: (n) =>
              site(n === 1 ? `/archive/${year}` : `/archive/${year}/page/${n}`),
            messages,
          }),
      });
    });
  }

  return pages.map((page) => ({
    ...page,
    direction: resolveTextDirection(page.language),
  }));
}

/**
 * Render the `error` page kind's `<main>` body (task packet S2-T06). This is
 * a pure function with no route/build-input dependency, exported for a
 * future caller (S2-T08's generated `404.html`, out of this task packet's
 * scope) and for this repository's own structural/golden tests.
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
    `<h1>${heading}</h1>` +
    `<p>${body}</p>` +
    `<p><a href="${escapeHtml(homeRoute)}">${returnLabel}</a></p>`
  );
}
