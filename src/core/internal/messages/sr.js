/**
 * Chrome message catalog for the `sr` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Пређи на садржај',
  homeLinkLabel: 'Почетна',
  primaryNavigationLabel: 'Главни мени',
  footerNavigationLabel: 'Подножје',
  breadcrumbNavigationLabel: 'Путања',
  paginationNavigationLabel: 'Страничење',
  previousPageLabel: 'Претходно',
  nextPageLabel: 'Следеће',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Страна ${current} од ${total}`,
  authorsSectionLabel: 'Аутори',
  tagsSectionLabel: 'Ознаке',
  seriesSectionLabel: 'Серије',
  archiveSectionLabel: 'Архива',
  indexHeading: 'Сви чланци',
  authorsIndexLabel: 'Аутори',
  tagIndexLabelPrefix: 'Ознака:',
  seriesIndexLabelPrefix: 'Серија:',
  archiveYearLabelPrefix: 'Архива:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `О аутору: ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Аутор: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, отвара се у новој картици',
  footerLegalLabel: 'Правне информације',
  termsLinkLabel: 'Услови',
  privacyLinkLabel: 'Приватност',
  consentRegionLabel: 'Подешавања приватности',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Овај сајт би желео да користи ${providerName} да би разумео читаност. Ништа се не учитава док не прихватите, а избор можете да промените било када у подножју.`,
  consentAcceptLabel: 'Прихвати аналитику',
  consentDeclineLabel: 'Одбиј',
  consentOpenLabel: 'Подешавања приватности',
  errorPageHeading: 'Страница није пронађена',
  errorPageBody:
    'Страница коју тражите није пронађена. Можда је премештена, преименована или уклоњена.',
  errorPageReturnHomeLabel: 'Назад на почетну страницу',
  appearanceControlLabel: 'Изглед',
  appearanceModeLightLabel: 'Светла',
  appearanceModeDarkLabel: 'Тамна',
  appearanceModeSystemLabel: 'Системска',
  searchButtonLabel: 'Претрага',
  searchButtonAriaLabel: 'Претражи чланке',
  searchPlaceholderLabel: 'Претражи публикацију',
  searchEmptyLabel: 'Ниједан чланак не одговара претрази.',
  searchUnavailableLabel: 'Претрага тренутно није доступна.',
  copyCodeLabel: 'Копирај',
  copiedLabel: 'Копирано',
  linkCopiedLabel: 'Веза је копирана.',
  copyBlockedLabel:
    'Копирање је овде блокирано. Копирајте адресу из прегледача.',
  codeSelectedLabel:
    'Кôд је изабран. Притисните Ctrl C или Command C да бисте копирали.',
  savedLabel: 'Сачувано за касније.',
  unsavedLabel: 'Уклоњено из сачуваних чланака.',
  menuSummaryLabel: 'Мени',
  featuredLabel: 'Издвојено',
  readEssayLabel: 'Прочитај есеј',
  latestHeading: 'Најновије',
  moreArticlesHeading: 'Још чланака',
  browseByTagLabel: 'Прегледај по ознаци',
  seriesCardLabel: 'Серија',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`Делови: ${count}`}`,
  startSeriesLabel: 'Почни од 1. дела',
  newsletterLabel: 'Билтен',
  newsletterActionLabel: 'Претплати се',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} мин читања`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Део ${part} од ${total}`,
  onThisPageLabel: 'На овој страници',
  writtenByLabel: 'Написао/ла',
  aboutTheAuthorLabel: 'О аутору',
  youAreHereLabel: 'Овде сте',
  newerArticleLabel: 'Новије',
  olderArticleLabel: 'Старије',
  moreArticlesNavigationLabel: 'Још чланака',
  keepReadingHeading: 'Наставите да читате',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Више у: ${tag}`,
  interactionsHeading: 'Одговори',
  reactionsGroupLabel: 'Реакције',
  likeLabel: 'Свиђа ми се',
  commentsHeading: 'Разговор',
  interactionsNeedScriptNotice: 'Реакције и коментари захтевају JavaScript.',
  showMoreCommentsLabel: 'Прикажи још коментара',
  shareLabel: 'Подели',
  copyLinkLabel: 'Копирај везу до чланка',
  saveForLaterLabel: 'Сачувај за касније',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Подели на ${network}`,
  shareByEmailLabel: 'Подели е-поштом',
  shareNativeLabel: 'Подели овај чланак',
  followLabel: 'Прати',
  followingLabel: 'Пратите',
  unfollowLabel: 'Престани да пратиш',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Прати: ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Престани да пратиш: ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Сада пратите: ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Више не пратите: ${name}.`,
  followDisabledMessage: 'Праћење на овом сајту тренутно није доступно.',
  followAuthorMissingMessage: 'Овог аутора тренутно није могуће пратити.',
  audienceNetworkError:
    'Није могуће повезати се са Galascribe. Покушајте поново.',
  audienceRateLimited: 'Превише покушаја. Покушајте поново за тренутак.',
  audienceGenericError: 'Нешто је пошло наопако. Покушајте поново.',
  audienceStorageBlocked:
    'Прегледач је блокирао складиште које сајт користи за пријаву.',
  audienceSignInUnsupported:
    'Овај прегледач вас не може пријавити на овој страници.',
  audienceSignInFailed: 'Пријава није завршена. Покушајте поново.',
  audienceSignInInvalid: 'Веза за пријаву није важећа. Покушајте поново.',
  honeypotLabel: 'Оставите ово поље празним',
  fieldRequiredMessage: 'Ово поље је обавезно.',
  fieldInvalidMessage: 'Проверите ово поље.',
  newsletterEmailLabel: 'Адреса е-поште',
  newsletterCheckInbox: 'Потврдите у пријемном сандучету',
  newsletterFullMessage: 'Овај билтен тренутно не прима нове претплатнике.',
  newsletterEmailInvalid: 'Унесите исправну адресу е-поште.',
  contactLinkLabel: 'Контакт',
  contactPageTitle: 'Контакт',
  contactDefaultIntro:
    'Имате питање или нешто да кажете? Пошаљите поруку, а аутор ће одговорити е-поштом.',
  contactNameLabel: 'Име',
  contactEmailLabel: 'Е-пошта',
  contactMessageLabel: 'Порука',
  contactWebsiteLabel: 'Вебсајт (необавезно)',
  contactPhoneLabel: 'Телефон (необавезно)',
  contactSubmitLabel: 'Пошаљи поруку',
  contactNoscript:
    'Овај образац захтева JavaScript. Укључите га да бисте послали поруку.',
  contactSent: 'Хвала, ваша порука је послата.',
  contactUnavailable: 'Овај образац тренутно не прима поруке.',
  contactRateLimited: 'Превише порука одавде. Покушајте касније.',
  contactMessageLinks: 'Порука може да садржи највише две везе.',
  tagListLabel: 'Ознаке',
  tagKickerLabel: 'Ознака',
  seriesKickerLabel: 'Серија',
  archiveKickerLabel: 'Архива',
  authorKickerLabel: 'Аутор',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`Чланци: ${count}`}`,
  emptyListingLabel: 'Још нема чланака.',
  editionsNavigationLabel: 'Издања',
  editionOriginalLabel: 'Оригинал',
  editionQuickReadLabel: 'Брзо читање',
  editionStandardLabel: 'Стандардно',
  editionDeepDiveLabel: 'Дубински',
  editionNoticeLabel:
    'Генерисано издање које је прегледао аутор; меродаван је оригинал',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'О нама',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Ажурирано ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Објаве са ознаком „${tag}”`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `Ознака ${tag} на ${publication}. ${`Чланци: ${count}`}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, серија на ${publication}. ${`Делови: ${count}`}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Архива ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `Објављено ${year}. на ${publication}. ${`Чланци: ${count}`}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Чланци аутора ${name} на ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Прегледајте теме на ${publication}. Укупно: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Прегледајте серије објављене на ${publication}. Укупно: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Сви чланци на ${publication} по годинама. Укупно: ${count}.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Сви чланци на ${publication}, најновији први.`,
  exploreColumnLabel: 'Истражите',
  rssFeedLabel: 'RSS извор',
  languageKickerLabel: 'Језик',
  languageSwitcherLabel: 'Језици',
  languageChipsLabel: 'Доступни језици',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `Језик: ${language}, ${publication}. ${`Чланци: ${count}`}.`,
  postRemovedHeading: 'Ова објава је уклоњена',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Уклоњена је ${date}.`,
  postRemovedHomeLabel: 'Иди на почетну страницу',
  versionPageHeading: 'Верзија сајта',
  versionTemplateLabel: 'Шаблон',
  versionThemeLabel: 'Тема',
  versionSchemasLabel: 'Шеме',
  versionToolchainLabel: 'Алати за објаву',
  versionCommitLabel: 'Изворни commit',
  versionBuiltAtLabel: 'Изграђено',
  listenNavLabel: 'Слушај',
  listenNavCurrentLabel: 'Слушај овај чланак',
  listenInviteTitle: 'Заузете руке? Радије слушај.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Овај чланак је доступан и као разговор од ${minutes} мин. Згодно за вожњу, тренинг или прање судова.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Овај чланак је доступан и као нарација од ${minutes} мин. Згодно за вожњу, тренинг или прање судова.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Овај чланак је доступан и као расправа од ${minutes} мин. Згодно за вожњу, тренинг или прање судова.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Овај чланак је доступан и као скеч од ${minutes} мин. Згодно за вожњу, тренинг или прање судова.`,
  listenInvitePlayLabel: 'Пусти',
  listenInviteDeclineLabel: 'Не, хвала',
  listenInviteNote: 'АИ гласови, прилагођено према овом чланку.',
  listenInviteCloseLabel: 'Затвори за сада',
  listenPlayerRegionLabel: 'Аудио плејер',
  listenPlayerNowPlayingLabel: 'Тренутно свира',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} од ${count}`,
  listenPlayerPlayLabel: 'Пусти',
  listenPlayerPauseLabel: 'Паузирај',
  listenPlayerBackLabel: 'Назад 15 секунди',
  listenPlayerPreviousLabel: 'Претходна епизода',
  listenPlayerNextLabel: 'Следећа епизода',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Брзина репродукције ${rate}×`,
  listenPlayerSeekLabel: 'Позиција',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} од ${total}`,
  listenPlayerCloseLabel: 'Заустави и затвори',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Свира: ${title}`,
  listenListHeading: 'Слушај овај блог',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `Епизода: ${count} · ${duration}`,
  listenListPlayAllLabel: 'Пусти све',
  listenListShuffleLabel: 'Насумично',
  listenListOrderLabel: 'Редослед',
  listenListNewestLabel: 'Најновије прво',
  listenListOldestLabel: 'Најстарије прво',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Прикажи све (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Пусти: ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} мин`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} ч ${minutes} мин`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('sr', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
