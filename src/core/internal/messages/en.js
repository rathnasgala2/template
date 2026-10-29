/**
 * Chrome message catalog for the `en` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
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
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, opens in a new tab',
  footerLegalLabel: 'Legal',
  termsLinkLabel: 'Terms',
  privacyLinkLabel: 'Privacy',
  consentRegionLabel: 'Privacy choices',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `This site would like to use ${providerName} to understand readership. ` +
    'Nothing is loaded until you accept, and you can change your choice any ' +
    'time from the footer.',
  consentAcceptLabel: 'Accept analytics',
  consentDeclineLabel: 'Decline',
  consentOpenLabel: 'Privacy choices',
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
  partsCountLabel: (count) => (count === '1' ? '1 part' : `${count} parts`),
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
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Share on ${network}`,
  shareByEmailLabel: 'Share by email',
  shareNativeLabel: 'Share this article',
  followLabel: 'Follow',
  followingLabel: 'Following',
  unfollowLabel: 'Unfollow',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Follow ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Unfollow ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `You now follow ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `You no longer follow ${name}.`,
  followDisabledMessage: "Following isn't available on this site right now.",
  followAuthorMissingMessage: "This author can't be followed right now.",
  audienceNetworkError: "Couldn't reach Galascribe. Try again.",
  audienceRateLimited: 'Too many attempts. Try again in a moment.',
  audienceGenericError: 'Something went wrong. Try again.',
  audienceStorageBlocked:
    'Your browser blocked storage this site needs to sign you in.',
  audienceSignInUnsupported: "This browser can't sign you in on this page.",
  audienceSignInFailed: "Sign-in didn't complete. Try again.",
  audienceSignInInvalid: "That sign-in link wasn't valid. Try again.",
  honeypotLabel: 'Leave this field empty',
  fieldRequiredMessage: 'This field is required.',
  fieldInvalidMessage: 'Check this field.',
  newsletterEmailLabel: 'Email address',
  newsletterCheckInbox: 'Check your inbox to confirm',
  newsletterFullMessage:
    "This newsletter isn't taking new subscribers right now.",
  newsletterEmailInvalid: 'Enter a valid email address.',
  contactLinkLabel: 'Contact',
  contactPageTitle: 'Contact',
  contactDefaultIntro:
    'Have a question or something to say? Send a message and the author will reply by email.',
  contactNameLabel: 'Name',
  contactEmailLabel: 'Email',
  contactMessageLabel: 'Message',
  contactWebsiteLabel: 'Website (optional)',
  contactPhoneLabel: 'Phone (optional)',
  contactSubmitLabel: 'Send message',
  contactNoscript: 'This form needs JavaScript. Turn it on to send a message.',
  contactSent: 'Thanks, your message was sent.',
  contactUnavailable: "This form isn't accepting messages right now.",
  contactRateLimited: 'Too many messages from here. Try again later.',
  contactMessageLinks: 'Your message can have at most two links.',
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
    `Browse the ${count === '1' ? '1 topic' : `${count} topics`} covered on ${publication}.`,
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
  languageKickerLabel: 'Language',
  languageSwitcherLabel: 'Languages',
  languageChipsLabel: 'Available languages',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? '1 article' : `${count} articles`} in ${language} on ${publication}.`,
  postRemovedHeading: 'This post was removed',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `It was removed on ${date}.`,
  postRemovedHomeLabel: 'Go to the home page',
  versionPageHeading: 'Site version',
  versionTemplateLabel: 'Template',
  versionThemeLabel: 'Theme',
  versionSchemasLabel: 'Schemas',
  versionToolchainLabel: 'Publish toolchain',
  versionCommitLabel: 'Source commit',
  versionBuiltAtLabel: 'Built at',
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
});
