/**
 * Chrome message catalog for the `ne` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'सामग्रीमा जानुहोस्',
  homeLinkLabel: 'गृहपृष्ठ',
  primaryNavigationLabel: 'मुख्य',
  footerNavigationLabel: 'फुटर',
  breadcrumbNavigationLabel: 'ब्रेडक्रम्ब',
  paginationNavigationLabel: 'पृष्ठ सङ्ख्या',
  previousPageLabel: 'अघिल्लो',
  nextPageLabel: 'अर्को',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `पृष्ठ ${current} / ${total}`,
  authorsSectionLabel: 'लेखकहरू',
  tagsSectionLabel: 'ट्यागहरू',
  seriesSectionLabel: 'शृङ्खला',
  archiveSectionLabel: 'अभिलेख',
  indexHeading: 'सबै लेख',
  authorsIndexLabel: 'लेखकहरू',
  tagIndexLabelPrefix: 'ट्याग:',
  seriesIndexLabelPrefix: 'शृङ्खला:',
  archiveYearLabelPrefix: 'अभिलेख:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName} को बारेमा`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `${displayName} द्वारा`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, नयाँ ट्याबमा खुल्छ',
  footerLegalLabel: 'कानुनी',
  termsLinkLabel: 'सर्तहरू',
  privacyLinkLabel: 'गोपनीयता',
  consentRegionLabel: 'गोपनीयता रोजाइ',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `यो साइटले पाठकहरूलाई बुझ्न ${providerName} प्रयोग गर्न चाहन्छ। तपाईंले स्वीकार नगरेसम्म केही पनि लोड हुँदैन, र तपाईं फुटरबाट जुनसुकै बेला आफ्नो रोजाइ बदल्न सक्नुहुन्छ।`,
  consentAcceptLabel: 'एनालिटिक्स स्वीकार गर्नुहोस्',
  consentDeclineLabel: 'अस्वीकार गर्नुहोस्',
  consentOpenLabel: 'गोपनीयता रोजाइ',
  errorPageHeading: 'पृष्ठ फेला परेन',
  errorPageBody:
    'तपाईंले खोजेको पृष्ठ फेला परेन। यसलाई सारिएको, नाम बदलिएको वा हटाइएको हुन सक्छ।',
  errorPageReturnHomeLabel: 'गृहपृष्ठमा फर्कनुहोस्',
  appearanceControlLabel: 'स्वरूप',
  appearanceModeLightLabel: 'उज्यालो',
  appearanceModeDarkLabel: 'अँध्यारो',
  appearanceModeSystemLabel: 'सिस्टम',
  searchButtonLabel: 'खोज्नुहोस्',
  searchButtonAriaLabel: 'लेखहरू खोज्नुहोस्',
  searchPlaceholderLabel: 'प्रकाशनमा खोज्नुहोस्',
  searchEmptyLabel: 'तपाईंको खोजसँग मिल्ने कुनै लेख छैन।',
  searchUnavailableLabel: 'खोज अहिले उपलब्ध छैन।',
  copyCodeLabel: 'कपी गर्नुहोस्',
  copiedLabel: 'कपी भयो',
  linkCopiedLabel: 'लिङ्क कपी भयो।',
  copyBlockedLabel:
    'यहाँ कपी गर्न रोकिएको छ। ठेगाना आफ्नो ब्राउजरबाट कपी गर्नुहोस्।',
  codeSelectedLabel: 'कोड चयन भयो। कपी गर्न Ctrl C वा Command C थिच्नुहोस्।',
  savedLabel: 'पछिका लागि सुरक्षित गरियो।',
  unsavedLabel: 'सुरक्षित लेखहरूबाट हटाइयो।',
  menuSummaryLabel: 'मेनु',
  featuredLabel: 'विशेष',
  readEssayLabel: 'निबन्ध पढ्नुहोस्',
  latestHeading: 'पछिल्ला',
  moreArticlesHeading: 'थप लेखहरू',
  browseByTagLabel: 'ट्यागअनुसार हेर्नुहोस्',
  seriesCardLabel: 'शृङ्खला',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} भाग`,
  startSeriesLabel: 'भाग १ बाट सुरु गर्नुहोस्',
  newsletterLabel: 'न्युजलेटर',
  newsletterActionLabel: 'सदस्यता लिनुहोस्',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} मिनेट पढाइ`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `भाग ${part} / ${total}`,
  onThisPageLabel: 'यो पृष्ठमा',
  writtenByLabel: 'लेखक',
  aboutTheAuthorLabel: 'लेखकको बारेमा',
  youAreHereLabel: 'तपाईं यहाँ हुनुहुन्छ',
  newerArticleLabel: 'नयाँ',
  olderArticleLabel: 'पुरानो',
  moreArticlesNavigationLabel: 'थप लेखहरू',
  keepReadingHeading: 'पढ्दै जानुहोस्',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `${tag} मा थप`,
  interactionsHeading: 'प्रतिक्रियाहरू',
  reactionsGroupLabel: 'रिएक्सनहरू',
  likeLabel: 'मन पर्यो',
  commentsHeading: 'छलफल',
  interactionsNeedScriptNotice: 'रिएक्सन र टिप्पणीका लागि JavaScript चाहिन्छ।',
  showMoreCommentsLabel: 'थप टिप्पणी देखाउनुहोस्',
  shareLabel: 'सेयर गर्नुहोस्',
  copyLinkLabel: 'यो लेखको लिङ्क कपी गर्नुहोस्',
  saveForLaterLabel: 'पछिका लागि सुरक्षित गर्नुहोस्',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `${network} मा सेयर गर्नुहोस्`,
  shareByEmailLabel: 'इमेलबाट सेयर गर्नुहोस्',
  shareNativeLabel: 'यो लेख सेयर गर्नुहोस्',
  followLabel: 'फलो गर्नुहोस्',
  followingLabel: 'फलो गरिरहनुभएको छ',
  unfollowLabel: 'अनफलो गर्नुहोस्',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name} लाई फलो गर्नुहोस्`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name} लाई अनफलो गर्नुहोस्`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `अब तपाईं ${name} लाई फलो गर्दै हुनुहुन्छ।`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `अब तपाईं ${name} लाई फलो गर्नुहुन्न।`,
  followDisabledMessage: 'यो साइटमा अहिले फलो गर्न मिल्दैन।',
  followAuthorMissingMessage: 'यी लेखकलाई अहिले फलो गर्न मिल्दैन।',
  audienceNetworkError: 'Galascribe सम्म पुग्न सकिएन। फेरि प्रयास गर्नुहोस्।',
  audienceRateLimited: 'धेरै प्रयास भए। केही बेरपछि फेरि प्रयास गर्नुहोस्।',
  audienceGenericError: 'केही गडबड भयो। फेरि प्रयास गर्नुहोस्।',
  audienceStorageBlocked:
    'साइन इनका लागि यो साइटलाई चाहिने भण्डारण तपाईंको ब्राउजरले रोक्यो।',
  audienceSignInUnsupported: 'यो ब्राउजरले यो पृष्ठमा साइन इन गराउन सक्दैन।',
  audienceSignInFailed: 'साइन इन पूरा भएन। फेरि प्रयास गर्नुहोस्।',
  audienceSignInInvalid:
    'त्यो साइन इन लिङ्क मान्य थिएन। फेरि प्रयास गर्नुहोस्।',
  honeypotLabel: 'यो फिल्ड खाली छोड्नुहोस्',
  fieldRequiredMessage: 'यो फिल्ड आवश्यक छ।',
  fieldInvalidMessage: 'यो फिल्ड जाँच गर्नुहोस्।',
  newsletterEmailLabel: 'इमेल ठेगाना',
  newsletterCheckInbox: 'पुष्टि गर्न इनबक्स हेर्नुहोस्',
  newsletterFullMessage: 'यो न्युजलेटरले अहिले नयाँ सदस्य लिइरहेको छैन।',
  newsletterEmailInvalid: 'मान्य इमेल ठेगाना लेख्नुहोस्।',
  contactLinkLabel: 'सम्पर्क',
  contactPageTitle: 'सम्पर्क',
  contactDefaultIntro:
    'प्रश्न वा भन्नुपर्ने कुरा छ? सन्देश पठाउनुहोस्, लेखकले इमेलमा जवाफ दिनेछन्।',
  contactNameLabel: 'नाम',
  contactEmailLabel: 'इमेल',
  contactMessageLabel: 'सन्देश',
  contactWebsiteLabel: 'वेबसाइट (ऐच्छिक)',
  contactPhoneLabel: 'फोन (ऐच्छिक)',
  contactSubmitLabel: 'सन्देश पठाउनुहोस्',
  contactNoscript:
    'यो फारमका लागि JavaScript चाहिन्छ। सन्देश पठाउन यसलाई खोल्नुहोस्।',
  contactSent: 'धन्यवाद, तपाईंको सन्देश पठाइयो।',
  contactUnavailable: 'यो फारमले अहिले सन्देश लिइरहेको छैन।',
  contactRateLimited: 'यहाँबाट धेरै सन्देश आए। पछि फेरि प्रयास गर्नुहोस्।',
  contactMessageLinks: 'तपाईंको सन्देशमा बढीमा दुईवटा लिङ्क हुन सक्छन्।',
  tagListLabel: 'ट्यागहरू',
  tagKickerLabel: 'ट्याग',
  seriesKickerLabel: 'शृङ्खला',
  archiveKickerLabel: 'अभिलेख',
  authorKickerLabel: 'लेखक',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} लेख`,
  emptyListingLabel: 'अहिलेसम्म कुनै लेख छैन।',
  editionsNavigationLabel: 'संस्करण',
  editionOriginalLabel: 'मूल',
  editionQuickReadLabel: 'छिटो पढाइ',
  editionStandardLabel: 'सामान्य',
  editionDeepDiveLabel: 'गहिरो पढाइ',
  editionNoticeLabel:
    'तयार पारिएको संस्करण, लेखकले समीक्षा गरेको; मूल लेख नै आधार हो',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'परिचय',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `अद्यावधिक मिति ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `“${tag}” ट्याग भएका लेखहरू`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication} मा ${tag} ट्याग भएका ${count} लेख।`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, ${publication} मा ${count} भागको शृङ्खला।`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `अभिलेख ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication} मा ${year} मा प्रकाशित ${count} लेख।`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${publication} मा ${name} ले लेखेका लेखहरू।`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `${publication} मा समेटिएका ${count} विषय हेर्नुहोस्।`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `${publication} मा प्रकाशित ${count} शृङ्खला हेर्नुहोस्।`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication} का सबै लेख, जम्मा ${count}, वर्षअनुसार।`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `${publication} का सबै लेख, नयाँ पहिले।`,
  exploreColumnLabel: 'अन्वेषण',
  rssFeedLabel: 'RSS फिड',
  languageKickerLabel: 'भाषा',
  languageSwitcherLabel: 'भाषाहरू',
  languageChipsLabel: 'उपलब्ध भाषाहरू',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication} मा ${language} भाषाका ${count} लेख।`,
  postRemovedHeading: 'यो पोस्ट हटाइएको छ',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `यसलाई ${date} मा हटाइएको थियो।`,
  postRemovedHomeLabel: 'गृहपृष्ठमा जानुहोस्',
  versionPageHeading: 'साइट संस्करण',
  versionTemplateLabel: 'टेम्प्लेट',
  versionThemeLabel: 'थिम',
  versionSchemasLabel: 'स्किमाहरू',
  versionToolchainLabel: 'प्रकाशन टुलचेन',
  versionCommitLabel: 'स्रोत कमिट',
  versionBuiltAtLabel: 'बनाइएको समय',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('ne', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
