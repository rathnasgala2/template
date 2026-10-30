/**
 * Chrome message catalog for the `ru` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Перейти к содержимому',
  homeLinkLabel: 'Главная',
  primaryNavigationLabel: 'Основная',
  footerNavigationLabel: 'Нижнее меню',
  breadcrumbNavigationLabel: 'Навигационная цепочка',
  paginationNavigationLabel: 'Страницы',
  previousPageLabel: 'Назад',
  nextPageLabel: 'Вперёд',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Страница ${current} из ${total}`,
  authorsSectionLabel: 'Авторы',
  tagsSectionLabel: 'Теги',
  seriesSectionLabel: 'Серии',
  archiveSectionLabel: 'Архив',
  indexHeading: 'Все статьи',
  authorsIndexLabel: 'Авторы',
  tagIndexLabelPrefix: 'Тег:',
  seriesIndexLabelPrefix: 'Серия:',
  archiveYearLabelPrefix: 'Архив:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Об авторе: ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Автор: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, откроется в новой вкладке',
  footerLegalLabel: 'Правовая информация',
  termsLinkLabel: 'Условия',
  privacyLinkLabel: 'Конфиденциальность',
  consentRegionLabel: 'Настройки конфиденциальности',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Этот сайт хотел бы использовать ${providerName}, чтобы понимать, кто его читает. Пока вы не согласитесь, ничего не загружается, а выбор можно изменить в любое время внизу страницы.`,
  consentAcceptLabel: 'Разрешить аналитику',
  consentDeclineLabel: 'Отклонить',
  consentOpenLabel: 'Настройки конфиденциальности',
  errorPageHeading: 'Страница не найдена',
  errorPageBody:
    'Страница, которую вы искали, не найдена. Возможно, её переместили, переименовали или удалили.',
  errorPageReturnHomeLabel: 'Вернуться на главную',
  appearanceControlLabel: 'Оформление',
  appearanceModeLightLabel: 'Светлое',
  appearanceModeDarkLabel: 'Тёмное',
  appearanceModeSystemLabel: 'Системное',
  searchButtonLabel: 'Поиск',
  searchButtonAriaLabel: 'Поиск по статьям',
  searchPlaceholderLabel: 'Поиск по изданию',
  searchEmptyLabel: 'По вашему запросу статей не найдено.',
  searchUnavailableLabel: 'Поиск сейчас недоступен.',
  copyCodeLabel: 'Копировать',
  copiedLabel: 'Скопировано',
  linkCopiedLabel: 'Ссылка скопирована.',
  copyBlockedLabel:
    'Здесь копирование заблокировано. Скопируйте адрес из браузера.',
  codeSelectedLabel:
    'Код выделен. Нажмите Ctrl C или Command C, чтобы скопировать.',
  savedLabel: 'Сохранено на потом.',
  unsavedLabel: 'Удалено из сохранённых статей.',
  menuSummaryLabel: 'Меню',
  featuredLabel: 'Избранное',
  readEssayLabel: 'Читать эссе',
  latestHeading: 'Свежее',
  moreArticlesHeading: 'Ещё статьи',
  browseByTagLabel: 'Обзор по тегам',
  seriesCardLabel: 'Серия',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`Частей: ${count}`}`,
  startSeriesLabel: 'Начать с части 1',
  newsletterLabel: 'Рассылка',
  newsletterActionLabel: 'Подписаться',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} мин чтения`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Часть ${part} из ${total}`,
  onThisPageLabel: 'На этой странице',
  writtenByLabel: 'Автор',
  aboutTheAuthorLabel: 'Об авторе',
  youAreHereLabel: 'Вы здесь',
  newerArticleLabel: 'Новее',
  olderArticleLabel: 'Старше',
  moreArticlesNavigationLabel: 'Ещё статьи',
  keepReadingHeading: 'Читать дальше',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Ещё по тегу ${tag}`,
  interactionsHeading: 'Отклики',
  reactionsGroupLabel: 'Реакции',
  likeLabel: 'Нравится',
  commentsHeading: 'Обсуждение',
  interactionsNeedScriptNotice: 'Для реакций и комментариев нужен JavaScript.',
  showMoreCommentsLabel: 'Показать ещё комментарии',
  shareLabel: 'Поделиться',
  copyLinkLabel: 'Скопировать ссылку на статью',
  saveForLaterLabel: 'Сохранить на потом',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Поделиться в ${network}`,
  shareByEmailLabel: 'Отправить по почте',
  shareNativeLabel: 'Поделиться статьёй',
  followLabel: 'Подписаться',
  followingLabel: 'Вы подписаны',
  unfollowLabel: 'Отписаться',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Подписаться на ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Отписаться от ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Вы подписались на ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Вы отписались от ${name}.`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `Подписчиков: ${count}`,
  followersTeamHint: 'Это видит только команда вашего сайта',
  followDisabledMessage: 'Подписка на этом сайте сейчас недоступна.',
  followAuthorMissingMessage: 'На этого автора сейчас нельзя подписаться.',
  audienceNetworkError:
    'Не удалось связаться с Galascribe. Попробуйте ещё раз.',
  audienceRateLimited: 'Слишком много попыток. Повторите через минуту.',
  audienceGenericError: 'Что-то пошло не так. Попробуйте ещё раз.',
  audienceStorageBlocked:
    'Браузер заблокировал хранилище, которое нужно сайту для входа.',
  audienceSignInUnsupported:
    'Этот браузер не может выполнить вход на этой странице.',
  audienceSignInFailed: 'Вход не завершён. Попробуйте ещё раз.',
  audienceSignInInvalid:
    'Эта ссылка для входа недействительна. Попробуйте ещё раз.',
  honeypotLabel: 'Оставьте это поле пустым',
  fieldRequiredMessage: 'Это поле обязательно.',
  fieldInvalidMessage: 'Проверьте это поле.',
  newsletterEmailLabel: 'Адрес электронной почты',
  newsletterCheckInbox: 'Проверьте почту, чтобы подтвердить подписку',
  newsletterFullMessage: 'Эта рассылка сейчас не принимает новых подписчиков.',
  newsletterEmailInvalid: 'Введите корректный адрес электронной почты.',
  contactLinkLabel: 'Контакты',
  contactPageTitle: 'Контакты',
  contactDefaultIntro:
    'Есть вопрос или что сказать? Напишите, и автор ответит по электронной почте.',
  contactNameLabel: 'Имя',
  contactEmailLabel: 'Эл. почта',
  contactMessageLabel: 'Сообщение',
  contactWebsiteLabel: 'Сайт (необязательно)',
  contactPhoneLabel: 'Телефон (необязательно)',
  contactSubmitLabel: 'Отправить сообщение',
  contactNoscript:
    'Для этой формы нужен JavaScript. Включите его, чтобы отправить сообщение.',
  contactSent: 'Спасибо, ваше сообщение отправлено.',
  contactUnavailable: 'Эта форма сейчас не принимает сообщения.',
  contactRateLimited: 'Слишком много сообщений отсюда. Повторите позже.',
  contactMessageLinks: 'В сообщении может быть не более двух ссылок.',
  tagListLabel: 'Теги',
  tagKickerLabel: 'Тег',
  seriesKickerLabel: 'Серия',
  archiveKickerLabel: 'Архив',
  authorKickerLabel: 'Автор',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`Статей: ${count}`}`,
  emptyListingLabel: 'Статей пока нет.',
  editionsNavigationLabel: 'Версии',
  editionOriginalLabel: 'Оригинал',
  editionQuickReadLabel: 'Кратко',
  editionStandardLabel: 'Стандартная',
  editionDeepDiveLabel: 'Подробно',
  editionNoticeLabel:
    'Сгенерированная версия, проверена автором; первоисточник — оригинал',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'О проекте',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Обновлено: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Записи с тегом «${tag}»`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `Статьи с тегом ${tag} на ${publication}. ${`Статей: ${count}`}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}: серия на ${publication}. ${`Частей: ${count}`}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Архив ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `Статьи за ${year} год на ${publication}. ${`Статей: ${count}`}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Статьи автора ${name} на ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Темы, о которых пишут на ${publication}. ${`Тем: ${count}`}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Серии на ${publication}. Всего: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Все статьи на ${publication} по годам. Всего: ${count}.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Все статьи на ${publication}, сначала новые.`,
  exploreColumnLabel: 'Разделы',
  rssFeedLabel: 'RSS-лента',
  languageKickerLabel: 'Язык',
  languageSwitcherLabel: 'Языки',
  languageChipsLabel: 'Доступные языки',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `Статьи на языке «${language}» на ${publication}. ${`Статей: ${count}`}.`,
  postRemovedHeading: 'Эта запись удалена',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Она была удалена ${date}.`,
  postRemovedHomeLabel: 'На главную',
  versionPageHeading: 'Версия сайта',
  versionTemplateLabel: 'Шаблон',
  versionThemeLabel: 'Тема',
  versionSchemasLabel: 'Схемы',
  versionToolchainLabel: 'Инструменты публикации',
  versionCommitLabel: 'Исходный коммит',
  versionBuiltAtLabel: 'Собрано',
  listenNavLabel: 'Слушать',
  listenNavCurrentLabel: 'Слушать эту статью',
  listenInviteTitle: 'Заняты руки? Лучше послушайте.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Эта статья есть и в виде беседы на ${minutes} мин. Удобно в дороге, на тренировке или за мытьём посуды.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Эта статья есть и в виде озвучки на ${minutes} мин. Удобно в дороге, на тренировке или за мытьём посуды.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Эта статья есть и в виде спора на ${minutes} мин. Удобно в дороге, на тренировке или за мытьём посуды.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Эта статья есть и в виде скетча на ${minutes} мин. Удобно в дороге, на тренировке или за мытьём посуды.`,
  listenInvitePlayLabel: 'Включить',
  listenInviteDeclineLabel: 'Нет, спасибо',
  listenInviteNote: 'Голоса ИИ, адаптация этой статьи.',
  listenInviteCloseLabel: 'Закрыть пока',
  listenPlayerRegionLabel: 'Аудиоплеер',
  listenPlayerNowPlayingLabel: 'Сейчас играет',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} из ${count}`,
  listenPlayerPlayLabel: 'Воспроизвести',
  listenPlayerPauseLabel: 'Пауза',
  listenPlayerBackLabel: 'Назад на 15 секунд',
  listenPlayerPreviousLabel: 'Предыдущий выпуск',
  listenPlayerNextLabel: 'Следующий выпуск',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Скорость воспроизведения ${rate}×`,
  listenPlayerSeekLabel: 'Позиция',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} из ${total}`,
  listenPlayerCloseLabel: 'Остановить и закрыть',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Играет: ${title}`,
  listenListHeading: 'Слушать этот блог',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `Выпусков: ${count} · ${duration}`,
  listenListPlayAllLabel: 'Слушать всё',
  listenListShuffleLabel: 'Перемешать',
  listenListOrderLabel: 'Порядок',
  listenListNewestLabel: 'Сначала новые',
  listenListOldestLabel: 'Сначала старые',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Показать все (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Воспроизвести: ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} мин`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} ч ${minutes} мин`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('ru', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
