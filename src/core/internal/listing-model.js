/**
 * Listing models and the language-section router.
 *
 * A listing model is the grouped view of a set of articles that every listing
 * kind (home, tags, series, archive, authors) is built from. The default
 * language's model is built by `page-kinds.js` from the listed groups; each
 * non-default language section has a model of its own, built here from that
 * language's articles only, so a section is a full mirror of the site.
 *
 * {@link createSectionRouter} decides, from those models alone, which routes
 * every section generates. It is the one place that maps a default-language
 * route to its section counterpart (`route(language, defaultRoute)`), falling
 * back to the default route when the counterpart page does not exist, so the
 * page builders and the chrome (navigation, footer, brand) resolve links the
 * same way.
 */

import { joinBasePathAndRoute } from './route.js';

/**
 * @typedef {import('../../../types/index.d.ts').ContentBuildRecord} ContentBuildRecord
 */

/**
 * @typedef {object} ListingModel
 * @property {string | undefined} segment the language segment, absent for the
 *   default language
 * @property {string} language the BCP-47 tag its pages carry
 * @property {ContentBuildRecord[]} articles newest first
 * @property {Map<string, ContentBuildRecord[]>} byTag
 * @property {string[]} sortedTags
 * @property {Map<string, ContentBuildRecord[]>} bySeries
 * @property {string[]} sortedSeries
 * @property {Map<string, ContentBuildRecord[]>} byYear
 * @property {string[]} sortedYears newest first
 */

/**
 * @typedef {object} SectionPlan
 * @property {string} language the section's BCP-47 tag
 * @property {string} segment the section's URL segment
 * @property {ListingModel} model
 * @property {import('../../../types/index.d.ts').AuthorNormalized[]} authors
 *   the authors with an article in the language
 * @property {ReadonlySet<string>} routes every un-joined route the section
 *   generates (home included)
 */

/**
 * Split an array into fixed-size, order-preserving pages.
 *
 * @template T
 * @param {readonly T[]} items items, already in final display order
 * @param {number} pageSize maximum items per page (at least 1)
 * @returns {T[][]} one array per page, always at least one (possibly empty)
 *   page
 */
export function paginate(items, pageSize) {
  if (items.length === 0) return [[]];
  /** @type {T[][]} */
  const pages = [];
  for (let index = 0; index < items.length; index += pageSize) {
    pages.push(items.slice(index, index + pageSize));
  }
  return pages;
}

/**
 * Group records by derived keys, preserving the input order within each
 * bucket.
 *
 * @param {readonly ContentBuildRecord[]} records
 * @param {(record: ContentBuildRecord) => readonly string[]} keysOf
 * @returns {Map<string, ContentBuildRecord[]>}
 */
export function groupBy(records, keysOf) {
  /** @type {Map<string, ContentBuildRecord[]>} */
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

/**
 * @param {object} input
 * @param {string | undefined} input.segment
 * @param {string} input.language
 * @param {ContentBuildRecord[]} input.articles newest first
 * @param {readonly ContentBuildRecord[]} input.seriesRecords the records a
 *   series groups
 * @param {(record: ContentBuildRecord) => readonly string[]} input.tagsOf
 * @param {(record: ContentBuildRecord) => readonly string[]} input.seriesOf
 * @param {(record: ContentBuildRecord, series: string) => number} input.orderOf
 * @returns {ListingModel}
 */
export function buildListingModel({
  segment,
  language,
  articles,
  seriesRecords,
  tagsOf,
  seriesOf,
  orderOf,
}) {
  const byTag = groupBy(articles, tagsOf);
  const bySeries = groupBy(seriesRecords, seriesOf);
  for (const [name, bucket] of bySeries) {
    bucket.sort((a, b) => orderOf(a, name) - orderOf(b, name));
  }
  const byYear = groupBy(articles, (r) => [
    r.frontmatter.publishedAt.slice(0, 4),
  ]);
  return {
    segment,
    language,
    articles,
    byTag,
    sortedTags: [...byTag.keys()].sort(),
    bySeries,
    sortedSeries: [...bySeries.keys()].sort(),
    byYear,
    sortedYears: [...byYear.keys()].sort().reverse(),
  };
}

/**
 * Every route a listing model generates, un-prefixed (home is `/`), exactly
 * the routes `page-kinds.js` emits for it.
 *
 * @param {ListingModel} model
 * @param {object} shape
 * @param {number} shape.pageSize
 * @param {number} shape.latestCount the home page's latest-card count
 * @param {(tag: string) => string} shape.tagSegment
 * @param {(name: string) => string} shape.seriesSegment
 * @returns {string[]}
 */
export function listingRoutes(
  model,
  { pageSize, latestCount, tagSegment, seriesSegment },
) {
  const routes = ['/'];
  const older = model.articles.slice(1 + latestCount);
  for (let n = 2; n <= paginate(older, pageSize).length; n += 1) {
    routes.push(`/page/${n}`);
  }
  if (model.sortedTags.length > 0) routes.push('/tags');
  for (const tag of model.sortedTags) routes.push(`/tags/${tagSegment(tag)}`);
  if (model.sortedSeries.length > 0) routes.push('/series');
  for (const name of model.sortedSeries) {
    routes.push(`/series/${seriesSegment(name)}`);
  }
  if (model.sortedYears.length > 0) routes.push('/archive');
  for (const year of model.sortedYears) {
    const count = paginate(model.byYear.get(year) ?? [], pageSize).length;
    routes.push(`/archive/${year}`);
    for (let n = 2; n <= count; n += 1)
      routes.push(`/archive/${year}/page/${n}`);
  }
  return routes;
}

/**
 * @typedef {object} SectionRouter
 * @property {ReadonlyMap<string, SectionPlan>} sections each section by its
 *   lower-cased language segment
 * @property {(language: string) => SectionPlan | undefined} sectionOf the
 *   section a language's pages belong to (none for the default language)
 * @property {(language: string, defaultRoute: string) => string} route the
 *   section counterpart of a default-language route when that page exists,
 *   else the route itself
 */

/**
 * @param {object} input
 * @param {readonly {language: string, segment: string}[]} input.sections
 * @param {readonly ContentBuildRecord[]} input.published every published
 *   article, newest first
 * @param {readonly ContentBuildRecord[]} input.seriesPool every published
 *   non-edition record
 * @param {readonly import('../../../types/index.d.ts').AuthorNormalized[]} input.authors
 * @param {(record: ContentBuildRecord) => string} input.segmentOf a record's
 *   language segment
 * @param {number} input.pageSize
 * @param {number} input.latestCount
 * @param {(tag: string) => string} input.tagSegment
 * @param {(name: string) => string} input.seriesSegment
 * @param {(author: import('../../../types/index.d.ts').AuthorNormalized) => string} input.authorRoute
 * @returns {SectionRouter}
 */
export function createSectionRouter({
  sections,
  published,
  seriesPool,
  authors,
  segmentOf,
  pageSize,
  latestCount,
  tagSegment,
  seriesSegment,
  authorRoute,
}) {
  /** @type {Map<string, SectionPlan>} */
  const plans = new Map();
  for (const { language, segment } of sections) {
    const articles = published.filter((r) => segmentOf(r) === segment);
    const model = buildListingModel({
      segment,
      language,
      articles,
      seriesRecords: seriesPool.filter((r) => segmentOf(r) === segment),
      tagsOf: (r) => r.frontmatter.tags,
      seriesOf: (r) => (r.frontmatter.series ? [r.frontmatter.series] : []),
      orderOf: (r) => r.frontmatter.seriesOrder ?? 0,
    });
    const sectionAuthors = authors.filter((author) =>
      articles.some((r) => r.frontmatter.authorIds.includes(author.id)),
    );
    const own = (/** @type {string} */ route) =>
      route === '/' ? `/${segment}` : `/${segment}${route}`;
    const routes = new Set([
      ...listingRoutes(model, {
        pageSize,
        latestCount,
        tagSegment,
        seriesSegment,
      }).map(own),
      ...sectionAuthors.map((author) => own(authorRoute(author))),
    ]);
    plans.set(segment, {
      language,
      segment,
      model,
      authors: sectionAuthors,
      routes,
    });
  }
  /** @type {SectionRouter['sectionOf']} */
  const sectionOf = (language) => plans.get(language.toLowerCase());
  return {
    sections: plans,
    sectionOf,
    route: (language, defaultRoute) => {
      const plan = sectionOf(language);
      if (!plan) return defaultRoute;
      const normal = defaultRoute.replace(/\/+$/, '') || '/';
      const candidate =
        normal === '/' ? `/${plan.segment}` : `/${plan.segment}${normal}`;
      return plan.routes.has(candidate) ? candidate : defaultRoute;
    },
  };
}

/** The page kinds a language section mirrors one for one. */
const MIRRORED_KINDS = new Set(['index', 'tag', 'series', 'archive', 'author']);

/**
 * The same-page counterparts of a mirrored listing page in every other
 * language: `variants` for the language switcher (the same page where it
 * exists, else that language's home; a paginated page maps to page 1), and
 * `alternates` plus `xDefaultRoute` for hreflang (only where the page exists,
 * never for a paginated page, whose content has no counterpart).
 *
 * @param {object} input
 * @param {string} input.defaultLanguage
 * @param {SectionRouter} input.router
 * @returns {<P extends {kind: string, route: string, variants?: unknown}>(page: P, existing: ReadonlySet<string>) => P}
 */
export function createCounterparts({ defaultLanguage, router }) {
  const sections = [...router.sections.values()];
  /** @type {(route: string) => {segment: string | undefined, base: string}} */
  const split = (route) => {
    for (const { segment } of sections) {
      if (route === `/${segment}`) return { segment, base: '/' };
      if (route.startsWith(`/${segment}/`)) {
        return { segment, base: route.slice(segment.length + 1) };
      }
    }
    return { segment: undefined, base: route };
  };
  return (page, existing) => {
    if (sections.length === 0 || !MIRRORED_KINDS.has(page.kind)) return page;
    const { base } = split(page.route);
    const first = base.replace(/\/page\/\d+$/, '') || '/';
    const languages = [
      { language: defaultLanguage, segment: undefined },
      ...sections,
    ];
    const entries = languages.map(({ language, segment }) => {
      const route =
        segment === undefined
          ? first
          : first === '/'
            ? `/${segment}`
            : `/${segment}${first}`;
      return {
        language,
        route,
        home: segment === undefined ? '/' : `/${segment}`,
        exists: existing.has(route),
      };
    });
    const present = entries.filter((entry) => entry.exists);
    const defaultEntry = entries[0];
    return {
      ...page,
      variants: entries.map((entry) => ({
        language: entry.language,
        route: entry.exists ? entry.route : entry.home,
      })),
      ...(first === base && present.length >= 2
        ? {
            alternates: present.map(({ language, route }) => ({
              language,
              route,
            })),
            ...(defaultEntry.exists
              ? { xDefaultRoute: defaultEntry.route }
              : {}),
          }
        : {}),
    };
  };
}

/** The catalog key labelling each system route in a section's navigation. */
const SYSTEM_NAV_LABELS = Object.freeze({
  '/': 'homeLinkLabel',
  '/archive': 'archiveSectionLabel',
  '/tags': 'tagsSectionLabel',
  '/series': 'seriesSectionLabel',
  '/authors': 'authorsSectionLabel',
  '/about': 'aboutLinkLabel',
});

/**
 * The navigation as a page in a section language shows it: an internal item
 * naming a system route takes its label from that language's catalog and its
 * route from the section router; every other item keeps the author's label
 * and route. A page in the default language shows the author's items as
 * authored.
 *
 * @param {readonly import('../../../types/index.d.ts').NavigationItem[]} items
 * @param {string} language the page's BCP-47 tag
 * @param {SectionRouter} router
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} messages
 *   the page language's catalog
 * @param {string} basePath the build input's `basePath`, which an item's
 *   route carries (as the current page's route does)
 * @returns {readonly import('../../../types/index.d.ts').NavigationItem[]}
 */
export function localizeNavigation(
  items,
  language,
  router,
  messages,
  basePath,
) {
  if (!router.sectionOf(language)) return items;
  const base = basePath.replace(/^\/+|\/+$/g, '');
  /** @type {(route: string) => string} the route without the base path */
  const stripBase = (route) => {
    const path = `/${route.replace(/^\/+|\/+$/g, '')}`;
    if (base === '') return path === '/' ? '/' : path;
    if (path === `/${base}`) return '/';
    return path.startsWith(`/${base}/`) ? path.slice(base.length + 1) : path;
  };
  /**
   * @param {import('../../../types/index.d.ts').NavigationItem} item
   * @returns {import('../../../types/index.d.ts').NavigationItem}
   */
  const localize = (item) => {
    const own =
      item.type === 'internal' && item.route !== undefined
        ? stripBase(item.route)
        : undefined;
    const key =
      own === undefined
        ? undefined
        : /** @type {Record<string, string>} */ (SYSTEM_NAV_LABELS)[own];
    const children = item.children.map(localize);
    return key === undefined || item.route === undefined
      ? { ...item, children }
      : {
          ...item,
          label: /** @type {string} */ (messages[key]),
          route: joinBasePathAndRoute(
            basePath,
            router.route(language, /** @type {string} */ (own)),
          ),
          children,
        };
  };
  return items.map(localize);
}
