/**
 * Chrome message catalog for the `ml` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'ഉള്ളടക്കത്തിലേക്ക് പോകുക',
  homeLinkLabel: 'ഹോം',
  primaryNavigationLabel: 'പ്രധാനം',
  footerNavigationLabel: 'ഫൂട്ടർ',
  breadcrumbNavigationLabel: 'ബ്രെഡ്ക്രമ്പ്',
  paginationNavigationLabel: 'പേജുകൾ',
  previousPageLabel: 'മുമ്പത്തേത്',
  nextPageLabel: 'അടുത്തത്',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `പേജ് ${current} / ${total}`,
  authorsSectionLabel: 'എഴുത്തുകാർ',
  tagsSectionLabel: 'ടാഗുകൾ',
  seriesSectionLabel: 'പരമ്പര',
  archiveSectionLabel: 'ആർക്കൈവ്',
  indexHeading: 'എല്ലാ ലേഖനങ്ങളും',
  authorsIndexLabel: 'എഴുത്തുകാർ',
  tagIndexLabelPrefix: 'ടാഗ്:',
  seriesIndexLabelPrefix: 'പരമ്പര:',
  archiveYearLabelPrefix: 'ആർക്കൈവ്:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName} - പരിചയം`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `എഴുതിയത്: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, പുതിയ ടാബിൽ തുറക്കും',
  footerLegalLabel: 'നിയമപരം',
  termsLinkLabel: 'നിബന്ധനകൾ',
  privacyLinkLabel: 'സ്വകാര്യത',
  consentRegionLabel: 'സ്വകാര്യതാ തിരഞ്ഞെടുപ്പുകൾ',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `വായനക്കാരെ മനസ്സിലാക്കാൻ ഈ സൈറ്റ് ${providerName} ഉപയോഗിക്കാൻ ആഗ്രഹിക്കുന്നു. നിങ്ങൾ അംഗീകരിക്കുന്നതുവരെ ഒന്നും ലോഡ് ചെയ്യില്ല, തിരഞ്ഞെടുപ്പ് എപ്പോൾ വേണമെങ്കിലും ഫൂട്ടറിൽ നിന്ന് മാറ്റാം.`,
  consentAcceptLabel: 'അനലിറ്റിക്സ് അംഗീകരിക്കുക',
  consentDeclineLabel: 'നിരസിക്കുക',
  consentOpenLabel: 'സ്വകാര്യതാ തിരഞ്ഞെടുപ്പുകൾ',
  errorPageHeading: 'പേജ് കണ്ടെത്താനായില്ല',
  errorPageBody:
    'നിങ്ങൾ തിരഞ്ഞ പേജ് കണ്ടെത്താനായില്ല. അത് മാറ്റുകയോ പേര് മാറ്റുകയോ നീക്കം ചെയ്യുകയോ ചെയ്തിരിക്കാം.',
  errorPageReturnHomeLabel: 'ഹോം പേജിലേക്ക് മടങ്ങുക',
  appearanceControlLabel: 'രൂപം',
  appearanceModeLightLabel: 'ലൈറ്റ്',
  appearanceModeDarkLabel: 'ഡാർക്ക്',
  appearanceModeSystemLabel: 'സിസ്റ്റം',
  searchButtonLabel: 'തിരയുക',
  searchButtonAriaLabel: 'ലേഖനങ്ങൾ തിരയുക',
  searchPlaceholderLabel: 'പ്രസിദ്ധീകരണത്തിൽ തിരയുക',
  searchEmptyLabel: 'നിങ്ങളുടെ തിരച്ചിലിനോട് യോജിക്കുന്ന ലേഖനങ്ങളില്ല.',
  searchUnavailableLabel: 'തിരച്ചിൽ ഇപ്പോൾ ലഭ്യമല്ല.',
  copyCodeLabel: 'പകർത്തുക',
  copiedLabel: 'പകർത്തി',
  linkCopiedLabel: 'ലിങ്ക് പകർത്തി.',
  copyBlockedLabel:
    'ഇവിടെ പകർത്തുന്നത് തടഞ്ഞിരിക്കുന്നു. വിലാസം ബ്രൗസറിൽ നിന്ന് പകർത്തുക.',
  codeSelectedLabel:
    'കോഡ് തിരഞ്ഞെടുത്തു. പകർത്താൻ Ctrl C അല്ലെങ്കിൽ Command C അമർത്തുക.',
  savedLabel: 'പിന്നീട് വായിക്കാൻ സൂക്ഷിച്ചു.',
  unsavedLabel: 'സൂക്ഷിച്ച ലേഖനങ്ങളിൽ നിന്ന് നീക്കി.',
  menuSummaryLabel: 'മെനു',
  featuredLabel: 'തിരഞ്ഞെടുത്തത്',
  readEssayLabel: 'ലേഖനം വായിക്കുക',
  latestHeading: 'ഏറ്റവും പുതിയത്',
  moreArticlesHeading: 'കൂടുതൽ ലേഖനങ്ങൾ',
  browseByTagLabel: 'ടാഗ് അനുസരിച്ച് കാണുക',
  seriesCardLabel: 'പരമ്പര',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} ഭാഗങ്ങൾ`,
  startSeriesLabel: 'ഭാഗം 1 മുതൽ തുടങ്ങുക',
  newsletterLabel: 'ന്യൂസ്‌ലെറ്റർ',
  newsletterActionLabel: 'സബ്സ്ക്രൈബ് ചെയ്യുക',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} മിനിറ്റ് വായന`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `ഭാഗം ${part} / ${total}`,
  onThisPageLabel: 'ഈ പേജിൽ',
  writtenByLabel: 'എഴുതിയത്',
  aboutTheAuthorLabel: 'എഴുത്തുകാരനെക്കുറിച്ച്',
  youAreHereLabel: 'നിങ്ങൾ ഇവിടെയാണ്',
  newerArticleLabel: 'പുതിയത്',
  olderArticleLabel: 'പഴയത്',
  moreArticlesNavigationLabel: 'കൂടുതൽ ലേഖനങ്ങൾ',
  keepReadingHeading: 'വായന തുടരുക',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `${tag} - കൂടുതൽ`,
  interactionsHeading: 'പ്രതികരണങ്ങൾ',
  reactionsGroupLabel: 'റിയാക്ഷനുകൾ',
  likeLabel: 'ഇഷ്ടപ്പെട്ടു',
  commentsHeading: 'ചർച്ച',
  interactionsNeedScriptNotice:
    'റിയാക്ഷനുകൾക്കും കമന്റുകൾക്കും JavaScript ആവശ്യമാണ്.',
  showMoreCommentsLabel: 'കൂടുതൽ കമന്റുകൾ കാണിക്കുക',
  shareLabel: 'പങ്കിടുക',
  copyLinkLabel: 'ഈ ലേഖനത്തിന്റെ ലിങ്ക് പകർത്തുക',
  saveForLaterLabel: 'പിന്നീടുള്ളതിനായി സൂക്ഷിക്കുക',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `${network}-ൽ പങ്കിടുക`,
  shareByEmailLabel: 'ഇമെയിൽ വഴി പങ്കിടുക',
  shareNativeLabel: 'ഈ ലേഖനം പങ്കിടുക',
  followLabel: 'പിന്തുടരുക',
  followingLabel: 'പിന്തുടരുന്നു',
  unfollowLabel: 'പിന്തുടരൽ നിർത്തുക',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name} എന്നയാളെ പിന്തുടരുക`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name} എന്നയാളെ പിന്തുടരുന്നത് നിർത്തുക`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) =>
    `ഇപ്പോൾ നിങ്ങൾ ${name} എന്നയാളെ പിന്തുടരുന്നു.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) =>
    `നിങ്ങൾ ഇനി ${name} എന്നയാളെ പിന്തുടരുന്നില്ല.`,
  followDisabledMessage: 'ഈ സൈറ്റിൽ ഇപ്പോൾ പിന്തുടരാൻ കഴിയില്ല.',
  followAuthorMissingMessage: 'ഈ എഴുത്തുകാരനെ ഇപ്പോൾ പിന്തുടരാൻ കഴിയില്ല.',
  audienceNetworkError: 'Galascribe-ൽ എത്താനായില്ല. വീണ്ടും ശ്രമിക്കുക.',
  audienceRateLimited:
    'വളരെയധികം ശ്രമങ്ങൾ. അൽപ്പസമയത്തിനു ശേഷം വീണ്ടും ശ്രമിക്കുക.',
  audienceGenericError: 'എന്തോ കുഴപ്പം സംഭവിച്ചു. വീണ്ടും ശ്രമിക്കുക.',
  audienceStorageBlocked:
    'സൈൻ ഇൻ ചെയ്യാൻ ഈ സൈറ്റിന് ആവശ്യമായ സ്റ്റോറേജ് നിങ്ങളുടെ ബ്രൗസർ തടഞ്ഞു.',
  audienceSignInUnsupported: 'ഈ ബ്രൗസറിന് ഈ പേജിൽ സൈൻ ഇൻ ചെയ്യാൻ കഴിയില്ല.',
  audienceSignInFailed: 'സൈൻ ഇൻ പൂർത്തിയായില്ല. വീണ്ടും ശ്രമിക്കുക.',
  audienceSignInInvalid:
    'ആ സൈൻ ഇൻ ലിങ്ക് സാധുവായിരുന്നില്ല. വീണ്ടും ശ്രമിക്കുക.',
  honeypotLabel: 'ഈ ഫീൽഡ് ഒഴിച്ചിടുക',
  fieldRequiredMessage: 'ഈ ഫീൽഡ് ആവശ്യമാണ്.',
  fieldInvalidMessage: 'ഈ ഫീൽഡ് പരിശോധിക്കുക.',
  newsletterEmailLabel: 'ഇമെയിൽ വിലാസം',
  newsletterCheckInbox: 'സ്ഥിരീകരിക്കാൻ ഇൻബോക്സ് പരിശോധിക്കുക',
  newsletterFullMessage:
    'ഈ ന്യൂസ്‌ലെറ്റർ ഇപ്പോൾ പുതിയ വരിക്കാരെ സ്വീകരിക്കുന്നില്ല.',
  newsletterEmailInvalid: 'സാധുവായ ഇമെയിൽ വിലാസം നൽകുക.',
  contactLinkLabel: 'ബന്ധപ്പെടുക',
  contactPageTitle: 'ബന്ധപ്പെടുക',
  contactDefaultIntro:
    'ചോദ്യമോ പറയാനുള്ളതോ ഉണ്ടോ? സന്ദേശം അയയ്ക്കൂ, എഴുത്തുകാരൻ ഇമെയിലിൽ മറുപടി നൽകും.',
  contactNameLabel: 'പേര്',
  contactEmailLabel: 'ഇമെയിൽ',
  contactMessageLabel: 'സന്ദേശം',
  contactWebsiteLabel: 'വെബ്സൈറ്റ് (ഓപ്ഷണൽ)',
  contactPhoneLabel: 'ഫോൺ (ഓപ്ഷണൽ)',
  contactSubmitLabel: 'സന്ദേശം അയയ്ക്കുക',
  contactNoscript:
    'ഈ ഫോമിന് JavaScript ആവശ്യമാണ്. സന്ദേശം അയയ്ക്കാൻ അത് ഓണാക്കുക.',
  contactSent: 'നന്ദി, നിങ്ങളുടെ സന്ദേശം അയച്ചു.',
  contactUnavailable: 'ഈ ഫോം ഇപ്പോൾ സന്ദേശങ്ങൾ സ്വീകരിക്കുന്നില്ല.',
  contactRateLimited:
    'ഇവിടെ നിന്ന് വളരെയധികം സന്ദേശങ്ങൾ വന്നു. പിന്നീട് വീണ്ടും ശ്രമിക്കുക.',
  contactMessageLinks:
    'നിങ്ങളുടെ സന്ദേശത്തിൽ പരമാവധി രണ്ട് ലിങ്കുകൾ മാത്രമേ പാടുള്ളൂ.',
  tagListLabel: 'ടാഗുകൾ',
  tagKickerLabel: 'ടാഗ്',
  seriesKickerLabel: 'പരമ്പര',
  archiveKickerLabel: 'ആർക്കൈവ്',
  authorKickerLabel: 'എഴുത്തുകാരൻ',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} ലേഖനങ്ങൾ`,
  emptyListingLabel: 'ഇതുവരെ ലേഖനങ്ങളില്ല.',
  editionsNavigationLabel: 'പതിപ്പുകൾ',
  editionOriginalLabel: 'യഥാർത്ഥം',
  editionQuickReadLabel: 'ചുരുക്ക വായന',
  editionStandardLabel: 'സാധാരണം',
  editionDeepDiveLabel: 'ആഴത്തിലുള്ള വായന',
  editionNoticeLabel:
    'നിർമ്മിച്ച പതിപ്പ്, എഴുത്തുകാരൻ പരിശോധിച്ചത്; യഥാർത്ഥ ലേഖനമാണ് അടിസ്ഥാനം',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'പരിചയം',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `പുതുക്കിയത്: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `“${tag}” ടാഗുള്ള ലേഖനങ്ങൾ`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication}-ൽ ${tag} ടാഗുള്ള ${count} ലേഖനങ്ങൾ.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, ${publication}-ലെ ${count} ഭാഗങ്ങളുള്ള പരമ്പര.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `ആർക്കൈവ് ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication}-ൽ ${year}-ൽ പ്രസിദ്ധീകരിച്ച ${count} ലേഖനങ്ങൾ.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${publication}-ൽ ${name} എഴുതിയ ലേഖനങ്ങൾ.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `${publication}-ൽ ഉൾപ്പെടുത്തിയ ${count} വിഷയങ്ങൾ കാണുക.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `${publication}-ൽ പ്രസിദ്ധീകരിച്ച ${count} പരമ്പരകൾ കാണുക.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication}-ലെ എല്ലാ ലേഖനങ്ങളും, ആകെ ${count}, വർഷം അനുസരിച്ച്.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `${publication}-ലെ എല്ലാ ലേഖനങ്ങളും, പുതിയത് ആദ്യം.`,
  exploreColumnLabel: 'അന്വേഷിക്കുക',
  rssFeedLabel: 'RSS ഫീഡ്',
  languageKickerLabel: 'ഭാഷ',
  languageSwitcherLabel: 'ഭാഷകൾ',
  languageChipsLabel: 'ലഭ്യമായ ഭാഷകൾ',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication}-ൽ ${language} ഭാഷയിലുള്ള ${count} ലേഖനങ്ങൾ.`,
  postRemovedHeading: 'ഈ പോസ്റ്റ് നീക്കം ചെയ്തു',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `ഇത് ${date} ന് നീക്കം ചെയ്തു.`,
  postRemovedHomeLabel: 'ഹോം പേജിലേക്ക് പോകുക',
  versionPageHeading: 'സൈറ്റ് പതിപ്പ്',
  versionTemplateLabel: 'ടെംപ്ലേറ്റ്',
  versionThemeLabel: 'തീം',
  versionSchemasLabel: 'സ്കീമകൾ',
  versionToolchainLabel: 'പബ്ലിഷ് ടൂൾചെയിൻ',
  versionCommitLabel: 'സോഴ്സ് കമ്മിറ്റ്',
  versionBuiltAtLabel: 'നിർമ്മിച്ച സമയം',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('ml', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
