/**
 * Chrome message catalog for the `ar` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'انتقل إلى المحتوى',
  homeLinkLabel: 'الرئيسية',
  primaryNavigationLabel: 'الرئيسية',
  footerNavigationLabel: 'التذييل',
  breadcrumbNavigationLabel: 'مسار التنقل',
  paginationNavigationLabel: 'ترقيم الصفحات',
  previousPageLabel: 'السابق',
  nextPageLabel: 'التالي',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `الصفحة ${current} من ${total}`,
  authorsSectionLabel: 'الكتّاب',
  tagsSectionLabel: 'الوسوم',
  seriesSectionLabel: 'السلاسل',
  archiveSectionLabel: 'الأرشيف',
  indexHeading: 'جميع المقالات',
  authorsIndexLabel: 'الكتّاب',
  tagIndexLabelPrefix: 'الوسم:',
  seriesIndexLabelPrefix: 'السلسلة:',
  archiveYearLabelPrefix: 'الأرشيف:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `عن ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `بقلم ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe، يفتح في علامة تبويب جديدة',
  footerLegalLabel: 'قانوني',
  termsLinkLabel: 'الشروط',
  privacyLinkLabel: 'الخصوصية',
  consentRegionLabel: 'خيارات الخصوصية',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `يودّ هذا الموقع استخدام ${providerName} لفهم قرّائه. لا يتم تحميل أي شيء حتى توافق، ويمكنك تغيير اختيارك في أي وقت من التذييل.`,
  consentAcceptLabel: 'قبول التحليلات',
  consentDeclineLabel: 'رفض',
  consentOpenLabel: 'خيارات الخصوصية',
  errorPageHeading: 'الصفحة غير موجودة',
  errorPageBody:
    'تعذّر العثور على الصفحة التي تبحث عنها. ربما نُقلت أو أُعيدت تسميتها أو حُذفت.',
  errorPageReturnHomeLabel: 'العودة إلى الصفحة الرئيسية',
  appearanceControlLabel: 'المظهر',
  appearanceModeLightLabel: 'فاتح',
  appearanceModeDarkLabel: 'داكن',
  appearanceModeSystemLabel: 'النظام',
  searchButtonLabel: 'بحث',
  searchButtonAriaLabel: 'البحث في المقالات',
  searchPlaceholderLabel: 'ابحث في المنشور',
  searchEmptyLabel: 'لا توجد مقالات تطابق بحثك.',
  searchUnavailableLabel: 'البحث غير متاح حاليًا.',
  copyCodeLabel: 'نسخ',
  copiedLabel: 'تم النسخ',
  linkCopiedLabel: 'تم نسخ الرابط.',
  copyBlockedLabel: 'النسخ محظور هنا. انسخ العنوان من المتصفح.',
  codeSelectedLabel: 'تم تحديد الشيفرة. اضغط Ctrl C أو Command C للنسخ.',
  savedLabel: 'تم الحفظ للقراءة لاحقًا.',
  unsavedLabel: 'تمت الإزالة من المقالات المحفوظة.',
  menuSummaryLabel: 'القائمة',
  featuredLabel: 'مميّز',
  readEssayLabel: 'اقرأ المقال',
  latestHeading: 'الأحدث',
  moreArticlesHeading: 'المزيد من المقالات',
  browseByTagLabel: 'تصفّح حسب الوسم',
  seriesCardLabel: 'سلسلة',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`عدد الأجزاء: ${count}`}`,
  startSeriesLabel: 'ابدأ من الجزء 1',
  newsletterLabel: 'النشرة البريدية',
  newsletterActionLabel: 'اشترك',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `القراءة ${minutes} دقيقة`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `الجزء ${part} من ${total}`,
  onThisPageLabel: 'في هذه الصفحة',
  writtenByLabel: 'بقلم',
  aboutTheAuthorLabel: 'عن الكاتب',
  youAreHereLabel: 'أنت هنا',
  newerArticleLabel: 'أحدث',
  olderArticleLabel: 'أقدم',
  moreArticlesNavigationLabel: 'المزيد من المقالات',
  keepReadingHeading: 'تابع القراءة',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `المزيد في ${tag}`,
  interactionsHeading: 'التفاعلات',
  reactionsGroupLabel: 'ردود الفعل',
  likeLabel: 'إعجاب',
  commentsHeading: 'النقاش',
  interactionsNeedScriptNotice: 'تحتاج ردود الفعل والتعليقات إلى JavaScript.',
  showMoreCommentsLabel: 'عرض المزيد من التعليقات',
  shareLabel: 'مشاركة',
  copyLinkLabel: 'نسخ رابط هذه المقالة',
  saveForLaterLabel: 'حفظ لوقت لاحق',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `مشاركة على ${network}`,
  shareByEmailLabel: 'مشاركة بالبريد الإلكتروني',
  shareNativeLabel: 'مشاركة هذه المقالة',
  followLabel: 'متابعة',
  followingLabel: 'تتابعه',
  unfollowLabel: 'إلغاء المتابعة',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `متابعة ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `إلغاء متابعة ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `أصبحت تتابع ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `لم تعد تتابع ${name}.`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `المتابعون: ${count}`,
  followersTeamHint: 'يراه فريق موقعك فقط',
  followDisabledMessage: 'المتابعة غير متاحة في هذا الموقع حاليًا.',
  followAuthorMissingMessage: 'لا يمكن متابعة هذا الكاتب حاليًا.',
  audienceNetworkError: 'تعذّر الاتصال بـ Galascribe. حاول مرة أخرى.',
  audienceRateLimited: 'محاولات كثيرة جدًا. حاول مجددًا بعد قليل.',
  audienceGenericError: 'حدث خطأ ما. حاول مرة أخرى.',
  audienceStorageBlocked:
    'حظر متصفحك مساحة التخزين التي يحتاجها هذا الموقع لتسجيل دخولك.',
  audienceSignInUnsupported: 'لا يستطيع هذا المتصفح تسجيل دخولك في هذه الصفحة.',
  audienceSignInFailed: 'لم يكتمل تسجيل الدخول. حاول مرة أخرى.',
  audienceSignInInvalid: 'رابط تسجيل الدخول هذا غير صالح. حاول مرة أخرى.',
  honeypotLabel: 'اترك هذا الحقل فارغًا',
  fieldRequiredMessage: 'هذا الحقل مطلوب.',
  fieldInvalidMessage: 'تحقق من هذا الحقل.',
  newsletterEmailLabel: 'عنوان البريد الإلكتروني',
  newsletterCheckInbox: 'تحقق من بريدك الوارد للتأكيد',
  newsletterFullMessage: 'لا تقبل هذه النشرة مشتركين جددًا حاليًا.',
  newsletterEmailInvalid: 'أدخل عنوان بريد إلكتروني صالحًا.',
  contactLinkLabel: 'اتصل بنا',
  contactPageTitle: 'اتصل بنا',
  contactDefaultIntro:
    'هل لديك سؤال أو شيء تقوله؟ أرسل رسالة وسيردّ الكاتب بالبريد الإلكتروني.',
  contactNameLabel: 'الاسم',
  contactEmailLabel: 'البريد الإلكتروني',
  contactMessageLabel: 'الرسالة',
  contactWebsiteLabel: 'الموقع (اختياري)',
  contactPhoneLabel: 'الهاتف (اختياري)',
  contactSubmitLabel: 'إرسال الرسالة',
  contactNoscript: 'يحتاج هذا النموذج إلى JavaScript. فعّله لإرسال رسالة.',
  contactSent: 'شكرًا، تم إرسال رسالتك.',
  contactUnavailable: 'لا يقبل هذا النموذج رسائل حاليًا.',
  contactRateLimited: 'رسائل كثيرة جدًا من هنا. حاول لاحقًا.',
  contactMessageLinks: 'يمكن أن تتضمن رسالتك رابطين على الأكثر.',
  tagListLabel: 'الوسوم',
  tagKickerLabel: 'وسم',
  seriesKickerLabel: 'سلسلة',
  archiveKickerLabel: 'الأرشيف',
  authorKickerLabel: 'الكاتب',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`عدد المقالات: ${count}`}`,
  emptyListingLabel: 'لا توجد مقالات بعد.',
  editionsNavigationLabel: 'الإصدارات',
  editionOriginalLabel: 'الأصل',
  editionQuickReadLabel: 'قراءة سريعة',
  editionStandardLabel: 'قياسي',
  editionDeepDiveLabel: 'معمّق',
  editionNoticeLabel: 'إصدار مُولَّد راجعه الكاتب؛ المرجع هو النص الأصلي',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'حول',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `آخر تحديث: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `المنشورات الموسومة «${tag}»`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `مقالات بوسم ${tag} على ${publication}. ${`عدد المقالات: ${count}`}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}: سلسلة على ${publication}. ${`عدد الأجزاء: ${count}`}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `أرشيف ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `مقالات نُشرت عام ${year} على ${publication}. ${`عدد المقالات: ${count}`}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `مقالات بقلم ${name} على ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `تصفّح المواضيع على ${publication}. ${`عدد المواضيع: ${count}`}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `تصفّح السلاسل المنشورة على ${publication}. الإجمالي: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `جميع مقالات ${publication} حسب السنة. الإجمالي: ${count}.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `جميع مقالات ${publication}، الأحدث أولًا.`,
  exploreColumnLabel: 'استكشاف',
  rssFeedLabel: 'تغذية RSS',
  languageKickerLabel: 'اللغة',
  languageSwitcherLabel: 'اللغات',
  languageChipsLabel: 'اللغات المتاحة',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `مقالات باللغة ${language} على ${publication}. ${`عدد المقالات: ${count}`}.`,
  postRemovedHeading: 'تمت إزالة هذا المنشور',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `أُزيل بتاريخ ${date}.`,
  postRemovedHomeLabel: 'الانتقال إلى الصفحة الرئيسية',
  versionPageHeading: 'إصدار الموقع',
  versionTemplateLabel: 'القالب',
  versionThemeLabel: 'السمة',
  versionSchemasLabel: 'المخططات',
  versionToolchainLabel: 'أدوات النشر',
  versionCommitLabel: 'إيداع المصدر',
  versionBuiltAtLabel: 'وقت البناء',
  listenNavLabel: 'استمع',
  listenNavCurrentLabel: 'استمع إلى هذه المقالة',
  listenInviteTitle: 'يداك مشغولتان؟ استمع بدلًا من القراءة.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `هذه المقالة متاحة أيضًا كمحادثة مدتها ${minutes} دقيقة. مناسبة للقيادة أو التمرين أو غسل الأطباق.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `هذه المقالة متاحة أيضًا كسرد صوتي مدته ${minutes} دقيقة. مناسب للقيادة أو التمرين أو غسل الأطباق.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `هذه المقالة متاحة أيضًا كمناظرة مدتها ${minutes} دقيقة. مناسبة للقيادة أو التمرين أو غسل الأطباق.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `هذه المقالة متاحة أيضًا كمشهد تمثيلي مدته ${minutes} دقيقة. مناسب للقيادة أو التمرين أو غسل الأطباق.`,
  listenInvitePlayLabel: 'شغّله',
  listenInviteDeclineLabel: 'لا، شكرًا',
  listenInviteNote: 'أصوات بالذكاء الاصطناعي، مقتبسة من هذه المقالة.',
  listenInviteCloseLabel: 'إغلاق الآن',
  listenPlayerRegionLabel: 'مشغّل الصوت',
  listenPlayerNowPlayingLabel: 'قيد التشغيل',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} من ${count}`,
  listenPlayerPlayLabel: 'تشغيل',
  listenPlayerPauseLabel: 'إيقاف مؤقت',
  listenPlayerBackLabel: 'رجوع 15 ثانية',
  listenPlayerPreviousLabel: 'الحلقة السابقة',
  listenPlayerNextLabel: 'الحلقة التالية',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `سرعة التشغيل ${rate}×`,
  listenPlayerSeekLabel: 'الموضع',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} من ${total}`,
  listenPlayerCloseLabel: 'إيقاف وإغلاق',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `قيد التشغيل: ${title}`,
  listenListHeading: 'استمع إلى هذه المدونة',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `عدد الحلقات: ${count} · ${duration}`,
  listenListPlayAllLabel: 'تشغيل الكل',
  listenListShuffleLabel: 'عشوائي',
  listenListOrderLabel: 'الترتيب',
  listenListNewestLabel: 'الأحدث أولًا',
  listenListOldestLabel: 'الأقدم أولًا',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `عرض الكل (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `تشغيل ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} دقيقة`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) =>
    `${hours} ساعة و${minutes} دقيقة`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('ar', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
