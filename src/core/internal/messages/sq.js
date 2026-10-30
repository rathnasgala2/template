/**
 * Chrome message catalog for the `sq` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Kalo te përmbajtja',
  homeLinkLabel: 'Ballina',
  primaryNavigationLabel: 'Kryesore',
  footerNavigationLabel: 'Fundi i faqes',
  breadcrumbNavigationLabel: 'Shtegu',
  paginationNavigationLabel: 'Faqosja',
  previousPageLabel: 'E mëparshme',
  nextPageLabel: 'Tjetra',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Faqja ${current} nga ${total}`,
  authorsSectionLabel: 'Autorët',
  tagsSectionLabel: 'Etiketat',
  seriesSectionLabel: 'Seri',
  archiveSectionLabel: 'Arkivi',
  indexHeading: 'Të gjitha artikujt',
  authorsIndexLabel: 'Autorët',
  tagIndexLabelPrefix: 'Etiketa:',
  seriesIndexLabelPrefix: 'Seria:',
  archiveYearLabelPrefix: 'Arkivi:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Rreth ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Nga ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, hapet në skedë të re',
  footerLegalLabel: 'Ligjore',
  termsLinkLabel: 'Kushtet',
  privacyLinkLabel: 'Privatësia',
  consentRegionLabel: 'Zgjedhjet e privatësisë',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Ky sajt dëshiron të përdorë ${providerName} për të kuptuar lexuesit. Asgjë nuk ngarkohet derisa të pranoni dhe zgjedhjen mund ta ndryshoni kurdo nga fundi i faqes.`,
  consentAcceptLabel: 'Prano analitikën',
  consentDeclineLabel: 'Refuzo',
  consentOpenLabel: 'Zgjedhjet e privatësisë',
  errorPageHeading: 'Faqja nuk u gjet',
  errorPageBody:
    'Faqja që kërkuat nuk u gjet. Mund të jetë zhvendosur, riemërtuar ose hequr.',
  errorPageReturnHomeLabel: 'Kthehu te ballina',
  appearanceControlLabel: 'Pamja',
  appearanceModeLightLabel: 'E çelët',
  appearanceModeDarkLabel: 'E errët',
  appearanceModeSystemLabel: 'Sistemi',
  searchButtonLabel: 'Kërko',
  searchButtonAriaLabel: 'Kërko artikuj',
  searchPlaceholderLabel: 'Kërko në botim',
  searchEmptyLabel: 'Asnjë artikull nuk përputhet me kërkimin.',
  searchUnavailableLabel: 'Kërkimi nuk është i disponueshëm tani.',
  copyCodeLabel: 'Kopjo',
  copiedLabel: 'U kopjua',
  linkCopiedLabel: 'Lidhja u kopjua.',
  copyBlockedLabel:
    'Kopjimi është bllokuar këtu. Kopjoni adresën nga shfletuesi.',
  codeSelectedLabel:
    'Kodi u zgjodh. Shtypni Ctrl C ose Command C për ta kopjuar.',
  savedLabel: 'U ruajt për më vonë.',
  unsavedLabel: 'U hoq nga artikujt e ruajtur.',
  menuSummaryLabel: 'Menyja',
  featuredLabel: 'Të veçuara',
  readEssayLabel: 'Lexo ese',
  latestHeading: 'Më të rejat',
  moreArticlesHeading: 'Më shumë artikuj',
  browseByTagLabel: 'Shfleto sipas etiketave',
  seriesCardLabel: 'Seri',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} pjesë`,
  startSeriesLabel: 'Fillo me pjesën 1',
  newsletterLabel: 'Buletini',
  newsletterActionLabel: 'Abonohu',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min lexim`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Pjesa ${part} nga ${total}`,
  onThisPageLabel: 'Në këtë faqe',
  writtenByLabel: 'Shkruar nga',
  aboutTheAuthorLabel: 'Rreth autorit',
  youAreHereLabel: 'Ju jeni këtu',
  newerArticleLabel: 'Më i ri',
  olderArticleLabel: 'Më i vjetër',
  moreArticlesNavigationLabel: 'Më shumë artikuj',
  keepReadingHeading: 'Vazhdo leximin',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Më shumë te ${tag}`,
  interactionsHeading: 'Përgjigje',
  reactionsGroupLabel: 'Reagime',
  likeLabel: 'Pëlqej',
  commentsHeading: 'Diskutim',
  interactionsNeedScriptNotice: 'Reagimet dhe komentet kërkojnë JavaScript.',
  showMoreCommentsLabel: 'Shfaq më shumë komente',
  shareLabel: 'Ndaj',
  copyLinkLabel: 'Kopjo lidhjen e këtij artikulli',
  saveForLaterLabel: 'Ruaje për më vonë',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Ndaje në ${network}`,
  shareByEmailLabel: 'Ndaje me email',
  shareNativeLabel: 'Ndaje këtë artikull',
  followLabel: 'Ndiq',
  followingLabel: 'Po e ndiqni',
  unfollowLabel: 'Mos e ndiq',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Ndiq ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Mos e ndiq ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Tani po ndiqni ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Nuk po e ndiqni më ${name}.`,
  followDisabledMessage: 'Ndjekja nuk është e disponueshme në këtë sajt tani.',
  followAuthorMissingMessage: 'Ky autor nuk mund të ndiqet tani.',
  audienceNetworkError: 'Nuk u lidh dot me Galascribe. Provoni përsëri.',
  audienceRateLimited: 'Shumë përpjekje. Provoni përsëri pas pak.',
  audienceGenericError: 'Diçka shkoi keq. Provoni përsëri.',
  audienceStorageBlocked:
    'Shfletuesi bllokoi hapësirën ruajtëse që sajti i duhet për hyrjen.',
  audienceSignInUnsupported:
    'Ky shfletues nuk mund t’ju identifikojë në këtë faqe.',
  audienceSignInFailed: 'Hyrja nuk u krye. Provoni përsëri.',
  audienceSignInInvalid:
    'Lidhja e hyrjes nuk ishte e vlefshme. Provoni përsëri.',
  honeypotLabel: 'Lëreni këtë fushë bosh',
  fieldRequiredMessage: 'Kjo fushë është e detyrueshme.',
  fieldInvalidMessage: 'Kontrolloni këtë fushë.',
  newsletterEmailLabel: 'Adresa e emailit',
  newsletterCheckInbox: 'Kontrolloni kutinë postare për të konfirmuar',
  newsletterFullMessage: 'Ky buletin nuk po pranon abonentë të rinj tani.',
  newsletterEmailInvalid: 'Shkruani një adresë emaili të vlefshme.',
  contactLinkLabel: 'Kontakti',
  contactPageTitle: 'Kontakti',
  contactDefaultIntro:
    'Keni një pyetje apo diçka për të thënë? Dërgoni një mesazh dhe autori do t’ju përgjigjet me email.',
  contactNameLabel: 'Emri',
  contactEmailLabel: 'Emaili',
  contactMessageLabel: 'Mesazhi',
  contactWebsiteLabel: 'Faqja e internetit (opsionale)',
  contactPhoneLabel: 'Telefoni (opsional)',
  contactSubmitLabel: 'Dërgo mesazhin',
  contactNoscript:
    'Ky formular kërkon JavaScript. Aktivizojeni për të dërguar mesazh.',
  contactSent: 'Faleminderit, mesazhi u dërgua.',
  contactUnavailable: 'Ky formular nuk po pranon mesazhe tani.',
  contactRateLimited: 'Shumë mesazhe nga ky vend. Provoni më vonë.',
  contactMessageLinks: 'Mesazhi mund të ketë më së shumti dy lidhje.',
  tagListLabel: 'Etiketat',
  tagKickerLabel: 'Etiketa',
  seriesKickerLabel: 'Seri',
  archiveKickerLabel: 'Arkivi',
  authorKickerLabel: 'Autori',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} artikuj`,
  emptyListingLabel: 'Ende nuk ka artikuj.',
  editionsNavigationLabel: 'Botimet',
  editionOriginalLabel: 'Origjinali',
  editionQuickReadLabel: 'Lexim i shpejtë',
  editionStandardLabel: 'Standard',
  editionDeepDiveLabel: 'Lexim i thelluar',
  editionNoticeLabel:
    'Botim i gjeneruar, i shqyrtuar nga autori; origjinali është reference',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Rreth nesh',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Përditësuar më ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Shkrime me etiketën “${tag}”`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count} artikuj me etiketën ${tag} në ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, një seri me ${count} pjesë në ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arkivi ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count} artikuj të botuar në ${year} në ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Artikuj të shkruar nga ${name} në ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Shfletoni ${count} tema të trajtuara në ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Shfletoni ${count} seri të botuara në ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Çdo artikull në ${publication}, ${count} gjithsej, sipas vitit.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Të gjithë artikujt në ${publication}, më të rejat në fillim.`,
  exploreColumnLabel: 'Eksploro',
  rssFeedLabel: 'Burimi RSS',
  languageKickerLabel: 'Gjuha',
  languageSwitcherLabel: 'Gjuhët',
  languageChipsLabel: 'Gjuhët e disponueshme',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count} artikuj në ${language} në ${publication}.`,
  postRemovedHeading: 'Ky shkrim u hoq',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `U hoq më ${date}.`,
  postRemovedHomeLabel: 'Shko te ballina',
  versionPageHeading: 'Versioni i sajtit',
  versionTemplateLabel: 'Shablloni',
  versionThemeLabel: 'Tema',
  versionSchemasLabel: 'Skemat',
  versionToolchainLabel: 'Veglat e botimit',
  versionCommitLabel: 'Commit i burimit',
  versionBuiltAtLabel: 'Ndërtuar më',
  listenNavLabel: 'Dëgjo',
  listenNavCurrentLabel: 'Dëgjo këtë artikull',
  listenInviteTitle: 'Duart i ke të zëna? Dëgjoje.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Ky artikull është edhe një bisedë ${minutes} minutëshe. Mirë për udhëtim, stërvitje ose larjen e enëve.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Ky artikull është edhe një rrëfim ${minutes} minutësh. Mirë për udhëtim, stërvitje ose larjen e enëve.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Ky artikull është edhe një debat ${minutes} minutësh. Mirë për udhëtim, stërvitje ose larjen e enëve.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Ky artikull është edhe një skeç ${minutes} minutësh. Mirë për udhëtim, stërvitje ose larjen e enëve.`,
  listenInvitePlayLabel: 'Luaje',
  listenInviteDeclineLabel: 'Jo, faleminderit',
  listenInviteNote: 'Zëra IA, përshtatur nga ky artikull.',
  listenInviteCloseLabel: 'Mbylle tani',
  listenPlayerRegionLabel: 'Luajtësi i audios',
  listenPlayerNowPlayingLabel: 'Po luhet tani',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} nga ${count}`,
  listenPlayerPlayLabel: 'Luaj',
  listenPlayerPauseLabel: 'Pauzë',
  listenPlayerBackLabel: 'Prapa 15 sekonda',
  listenPlayerPreviousLabel: 'Episodi i mëparshëm',
  listenPlayerNextLabel: 'Episodi tjetër',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Shpejtësia e luajtjes ${rate}×`,
  listenPlayerSeekLabel: 'Pozicioni',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} nga ${total}`,
  listenPlayerCloseLabel: 'Ndalo dhe mbyll',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Po luhet: ${title}`,
  listenListHeading: 'Dëgjo këtë blog',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count} episode · ${duration}`,
  listenListPlayAllLabel: 'Luaji të gjitha',
  listenListShuffleLabel: 'Përzieji',
  listenListOrderLabel: 'Renditja',
  listenListNewestLabel: 'Më të rejat së pari',
  listenListOldestLabel: 'Më të vjetrat së pari',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Shfaqi të gjitha (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Luaj ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} orë ${minutes} min`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('sq', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
