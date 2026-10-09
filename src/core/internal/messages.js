/**
 * Core-owned chrome message catalog: every user-visible chrome string comes
 * from a message catalog, not an inline literal, so localization can find
 * them.
 *
 * Every user-visible string this package's own generated chrome (skip link,
 * navigation labels, breadcrumb labels, pagination controls, generated
 * listing-page headings, the error page kind, the Light/Dark/System
 * appearance control's label and its three option labels) emits is looked
 * up here by key
 * rather than written inline at its call site. This renderer authors
 * exactly one catalog, `en` (the only language the golden fixture's own
 * core chrome is required to exercise); per-content localization of
 * *authored* content is
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
    footerAttributionLabel: 'Made with Galascribe',
    errorPageHeading: 'Page not found',
    errorPageBody:
      'The page you were looking for could not be found. It may have been ' +
      'moved, renamed or removed.',
    errorPageReturnHomeLabel: 'Return to the home page',
    appearanceControlLabel: 'Appearance',
    appearanceModeLightLabel: 'Light',
    appearanceModeDarkLabel: 'Dark',
    appearanceModeSystemLabel: 'System',
    searchButtonLabel: 'Search',
    searchButtonAriaLabel: 'Search articles',
    searchPlaceholderLabel: 'Search the publication',
    searchEmptyLabel: 'No articles match your search.',
    searchUnavailableLabel: 'Search is unavailable right now.',
    copyCodeLabel: 'Copy',
    copiedLabel: 'Copied',
    linkCopiedLabel: 'Link copied.',
    copyBlockedLabel:
      'Copying is blocked here. Copy the address from your browser.',
    codeSelectedLabel: 'Code selected. Press Ctrl C or Command C to copy.',
    savedLabel: 'Saved for later.',
    unsavedLabel: 'Removed from saved articles.',
    menuSummaryLabel: 'Menu',
    featuredLabel: 'Featured',
    readEssayLabel: 'Read the essay',
    latestHeading: 'Latest',
    moreArticlesHeading: 'More articles',
    browseByTagLabel: 'Browse by tag',
    seriesCardLabel: 'Series',
    /** @type {(count: string) => string} */
    partsCountLabel: (count) => `${count} parts`,
    startSeriesLabel: 'Start with part 1',
    newsletterLabel: 'Newsletter',
    newsletterActionLabel: 'Subscribe',
    /** @type {(minutes: string) => string} */
    readingTimeLabel: (minutes) => `${minutes} min read`,
    /** @type {(part: string, total: string) => string} */
    seriesPartLabel: (part, total) => `Part ${part} of ${total}`,
    onThisPageLabel: 'On this page',
    writtenByLabel: 'Written by',
    aboutTheAuthorLabel: 'About the author',
    youAreHereLabel: 'You are here',
    newerArticleLabel: 'Newer',
    olderArticleLabel: 'Older',
    moreArticlesNavigationLabel: 'More articles',
    keepReadingHeading: 'Keep reading',
    /** @type {(tag: string) => string} */
    moreInTagLabel: (tag) => `More in ${tag}`,
    interactionsHeading: 'Responses',
    reactionsGroupLabel: 'Reactions',
    likeLabel: 'Like',
    commentsHeading: 'Conversation',
    interactionsNeedScriptNotice: 'Reactions and comments need JavaScript.',
    showMoreCommentsLabel: 'Show more comments',
    shareLabel: 'Share',
    copyLinkLabel: 'Copy link to this article',
    saveForLaterLabel: 'Save for later',
    tagListLabel: 'Tags',
    tagKickerLabel: 'Tag',
    seriesKickerLabel: 'Series',
    archiveKickerLabel: 'Archive',
    authorKickerLabel: 'Author',
    /** @type {(count: string) => string} */
    articleCountLabel: (count) =>
      count === '1' ? '1 article' : `${count} articles`,
    emptyListingLabel: 'No articles yet.',
    editionsNavigationLabel: 'Editions',
    editionOriginalLabel: 'Original',
    editionQuickReadLabel: 'Quick read',
    editionStandardLabel: 'Standard',
    editionDeepDiveLabel: 'Deep dive',
    editionNoticeLabel:
      'Generated edition, reviewed by the author; the original is the reference',
    /** @type {(title: string, edition: string) => string} */
    editionPageTitle: (title, edition) => `${title} (${edition})`,
    aboutPageTitle: 'About',
    /** @type {(date: string) => string} */
    updatedLabel: (date) => `Updated ${date}`,
    /** @type {(tag: string) => string} */
    tagPageTitle: (tag) => `Posts tagged \u201c${tag}\u201d`,
    /** @type {(count: string, tag: string, publication: string) => string} */
    tagPageDescription: (count, tag, publication) =>
      `${count === '1' ? '1 article' : `${count} articles`} tagged ${tag} on ${publication}.`,
    /** @type {(count: string, name: string, publication: string) => string} */
    seriesPageDescription: (count, name, publication) =>
      `${name}, a series of ${count === '1' ? '1 part' : `${count} parts`} on ${publication}.`,
    /** @type {(year: string) => string} */
    archivePageTitle: (year) => `Archive ${year}`,
    /** @type {(count: string, year: string, publication: string) => string} */
    archivePageDescription: (count, year, publication) =>
      `${count === '1' ? '1 article' : `${count} articles`} published in ${year} on ${publication}.`,
    /** @type {(name: string, publication: string) => string} */
    authorPageDescription: (name, publication) =>
      `Articles written by ${name} on ${publication}.`,
    /** @type {(count: string, publication: string) => string} */
    tagsRootDescription: (count, publication) =>
      `Browse the ${count} topics covered on ${publication}.`,
    /** @type {(count: string, publication: string) => string} */
    seriesRootDescription: (count, publication) =>
      `Browse the ${count} series published on ${publication}.`,
    /** @type {(count: string, publication: string) => string} */
    archiveRootDescription: (count, publication) =>
      `Every article on ${publication}, ${count} in all, by year.`,
    /** @type {(publication: string) => string} */
    indexPageDescription: (publication) =>
      `All articles on ${publication}, newest first.`,
    exploreColumnLabel: 'Explore',
    rssFeedLabel: 'RSS feed',
    /** @type {(iso: string) => string} */
    formatDate: (iso) => {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
      if (!match) return iso;
      return `${months[Number(match[2]) - 1]} ${Number(match[3])}, ${match[1]}`;
    },
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
