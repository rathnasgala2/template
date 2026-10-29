/**
 * Chrome message catalog for the `bg` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Към съдържанието',
  homeLinkLabel: 'Начало',
  primaryNavigationLabel: 'Основно меню',
  footerNavigationLabel: 'Долен колонтитул',
  breadcrumbNavigationLabel: 'Път',
  paginationNavigationLabel: 'Странициране',
  previousPageLabel: 'Предишна',
  nextPageLabel: 'Следваща',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Страница ${current} от ${total}`,
  authorsSectionLabel: 'Автори',
  tagsSectionLabel: 'Етикети',
  seriesSectionLabel: 'Серии',
  archiveSectionLabel: 'Архив',
  indexHeading: 'Всички статии',
  authorsIndexLabel: 'Автори',
  tagIndexLabelPrefix: 'Етикет:',
  seriesIndexLabelPrefix: 'Серия:',
  archiveYearLabelPrefix: 'Архив:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `За ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `От ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, отваря се в нов раздел',
  footerLegalLabel: 'Правна информация',
  termsLinkLabel: 'Условия',
  privacyLinkLabel: 'Поверителност',
  consentRegionLabel: 'Избори за поверителност',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Този сайт би искал да използва ${providerName}, за да разбира читателската аудитория. Нищо не се зарежда, докато не приемете, и можете да промените избора си по всяко време от долната част на страницата.`,
  consentAcceptLabel: 'Приемане на анализа',
  consentDeclineLabel: 'Отказ',
  consentOpenLabel: 'Избори за поверителност',
  errorPageHeading: 'Страницата не е намерена',
  errorPageBody:
    'Страницата, която търсите, не беше намерена. Може да е преместена, преименувана или премахната.',
  errorPageReturnHomeLabel: 'Към началната страница',
  appearanceControlLabel: 'Външен вид',
  appearanceModeLightLabel: 'Светъл',
  appearanceModeDarkLabel: 'Тъмен',
  appearanceModeSystemLabel: 'Системен',
  searchButtonLabel: 'Търсене',
  searchButtonAriaLabel: 'Търсене в статиите',
  searchPlaceholderLabel: 'Търсене в изданието',
  searchEmptyLabel: 'Няма статии, които отговарят на търсенето.',
  searchUnavailableLabel: 'Търсенето в момента не е достъпно.',
  copyCodeLabel: 'Копиране',
  copiedLabel: 'Копирано',
  linkCopiedLabel: 'Връзката е копирана.',
  copyBlockedLabel: 'Копирането тук е блокирано. Копирайте адреса от браузъра.',
  codeSelectedLabel:
    'Кодът е избран. Натиснете Ctrl C или Command C, за да копирате.',
  savedLabel: 'Запазено за по-късно.',
  unsavedLabel: 'Премахнато от запазените статии.',
  menuSummaryLabel: 'Меню',
  featuredLabel: 'Препоръчано',
  readEssayLabel: 'Прочетете есето',
  latestHeading: 'Най-нови',
  moreArticlesHeading: 'Още статии',
  browseByTagLabel: 'Преглед по етикет',
  seriesCardLabel: 'Серия',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count === '1' ? '1 част' : `${count} части`}`,
  startSeriesLabel: 'Започнете с част 1',
  newsletterLabel: 'Бюлетин',
  newsletterActionLabel: 'Абонирай се',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} мин. четене`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Част ${part} от ${total}`,
  onThisPageLabel: 'На тази страница',
  writtenByLabel: 'Автор',
  aboutTheAuthorLabel: 'За автора',
  youAreHereLabel: 'Вие сте тук',
  newerArticleLabel: 'По-нова',
  olderArticleLabel: 'По-стара',
  moreArticlesNavigationLabel: 'Още статии',
  keepReadingHeading: 'Продължете да четете',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Още в ${tag}`,
  interactionsHeading: 'Отзиви',
  reactionsGroupLabel: 'Реакции',
  likeLabel: 'Харесвам',
  commentsHeading: 'Разговор',
  interactionsNeedScriptNotice: 'Реакциите и коментарите изискват JavaScript.',
  showMoreCommentsLabel: 'Още коментари',
  shareLabel: 'Споделяне',
  copyLinkLabel: 'Копиране на връзката към статията',
  saveForLaterLabel: 'Запази за по-късно',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Споделяне в ${network}`,
  shareByEmailLabel: 'Споделяне по имейл',
  shareNativeLabel: 'Споделяне на статията',
  followLabel: 'Следване',
  followingLabel: 'Следвате',
  unfollowLabel: 'Спиране на следването',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Следване на ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Спиране на следването на ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Вече следвате ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Вече не следвате ${name}.`,
  followDisabledMessage: 'Следването в момента не е налично на този сайт.',
  followAuthorMissingMessage: 'Този автор в момента не може да бъде следван.',
  audienceNetworkError: 'Не може да се свърже с Galascribe. Опитайте отново.',
  audienceRateLimited: 'Твърде много опити. Опитайте отново след малко.',
  audienceGenericError: 'Нещо се обърка. Опитайте отново.',
  audienceStorageBlocked:
    'Браузърът ви блокира хранилището, което сайтът ползва за вход.',
  audienceSignInUnsupported:
    'Този браузър не може да ви впише на тази страница.',
  audienceSignInFailed: 'Входът не беше завършен. Опитайте отново.',
  audienceSignInInvalid: 'Връзката за вход не е валидна. Опитайте отново.',
  honeypotLabel: 'Оставете това поле празно',
  fieldRequiredMessage: 'Това поле е задължително.',
  fieldInvalidMessage: 'Проверете това поле.',
  newsletterEmailLabel: 'Имейл адрес',
  newsletterCheckInbox: 'Проверете пощата си за потвърждение',
  newsletterFullMessage: 'Този бюлетин в момента не приема нови абонати.',
  newsletterEmailInvalid: 'Въведете валиден имейл адрес.',
  contactLinkLabel: 'Контакт',
  contactPageTitle: 'Контакт',
  contactDefaultIntro:
    'Имате въпрос или нещо за казване? Изпратете съобщение и авторът ще отговори по имейл.',
  contactNameLabel: 'Име',
  contactEmailLabel: 'Имейл',
  contactMessageLabel: 'Съобщение',
  contactWebsiteLabel: 'Уебсайт (по желание)',
  contactPhoneLabel: 'Телефон (по желание)',
  contactSubmitLabel: 'Изпращане на съобщението',
  contactNoscript:
    'Тази форма изисква JavaScript. Включете го, за да изпратите съобщение.',
  contactSent: 'Благодарим, съобщението ви е изпратено.',
  contactUnavailable: 'Тази форма в момента не приема съобщения.',
  contactRateLimited: 'Твърде много съобщения оттук. Опитайте по-късно.',
  contactMessageLinks: 'Съобщението може да съдържа най-много две връзки.',
  tagListLabel: 'Етикети',
  tagKickerLabel: 'Етикет',
  seriesKickerLabel: 'Серия',
  archiveKickerLabel: 'Архив',
  authorKickerLabel: 'Автор',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) =>
    `${count === '1' ? '1 статия' : `${count} статии`}`,
  emptyListingLabel: 'Все още няма статии.',
  editionsNavigationLabel: 'Версии',
  editionOriginalLabel: 'Оригинал',
  editionQuickReadLabel: 'Бързо четене',
  editionStandardLabel: 'Стандартна',
  editionDeepDiveLabel: 'Задълбочено',
  editionNoticeLabel:
    'Генерирана версия, прегледана от автора; оригиналът е основата',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'За нас',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Обновено на ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Публикации с етикет „${tag}“`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count === '1' ? '1 статия' : `${count} статии`} с етикет ${tag} в ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, серия от ${count === '1' ? '1 част' : `${count} части`} в ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Архив ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count === '1' ? '1 статия' : `${count} статии`}, публикувани през ${year} в ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Статии от ${name} в ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Разгледайте ${count} теми в ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Разгледайте ${count} серии, публикувани в ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Всички статии в ${publication}, общо ${count}, по години.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Всички статии в ${publication}, най-новите първо.`,
  exploreColumnLabel: 'Разгледайте',
  rssFeedLabel: 'RSS емисия',
  languageKickerLabel: 'Език',
  languageSwitcherLabel: 'Езици',
  languageChipsLabel: 'Налични езици',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? '1 статия' : `${count} статии`} на ${language} в ${publication}.`,
  postRemovedHeading: 'Тази публикация е премахната',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Премахната е на ${date}.`,
  postRemovedHomeLabel: 'Към началната страница',
  versionPageHeading: 'Версия на сайта',
  versionTemplateLabel: 'Шаблон',
  versionThemeLabel: 'Тема',
  versionSchemasLabel: 'Схеми',
  versionToolchainLabel: 'Инструменти за публикуване',
  versionCommitLabel: 'Изходен къмит',
  versionBuiltAtLabel: 'Изграден на',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('bg', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
