/**
 * Chrome message catalog for the `mk` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Прескокни до содржината',
  homeLinkLabel: 'Почетна',
  primaryNavigationLabel: 'Главна',
  footerNavigationLabel: 'Подножје',
  breadcrumbNavigationLabel: 'Патека',
  paginationNavigationLabel: 'Страници',
  previousPageLabel: 'Претходна',
  nextPageLabel: 'Следна',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Страница ${current} од ${total}`,
  authorsSectionLabel: 'Автори',
  tagsSectionLabel: 'Ознаки',
  seriesSectionLabel: 'Серија',
  archiveSectionLabel: 'Архива',
  indexHeading: 'Сите написи',
  authorsIndexLabel: 'Автори',
  tagIndexLabelPrefix: 'Ознака:',
  seriesIndexLabelPrefix: 'Серија:',
  archiveYearLabelPrefix: 'Архива:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `За ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Од ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, се отвора во ново јазиче',
  footerLegalLabel: 'Правно',
  termsLinkLabel: 'Услови',
  privacyLinkLabel: 'Приватност',
  consentRegionLabel: 'Избор за приватност',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Оваа страница сака да користи ${providerName} за да ја разбере читаноста. Ништо не се вчитува додека не прифатите, а изборот можете да го промените во секое време од подножјето.`,
  consentAcceptLabel: 'Прифати аналитика',
  consentDeclineLabel: 'Одбиј',
  consentOpenLabel: 'Избор за приватност',
  errorPageHeading: 'Страницата не е пронајдена',
  errorPageBody:
    'Страницата што ја баравте не е пронајдена. Можеби е преместена, преименувана или отстранета.',
  errorPageReturnHomeLabel: 'Врати се на почетната страница',
  appearanceControlLabel: 'Изглед',
  appearanceModeLightLabel: 'Светол',
  appearanceModeDarkLabel: 'Темен',
  appearanceModeSystemLabel: 'Системски',
  searchButtonLabel: 'Пребарај',
  searchButtonAriaLabel: 'Пребарај написи',
  searchPlaceholderLabel: 'Пребарај во публикацијата',
  searchEmptyLabel: 'Ниеден напис не одговара на пребарувањето.',
  searchUnavailableLabel: 'Пребарувањето моментално не е достапно.',
  copyCodeLabel: 'Копирај',
  copiedLabel: 'Копирано',
  linkCopiedLabel: 'Врската е копирана.',
  copyBlockedLabel:
    'Копирањето е блокирано тука. Копирајте ја адресата од прелистувачот.',
  codeSelectedLabel:
    'Кодот е избран. Притиснете Ctrl C или Command C за копирање.',
  savedLabel: 'Зачувано за подоцна.',
  unsavedLabel: 'Отстрането од зачуваните написи.',
  menuSummaryLabel: 'Мени',
  featuredLabel: 'Издвоено',
  readEssayLabel: 'Прочитај го есејот',
  latestHeading: 'Најнови',
  moreArticlesHeading: 'Повеќе написи',
  browseByTagLabel: 'Прелистај по ознаки',
  seriesCardLabel: 'Серија',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} дела`,
  startSeriesLabel: 'Почни од 1. дел',
  newsletterLabel: 'Билтен',
  newsletterActionLabel: 'Претплати се',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} мин. читање`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Дел ${part} од ${total}`,
  onThisPageLabel: 'На оваа страница',
  writtenByLabel: 'Автор',
  aboutTheAuthorLabel: 'За авторот',
  youAreHereLabel: 'Овде сте',
  newerArticleLabel: 'Понови',
  olderArticleLabel: 'Постари',
  moreArticlesNavigationLabel: 'Повеќе написи',
  keepReadingHeading: 'Продолжи со читање',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Повеќе во ${tag}`,
  interactionsHeading: 'Реакции',
  reactionsGroupLabel: 'Реакции',
  likeLabel: 'Допаѓа ми се',
  commentsHeading: 'Разговор',
  interactionsNeedScriptNotice: 'Реакциите и коментарите бараат JavaScript.',
  showMoreCommentsLabel: 'Прикажи повеќе коментари',
  shareLabel: 'Сподели',
  copyLinkLabel: 'Копирај ја врската до овој напис',
  saveForLaterLabel: 'Зачувај за подоцна',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Сподели на ${network}`,
  shareByEmailLabel: 'Сподели по е-пошта',
  shareNativeLabel: 'Сподели го написот',
  followLabel: 'Следи',
  followingLabel: 'Следите',
  unfollowLabel: 'Прекини со следење',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Следи го ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Прекини со следење на ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Сега го следите ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Повеќе не го следите ${name}.`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `Следбеници: ${count}`,
  followersTeamHint: 'Ова го гледа само тимот на вашата страница',
  followDisabledMessage: 'Следењето моментално не е достапно на оваа страница.',
  followAuthorMissingMessage: 'Овој автор моментално не може да се следи.',
  audienceNetworkError:
    'Не можеше да се воспостави врска со Galascribe. Обидете се повторно.',
  audienceRateLimited: 'Премногу обиди. Обидете се повторно за момент.',
  audienceGenericError: 'Нешто тргна наопаку. Обидете се повторно.',
  audienceStorageBlocked:
    'Вашиот прелистувач го блокираше просторот што страницата го бара за најава.',
  audienceSignInUnsupported:
    'Овој прелистувач не може да ве најави на оваа страница.',
  audienceSignInFailed: 'Најавата не заврши. Обидете се повторно.',
  audienceSignInInvalid:
    'Врската за најава не беше важечка. Обидете се повторно.',
  honeypotLabel: 'Оставете го ова поле празно',
  fieldRequiredMessage: 'Ова поле е задолжително.',
  fieldInvalidMessage: 'Проверете го ова поле.',
  newsletterEmailLabel: 'Адреса на е-пошта',
  newsletterCheckInbox: 'Проверете го сандачето за потврда',
  newsletterFullMessage: 'Овој билтен моментално не прима нови претплатници.',
  newsletterEmailInvalid: 'Внесете важечка адреса на е-пошта.',
  contactLinkLabel: 'Контакт',
  contactPageTitle: 'Контакт',
  contactDefaultIntro:
    'Имате прашање или нешто да кажете? Испратете порака, авторот ќе одговори по е-пошта.',
  contactNameLabel: 'Име',
  contactEmailLabel: 'Е-пошта',
  contactMessageLabel: 'Порака',
  contactWebsiteLabel: 'Веб-страница (по избор)',
  contactPhoneLabel: 'Телефон (по избор)',
  contactSubmitLabel: 'Испрати порака',
  contactNoscript:
    'Овој формулар бара JavaScript. Вклучете го за да испратите порака.',
  contactSent: 'Благодариме, пораката е испратена.',
  contactUnavailable: 'Овој формулар моментално не прима пораки.',
  contactRateLimited: 'Премногу пораки оттука. Обидете се подоцна.',
  contactMessageLinks: 'Пораката може да содржи најмногу две врски.',
  tagListLabel: 'Ознаки',
  tagKickerLabel: 'Ознака',
  seriesKickerLabel: 'Серија',
  archiveKickerLabel: 'Архива',
  authorKickerLabel: 'Автор',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} написи`,
  emptyListingLabel: 'Сè уште нема написи.',
  editionsNavigationLabel: 'Изданија',
  editionOriginalLabel: 'Оригинал',
  editionQuickReadLabel: 'Брзо читање',
  editionStandardLabel: 'Стандардно',
  editionDeepDiveLabel: 'Длабинско читање',
  editionNoticeLabel:
    'Генерирано издание, прегледано од авторот; оригиналот е мерродавен',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'За нас',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Ажурирано ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Написи со ознака „${tag}“`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count} написи со ознака ${tag} на ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, серија од ${count} дела на ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Архива ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count} написи објавени во ${year} година на ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Написи од ${name} на ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Прелистајте ги ${count} теми на ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Прелистајте ги ${count} серии објавени на ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Сите написи на ${publication}, вкупно ${count}, по години.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Сите написи на ${publication}, најновите први.`,
  exploreColumnLabel: 'Истражи',
  rssFeedLabel: 'RSS извор',
  languageKickerLabel: 'Јазик',
  languageSwitcherLabel: 'Јазици',
  languageChipsLabel: 'Достапни јазици',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count} написи на ${language} јазик на ${publication}.`,
  postRemovedHeading: 'Овој напис е отстранет',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Отстранет е на ${date}.`,
  postRemovedHomeLabel: 'Оди на почетната страница',
  versionPageHeading: 'Верзија на страницата',
  versionTemplateLabel: 'Шаблон',
  versionThemeLabel: 'Тема',
  versionSchemasLabel: 'Шеми',
  versionToolchainLabel: 'Алатки за објавување',
  versionCommitLabel: 'Изворен commit',
  versionBuiltAtLabel: 'Изграден на',
  listenNavLabel: 'Слушај',
  listenNavCurrentLabel: 'Слушај го овој напис',
  listenInviteTitle: 'Зафатени раце? Подобро слушајте.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Овој напис е достапен и како разговор од ${minutes} мин. Погодно за пат, тренинг или миење садови.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Овој напис е достапен и како нарација од ${minutes} мин. Погодно за пат, тренинг или миење садови.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Овој напис е достапен и како дебата од ${minutes} мин. Погодно за пат, тренинг или миење садови.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Овој напис е достапен и како скеч од ${minutes} мин. Погодно за пат, тренинг или миење садови.`,
  listenInvitePlayLabel: 'Пушти',
  listenInviteDeclineLabel: 'Не, благодарам',
  listenInviteNote:
    'Гласови со вештачка интелигенција, адаптирани од овој напис.',
  listenInviteCloseLabel: 'Затвори засега',
  listenPlayerRegionLabel: 'Аудио плеер',
  listenPlayerNowPlayingLabel: 'Сега свири',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} од ${count}`,
  listenPlayerPlayLabel: 'Пушти',
  listenPlayerPauseLabel: 'Пауза',
  listenPlayerBackLabel: '15 секунди назад',
  listenPlayerPreviousLabel: 'Претходна епизода',
  listenPlayerNextLabel: 'Следна епизода',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Брзина на репродукција ${rate}×`,
  listenPlayerSeekLabel: 'Позиција',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} од ${total}`,
  listenPlayerCloseLabel: 'Запри и затвори',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Сега свири: ${title}`,
  listenListHeading: 'Слушајте го овој блог',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count} епизоди · ${duration}`,
  listenListPlayAllLabel: 'Пушти ги сите',
  listenListShuffleLabel: 'Измешано',
  listenListOrderLabel: 'Редослед',
  listenListNewestLabel: 'Најновите први',
  listenListOldestLabel: 'Најстарите први',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Прикажи ги сите (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Пушти: ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} мин.`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} ч. ${minutes} мин.`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('mk', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
