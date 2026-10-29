/**
 * Chrome message catalog for the `hi` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'मुख्य सामग्री पर जाएँ',
  homeLinkLabel: 'होम',
  primaryNavigationLabel: 'मुख्य',
  footerNavigationLabel: 'फ़ुटर',
  breadcrumbNavigationLabel: 'ब्रेडक्रंब',
  paginationNavigationLabel: 'पेज संख्या',
  previousPageLabel: 'पिछला',
  nextPageLabel: 'अगला',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `पेज ${current} / ${total}`,
  authorsSectionLabel: 'लेखक',
  tagsSectionLabel: 'टैग',
  seriesSectionLabel: 'श्रृंखला',
  archiveSectionLabel: 'संग्रह',
  indexHeading: 'सभी लेख',
  authorsIndexLabel: 'लेखक',
  tagIndexLabelPrefix: 'टैग:',
  seriesIndexLabelPrefix: 'श्रृंखला:',
  archiveYearLabelPrefix: 'संग्रह:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName} के बारे में`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `${displayName} द्वारा`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, नए टैब में खुलेगा',
  footerLegalLabel: 'कानूनी',
  termsLinkLabel: 'शर्तें',
  privacyLinkLabel: 'गोपनीयता',
  consentRegionLabel: 'गोपनीयता विकल्प',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `यह साइट पाठकों को समझने के लिए ${providerName} का उपयोग करना चाहती है। आपके स्वीकार करने तक कुछ भी लोड नहीं होगा, और आप फ़ुटर से कभी भी अपनी पसंद बदल सकते हैं।`,
  consentAcceptLabel: 'एनालिटिक्स स्वीकार करें',
  consentDeclineLabel: 'अस्वीकार करें',
  consentOpenLabel: 'गोपनीयता विकल्प',
  errorPageHeading: 'पेज नहीं मिला',
  errorPageBody:
    'आप जो पेज ढूँढ रहे थे वह नहीं मिला। हो सकता है उसे हटा दिया गया हो, उसका नाम बदल गया हो या वह स्थानांतरित हो गया हो।',
  errorPageReturnHomeLabel: 'होम पेज पर लौटें',
  appearanceControlLabel: 'रूप',
  appearanceModeLightLabel: 'हल्का',
  appearanceModeDarkLabel: 'गहरा',
  appearanceModeSystemLabel: 'सिस्टम',
  searchButtonLabel: 'खोजें',
  searchButtonAriaLabel: 'लेख खोजें',
  searchPlaceholderLabel: 'प्रकाशन में खोजें',
  searchEmptyLabel: 'आपकी खोज से कोई लेख नहीं मिला।',
  searchUnavailableLabel: 'अभी खोज उपलब्ध नहीं है।',
  copyCodeLabel: 'कॉपी करें',
  copiedLabel: 'कॉपी हो गया',
  linkCopiedLabel: 'लिंक कॉपी हो गया।',
  copyBlockedLabel:
    'यहाँ कॉपी करना रोका गया है। अपने ब्राउज़र से पता कॉपी करें।',
  codeSelectedLabel:
    'कोड चुना गया। कॉपी करने के लिए Ctrl C या Command C दबाएँ।',
  savedLabel: 'बाद के लिए सहेजा गया।',
  unsavedLabel: 'सहेजे गए लेखों से हटाया गया।',
  menuSummaryLabel: 'मेनू',
  featuredLabel: 'विशेष',
  readEssayLabel: 'निबंध पढ़ें',
  latestHeading: 'नवीनतम',
  moreArticlesHeading: 'और लेख',
  browseByTagLabel: 'टैग से देखें',
  seriesCardLabel: 'श्रृंखला',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} भाग`,
  startSeriesLabel: 'भाग 1 से शुरू करें',
  newsletterLabel: 'न्यूज़लेटर',
  newsletterActionLabel: 'सब्सक्राइब करें',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} मिनट में पढ़ें`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `भाग ${part} / ${total}`,
  onThisPageLabel: 'इस पेज पर',
  writtenByLabel: 'लेखक',
  aboutTheAuthorLabel: 'लेखक के बारे में',
  youAreHereLabel: 'आप यहाँ हैं',
  newerArticleLabel: 'नया',
  olderArticleLabel: 'पुराना',
  moreArticlesNavigationLabel: 'और लेख',
  keepReadingHeading: 'पढ़ते रहें',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `${tag} में और`,
  interactionsHeading: 'प्रतिक्रियाएँ',
  reactionsGroupLabel: 'रिएक्शन',
  likeLabel: 'पसंद करें',
  commentsHeading: 'चर्चा',
  interactionsNeedScriptNotice:
    'रिएक्शन और टिप्पणियों के लिए JavaScript ज़रूरी है।',
  showMoreCommentsLabel: 'और टिप्पणियाँ दिखाएँ',
  shareLabel: 'शेयर करें',
  copyLinkLabel: 'इस लेख का लिंक कॉपी करें',
  saveForLaterLabel: 'बाद के लिए सहेजें',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `${network} पर शेयर करें`,
  shareByEmailLabel: 'ईमेल से शेयर करें',
  shareNativeLabel: 'यह लेख शेयर करें',
  followLabel: 'फ़ॉलो करें',
  followingLabel: 'फ़ॉलो कर रहे हैं',
  unfollowLabel: 'अनफ़ॉलो करें',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name} को फ़ॉलो करें`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name} को अनफ़ॉलो करें`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `अब आप ${name} को फ़ॉलो कर रहे हैं।`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `अब आप ${name} को फ़ॉलो नहीं कर रहे हैं।`,
  followDisabledMessage: 'इस साइट पर अभी फ़ॉलो करना उपलब्ध नहीं है।',
  followAuthorMissingMessage: 'इस लेखक को अभी फ़ॉलो नहीं किया जा सकता।',
  audienceNetworkError: 'Galascribe तक नहीं पहुँच सके। फिर कोशिश करें।',
  audienceRateLimited:
    'बहुत ज़्यादा कोशिशें हुईं। थोड़ी देर बाद फिर कोशिश करें।',
  audienceGenericError: 'कुछ गड़बड़ हो गई। फिर कोशिश करें।',
  audienceStorageBlocked:
    'साइन इन के लिए इस साइट को जो स्टोरेज चाहिए, उसे आपके ब्राउज़र ने रोक दिया।',
  audienceSignInUnsupported: 'यह ब्राउज़र इस पेज पर साइन इन नहीं कर सकता।',
  audienceSignInFailed: 'साइन इन पूरा नहीं हुआ। फिर कोशिश करें।',
  audienceSignInInvalid: 'वह साइन इन लिंक मान्य नहीं था। फिर कोशिश करें।',
  honeypotLabel: 'इस फ़ील्ड को खाली छोड़ें',
  fieldRequiredMessage: 'यह फ़ील्ड ज़रूरी है।',
  fieldInvalidMessage: 'इस फ़ील्ड की जाँच करें।',
  newsletterEmailLabel: 'ईमेल पता',
  newsletterCheckInbox: 'पुष्टि के लिए अपना इनबॉक्स देखें',
  newsletterFullMessage: 'यह न्यूज़लेटर अभी नए सब्सक्राइबर नहीं ले रहा है।',
  newsletterEmailInvalid: 'सही ईमेल पता लिखें।',
  contactLinkLabel: 'संपर्क',
  contactPageTitle: 'संपर्क',
  contactDefaultIntro:
    'कोई सवाल है या कुछ कहना है? संदेश भेजें, लेखक ईमेल से जवाब देंगे।',
  contactNameLabel: 'नाम',
  contactEmailLabel: 'ईमेल',
  contactMessageLabel: 'संदेश',
  contactWebsiteLabel: 'वेबसाइट (वैकल्पिक)',
  contactPhoneLabel: 'फ़ोन (वैकल्पिक)',
  contactSubmitLabel: 'संदेश भेजें',
  contactNoscript:
    'इस फ़ॉर्म के लिए JavaScript ज़रूरी है। संदेश भेजने के लिए इसे चालू करें।',
  contactSent: 'धन्यवाद, आपका संदेश भेज दिया गया।',
  contactUnavailable: 'यह फ़ॉर्म अभी संदेश नहीं ले रहा है।',
  contactRateLimited:
    'यहाँ से बहुत ज़्यादा संदेश आए हैं। बाद में फिर कोशिश करें।',
  contactMessageLinks: 'आपके संदेश में अधिकतम दो लिंक हो सकते हैं।',
  tagListLabel: 'टैग',
  tagKickerLabel: 'टैग',
  seriesKickerLabel: 'श्रृंखला',
  archiveKickerLabel: 'संग्रह',
  authorKickerLabel: 'लेखक',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} लेख`,
  emptyListingLabel: 'अभी कोई लेख नहीं है।',
  editionsNavigationLabel: 'संस्करण',
  editionOriginalLabel: 'मूल',
  editionQuickReadLabel: 'संक्षिप्त पाठ',
  editionStandardLabel: 'सामान्य',
  editionDeepDiveLabel: 'विस्तृत पाठ',
  editionNoticeLabel:
    'तैयार किया गया संस्करण, लेखक द्वारा जाँचा गया; मूल लेख ही आधार है',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'परिचय',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `अपडेट किया गया ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `“${tag}” टैग वाले लेख`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication} पर ${tag} टैग वाले ${count} लेख।`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, ${publication} पर ${count} भागों की एक श्रृंखला।`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `संग्रह ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication} पर ${year} में प्रकाशित ${count} लेख।`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${publication} पर ${name} के लिखे लेख।`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `${publication} पर शामिल ${count} विषय देखें।`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `${publication} पर प्रकाशित ${count} श्रृंखलाएँ देखें।`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication} के सभी लेख, कुल ${count}, वर्ष के अनुसार।`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) => `${publication} के सभी लेख, नए पहले।`,
  exploreColumnLabel: 'खोजें',
  rssFeedLabel: 'RSS फ़ीड',
  languageKickerLabel: 'भाषा',
  languageSwitcherLabel: 'भाषाएँ',
  languageChipsLabel: 'उपलब्ध भाषाएँ',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication} पर ${language} में ${count} लेख।`,
  postRemovedHeading: 'यह पोस्ट हटा दी गई है',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `इसे ${date} को हटाया गया था।`,
  postRemovedHomeLabel: 'होम पेज पर जाएँ',
  versionPageHeading: 'साइट संस्करण',
  versionTemplateLabel: 'टेम्पलेट',
  versionThemeLabel: 'थीम',
  versionSchemasLabel: 'स्कीमा',
  versionToolchainLabel: 'पब्लिश टूलचेन',
  versionCommitLabel: 'सोर्स कमिट',
  versionBuiltAtLabel: 'बनाने का समय',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('hi', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
