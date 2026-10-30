/**
 * Chrome message catalog for the `uk` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Перейти до вмісту',
  homeLinkLabel: 'Головна',
  primaryNavigationLabel: 'Основна',
  footerNavigationLabel: 'Нижнє меню',
  breadcrumbNavigationLabel: 'Навігаційний ланцюжок',
  paginationNavigationLabel: 'Сторінки',
  previousPageLabel: 'Назад',
  nextPageLabel: 'Далі',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Сторінка ${current} з ${total}`,
  authorsSectionLabel: 'Автори',
  tagsSectionLabel: 'Теги',
  seriesSectionLabel: 'Серії',
  archiveSectionLabel: 'Архів',
  indexHeading: 'Усі статті',
  authorsIndexLabel: 'Автори',
  tagIndexLabelPrefix: 'Тег:',
  seriesIndexLabelPrefix: 'Серія:',
  archiveYearLabelPrefix: 'Архів:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Про автора: ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Автор: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, відкриється в новій вкладці',
  footerLegalLabel: 'Правова інформація',
  termsLinkLabel: 'Умови',
  privacyLinkLabel: 'Конфіденційність',
  consentRegionLabel: 'Налаштування конфіденційності',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Цей сайт хотів би використовувати ${providerName}, щоб розуміти, хто його читає. Доки ви не погодитесь, нічого не завантажується, а свій вибір можна змінити будь-коли внизу сторінки.`,
  consentAcceptLabel: 'Дозволити аналітику',
  consentDeclineLabel: 'Відхилити',
  consentOpenLabel: 'Налаштування конфіденційності',
  errorPageHeading: 'Сторінку не знайдено',
  errorPageBody:
    'Сторінку, яку ви шукали, не знайдено. Можливо, її перемістили, перейменували або видалили.',
  errorPageReturnHomeLabel: 'Повернутися на головну',
  appearanceControlLabel: 'Вигляд',
  appearanceModeLightLabel: 'Світлий',
  appearanceModeDarkLabel: 'Темний',
  appearanceModeSystemLabel: 'Системний',
  searchButtonLabel: 'Пошук',
  searchButtonAriaLabel: 'Пошук статей',
  searchPlaceholderLabel: 'Пошук у виданні',
  searchEmptyLabel: 'За вашим запитом статей не знайдено.',
  searchUnavailableLabel: 'Пошук зараз недоступний.',
  copyCodeLabel: 'Копіювати',
  copiedLabel: 'Скопійовано',
  linkCopiedLabel: 'Посилання скопійовано.',
  copyBlockedLabel: 'Тут копіювання заблоковано. Скопіюйте адресу з браузера.',
  codeSelectedLabel:
    'Код виділено. Натисніть Ctrl C або Command C, щоб скопіювати.',
  savedLabel: 'Збережено на потім.',
  unsavedLabel: 'Видалено зі збережених статей.',
  menuSummaryLabel: 'Меню',
  featuredLabel: 'Вибране',
  readEssayLabel: 'Читати есе',
  latestHeading: 'Нове',
  moreArticlesHeading: 'Більше статей',
  browseByTagLabel: 'Перегляд за тегами',
  seriesCardLabel: 'Серія',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`Частин: ${count}`}`,
  startSeriesLabel: 'Почати з частини 1',
  newsletterLabel: 'Розсилка',
  newsletterActionLabel: 'Підписатися',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} хв читання`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Частина ${part} з ${total}`,
  onThisPageLabel: 'На цій сторінці',
  writtenByLabel: 'Автор',
  aboutTheAuthorLabel: 'Про автора',
  youAreHereLabel: 'Ви тут',
  newerArticleLabel: 'Новіше',
  olderArticleLabel: 'Старіше',
  moreArticlesNavigationLabel: 'Більше статей',
  keepReadingHeading: 'Читати далі',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Ще за тегом ${tag}`,
  interactionsHeading: 'Відгуки',
  reactionsGroupLabel: 'Реакції',
  likeLabel: 'Подобається',
  commentsHeading: 'Обговорення',
  interactionsNeedScriptNotice: 'Для реакцій і коментарів потрібен JavaScript.',
  showMoreCommentsLabel: 'Показати більше коментарів',
  shareLabel: 'Поділитися',
  copyLinkLabel: 'Копіювати посилання на статтю',
  saveForLaterLabel: 'Зберегти на потім',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Поділитися в ${network}`,
  shareByEmailLabel: 'Надіслати поштою',
  shareNativeLabel: 'Поділитися статтею',
  followLabel: 'Підписатися',
  followingLabel: 'Ви підписані',
  unfollowLabel: 'Відписатися',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Підписатися на ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Відписатися від ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Ви підписалися на ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Ви відписалися від ${name}.`,
  followDisabledMessage: 'Підписка на цьому сайті зараз недоступна.',
  followAuthorMissingMessage: 'На цього автора зараз не можна підписатися.',
  audienceNetworkError: 'Не вдалося зв’язатися з Galascribe. Спробуйте ще раз.',
  audienceRateLimited: 'Забагато спроб. Повторіть за хвилину.',
  audienceGenericError: 'Щось пішло не так. Спробуйте ще раз.',
  audienceStorageBlocked:
    'Браузер заблокував сховище, потрібне сайту для входу.',
  audienceSignInUnsupported:
    'Цей браузер не може виконати вхід на цій сторінці.',
  audienceSignInFailed: 'Вхід не завершено. Спробуйте ще раз.',
  audienceSignInInvalid: 'Це посилання для входу недійсне. Спробуйте ще раз.',
  honeypotLabel: 'Залиште це поле порожнім',
  fieldRequiredMessage: 'Це поле обов’язкове.',
  fieldInvalidMessage: 'Перевірте це поле.',
  newsletterEmailLabel: 'Адреса електронної пошти',
  newsletterCheckInbox: 'Перевірте пошту, щоб підтвердити підписку',
  newsletterFullMessage: 'Ця розсилка зараз не приймає нових підписників.',
  newsletterEmailInvalid: 'Введіть дійсну адресу електронної пошти.',
  contactLinkLabel: 'Контакти',
  contactPageTitle: 'Контакти',
  contactDefaultIntro:
    'Маєте запитання чи що сказати? Надішліть повідомлення, і автор відповість електронною поштою.',
  contactNameLabel: 'Ім’я',
  contactEmailLabel: 'Ел. пошта',
  contactMessageLabel: 'Повідомлення',
  contactWebsiteLabel: 'Сайт (необов’язково)',
  contactPhoneLabel: 'Телефон (необов’язково)',
  contactSubmitLabel: 'Надіслати повідомлення',
  contactNoscript:
    'Для цієї форми потрібен JavaScript. Увімкніть його, щоб надіслати повідомлення.',
  contactSent: 'Дякуємо, ваше повідомлення надіслано.',
  contactUnavailable: 'Ця форма зараз не приймає повідомлення.',
  contactRateLimited: 'Забагато повідомлень звідси. Спробуйте пізніше.',
  contactMessageLinks: 'У повідомленні може бути не більше двох посилань.',
  tagListLabel: 'Теги',
  tagKickerLabel: 'Тег',
  seriesKickerLabel: 'Серія',
  archiveKickerLabel: 'Архів',
  authorKickerLabel: 'Автор',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`Статей: ${count}`}`,
  emptyListingLabel: 'Статей поки немає.',
  editionsNavigationLabel: 'Версії',
  editionOriginalLabel: 'Оригінал',
  editionQuickReadLabel: 'Коротко',
  editionStandardLabel: 'Стандартна',
  editionDeepDiveLabel: 'Докладно',
  editionNoticeLabel:
    'Згенерована версія, перевірена автором; першоджерело — оригінал',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Про нас',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Оновлено: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Записи з тегом «${tag}»`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `Статті з тегом ${tag} на ${publication}. ${`Статей: ${count}`}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}: серія на ${publication}. ${`Частин: ${count}`}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Архів ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `Статті за ${year} рік на ${publication}. ${`Статей: ${count}`}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Статті автора ${name} на ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Теми, про які пишуть на ${publication}. ${`Тем: ${count}`}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Серії на ${publication}. Усього: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Усі статті на ${publication} за роками. Усього: ${count}.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Усі статті на ${publication}, спочатку нові.`,
  exploreColumnLabel: 'Розділи',
  rssFeedLabel: 'RSS-стрічка',
  languageKickerLabel: 'Мова',
  languageSwitcherLabel: 'Мови',
  languageChipsLabel: 'Доступні мови',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `Статті мовою «${language}» на ${publication}. ${`Статей: ${count}`}.`,
  postRemovedHeading: 'Цей запис видалено',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Його видалено ${date}.`,
  postRemovedHomeLabel: 'На головну',
  versionPageHeading: 'Версія сайту',
  versionTemplateLabel: 'Шаблон',
  versionThemeLabel: 'Тема',
  versionSchemasLabel: 'Схеми',
  versionToolchainLabel: 'Інструменти публікації',
  versionCommitLabel: 'Вихідний коміт',
  versionBuiltAtLabel: 'Зібрано',
  listenNavLabel: 'Слухати',
  listenNavCurrentLabel: 'Слухати цю статтю',
  listenInviteTitle: 'Зайняті руки? Краще послухайте.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Ця стаття є також у вигляді розмови на ${minutes} хв. Зручно в дорозі, на тренуванні чи за миттям посуду.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Ця стаття є також у вигляді озвучення на ${minutes} хв. Зручно в дорозі, на тренуванні чи за миттям посуду.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Ця стаття є також у вигляді дебатів на ${minutes} хв. Зручно в дорозі, на тренуванні чи за миттям посуду.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Ця стаття є також у вигляді скетчу на ${minutes} хв. Зручно в дорозі, на тренуванні чи за миттям посуду.`,
  listenInvitePlayLabel: 'Увімкнути',
  listenInviteDeclineLabel: 'Ні, дякую',
  listenInviteNote: 'Голоси ШІ, адаптація цієї статті.',
  listenInviteCloseLabel: 'Закрити поки що',
  listenPlayerRegionLabel: 'Аудіоплеєр',
  listenPlayerNowPlayingLabel: 'Зараз грає',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} з ${count}`,
  listenPlayerPlayLabel: 'Відтворити',
  listenPlayerPauseLabel: 'Пауза',
  listenPlayerBackLabel: 'Назад на 15 секунд',
  listenPlayerPreviousLabel: 'Попередній випуск',
  listenPlayerNextLabel: 'Наступний випуск',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Швидкість відтворення ${rate}×`,
  listenPlayerSeekLabel: 'Позиція',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} з ${total}`,
  listenPlayerCloseLabel: 'Зупинити й закрити',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Грає: ${title}`,
  listenListHeading: 'Слухати цей блог',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `Випусків: ${count} · ${duration}`,
  listenListPlayAllLabel: 'Слухати все',
  listenListShuffleLabel: 'Перемішати',
  listenListOrderLabel: 'Порядок',
  listenListNewestLabel: 'Спочатку нові',
  listenListOldestLabel: 'Спочатку старі',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Показати всі (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Відтворити: ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} хв`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} год ${minutes} хв`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('uk', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
