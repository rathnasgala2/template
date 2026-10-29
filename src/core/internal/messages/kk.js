/**
 * Chrome message catalog for the `kk` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Негізгі мазмұнға өту',
  homeLinkLabel: 'Басты бет',
  primaryNavigationLabel: 'Негізгі',
  footerNavigationLabel: 'Төменгі бөлім',
  breadcrumbNavigationLabel: 'Навигация жолы',
  paginationNavigationLabel: 'Беттер',
  previousPageLabel: 'Алдыңғы',
  nextPageLabel: 'Келесі',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `${current} / ${total} бет`,
  authorsSectionLabel: 'Авторлар',
  tagsSectionLabel: 'Тегтер',
  seriesSectionLabel: 'Серия',
  archiveSectionLabel: 'Мұрағат',
  indexHeading: 'Барлық мақалалар',
  authorsIndexLabel: 'Авторлар',
  tagIndexLabelPrefix: 'Тег:',
  seriesIndexLabelPrefix: 'Серия:',
  archiveYearLabelPrefix: 'Мұрағат:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName} туралы`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Авторы: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, жаңа қойындыда ашылады',
  footerLegalLabel: 'Құқықтық',
  termsLinkLabel: 'Шарттар',
  privacyLinkLabel: 'Құпиялылық',
  consentRegionLabel: 'Құпиялылық таңдауы',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Бұл сайт оқырмандарды түсіну үшін ${providerName} қызметін пайдаланғысы келеді. Сіз келіспейінше ештеңе жүктелмейді, таңдауыңызды кез келген уақытта төменгі бөлімнен өзгерте аласыз.`,
  consentAcceptLabel: 'Аналитикаға келісу',
  consentDeclineLabel: 'Бас тарту',
  consentOpenLabel: 'Құпиялылық таңдауы',
  errorPageHeading: 'Бет табылмады',
  errorPageBody:
    'Сіз іздеген бет табылмады. Ол көшірілген, атауы өзгертілген немесе жойылған болуы мүмкін.',
  errorPageReturnHomeLabel: 'Басты бетке оралу',
  appearanceControlLabel: 'Көрінісі',
  appearanceModeLightLabel: 'Ашық',
  appearanceModeDarkLabel: 'Күңгірт',
  appearanceModeSystemLabel: 'Жүйелік',
  searchButtonLabel: 'Іздеу',
  searchButtonAriaLabel: 'Мақалаларды іздеу',
  searchPlaceholderLabel: 'Басылымнан іздеу',
  searchEmptyLabel: 'Іздеуіңізге сәйкес мақала жоқ.',
  searchUnavailableLabel: 'Іздеу қазір қолжетімсіз.',
  copyCodeLabel: 'Көшіру',
  copiedLabel: 'Көшірілді',
  linkCopiedLabel: 'Сілтеме көшірілді.',
  copyBlockedLabel:
    'Мұнда көшіруге тыйым салынған. Мекенжайды браузерден көшіріңіз.',
  codeSelectedLabel:
    'Код таңдалды. Көшіру үшін Ctrl C немесе Command C басыңыз.',
  savedLabel: 'Кейінге сақталды.',
  unsavedLabel: 'Сақталған мақалалардан алынды.',
  menuSummaryLabel: 'Мәзір',
  featuredLabel: 'Таңдаулы',
  readEssayLabel: 'Эссені оқу',
  latestHeading: 'Соңғылары',
  moreArticlesHeading: 'Тағы мақалалар',
  browseByTagLabel: 'Тегтер бойынша қарау',
  seriesCardLabel: 'Серия',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} бөлім`,
  startSeriesLabel: '1-бөлімнен бастау',
  newsletterLabel: 'Жаңалықтар хаты',
  newsletterActionLabel: 'Жазылу',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} мин оқу`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `${part}-бөлім, барлығы ${total}`,
  onThisPageLabel: 'Осы бетте',
  writtenByLabel: 'Авторы',
  aboutTheAuthorLabel: 'Автор туралы',
  youAreHereLabel: 'Сіз осындасыз',
  newerArticleLabel: 'Жаңарақ',
  olderArticleLabel: 'Ескірек',
  moreArticlesNavigationLabel: 'Тағы мақалалар',
  keepReadingHeading: 'Оқуды жалғастырыңыз',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `${tag} бойынша тағы`,
  interactionsHeading: 'Пікірлер',
  reactionsGroupLabel: 'Реакциялар',
  likeLabel: 'Ұнайды',
  commentsHeading: 'Талқылау',
  interactionsNeedScriptNotice:
    'Реакциялар мен пікірлер үшін JavaScript қажет.',
  showMoreCommentsLabel: 'Тағы пікірлерді көрсету',
  shareLabel: 'Бөлісу',
  copyLinkLabel: 'Мақала сілтемесін көшіру',
  saveForLaterLabel: 'Кейінге сақтау',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `${network} арқылы бөлісу`,
  shareByEmailLabel: 'Электрондық пошта арқылы бөлісу',
  shareNativeLabel: 'Осы мақаламен бөлісу',
  followLabel: 'Бақылау',
  followingLabel: 'Бақылап жатырсыз',
  unfollowLabel: 'Бақылауды тоқтату',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name} авторын бақылау`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name} авторын бақылауды тоқтату`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Енді сіз ${name} авторын бақылап жатырсыз.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Енді сіз ${name} авторын бақыламайсыз.`,
  followDisabledMessage: 'Бақылау бұл сайтта қазір қолжетімсіз.',
  followAuthorMissingMessage: 'Бұл авторды қазір бақылау мүмкін емес.',
  audienceNetworkError:
    'Galascribe қызметіне қосылу мүмкін болмады. Қайталап көріңіз.',
  audienceRateLimited: 'Әрекет тым көп. Біраздан кейін қайталап көріңіз.',
  audienceGenericError: 'Бір нәрсе дұрыс болмады. Қайталап көріңіз.',
  audienceStorageBlocked: 'Браузеріңіз сайтқа кіру үшін қажет жадты бұғаттады.',
  audienceSignInUnsupported: 'Бұл браузер осы бетте кіруге мүмкіндік бермейді.',
  audienceSignInFailed: 'Кіру аяқталмады. Қайталап көріңіз.',
  audienceSignInInvalid: 'Кіру сілтемесі жарамсыз болды. Қайталап көріңіз.',
  honeypotLabel: 'Бұл өрісті бос қалдырыңыз',
  fieldRequiredMessage: 'Бұл өріс міндетті.',
  fieldInvalidMessage: 'Бұл өрісті тексеріңіз.',
  newsletterEmailLabel: 'Электрондық пошта мекенжайы',
  newsletterCheckInbox: 'Растау үшін кіріс хаттарды тексеріңіз',
  newsletterFullMessage:
    'Бұл жаңалықтар хаты қазір жаңа жазылушыларды қабылдамайды.',
  newsletterEmailInvalid: 'Дұрыс электрондық пошта мекенжайын енгізіңіз.',
  contactLinkLabel: 'Байланыс',
  contactPageTitle: 'Байланыс',
  contactDefaultIntro:
    'Сұрағыңыз немесе айтатын сөзіңіз бар ма? Хабарлама жіберіңіз, автор электрондық пошта арқылы жауап береді.',
  contactNameLabel: 'Аты',
  contactEmailLabel: 'Электрондық пошта',
  contactMessageLabel: 'Хабарлама',
  contactWebsiteLabel: 'Веб-сайт (міндетті емес)',
  contactPhoneLabel: 'Телефон (міндетті емес)',
  contactSubmitLabel: 'Хабарлама жіберу',
  contactNoscript:
    'Бұл пішін үшін JavaScript қажет. Хабарлама жіберу үшін оны қосыңыз.',
  contactSent: 'Рахмет, хабарламаңыз жіберілді.',
  contactUnavailable: 'Бұл пішін қазір хабарлама қабылдамайды.',
  contactRateLimited:
    'Осы жерден тым көп хабарлама келді. Кейінірек қайталап көріңіз.',
  contactMessageLinks: 'Хабарламада көбі екі сілтеме болуы мүмкін.',
  tagListLabel: 'Тегтер',
  tagKickerLabel: 'Тег',
  seriesKickerLabel: 'Серия',
  archiveKickerLabel: 'Мұрағат',
  authorKickerLabel: 'Автор',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} мақала`,
  emptyListingLabel: 'Әзірге мақала жоқ.',
  editionsNavigationLabel: 'Басылымдар',
  editionOriginalLabel: 'Түпнұсқа',
  editionQuickReadLabel: 'Жылдам оқу',
  editionStandardLabel: 'Стандартты',
  editionDeepDiveLabel: 'Терең оқу',
  editionNoticeLabel:
    'Жасалған басылым, автор тексерген; түпнұсқа негізгі болып саналады',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Туралы',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Жаңартылды: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `«${tag}» тегі бар жазбалар`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication} сайтындағы ${tag} тегі бар ${count} мақала.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, ${publication} сайтындағы ${count} бөлімнен тұратын серия.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Мұрағат ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication} сайтында ${year} жылы жарияланған ${count} мақала.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${name} жазған мақалалар, ${publication} сайтында.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `${publication} сайтында қамтылған ${count} тақырыпты қараңыз.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `${publication} сайтында жарияланған ${count} серияны қараңыз.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication} сайтындағы барлық мақалалар, барлығы ${count}, жылдар бойынша.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `${publication} сайтындағы барлық мақалалар, жаңалары алдымен.`,
  exploreColumnLabel: 'Шолу',
  rssFeedLabel: 'RSS арнасы',
  languageKickerLabel: 'Тіл',
  languageSwitcherLabel: 'Тілдер',
  languageChipsLabel: 'Қолжетімді тілдер',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication} сайтындағы ${language} тіліндегі ${count} мақала.`,
  postRemovedHeading: 'Бұл жазба жойылған',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Ол ${date} күні жойылған.`,
  postRemovedHomeLabel: 'Басты бетке өту',
  versionPageHeading: 'Сайт нұсқасы',
  versionTemplateLabel: 'Үлгі',
  versionThemeLabel: 'Тақырып',
  versionSchemasLabel: 'Схемалар',
  versionToolchainLabel: 'Жариялау құралдары',
  versionCommitLabel: 'Бастапқы commit',
  versionBuiltAtLabel: 'Жиналған уақыты',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('kk', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
