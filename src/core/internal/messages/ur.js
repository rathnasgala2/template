/**
 * Chrome message catalog for the `ur` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'مواد پر جائیں',
  homeLinkLabel: 'ہوم',
  primaryNavigationLabel: 'مرکزی',
  footerNavigationLabel: 'فٹر',
  breadcrumbNavigationLabel: 'راستہ',
  paginationNavigationLabel: 'صفحات',
  previousPageLabel: 'پچھلا',
  nextPageLabel: 'اگلا',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `صفحہ ${current} از ${total}`,
  authorsSectionLabel: 'مصنفین',
  tagsSectionLabel: 'ٹیگز',
  seriesSectionLabel: 'سلسلہ',
  archiveSectionLabel: 'آرکائیو',
  indexHeading: 'تمام مضامین',
  authorsIndexLabel: 'مصنفین',
  tagIndexLabelPrefix: 'ٹیگ:',
  seriesIndexLabelPrefix: 'سلسلہ:',
  archiveYearLabelPrefix: 'آرکائیو:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName} کے بارے میں`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `از ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe، نئے ٹیب میں کھلے گا',
  footerLegalLabel: 'قانونی',
  termsLinkLabel: 'شرائط',
  privacyLinkLabel: 'رازداری',
  consentRegionLabel: 'رازداری کے انتخابات',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `یہ سائٹ قارئین کو سمجھنے کے لیے ${providerName} استعمال کرنا چاہتی ہے۔ آپ کے قبول کرنے تک کچھ لوڈ نہیں ہوگا، اور آپ اپنا انتخاب کسی بھی وقت فٹر سے بدل سکتے ہیں۔`,
  consentAcceptLabel: 'اینالٹکس قبول کریں',
  consentDeclineLabel: 'مسترد کریں',
  consentOpenLabel: 'رازداری کے انتخابات',
  errorPageHeading: 'صفحہ نہیں ملا',
  errorPageBody:
    'آپ جس صفحے کو تلاش کر رہے تھے وہ نہیں ملا۔ ہو سکتا ہے اسے منتقل کر دیا گیا ہو، اس کا نام بدل گیا ہو یا اسے ہٹا دیا گیا ہو۔',
  errorPageReturnHomeLabel: 'ہوم صفحے پر واپس جائیں',
  appearanceControlLabel: 'ظاہری شکل',
  appearanceModeLightLabel: 'روشن',
  appearanceModeDarkLabel: 'گہرا',
  appearanceModeSystemLabel: 'سسٹم',
  searchButtonLabel: 'تلاش کریں',
  searchButtonAriaLabel: 'مضامین تلاش کریں',
  searchPlaceholderLabel: 'اشاعت میں تلاش کریں',
  searchEmptyLabel: 'آپ کی تلاش سے کوئی مضمون مماثل نہیں۔',
  searchUnavailableLabel: 'تلاش ابھی دستیاب نہیں ہے۔',
  copyCodeLabel: 'کاپی کریں',
  copiedLabel: 'کاپی ہو گیا',
  linkCopiedLabel: 'لنک کاپی ہو گیا۔',
  copyBlockedLabel: 'یہاں کاپی کرنا بلاک ہے۔ ایڈریس اپنے براؤزر سے کاپی کریں۔',
  codeSelectedLabel:
    'کوڈ منتخب ہو گیا۔ کاپی کرنے کے لیے Ctrl C یا Command C دبائیں۔',
  savedLabel: 'بعد کے لیے محفوظ کیا گیا۔',
  unsavedLabel: 'محفوظ شدہ مضامین سے ہٹا دیا گیا۔',
  menuSummaryLabel: 'مینو',
  featuredLabel: 'نمایاں',
  readEssayLabel: 'مضمون پڑھیں',
  latestHeading: 'تازہ ترین',
  moreArticlesHeading: 'مزید مضامین',
  browseByTagLabel: 'ٹیگ کے مطابق دیکھیں',
  seriesCardLabel: 'سلسلہ',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} حصے`,
  startSeriesLabel: 'حصہ 1 سے شروع کریں',
  newsletterLabel: 'نیوز لیٹر',
  newsletterActionLabel: 'سبسکرائب کریں',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} منٹ کا مطالعہ`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `حصہ ${part} از ${total}`,
  onThisPageLabel: 'اس صفحے پر',
  writtenByLabel: 'مصنف',
  aboutTheAuthorLabel: 'مصنف کے بارے میں',
  youAreHereLabel: 'آپ یہاں ہیں',
  newerArticleLabel: 'نیا',
  olderArticleLabel: 'پرانا',
  moreArticlesNavigationLabel: 'مزید مضامین',
  keepReadingHeading: 'پڑھتے رہیں',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `${tag} میں مزید`,
  interactionsHeading: 'ردعمل',
  reactionsGroupLabel: 'ریایکشنز',
  likeLabel: 'پسند کریں',
  commentsHeading: 'گفتگو',
  interactionsNeedScriptNotice:
    'ریایکشنز اور تبصروں کے لیے JavaScript درکار ہے۔',
  showMoreCommentsLabel: 'مزید تبصرے دکھائیں',
  shareLabel: 'شیئر کریں',
  copyLinkLabel: 'اس مضمون کا لنک کاپی کریں',
  saveForLaterLabel: 'بعد کے لیے محفوظ کریں',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `${network} پر شیئر کریں`,
  shareByEmailLabel: 'ای میل سے شیئر کریں',
  shareNativeLabel: 'یہ مضمون شیئر کریں',
  followLabel: 'فالو کریں',
  followingLabel: 'فالو کر رہے ہیں',
  unfollowLabel: 'ان فالو کریں',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name} کو فالو کریں`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name} کو ان فالو کریں`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `اب آپ ${name} کو فالو کر رہے ہیں۔`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `اب آپ ${name} کو فالو نہیں کر رہے۔`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `${count} فالوورز`,
  followersTeamHint: 'اسے صرف آپ کی سائٹ کی ٹیم دیکھتی ہے',
  followDisabledMessage: 'اس سائٹ پر فی الحال فالو کرنا دستیاب نہیں ہے۔',
  followAuthorMissingMessage: 'اس مصنف کو فی الحال فالو نہیں کیا جا سکتا۔',
  audienceNetworkError: 'Galascribe تک رسائی نہیں ہو سکی۔ دوبارہ کوشش کریں۔',
  audienceRateLimited:
    'بہت زیادہ کوششیں ہو گئیں۔ کچھ دیر بعد دوبارہ کوشش کریں۔',
  audienceGenericError: 'کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔',
  audienceStorageBlocked:
    'آپ کے براؤزر نے وہ اسٹوریج بلاک کر دی جو سائٹ کو سائن اِن کے لیے چاہیے۔',
  audienceSignInUnsupported: 'یہ براؤزر اس صفحے پر سائن اِن نہیں کر سکتا۔',
  audienceSignInFailed: 'سائن اِن مکمل نہیں ہوا۔ دوبارہ کوشش کریں۔',
  audienceSignInInvalid: 'وہ سائن اِن لنک درست نہیں تھا۔ دوبارہ کوشش کریں۔',
  honeypotLabel: 'اس خانے کو خالی چھوڑ دیں',
  fieldRequiredMessage: 'یہ خانہ لازمی ہے۔',
  fieldInvalidMessage: 'اس خانے کو چیک کریں۔',
  newsletterEmailLabel: 'ای میل ایڈریس',
  newsletterCheckInbox: 'تصدیق کے لیے اپنا ان باکس دیکھیں',
  newsletterFullMessage: 'یہ نیوز لیٹر فی الحال نئے سبسکرائبرز نہیں لے رہا۔',
  newsletterEmailInvalid: 'درست ای میل ایڈریس درج کریں۔',
  contactLinkLabel: 'رابطہ',
  contactPageTitle: 'رابطہ',
  contactDefaultIntro:
    'کوئی سوال ہے یا کچھ کہنا ہے؟ پیغام بھیجیں، مصنف ای میل پر جواب دیں گے۔',
  contactNameLabel: 'نام',
  contactEmailLabel: 'ای میل',
  contactMessageLabel: 'پیغام',
  contactWebsiteLabel: 'ویب سائٹ (اختیاری)',
  contactPhoneLabel: 'فون (اختیاری)',
  contactSubmitLabel: 'پیغام بھیجیں',
  contactNoscript:
    'اس فارم کے لیے JavaScript درکار ہے۔ پیغام بھیجنے کے لیے اسے آن کریں۔',
  contactSent: 'شکریہ، آپ کا پیغام بھیج دیا گیا۔',
  contactUnavailable: 'یہ فارم فی الحال پیغامات قبول نہیں کر رہا۔',
  contactRateLimited:
    'یہاں سے بہت زیادہ پیغامات آئے ہیں۔ بعد میں دوبارہ کوشش کریں۔',
  contactMessageLinks: 'آپ کے پیغام میں زیادہ سے زیادہ دو لنک ہو سکتے ہیں۔',
  tagListLabel: 'ٹیگز',
  tagKickerLabel: 'ٹیگ',
  seriesKickerLabel: 'سلسلہ',
  archiveKickerLabel: 'آرکائیو',
  authorKickerLabel: 'مصنف',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} مضامین`,
  emptyListingLabel: 'ابھی کوئی مضمون نہیں۔',
  editionsNavigationLabel: 'ایڈیشنز',
  editionOriginalLabel: 'اصل',
  editionQuickReadLabel: 'مختصر مطالعہ',
  editionStandardLabel: 'معیاری',
  editionDeepDiveLabel: 'تفصیلی مطالعہ',
  editionNoticeLabel:
    'تیار کردہ ایڈیشن، مصنف کا جائزہ شدہ؛ اصل متن ہی حوالہ ہے',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'تعارف',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `تازہ کاری: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `ٹیگ “${tag}” والی تحریریں`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication} پر ٹیگ ${tag} والے ${count} مضامین۔`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}، ${publication} پر ${count} حصوں کا ایک سلسلہ۔`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `آرکائیو ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication} پر ${year} میں شائع ہونے والے ${count} مضامین۔`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${publication} پر ${name} کے لکھے ہوئے مضامین۔`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `${publication} پر شامل ${count} موضوعات دیکھیں۔`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `${publication} پر شائع ہونے والے ${count} سلسلے دیکھیں۔`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication} کے تمام مضامین، کل ${count}، سال کے لحاظ سے۔`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `${publication} کے تمام مضامین، نئے پہلے۔`,
  exploreColumnLabel: 'دریافت کریں',
  rssFeedLabel: 'RSS فیڈ',
  languageKickerLabel: 'زبان',
  languageSwitcherLabel: 'زبانیں',
  languageChipsLabel: 'دستیاب زبانیں',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication} پر ${language} میں ${count} مضامین۔`,
  postRemovedHeading: 'یہ پوسٹ ہٹا دی گئی ہے',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `اسے ${date} کو ہٹایا گیا تھا۔`,
  postRemovedHomeLabel: 'ہوم صفحے پر جائیں',
  versionPageHeading: 'سائٹ کا ورژن',
  versionTemplateLabel: 'ٹیمپلیٹ',
  versionThemeLabel: 'تھیم',
  versionSchemasLabel: 'اسکیمے',
  versionToolchainLabel: 'پبلش ٹول چین',
  versionCommitLabel: 'سورس کمٹ',
  versionBuiltAtLabel: 'تیار ہونے کا وقت',
  listenNavLabel: 'سنیں',
  listenNavCurrentLabel: 'یہ مضمون سنیں',
  listenInviteTitle: 'ہاتھ مصروف ہیں؟ پڑھنے کے بجائے سنیں۔',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `یہ مضمون ${minutes} منٹ کی گفتگو کی صورت میں بھی دستیاب ہے۔ ڈرائیو، ورزش یا برتن دھونے کے لیے موزوں۔`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `یہ مضمون ${minutes} منٹ کے بیانیے کی صورت میں بھی دستیاب ہے۔ ڈرائیو، ورزش یا برتن دھونے کے لیے موزوں۔`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `یہ مضمون ${minutes} منٹ کے مباحثے کی صورت میں بھی دستیاب ہے۔ ڈرائیو، ورزش یا برتن دھونے کے لیے موزوں۔`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `یہ مضمون ${minutes} منٹ کے خاکے کی صورت میں بھی دستیاب ہے۔ ڈرائیو، ورزش یا برتن دھونے کے لیے موزوں۔`,
  listenInvitePlayLabel: 'چلائیں',
  listenInviteDeclineLabel: 'نہیں، شکریہ',
  listenInviteNote: 'اے آئی آوازیں، اس مضمون سے ماخوذ۔',
  listenInviteCloseLabel: 'ابھی بند کریں',
  listenPlayerRegionLabel: 'آڈیو پلیئر',
  listenPlayerNowPlayingLabel: 'ابھی چل رہا ہے',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${count} میں سے ${index}`,
  listenPlayerPlayLabel: 'چلائیں',
  listenPlayerPauseLabel: 'روکیں',
  listenPlayerBackLabel: '15 سیکنڈ پیچھے',
  listenPlayerPreviousLabel: 'پچھلی قسط',
  listenPlayerNextLabel: 'اگلی قسط',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `پلے بیک کی رفتار ${rate}×`,
  listenPlayerSeekLabel: 'مقام',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${total} میں سے ${elapsed}`,
  listenPlayerCloseLabel: 'روکیں اور بند کریں',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `چل رہا ہے: ${title}`,
  listenListHeading: 'یہ بلاگ سنیں',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count} اقساط · ${duration}`,
  listenListPlayAllLabel: 'سب چلائیں',
  listenListShuffleLabel: 'بے ترتیب',
  listenListOrderLabel: 'ترتیب',
  listenListNewestLabel: 'نیا پہلے',
  listenListOldestLabel: 'پرانا پہلے',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `سب دکھائیں (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `${title} چلائیں`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} منٹ`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) =>
    `${hours} گھنٹہ ${minutes} منٹ`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('ur', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
