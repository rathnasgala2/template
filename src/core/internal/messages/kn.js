/**
 * Chrome message catalog for the `kn` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'ವಿಷಯಕ್ಕೆ ಹೋಗಿ',
  homeLinkLabel: 'ಮುಖಪುಟ',
  primaryNavigationLabel: 'ಮುಖ್ಯ',
  footerNavigationLabel: 'ಅಡಿಟಿಪ್ಪಣಿ',
  breadcrumbNavigationLabel: 'ಬ್ರೆಡ್‌ಕ್ರಂಬ್',
  paginationNavigationLabel: 'ಪುಟಗಳು',
  previousPageLabel: 'ಹಿಂದಿನದು',
  nextPageLabel: 'ಮುಂದಿನದು',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `ಪುಟ ${current} / ${total}`,
  authorsSectionLabel: 'ಲೇಖಕರು',
  tagsSectionLabel: 'ಟ್ಯಾಗ್‌ಗಳು',
  seriesSectionLabel: 'ಸರಣಿ',
  archiveSectionLabel: 'ಆರ್ಕೈವ್',
  indexHeading: 'ಎಲ್ಲಾ ಲೇಖನಗಳು',
  authorsIndexLabel: 'ಲೇಖಕರು',
  tagIndexLabelPrefix: 'ಟ್ಯಾಗ್:',
  seriesIndexLabelPrefix: 'ಸರಣಿ:',
  archiveYearLabelPrefix: 'ಆರ್ಕೈವ್:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName} ಬಗ್ಗೆ`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `${displayName} ಅವರಿಂದ`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ತೆರೆಯುತ್ತದೆ',
  footerLegalLabel: 'ಕಾನೂನು',
  termsLinkLabel: 'ನಿಯಮಗಳು',
  privacyLinkLabel: 'ಗೌಪ್ಯತೆ',
  consentRegionLabel: 'ಗೌಪ್ಯತೆ ಆಯ್ಕೆಗಳು',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `ಓದುಗರನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಈ ಸೈಟ್ ${providerName} ಬಳಸಲು ಬಯಸುತ್ತದೆ. ನೀವು ಒಪ್ಪುವವರೆಗೆ ಏನೂ ಲೋಡ್ ಆಗುವುದಿಲ್ಲ, ಮತ್ತು ನಿಮ್ಮ ಆಯ್ಕೆಯನ್ನು ಯಾವಾಗ ಬೇಕಾದರೂ ಅಡಿಟಿಪ್ಪಣಿಯಿಂದ ಬದಲಿಸಬಹುದು.`,
  consentAcceptLabel: 'ಅನಾಲಿಟಿಕ್ಸ್ ಒಪ್ಪಿಕೊಳ್ಳಿ',
  consentDeclineLabel: 'ನಿರಾಕರಿಸಿ',
  consentOpenLabel: 'ಗೌಪ್ಯತೆ ಆಯ್ಕೆಗಳು',
  errorPageHeading: 'ಪುಟ ಸಿಗಲಿಲ್ಲ',
  errorPageBody:
    'ನೀವು ಹುಡುಕುತ್ತಿದ್ದ ಪುಟ ಸಿಗಲಿಲ್ಲ. ಅದನ್ನು ಸ್ಥಳಾಂತರಿಸಿರಬಹುದು, ಹೆಸರು ಬದಲಿಸಿರಬಹುದು ಅಥವಾ ತೆಗೆದುಹಾಕಿರಬಹುದು.',
  errorPageReturnHomeLabel: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
  appearanceControlLabel: 'ಗೋಚರತೆ',
  appearanceModeLightLabel: 'ಲೈಟ್',
  appearanceModeDarkLabel: 'ಡಾರ್ಕ್',
  appearanceModeSystemLabel: 'ಸಿಸ್ಟಮ್',
  searchButtonLabel: 'ಹುಡುಕಿ',
  searchButtonAriaLabel: 'ಲೇಖನಗಳನ್ನು ಹುಡುಕಿ',
  searchPlaceholderLabel: 'ಪ್ರಕಟಣೆಯಲ್ಲಿ ಹುಡುಕಿ',
  searchEmptyLabel: 'ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಹೊಂದುವ ಲೇಖನಗಳಿಲ್ಲ.',
  searchUnavailableLabel: 'ಹುಡುಕಾಟ ಈಗ ಲಭ್ಯವಿಲ್ಲ.',
  copyCodeLabel: 'ನಕಲಿಸಿ',
  copiedLabel: 'ನಕಲಿಸಲಾಗಿದೆ',
  linkCopiedLabel: 'ಲಿಂಕ್ ನಕಲಿಸಲಾಗಿದೆ.',
  copyBlockedLabel:
    'ಇಲ್ಲಿ ನಕಲಿಸುವುದನ್ನು ತಡೆಯಲಾಗಿದೆ. ವಿಳಾಸವನ್ನು ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಿಂದ ನಕಲಿಸಿ.',
  codeSelectedLabel: 'ಕೋಡ್ ಆಯ್ಕೆಯಾಗಿದೆ. ನಕಲಿಸಲು Ctrl C ಅಥವಾ Command C ಒತ್ತಿ.',
  savedLabel: 'ನಂತರಕ್ಕಾಗಿ ಉಳಿಸಲಾಗಿದೆ.',
  unsavedLabel: 'ಉಳಿಸಿದ ಲೇಖನಗಳಿಂದ ತೆಗೆಯಲಾಗಿದೆ.',
  menuSummaryLabel: 'ಮೆನು',
  featuredLabel: 'ವಿಶೇಷ',
  readEssayLabel: 'ಪ್ರಬಂಧ ಓದಿ',
  latestHeading: 'ಇತ್ತೀಚಿನವು',
  moreArticlesHeading: 'ಇನ್ನಷ್ಟು ಲೇಖನಗಳು',
  browseByTagLabel: 'ಟ್ಯಾಗ್ ಪ್ರಕಾರ ನೋಡಿ',
  seriesCardLabel: 'ಸರಣಿ',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} ಭಾಗಗಳು`,
  startSeriesLabel: 'ಭಾಗ 1 ರಿಂದ ಪ್ರಾರಂಭಿಸಿ',
  newsletterLabel: 'ಸುದ್ದಿಪತ್ರ',
  newsletterActionLabel: 'ಚಂದಾದಾರರಾಗಿ',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} ನಿಮಿಷಗಳ ಓದು`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `ಭಾಗ ${part} / ${total}`,
  onThisPageLabel: 'ಈ ಪುಟದಲ್ಲಿ',
  writtenByLabel: 'ಲೇಖಕರು',
  aboutTheAuthorLabel: 'ಲೇಖಕರ ಬಗ್ಗೆ',
  youAreHereLabel: 'ನೀವು ಇಲ್ಲಿದ್ದೀರಿ',
  newerArticleLabel: 'ಹೊಸದು',
  olderArticleLabel: 'ಹಳೆಯದು',
  moreArticlesNavigationLabel: 'ಇನ್ನಷ್ಟು ಲೇಖನಗಳು',
  keepReadingHeading: 'ಓದುತ್ತಿರಿ',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `${tag} ನಲ್ಲಿ ಇನ್ನಷ್ಟು`,
  interactionsHeading: 'ಪ್ರತಿಕ್ರಿಯೆಗಳು',
  reactionsGroupLabel: 'ರಿಯಾಕ್ಷನ್‌ಗಳು',
  likeLabel: 'ಇಷ್ಟ',
  commentsHeading: 'ಚರ್ಚೆ',
  interactionsNeedScriptNotice:
    'ರಿಯಾಕ್ಷನ್ ಮತ್ತು ಕಾಮೆಂಟ್‌ಗಳಿಗೆ JavaScript ಬೇಕು.',
  showMoreCommentsLabel: 'ಇನ್ನಷ್ಟು ಕಾಮೆಂಟ್‌ಗಳನ್ನು ತೋರಿಸಿ',
  shareLabel: 'ಹಂಚಿಕೊಳ್ಳಿ',
  copyLinkLabel: 'ಈ ಲೇಖನದ ಲಿಂಕ್ ನಕಲಿಸಿ',
  saveForLaterLabel: 'ನಂತರಕ್ಕಾಗಿ ಉಳಿಸಿ',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `${network} ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ`,
  shareByEmailLabel: 'ಇಮೇಲ್ ಮೂಲಕ ಹಂಚಿಕೊಳ್ಳಿ',
  shareNativeLabel: 'ಈ ಲೇಖನವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ',
  followLabel: 'ಫಾಲೋ ಮಾಡಿ',
  followingLabel: 'ಫಾಲೋ ಮಾಡುತ್ತಿದ್ದೀರಿ',
  unfollowLabel: 'ಅನ್‌ಫಾಲೋ ಮಾಡಿ',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name} ಅವರನ್ನು ಫಾಲೋ ಮಾಡಿ`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name} ಅವರನ್ನು ಅನ್‌ಫಾಲೋ ಮಾಡಿ`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) =>
    `ನೀವು ಈಗ ${name} ಅವರನ್ನು ಫಾಲೋ ಮಾಡುತ್ತಿದ್ದೀರಿ.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) =>
    `ನೀವು ಇನ್ನು ${name} ಅವರನ್ನು ಫಾಲೋ ಮಾಡುತ್ತಿಲ್ಲ.`,
  followDisabledMessage: 'ಈ ಸೈಟ್‌ನಲ್ಲಿ ಈಗ ಫಾಲೋ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ.',
  followAuthorMissingMessage: 'ಈ ಲೇಖಕರನ್ನು ಈಗ ಫಾಲೋ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ.',
  audienceNetworkError: 'Galascribe ತಲುಪಲು ಆಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  audienceRateLimited:
    'ತುಂಬಾ ಪ್ರಯತ್ನಗಳಾಗಿವೆ. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  audienceGenericError: 'ಏನೋ ತಪ್ಪಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  audienceStorageBlocked:
    'ಸೈನ್ ಇನ್‌ಗೆ ಈ ಸೈಟ್‌ಗೆ ಬೇಕಾದ ಸಂಗ್ರಹಣೆಯನ್ನು ನಿಮ್ಮ ಬ್ರೌಸರ್ ತಡೆದಿದೆ.',
  audienceSignInUnsupported: 'ಈ ಬ್ರೌಸರ್ ಈ ಪುಟದಲ್ಲಿ ಸೈನ್ ಇನ್ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ.',
  audienceSignInFailed: 'ಸೈನ್ ಇನ್ ಪೂರ್ಣಗೊಳ್ಳಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  audienceSignInInvalid: 'ಆ ಸೈನ್ ಇನ್ ಲಿಂಕ್ ಮಾನ್ಯವಾಗಿರಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  honeypotLabel: 'ಈ ಕ್ಷೇತ್ರವನ್ನು ಖಾಲಿ ಬಿಡಿ',
  fieldRequiredMessage: 'ಈ ಕ್ಷೇತ್ರ ಅಗತ್ಯ.',
  fieldInvalidMessage: 'ಈ ಕ್ಷೇತ್ರವನ್ನು ಪರಿಶೀಲಿಸಿ.',
  newsletterEmailLabel: 'ಇಮೇಲ್ ವಿಳಾಸ',
  newsletterCheckInbox: 'ದೃಢೀಕರಿಸಲು ನಿಮ್ಮ ಇನ್‌ಬಾಕ್ಸ್ ನೋಡಿ',
  newsletterFullMessage: 'ಈ ಸುದ್ದಿಪತ್ರ ಈಗ ಹೊಸ ಚಂದಾದಾರರನ್ನು ಸ್ವೀಕರಿಸುತ್ತಿಲ್ಲ.',
  newsletterEmailInvalid: 'ಮಾನ್ಯ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ.',
  contactLinkLabel: 'ಸಂಪರ್ಕ',
  contactPageTitle: 'ಸಂಪರ್ಕ',
  contactDefaultIntro:
    'ಪ್ರಶ್ನೆ ಅಥವಾ ಹೇಳಲು ಏನಾದರೂ ಇದೆಯೇ? ಸಂದೇಶ ಕಳುಹಿಸಿ, ಲೇಖಕರು ಇಮೇಲ್ ಮೂಲಕ ಉತ್ತರಿಸುತ್ತಾರೆ.',
  contactNameLabel: 'ಹೆಸರು',
  contactEmailLabel: 'ಇಮೇಲ್',
  contactMessageLabel: 'ಸಂದೇಶ',
  contactWebsiteLabel: 'ವೆಬ್‌ಸೈಟ್ (ಐಚ್ಛಿಕ)',
  contactPhoneLabel: 'ಫೋನ್ (ಐಚ್ಛಿಕ)',
  contactSubmitLabel: 'ಸಂದೇಶ ಕಳುಹಿಸಿ',
  contactNoscript:
    'ಈ ಫಾರ್ಮ್‌ಗೆ JavaScript ಬೇಕು. ಸಂದೇಶ ಕಳುಹಿಸಲು ಅದನ್ನು ಆನ್ ಮಾಡಿ.',
  contactSent: 'ಧನ್ಯವಾದಗಳು, ನಿಮ್ಮ ಸಂದೇಶ ಕಳುಹಿಸಲಾಗಿದೆ.',
  contactUnavailable: 'ಈ ಫಾರ್ಮ್ ಈಗ ಸಂದೇಶಗಳನ್ನು ಸ್ವೀಕರಿಸುತ್ತಿಲ್ಲ.',
  contactRateLimited: 'ಇಲ್ಲಿಂದ ತುಂಬಾ ಸಂದೇಶಗಳು ಬಂದಿವೆ. ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  contactMessageLinks: 'ನಿಮ್ಮ ಸಂದೇಶದಲ್ಲಿ ಗರಿಷ್ಠ ಎರಡು ಲಿಂಕ್‌ಗಳಿರಬಹುದು.',
  tagListLabel: 'ಟ್ಯಾಗ್‌ಗಳು',
  tagKickerLabel: 'ಟ್ಯಾಗ್',
  seriesKickerLabel: 'ಸರಣಿ',
  archiveKickerLabel: 'ಆರ್ಕೈವ್',
  authorKickerLabel: 'ಲೇಖಕರು',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} ಲೇಖನಗಳು`,
  emptyListingLabel: 'ಇನ್ನೂ ಲೇಖನಗಳಿಲ್ಲ.',
  editionsNavigationLabel: 'ಆವೃತ್ತಿಗಳು',
  editionOriginalLabel: 'ಮೂಲ',
  editionQuickReadLabel: 'ಕ್ಷಿಪ್ರ ಓದು',
  editionStandardLabel: 'ಸಾಮಾನ್ಯ',
  editionDeepDiveLabel: 'ಆಳವಾದ ಓದು',
  editionNoticeLabel: 'ರಚಿಸಿದ ಆವೃತ್ತಿ, ಲೇಖಕರು ಪರಿಶೀಲಿಸಿದ್ದಾರೆ; ಮೂಲ ಲೇಖನವೇ ಆಧಾರ',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'ಪರಿಚಯ',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `ನವೀಕರಿಸಲಾಗಿದೆ: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `“${tag}” ಟ್ಯಾಗ್ ಇರುವ ಲೇಖನಗಳು`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication} ನಲ್ಲಿ ${tag} ಟ್ಯಾಗ್ ಇರುವ ${count} ಲೇಖನಗಳು.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, ${publication} ನಲ್ಲಿರುವ ${count} ಭಾಗಗಳ ಸರಣಿ.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `ಆರ್ಕೈವ್ ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication} ನಲ್ಲಿ ${year} ರಲ್ಲಿ ಪ್ರಕಟವಾದ ${count} ಲೇಖನಗಳು.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${publication} ನಲ್ಲಿ ${name} ಬರೆದ ಲೇಖನಗಳು.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `${publication} ನಲ್ಲಿ ಒಳಗೊಂಡ ${count} ವಿಷಯಗಳನ್ನು ನೋಡಿ.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `${publication} ನಲ್ಲಿ ಪ್ರಕಟವಾದ ${count} ಸರಣಿಗಳನ್ನು ನೋಡಿ.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication} ನ ಎಲ್ಲಾ ಲೇಖನಗಳು, ಒಟ್ಟು ${count}, ವರ್ಷದ ಪ್ರಕಾರ.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `${publication} ನ ಎಲ್ಲಾ ಲೇಖನಗಳು, ಹೊಸದು ಮೊದಲು.`,
  exploreColumnLabel: 'ಅನ್ವೇಷಿಸಿ',
  rssFeedLabel: 'RSS ಫೀಡ್',
  languageKickerLabel: 'ಭಾಷೆ',
  languageSwitcherLabel: 'ಭಾಷೆಗಳು',
  languageChipsLabel: 'ಲಭ್ಯವಿರುವ ಭಾಷೆಗಳು',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication} ನಲ್ಲಿ ${language} ಭಾಷೆಯ ${count} ಲೇಖನಗಳು.`,
  postRemovedHeading: 'ಈ ಪೋಸ್ಟ್ ಅನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `ಇದನ್ನು ${date} ರಂದು ತೆಗೆದುಹಾಕಲಾಗಿದೆ.`,
  postRemovedHomeLabel: 'ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ',
  versionPageHeading: 'ಸೈಟ್ ಆವೃತ್ತಿ',
  versionTemplateLabel: 'ಟೆಂಪ್ಲೇಟ್',
  versionThemeLabel: 'ಥೀಮ್',
  versionSchemasLabel: 'ಸ್ಕೀಮಾಗಳು',
  versionToolchainLabel: 'ಪ್ರಕಟಣೆ ಟೂಲ್‌ಚೇನ್',
  versionCommitLabel: 'ಮೂಲ ಕಮಿಟ್',
  versionBuiltAtLabel: 'ನಿರ್ಮಿಸಿದ ಸಮಯ',
  listenNavLabel: 'ಆಲಿಸಿ',
  listenNavCurrentLabel: 'ಈ ಲೇಖನವನ್ನು ಆಲಿಸಿ',
  listenInviteTitle: 'ಕೈಗಳು ಬ್ಯುಸಿಯೇ? ಬದಲಿಗೆ ಆಲಿಸಿ.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `ಈ ಲೇಖನ ${minutes} ನಿಮಿಷಗಳ ಸಂಭಾಷಣೆಯಾಗಿಯೂ ಲಭ್ಯವಿದೆ. ಪ್ರಯಾಣ, ವ್ಯಾಯಾಮ ಅಥವಾ ಪಾತ್ರೆ ತೊಳೆಯುವಾಗ ಸೂಕ್ತ.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `ಈ ಲೇಖನ ${minutes} ನಿಮಿಷಗಳ ವಾಚನವಾಗಿಯೂ ಲಭ್ಯವಿದೆ. ಪ್ರಯಾಣ, ವ್ಯಾಯಾಮ ಅಥವಾ ಪಾತ್ರೆ ತೊಳೆಯುವಾಗ ಸೂಕ್ತ.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `ಈ ಲೇಖನ ${minutes} ನಿಮಿಷಗಳ ಚರ್ಚೆಯಾಗಿಯೂ ಲಭ್ಯವಿದೆ. ಪ್ರಯಾಣ, ವ್ಯಾಯಾಮ ಅಥವಾ ಪಾತ್ರೆ ತೊಳೆಯುವಾಗ ಸೂಕ್ತ.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `ಈ ಲೇಖನ ${minutes} ನಿಮಿಷಗಳ ಸ್ಕಿಟ್ ಆಗಿಯೂ ಲಭ್ಯವಿದೆ. ಪ್ರಯಾಣ, ವ್ಯಾಯಾಮ ಅಥವಾ ಪಾತ್ರೆ ತೊಳೆಯುವಾಗ ಸೂಕ್ತ.`,
  listenInvitePlayLabel: 'ಪ್ಲೇ ಮಾಡಿ',
  listenInviteDeclineLabel: 'ಬೇಡ, ಧನ್ಯವಾದಗಳು',
  listenInviteNote: 'AI ಧ್ವನಿಗಳು, ಈ ಲೇಖನದಿಂದ ಅಳವಡಿಸಿದ್ದು.',
  listenInviteCloseLabel: 'ಸದ್ಯಕ್ಕೆ ಮುಚ್ಚಿ',
  listenPlayerRegionLabel: 'ಆಡಿಯೊ ಪ್ಲೇಯರ್',
  listenPlayerNowPlayingLabel: 'ಈಗ ಪ್ಲೇ ಆಗುತ್ತಿದೆ',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${count} ರಲ್ಲಿ ${index}`,
  listenPlayerPlayLabel: 'ಪ್ಲೇ',
  listenPlayerPauseLabel: 'ವಿರಾಮ',
  listenPlayerBackLabel: '15 ಸೆಕೆಂಡ್ ಹಿಂದಕ್ಕೆ',
  listenPlayerPreviousLabel: 'ಹಿಂದಿನ ಸಂಚಿಕೆ',
  listenPlayerNextLabel: 'ಮುಂದಿನ ಸಂಚಿಕೆ',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `ಪ್ಲೇಬ್ಯಾಕ್ ವೇಗ ${rate}×`,
  listenPlayerSeekLabel: 'ಸ್ಥಾನ',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${total} ರಲ್ಲಿ ${elapsed}`,
  listenPlayerCloseLabel: 'ನಿಲ್ಲಿಸಿ ಮುಚ್ಚಿ',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `ಪ್ಲೇ ಆಗುತ್ತಿದೆ: ${title}`,
  listenListHeading: 'ಈ ಬ್ಲಾಗ್ ಆಲಿಸಿ',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count} ಸಂಚಿಕೆಗಳು · ${duration}`,
  listenListPlayAllLabel: 'ಎಲ್ಲವನ್ನೂ ಪ್ಲೇ ಮಾಡಿ',
  listenListShuffleLabel: 'ಷಫಲ್',
  listenListOrderLabel: 'ಕ್ರಮ',
  listenListNewestLabel: 'ಹೊಸದು ಮೊದಲು',
  listenListOldestLabel: 'ಹಳೆಯದು ಮೊದಲು',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `ಎಲ್ಲಾ ${count} ತೋರಿಸಿ`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `${title} ಪ್ಲೇ ಮಾಡಿ`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} ನಿಮಿಷ`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) =>
    `${hours} ಗಂಟೆ ${minutes} ನಿಮಿಷ`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('kn', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
