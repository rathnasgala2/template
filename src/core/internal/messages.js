/**
 * Core-owned chrome message catalog (brief S2 section 3: the semantic
 * skeleton and navigation renderer; task packet S2-T06: "all user-visible
 * chrome strings coming from a message catalog (not inline literals) so
 * localization can find them").
 *
 * Every user-visible string this package's own generated chrome (skip link,
 * navigation labels, breadcrumb labels, pagination controls, generated
 * listing-page headings, the error page kind, the S2-T07 Light/Dark/System
 * appearance control's label and its three option labels) emits is looked
 * up here by key
 * rather than written inline at its call site. S2 authors exactly one
 * catalog, `en` (the only language the golden fixture's own core chrome is
 * required to exercise); per-content localization of *authored* content is
 * `publication`/`content` data, not core chrome, and full chrome
 * localization (additional catalogs, a locale-selection policy) is future
 * work this module is shaped to admit without changing any call site: every
 * lookup already goes through {@link getMessages}, keyed by a BCP-47 tag,
 * with a fixed fallback to `en` for a tag this catalog does not carry.
 *
 * @type {Readonly<Record<string, Readonly<Record<string, string | ((...args: string[]) => string)>>>>}
 */
const CATALOGS = Object.freeze({
  en: Object.freeze({
    skipToContent: 'Skip to content',
    homeLinkLabel: 'Home',
    primaryNavigationLabel: 'Primary',
    footerNavigationLabel: 'Footer',
    breadcrumbNavigationLabel: 'Breadcrumb',
    paginationNavigationLabel: 'Pagination',
    previousPageLabel: 'Previous',
    nextPageLabel: 'Next',
    /** @type {(current: string, total: string) => string} */
    pageStatusLabel: (current, total) => `Page ${current} of ${total}`,
    authorsSectionLabel: 'Authors',
    tagsSectionLabel: 'Tags',
    seriesSectionLabel: 'Series',
    archiveSectionLabel: 'Archive',
    indexHeading: 'All articles',
    authorsIndexLabel: 'Authors',
    tagIndexLabelPrefix: 'Tag:',
    seriesIndexLabelPrefix: 'Series:',
    archiveYearLabelPrefix: 'Archive:',
    /** @type {(displayName: string) => string} */
    aboutAuthorHeading: (displayName) => `About ${displayName}`,
    /** @type {(displayName: string) => string} */
    byLineLabel: (displayName) => `By ${displayName}`,
    footerCopyrightPrefix: '©',
    footerAttributionLabel: 'Published with the Galascribe template renderer.',
    errorPageHeading: 'Page not found',
    errorPageBody:
      'The page you were looking for could not be found. It may have been ' +
      'moved, renamed or removed.',
    errorPageReturnHomeLabel: 'Return to the home page',
    appearanceControlLabel: 'Appearance',
    appearanceModeLightLabel: 'Light',
    appearanceModeDarkLabel: 'Dark',
    appearanceModeSystemLabel: 'System',
  }),
});

/** @type {string} */
const DEFAULT_LOCALE = 'en';

/**
 * Resolve the message catalog for a BCP-47 language tag, falling back to the
 * default `en` catalog for any tag with no dedicated catalog (currently
 * every tag, since only `en` is authored in S2).
 *
 * @param {string} [bcp47] a language tag (typically
 *   `publication.defaultLanguage` or a per-content `frontmatter.language`)
 * @returns {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 *   the resolved catalog
 */
export function getMessages(bcp47) {
  const primarySubtag = (bcp47 ?? '').split('-')[0]?.toLowerCase() ?? '';
  return CATALOGS[primarySubtag] ?? CATALOGS[DEFAULT_LOCALE];
}
