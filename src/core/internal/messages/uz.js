/**
 * Chrome message catalog for the `uz` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Asosiy mazmunga o‘tish',
  homeLinkLabel: 'Bosh sahifa',
  primaryNavigationLabel: 'Asosiy',
  footerNavigationLabel: 'Quyi qism',
  breadcrumbNavigationLabel: 'Navigatsiya yo‘li',
  paginationNavigationLabel: 'Sahifalar',
  previousPageLabel: 'Oldingi',
  nextPageLabel: 'Keyingi',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `${current} / ${total}-sahifa`,
  authorsSectionLabel: 'Mualliflar',
  tagsSectionLabel: 'Teglar',
  seriesSectionLabel: 'Turkum',
  archiveSectionLabel: 'Arxiv',
  indexHeading: 'Barcha maqolalar',
  authorsIndexLabel: 'Mualliflar',
  tagIndexLabelPrefix: 'Teg:',
  seriesIndexLabelPrefix: 'Turkum:',
  archiveYearLabelPrefix: 'Arxiv:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName} haqida`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Muallif: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, yangi yorliqda ochiladi',
  footerLegalLabel: 'Huquqiy',
  termsLinkLabel: 'Shartlar',
  privacyLinkLabel: 'Maxfiylik',
  consentRegionLabel: 'Maxfiylik sozlamalari',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Bu sayt o‘quvchilar auditoriyasini tushunish uchun ${providerName} xizmatidan foydalanmoqchi. Siz rozilik bermaguningizcha hech narsa yuklanmaydi, tanlovingizni istalgan payt quyi qismdan o‘zgartirishingiz mumkin.`,
  consentAcceptLabel: 'Analitikaga rozilik',
  consentDeclineLabel: 'Rad etish',
  consentOpenLabel: 'Maxfiylik sozlamalari',
  errorPageHeading: 'Sahifa topilmadi',
  errorPageBody:
    'Siz izlagan sahifa topilmadi. U ko‘chirilgan, nomi o‘zgartirilgan yoki o‘chirilgan bo‘lishi mumkin.',
  errorPageReturnHomeLabel: 'Bosh sahifaga qaytish',
  appearanceControlLabel: 'Ko‘rinish',
  appearanceModeLightLabel: 'Yorug‘',
  appearanceModeDarkLabel: 'Qorong‘i',
  appearanceModeSystemLabel: 'Tizim',
  searchButtonLabel: 'Qidirish',
  searchButtonAriaLabel: 'Maqolalarni qidirish',
  searchPlaceholderLabel: 'Nashrdan qidirish',
  searchEmptyLabel: 'Qidiruvingizga mos maqola topilmadi.',
  searchUnavailableLabel: 'Qidiruv hozir ishlamayapti.',
  copyCodeLabel: 'Nusxalash',
  copiedLabel: 'Nusxalandi',
  linkCopiedLabel: 'Havola nusxalandi.',
  copyBlockedLabel:
    'Bu yerda nusxalash taqiqlangan. Manzilni brauzerdan nusxalang.',
  codeSelectedLabel:
    'Kod belgilandi. Nusxalash uchun Ctrl C yoki Command C bosing.',
  savedLabel: 'Keyinroq o‘qish uchun saqlandi.',
  unsavedLabel: 'Saqlangan maqolalardan olib tashlandi.',
  menuSummaryLabel: 'Menyu',
  featuredLabel: 'Tanlangan',
  readEssayLabel: 'Esseni o‘qish',
  latestHeading: 'Eng so‘nggi',
  moreArticlesHeading: 'Yana maqolalar',
  browseByTagLabel: 'Teglar bo‘yicha ko‘rish',
  seriesCardLabel: 'Turkum',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} qism`,
  startSeriesLabel: '1-qismdan boshlash',
  newsletterLabel: 'Axborot xati',
  newsletterActionLabel: 'Obuna bo‘lish',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} daqiqalik o‘qish`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `${part}-qism, jami ${total}`,
  onThisPageLabel: 'Shu sahifada',
  writtenByLabel: 'Muallif',
  aboutTheAuthorLabel: 'Muallif haqida',
  youAreHereLabel: 'Siz shu yerdasiz',
  newerArticleLabel: 'Yangiroq',
  olderArticleLabel: 'Eskiroq',
  moreArticlesNavigationLabel: 'Yana maqolalar',
  keepReadingHeading: 'O‘qishda davom eting',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `${tag} bo‘yicha yana`,
  interactionsHeading: 'Fikrlar',
  reactionsGroupLabel: 'Reaksiyalar',
  likeLabel: 'Yoqdi',
  commentsHeading: 'Muhokama',
  interactionsNeedScriptNotice: 'Reaksiya va izohlar uchun JavaScript kerak.',
  showMoreCommentsLabel: 'Yana izohlarni ko‘rsatish',
  shareLabel: 'Ulashish',
  copyLinkLabel: 'Maqola havolasini nusxalash',
  saveForLaterLabel: 'Keyinroq o‘qish uchun saqlash',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `${network} orqali ulashish`,
  shareByEmailLabel: 'E-pochta orqali ulashish',
  shareNativeLabel: 'Bu maqolani ulashish',
  followLabel: 'Kuzatish',
  followingLabel: 'Kuzatilmoqda',
  unfollowLabel: 'Kuzatmaslik',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name} muallifini kuzatish`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name} muallifini kuzatmaslik`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Endi siz ${name} muallifini kuzatyapsiz.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) =>
    `Endi siz ${name} muallifini kuzatmayapsiz.`,
  followDisabledMessage: 'Kuzatish bu saytda hozir mavjud emas.',
  followAuthorMissingMessage: 'Bu muallifni hozir kuzatib bo‘lmaydi.',
  audienceNetworkError:
    'Galascribe bilan aloqa o‘rnatilmadi. Qayta urinib ko‘ring.',
  audienceRateLimited:
    'Urinishlar juda ko‘p. Birozdan so‘ng qayta urinib ko‘ring.',
  audienceGenericError: 'Nimadir xato ketdi. Qayta urinib ko‘ring.',
  audienceStorageBlocked:
    'Brauzeringiz saytga kirish uchun kerak bo‘lgan xotirani bloklab qo‘ydi.',
  audienceSignInUnsupported:
    'Bu brauzer orqali ushbu sahifada tizimga kirib bo‘lmaydi.',
  audienceSignInFailed: 'Tizimga kirish yakunlanmadi. Qayta urinib ko‘ring.',
  audienceSignInInvalid: 'Kirish havolasi yaroqsiz edi. Qayta urinib ko‘ring.',
  honeypotLabel: 'Bu maydonni bo‘sh qoldiring',
  fieldRequiredMessage: 'Bu maydon to‘ldirilishi shart.',
  fieldInvalidMessage: 'Bu maydonni tekshiring.',
  newsletterEmailLabel: 'E-pochta manzili',
  newsletterCheckInbox: 'Tasdiqlash uchun pochtangizni tekshiring',
  newsletterFullMessage:
    'Bu axborot xati hozir yangi obunachilarni qabul qilmayapti.',
  newsletterEmailInvalid: 'To‘g‘ri e-pochta manzilini kiriting.',
  contactLinkLabel: 'Aloqa',
  contactPageTitle: 'Aloqa',
  contactDefaultIntro:
    'Savolingiz yoki aytadigan gapingiz bormi? Xabar yuboring, muallif e-pochta orqali javob beradi.',
  contactNameLabel: 'Ism',
  contactEmailLabel: 'E-pochta',
  contactMessageLabel: 'Xabar',
  contactWebsiteLabel: 'Veb-sayt (ixtiyoriy)',
  contactPhoneLabel: 'Telefon (ixtiyoriy)',
  contactSubmitLabel: 'Xabar yuborish',
  contactNoscript:
    'Bu shakl uchun JavaScript kerak. Xabar yuborish uchun uni yoqing.',
  contactSent: 'Rahmat, xabaringiz yuborildi.',
  contactUnavailable: 'Bu shakl hozir xabar qabul qilmayapti.',
  contactRateLimited:
    'Bu yerdan juda ko‘p xabar yuborildi. Keyinroq qayta urinib ko‘ring.',
  contactMessageLinks:
    'Xabaringizda ko‘pi bilan ikkita havola bo‘lishi mumkin.',
  tagListLabel: 'Teglar',
  tagKickerLabel: 'Teg',
  seriesKickerLabel: 'Turkum',
  archiveKickerLabel: 'Arxiv',
  authorKickerLabel: 'Muallif',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} ta maqola`,
  emptyListingLabel: 'Hozircha maqola yo‘q.',
  editionsNavigationLabel: 'Tahrirlar',
  editionOriginalLabel: 'Asl nusxa',
  editionQuickReadLabel: 'Qisqa o‘qish',
  editionStandardLabel: 'Standart',
  editionDeepDiveLabel: 'Chuqur o‘qish',
  editionNoticeLabel:
    'Yaratilgan tahrir, muallif tekshirgan; asl nusxa asosiy hisoblanadi',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Haqida',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Yangilangan: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `“${tag}” tegi bilan maqolalar`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication} saytida ${tag} tegi bilan ${count} ta maqola.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, ${publication} saytidagi ${count} qismli turkum.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arxiv ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication} saytida ${year}-yilda chop etilgan ${count} ta maqola.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${name} yozgan maqolalar, ${publication} saytida.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `${publication} saytida yoritilgan ${count} ta mavzuni ko‘ring.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `${publication} saytida chop etilgan ${count} ta turkumni ko‘ring.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication} saytidagi barcha maqolalar, jami ${count} ta, yillar bo‘yicha.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `${publication} saytidagi barcha maqolalar, yangilari birinchi.`,
  exploreColumnLabel: 'Ko‘rib chiqish',
  rssFeedLabel: 'RSS tasmasi',
  languageKickerLabel: 'Til',
  languageSwitcherLabel: 'Tillar',
  languageChipsLabel: 'Mavjud tillar',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication} saytida ${language} tilida ${count} ta maqola.`,
  postRemovedHeading: 'Bu yozuv o‘chirilgan',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `U ${date} sanasida o‘chirilgan.`,
  postRemovedHomeLabel: 'Bosh sahifaga o‘tish',
  versionPageHeading: 'Sayt versiyasi',
  versionTemplateLabel: 'Andoza',
  versionThemeLabel: 'Mavzu',
  versionSchemasLabel: 'Sxemalar',
  versionToolchainLabel: 'Nashr vositalari',
  versionCommitLabel: 'Manba commit',
  versionBuiltAtLabel: 'Yig‘ilgan vaqt',
  listenNavLabel: 'Tinglash',
  listenNavCurrentLabel: 'Bu maqolani tinglash',
  listenInviteTitle: 'Qo‘llaringiz band? Tinglang.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Bu maqola ${minutes} daqiqalik suhbat sifatida ham mavjud. Yo‘lda, mashq paytida yoki idish yuvayotganda qulay.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Bu maqola ${minutes} daqiqalik hikoya sifatida ham mavjud. Yo‘lda, mashq paytida yoki idish yuvayotganda qulay.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Bu maqola ${minutes} daqiqalik munozara sifatida ham mavjud. Yo‘lda, mashq paytida yoki idish yuvayotganda qulay.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Bu maqola ${minutes} daqiqalik skeç sifatida ham mavjud. Yo‘lda, mashq paytida yoki idish yuvayotganda qulay.`,
  listenInvitePlayLabel: 'Ijro etish',
  listenInviteDeclineLabel: 'Yo‘q, rahmat',
  listenInviteNote:
    'Sun’iy intellekt ovozlari, ushbu maqola asosida moslashtirilgan.',
  listenInviteCloseLabel: 'Hozircha yopish',
  listenPlayerRegionLabel: 'Audio pleyer',
  listenPlayerNowPlayingLabel: 'Hozir ijro etilmoqda',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} / ${count}`,
  listenPlayerPlayLabel: 'Ijro etish',
  listenPlayerPauseLabel: 'To‘xtatib turish',
  listenPlayerBackLabel: '15 soniya orqaga',
  listenPlayerPreviousLabel: 'Oldingi epizod',
  listenPlayerNextLabel: 'Keyingi epizod',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Ijro tezligi ${rate}×`,
  listenPlayerSeekLabel: 'Joylashuv',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} / ${total}`,
  listenPlayerCloseLabel: 'To‘xtatish va yopish',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Ijro etilmoqda: ${title}`,
  listenListHeading: 'Bu blogni tinglash',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count} ta epizod · ${duration}`,
  listenListPlayAllLabel: 'Hammasini ijro etish',
  listenListShuffleLabel: 'Aralashtirish',
  listenListOrderLabel: 'Tartib',
  listenListNewestLabel: 'Avval yangilari',
  listenListOldestLabel: 'Avval eskilari',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Hammasini ko‘rsatish (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `${title} ni ijro etish`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} daq`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) =>
    `${hours} soat ${minutes} daq`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('uz', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
