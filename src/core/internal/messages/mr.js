/**
 * Chrome message catalog for the `mr` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'मजकुराकडे जा',
  homeLinkLabel: 'मुख्यपृष्ठ',
  primaryNavigationLabel: 'मुख्य',
  footerNavigationLabel: 'तळटीप',
  breadcrumbNavigationLabel: 'ब्रेडक्रंब',
  paginationNavigationLabel: 'पृष्ठे',
  previousPageLabel: 'मागील',
  nextPageLabel: 'पुढील',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `पृष्ठ ${current} / ${total}`,
  authorsSectionLabel: 'लेखक',
  tagsSectionLabel: 'टॅग',
  seriesSectionLabel: 'मालिका',
  archiveSectionLabel: 'संग्रह',
  indexHeading: 'सर्व लेख',
  authorsIndexLabel: 'लेखक',
  tagIndexLabelPrefix: 'टॅग:',
  seriesIndexLabelPrefix: 'मालिका:',
  archiveYearLabelPrefix: 'संग्रह:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName} यांच्याबद्दल`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `लेखक: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, नवीन टॅबमध्ये उघडते',
  footerLegalLabel: 'कायदेशीर',
  termsLinkLabel: 'अटी',
  privacyLinkLabel: 'गोपनीयता',
  consentRegionLabel: 'गोपनीयता पर्याय',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `वाचकांना समजून घेण्यासाठी ही साइट ${providerName} वापरू इच्छिते. तुम्ही स्वीकारेपर्यंत काहीही लोड होणार नाही, आणि तुमचा पर्याय तुम्ही केव्हाही तळटीपेतून बदलू शकता.`,
  consentAcceptLabel: 'ॲनालिटिक्स स्वीकारा',
  consentDeclineLabel: 'नाकारा',
  consentOpenLabel: 'गोपनीयता पर्याय',
  errorPageHeading: 'पृष्ठ सापडले नाही',
  errorPageBody:
    'तुम्ही शोधत असलेले पृष्ठ सापडले नाही. ते हलवले, त्याचे नाव बदलले किंवा काढून टाकले असावे.',
  errorPageReturnHomeLabel: 'मुख्यपृष्ठावर परत जा',
  appearanceControlLabel: 'स्वरूप',
  appearanceModeLightLabel: 'फिकट',
  appearanceModeDarkLabel: 'गडद',
  appearanceModeSystemLabel: 'सिस्टम',
  searchButtonLabel: 'शोधा',
  searchButtonAriaLabel: 'लेख शोधा',
  searchPlaceholderLabel: 'प्रकाशनात शोधा',
  searchEmptyLabel: 'तुमच्या शोधाशी जुळणारा कोणताही लेख नाही.',
  searchUnavailableLabel: 'शोध सध्या उपलब्ध नाही.',
  copyCodeLabel: 'कॉपी करा',
  copiedLabel: 'कॉपी झाले',
  linkCopiedLabel: 'लिंक कॉपी झाली.',
  copyBlockedLabel:
    'येथे कॉपी करणे अवरोधित आहे. पत्ता तुमच्या ब्राउझरमधून कॉपी करा.',
  codeSelectedLabel: 'कोड निवडला. कॉपी करण्यासाठी Ctrl C किंवा Command C दाबा.',
  savedLabel: 'नंतरसाठी जतन केले.',
  unsavedLabel: 'जतन केलेल्या लेखांमधून काढले.',
  menuSummaryLabel: 'मेनू',
  featuredLabel: 'निवडक',
  readEssayLabel: 'निबंध वाचा',
  latestHeading: 'ताजे',
  moreArticlesHeading: 'आणखी लेख',
  browseByTagLabel: 'टॅगनुसार पहा',
  seriesCardLabel: 'मालिका',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} भाग`,
  startSeriesLabel: 'भाग १ पासून सुरू करा',
  newsletterLabel: 'वृत्तपत्र',
  newsletterActionLabel: 'सदस्यता घ्या',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} मिनिटांचे वाचन`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `भाग ${part} / ${total}`,
  onThisPageLabel: 'या पृष्ठावर',
  writtenByLabel: 'लेखक',
  aboutTheAuthorLabel: 'लेखकाबद्दल',
  youAreHereLabel: 'तुम्ही येथे आहात',
  newerArticleLabel: 'नवीन',
  olderArticleLabel: 'जुना',
  moreArticlesNavigationLabel: 'आणखी लेख',
  keepReadingHeading: 'वाचत राहा',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `${tag} मध्ये आणखी`,
  interactionsHeading: 'प्रतिसाद',
  reactionsGroupLabel: 'रिॲक्शन',
  likeLabel: 'आवडले',
  commentsHeading: 'चर्चा',
  interactionsNeedScriptNotice:
    'रिॲक्शन आणि टिप्पण्यांसाठी JavaScript आवश्यक आहे.',
  showMoreCommentsLabel: 'आणखी टिप्पण्या दाखवा',
  shareLabel: 'शेअर करा',
  copyLinkLabel: 'या लेखाची लिंक कॉपी करा',
  saveForLaterLabel: 'नंतरसाठी जतन करा',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `${network} वर शेअर करा`,
  shareByEmailLabel: 'ईमेलने शेअर करा',
  shareNativeLabel: 'हा लेख शेअर करा',
  followLabel: 'फॉलो करा',
  followingLabel: 'फॉलो करत आहात',
  unfollowLabel: 'अनफॉलो करा',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name} यांना फॉलो करा`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name} यांना अनफॉलो करा`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `तुम्ही आता ${name} यांना फॉलो करत आहात.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `तुम्ही आता ${name} यांना फॉलो करत नाही.`,
  followDisabledMessage: 'या साइटवर सध्या फॉलो करता येत नाही.',
  followAuthorMissingMessage: 'या लेखकाला सध्या फॉलो करता येत नाही.',
  audienceNetworkError:
    'Galascribe पर्यंत पोहोचता आले नाही. पुन्हा प्रयत्न करा.',
  audienceRateLimited: 'खूप प्रयत्न झाले. थोड्या वेळाने पुन्हा प्रयत्न करा.',
  audienceGenericError: 'काहीतरी चुकले. पुन्हा प्रयत्न करा.',
  audienceStorageBlocked:
    'साइन इनसाठी या साइटला लागणारी साठवण तुमच्या ब्राउझरने अवरोधित केली.',
  audienceSignInUnsupported: 'हा ब्राउझर या पृष्ठावर साइन इन करू शकत नाही.',
  audienceSignInFailed: 'साइन इन पूर्ण झाले नाही. पुन्हा प्रयत्न करा.',
  audienceSignInInvalid: 'ती साइन इन लिंक वैध नव्हती. पुन्हा प्रयत्न करा.',
  honeypotLabel: 'हे फील्ड रिकामे ठेवा',
  fieldRequiredMessage: 'हे फील्ड आवश्यक आहे.',
  fieldInvalidMessage: 'हे फील्ड तपासा.',
  newsletterEmailLabel: 'ईमेल पत्ता',
  newsletterCheckInbox: 'खात्री करण्यासाठी तुमचा इनबॉक्स तपासा',
  newsletterFullMessage: 'हे वृत्तपत्र सध्या नवीन सदस्य घेत नाही.',
  newsletterEmailInvalid: 'वैध ईमेल पत्ता लिहा.',
  contactLinkLabel: 'संपर्क',
  contactPageTitle: 'संपर्क',
  contactDefaultIntro:
    'प्रश्न आहे किंवा काही सांगायचे आहे? संदेश पाठवा, लेखक ईमेलने उत्तर देतील.',
  contactNameLabel: 'नाव',
  contactEmailLabel: 'ईमेल',
  contactMessageLabel: 'संदेश',
  contactWebsiteLabel: 'वेबसाइट (ऐच्छिक)',
  contactPhoneLabel: 'फोन (ऐच्छिक)',
  contactSubmitLabel: 'संदेश पाठवा',
  contactNoscript:
    'या फॉर्मसाठी JavaScript आवश्यक आहे. संदेश पाठवण्यासाठी ते चालू करा.',
  contactSent: 'धन्यवाद, तुमचा संदेश पाठवला गेला.',
  contactUnavailable: 'हा फॉर्म सध्या संदेश स्वीकारत नाही.',
  contactRateLimited: 'येथून खूप संदेश आले आहेत. नंतर पुन्हा प्रयत्न करा.',
  contactMessageLinks: 'तुमच्या संदेशात जास्तीत जास्त दोन लिंक असू शकतात.',
  tagListLabel: 'टॅग',
  tagKickerLabel: 'टॅग',
  seriesKickerLabel: 'मालिका',
  archiveKickerLabel: 'संग्रह',
  authorKickerLabel: 'लेखक',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} लेख`,
  emptyListingLabel: 'अजून कोणतेही लेख नाहीत.',
  editionsNavigationLabel: 'आवृत्त्या',
  editionOriginalLabel: 'मूळ',
  editionQuickReadLabel: 'झटपट वाचन',
  editionStandardLabel: 'सामान्य',
  editionDeepDiveLabel: 'सविस्तर वाचन',
  editionNoticeLabel:
    'तयार केलेली आवृत्ती, लेखकाने तपासलेली; मूळ लेख हाच आधार आहे',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'परिचय',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `अद्ययावत: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `“${tag}” टॅग असलेले लेख`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication} वर ${tag} टॅग असलेले ${count} लेख.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, ${publication} वरील ${count} भागांची मालिका.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `संग्रह ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication} वर ${year} मध्ये प्रकाशित झालेले ${count} लेख.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${publication} वर ${name} यांनी लिहिलेले लेख.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `${publication} वर समाविष्ट असलेले ${count} विषय पहा.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `${publication} वर प्रकाशित झालेल्या ${count} मालिका पहा.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication} वरील सर्व लेख, एकूण ${count}, वर्षानुसार.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `${publication} वरील सर्व लेख, नवीन आधी.`,
  exploreColumnLabel: 'शोधा',
  rssFeedLabel: 'RSS फीड',
  languageKickerLabel: 'भाषा',
  languageSwitcherLabel: 'भाषा',
  languageChipsLabel: 'उपलब्ध भाषा',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication} वर ${language} भाषेतील ${count} लेख.`,
  postRemovedHeading: 'ही पोस्ट काढून टाकली आहे',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `ती ${date} रोजी काढून टाकली.`,
  postRemovedHomeLabel: 'मुख्यपृष्ठावर जा',
  versionPageHeading: 'साइट आवृत्ती',
  versionTemplateLabel: 'टेम्पलेट',
  versionThemeLabel: 'थीम',
  versionSchemasLabel: 'स्कीमा',
  versionToolchainLabel: 'प्रकाशन टूलचेन',
  versionCommitLabel: 'स्रोत कमिट',
  versionBuiltAtLabel: 'तयार केल्याची वेळ',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('mr', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
