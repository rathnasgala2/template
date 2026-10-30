/**
 * Chrome message catalog for the `fa` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'رفتن به محتوا',
  homeLinkLabel: 'خانه',
  primaryNavigationLabel: 'اصلی',
  footerNavigationLabel: 'پایین صفحه',
  breadcrumbNavigationLabel: 'مسیر صفحه',
  paginationNavigationLabel: 'صفحه‌بندی',
  previousPageLabel: 'قبلی',
  nextPageLabel: 'بعدی',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `صفحهٔ ${current} از ${total}`,
  authorsSectionLabel: 'نویسندگان',
  tagsSectionLabel: 'برچسب‌ها',
  seriesSectionLabel: 'مجموعه‌ها',
  archiveSectionLabel: 'بایگانی',
  indexHeading: 'همهٔ مقاله‌ها',
  authorsIndexLabel: 'نویسندگان',
  tagIndexLabelPrefix: 'برچسب:',
  seriesIndexLabelPrefix: 'مجموعه:',
  archiveYearLabelPrefix: 'بایگانی:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `دربارهٔ ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `نوشتهٔ ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe، در زبانهٔ جدید باز می‌شود',
  footerLegalLabel: 'حقوقی',
  termsLinkLabel: 'شرایط',
  privacyLinkLabel: 'حریم خصوصی',
  consentRegionLabel: 'گزینه‌های حریم خصوصی',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `این سایت می‌خواهد برای شناخت خوانندگانش از ${providerName} استفاده کند. تا زمانی که نپذیرید چیزی بارگذاری نمی‌شود و هر زمان می‌توانید انتخابتان را از پایین صفحه تغییر دهید.`,
  consentAcceptLabel: 'پذیرش تحلیل',
  consentDeclineLabel: 'رد کردن',
  consentOpenLabel: 'گزینه‌های حریم خصوصی',
  errorPageHeading: 'صفحه پیدا نشد',
  errorPageBody:
    'صفحه‌ای که دنبالش بودید پیدا نشد. ممکن است جابه‌جا، تغییر نام یا حذف شده باشد.',
  errorPageReturnHomeLabel: 'بازگشت به صفحهٔ اصلی',
  appearanceControlLabel: 'ظاهر',
  appearanceModeLightLabel: 'روشن',
  appearanceModeDarkLabel: 'تیره',
  appearanceModeSystemLabel: 'سیستم',
  searchButtonLabel: 'جستجو',
  searchButtonAriaLabel: 'جستجوی مقاله‌ها',
  searchPlaceholderLabel: 'جستجو در نشریه',
  searchEmptyLabel: 'مقاله‌ای مطابق جستجوی شما نیست.',
  searchUnavailableLabel: 'جستجو اکنون در دسترس نیست.',
  copyCodeLabel: 'کپی',
  copiedLabel: 'کپی شد',
  linkCopiedLabel: 'پیوند کپی شد.',
  copyBlockedLabel: 'کپی در اینجا مسدود است. نشانی را از مرورگر کپی کنید.',
  codeSelectedLabel: 'کد انتخاب شد. برای کپی Ctrl C یا Command C را بزنید.',
  savedLabel: 'برای بعد ذخیره شد.',
  unsavedLabel: 'از مقاله‌های ذخیره‌شده حذف شد.',
  menuSummaryLabel: 'منو',
  featuredLabel: 'ویژه',
  readEssayLabel: 'خواندن مقاله',
  latestHeading: 'تازه‌ترین',
  moreArticlesHeading: 'مقاله‌های بیشتر',
  browseByTagLabel: 'مرور بر اساس برچسب',
  seriesCardLabel: 'مجموعه',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`${count} بخش`}`,
  startSeriesLabel: 'شروع از بخش ۱',
  newsletterLabel: 'خبرنامه',
  newsletterActionLabel: 'اشتراک',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} دقیقه مطالعه`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `بخش ${part} از ${total}`,
  onThisPageLabel: 'در این صفحه',
  writtenByLabel: 'نویسنده',
  aboutTheAuthorLabel: 'دربارهٔ نویسنده',
  youAreHereLabel: 'شما اینجایید',
  newerArticleLabel: 'جدیدتر',
  olderArticleLabel: 'قدیمی‌تر',
  moreArticlesNavigationLabel: 'مقاله‌های بیشتر',
  keepReadingHeading: 'ادامهٔ مطالعه',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `بیشتر در ${tag}`,
  interactionsHeading: 'واکنش‌ها',
  reactionsGroupLabel: 'واکنش‌ها',
  likeLabel: 'پسندیدن',
  commentsHeading: 'گفتگو',
  interactionsNeedScriptNotice:
    'واکنش‌ها و دیدگاه‌ها به جاوااسکریپت (JavaScript) نیاز دارند.',
  showMoreCommentsLabel: 'نمایش دیدگاه‌های بیشتر',
  shareLabel: 'اشتراک‌گذاری',
  copyLinkLabel: 'کپی پیوند این مقاله',
  saveForLaterLabel: 'ذخیره برای بعد',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `اشتراک‌گذاری در ${network}`,
  shareByEmailLabel: 'اشتراک‌گذاری با ایمیل',
  shareNativeLabel: 'اشتراک‌گذاری این مقاله',
  followLabel: 'دنبال کردن',
  followingLabel: 'دنبال می‌کنید',
  unfollowLabel: 'لغو دنبال کردن',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `دنبال کردن ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `لغو دنبال کردن ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `اکنون ${name} را دنبال می‌کنید.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `دیگر ${name} را دنبال نمی‌کنید.`,
  followDisabledMessage: 'دنبال کردن اکنون در این سایت در دسترس نیست.',
  followAuthorMissingMessage: 'این نویسنده را اکنون نمی‌توان دنبال کرد.',
  audienceNetworkError: 'اتصال به Galascribe برقرار نشد. دوباره تلاش کنید.',
  audienceRateLimited: 'تلاش‌های بیش از حد. کمی بعد دوباره تلاش کنید.',
  audienceGenericError: 'مشکلی پیش آمد. دوباره تلاش کنید.',
  audienceStorageBlocked:
    'مرورگر شما فضای ذخیره‌سازی موردنیاز این سایت برای ورود را مسدود کرد.',
  audienceSignInUnsupported:
    'این مرورگر نمی‌تواند در این صفحه شما را وارد کند.',
  audienceSignInFailed: 'ورود کامل نشد. دوباره تلاش کنید.',
  audienceSignInInvalid: 'آن پیوند ورود معتبر نبود. دوباره تلاش کنید.',
  honeypotLabel: 'این بخش را خالی بگذارید',
  fieldRequiredMessage: 'این بخش الزامی است.',
  fieldInvalidMessage: 'این بخش را بررسی کنید.',
  newsletterEmailLabel: 'نشانی ایمیل',
  newsletterCheckInbox: 'برای تأیید، صندوق ورودی خود را بررسی کنید',
  newsletterFullMessage: 'این خبرنامه اکنون مشترک جدید نمی‌پذیرد.',
  newsletterEmailInvalid: 'یک نشانی ایمیل معتبر وارد کنید.',
  contactLinkLabel: 'تماس',
  contactPageTitle: 'تماس',
  contactDefaultIntro:
    'پرسشی دارید یا چیزی برای گفتن؟ پیامی بفرستید و نویسنده با ایمیل پاسخ می‌دهد.',
  contactNameLabel: 'نام',
  contactEmailLabel: 'ایمیل',
  contactMessageLabel: 'پیام',
  contactWebsiteLabel: 'وب‌سایت (اختیاری)',
  contactPhoneLabel: 'تلفن (اختیاری)',
  contactSubmitLabel: 'ارسال پیام',
  contactNoscript:
    'این فرم به جاوااسکریپت (JavaScript) نیاز دارد. برای ارسال پیام آن را روشن کنید.',
  contactSent: 'سپاس، پیام شما ارسال شد.',
  contactUnavailable: 'این فرم اکنون پیام نمی‌پذیرد.',
  contactRateLimited: 'پیام‌های بیش از حد از اینجا. بعداً دوباره تلاش کنید.',
  contactMessageLinks: 'پیام شما حداکثر می‌تواند دو پیوند داشته باشد.',
  tagListLabel: 'برچسب‌ها',
  tagKickerLabel: 'برچسب',
  seriesKickerLabel: 'مجموعه',
  archiveKickerLabel: 'بایگانی',
  authorKickerLabel: 'نویسنده',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`${count} مقاله`}`,
  emptyListingLabel: 'هنوز مقاله‌ای نیست.',
  editionsNavigationLabel: 'نسخه‌ها',
  editionOriginalLabel: 'اصلی',
  editionQuickReadLabel: 'خواندن سریع',
  editionStandardLabel: 'استاندارد',
  editionDeepDiveLabel: 'تفصیلی',
  editionNoticeLabel:
    'نسخهٔ تولیدشده و بازبینی‌شده توسط نویسنده؛ مرجع، نسخهٔ اصلی است',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'دربارهٔ ما',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `به‌روزرسانی: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `نوشته‌های دارای برچسب «${tag}»`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${`${count} مقاله`} با برچسب ${tag} در ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}، مجموعه‌ای با ${`${count} بخش`} در ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `بایگانی ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${`${count} مقاله`} منتشرشده در ${year} در ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `مقاله‌های ${name} در ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `${`${count} موضوع`} را که در ${publication} پوشش داده شده‌اند مرور کنید.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `${count} مجموعهٔ منتشرشده در ${publication} را مرور کنید.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `همهٔ مقاله‌های ${publication}، در مجموع ${count}، به تفکیک سال.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `همهٔ مقاله‌های ${publication}، از تازه‌ترین.`,
  exploreColumnLabel: 'کاوش',
  rssFeedLabel: 'خوراک RSS',
  languageKickerLabel: 'زبان',
  languageSwitcherLabel: 'زبان‌ها',
  languageChipsLabel: 'زبان‌های موجود',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${`${count} مقاله`} به زبان ${language} در ${publication}.`,
  postRemovedHeading: 'این نوشته حذف شده است',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `در ${date} حذف شد.`,
  postRemovedHomeLabel: 'رفتن به صفحهٔ اصلی',
  versionPageHeading: 'نسخهٔ سایت',
  versionTemplateLabel: 'قالب',
  versionThemeLabel: 'پوسته',
  versionSchemasLabel: 'شِماها',
  versionToolchainLabel: 'زنجیرهٔ ابزار انتشار',
  versionCommitLabel: 'کامیت منبع',
  versionBuiltAtLabel: 'زمان ساخت',
  listenNavLabel: 'گوش دادن',
  listenNavCurrentLabel: 'گوش دادن به این نوشته',
  listenInviteTitle: 'دست‌هایتان مشغول است؟ گوش دهید.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `این نوشته به‌صورت گفت‌وگوی ${minutes} دقیقه‌ای هم در دسترس است. مناسب رانندگی، ورزش یا شستن ظرف‌ها.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `این نوشته به‌صورت روایت ${minutes} دقیقه‌ای هم در دسترس است. مناسب رانندگی، ورزش یا شستن ظرف‌ها.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `این نوشته به‌صورت مناظره ${minutes} دقیقه‌ای هم در دسترس است. مناسب رانندگی، ورزش یا شستن ظرف‌ها.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `این نوشته به‌صورت نمایش کوتاه ${minutes} دقیقه‌ای هم در دسترس است. مناسب رانندگی، ورزش یا شستن ظرف‌ها.`,
  listenInvitePlayLabel: 'پخش',
  listenInviteDeclineLabel: 'نه، ممنون',
  listenInviteNote: 'صداهای هوش مصنوعی، اقتباس از این نوشته.',
  listenInviteCloseLabel: 'فعلاً ببند',
  listenPlayerRegionLabel: 'پخش‌کننده صدا',
  listenPlayerNowPlayingLabel: 'در حال پخش',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} از ${count}`,
  listenPlayerPlayLabel: 'پخش',
  listenPlayerPauseLabel: 'توقف موقت',
  listenPlayerBackLabel: '15 ثانیه به عقب',
  listenPlayerPreviousLabel: 'قسمت قبلی',
  listenPlayerNextLabel: 'قسمت بعدی',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `سرعت پخش ${rate}×`,
  listenPlayerSeekLabel: 'موقعیت',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} از ${total}`,
  listenPlayerCloseLabel: 'توقف و بستن',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `در حال پخش: ${title}`,
  listenListHeading: 'گوش دادن به این وبلاگ',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count} قسمت · ${duration}`,
  listenListPlayAllLabel: 'پخش همه',
  listenListShuffleLabel: 'تصادفی',
  listenListOrderLabel: 'ترتیب',
  listenListNewestLabel: 'جدیدترین‌ها اول',
  listenListOldestLabel: 'قدیمی‌ترین‌ها اول',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `نمایش همه (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `پخش ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} دقیقه`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) =>
    `${hours} ساعت و ${minutes} دقیقه`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('fa', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
