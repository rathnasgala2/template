/**
 * Chrome message catalog for the `he` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'דלג לתוכן',
  homeLinkLabel: 'דף הבית',
  primaryNavigationLabel: 'ראשי',
  footerNavigationLabel: 'תחתית',
  breadcrumbNavigationLabel: 'נתיב',
  paginationNavigationLabel: 'דפדוף',
  previousPageLabel: 'הקודם',
  nextPageLabel: 'הבא',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `עמוד ${current} מתוך ${total}`,
  authorsSectionLabel: 'כותבים',
  tagsSectionLabel: 'תגיות',
  seriesSectionLabel: 'סדרות',
  archiveSectionLabel: 'ארכיון',
  indexHeading: 'כל המאמרים',
  authorsIndexLabel: 'כותבים',
  tagIndexLabelPrefix: 'תגית:',
  seriesIndexLabelPrefix: 'סדרה:',
  archiveYearLabelPrefix: 'ארכיון:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `על ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `מאת ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, נפתח בכרטיסייה חדשה',
  footerLegalLabel: 'משפטי',
  termsLinkLabel: 'תנאים',
  privacyLinkLabel: 'פרטיות',
  consentRegionLabel: 'אפשרויות פרטיות',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `האתר הזה רוצה להשתמש ב-${providerName} כדי להבין את היקף הקריאה. שום דבר לא נטען עד שתאשרו, ואפשר לשנות את הבחירה בכל עת מתחתית הדף.`,
  consentAcceptLabel: 'אישור ניתוח נתונים',
  consentDeclineLabel: 'דחייה',
  consentOpenLabel: 'אפשרויות פרטיות',
  errorPageHeading: 'הדף לא נמצא',
  errorPageBody: 'הדף שחיפשתם לא נמצא. ייתכן שהוא הועבר, שונה שמו או הוסר.',
  errorPageReturnHomeLabel: 'חזרה לדף הבית',
  appearanceControlLabel: 'מראה',
  appearanceModeLightLabel: 'בהיר',
  appearanceModeDarkLabel: 'כהה',
  appearanceModeSystemLabel: 'לפי המערכת',
  searchButtonLabel: 'חיפוש',
  searchButtonAriaLabel: 'חיפוש במאמרים',
  searchPlaceholderLabel: 'חיפוש בפרסום',
  searchEmptyLabel: 'אין מאמרים שמתאימים לחיפוש.',
  searchUnavailableLabel: 'החיפוש אינו זמין כרגע.',
  copyCodeLabel: 'העתקה',
  copiedLabel: 'הועתק',
  linkCopiedLabel: 'הקישור הועתק.',
  copyBlockedLabel: 'ההעתקה חסומה כאן. העתיקו את הכתובת מהדפדפן.',
  codeSelectedLabel: 'הקוד נבחר. הקישו Ctrl C או Command C כדי להעתיק.',
  savedLabel: 'נשמר לאחר כך.',
  unsavedLabel: 'הוסר מהמאמרים השמורים.',
  menuSummaryLabel: 'תפריט',
  featuredLabel: 'מומלץ',
  readEssayLabel: 'קריאת החיבור',
  latestHeading: 'אחרונים',
  moreArticlesHeading: 'עוד מאמרים',
  browseByTagLabel: 'עיון לפי תגית',
  seriesCardLabel: 'סדרה',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count === '1' ? 'חלק אחד' : `${count} חלקים`}`,
  startSeriesLabel: 'להתחיל מחלק 1',
  newsletterLabel: 'ניוזלטר',
  newsletterActionLabel: 'הרשמה',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} דקות קריאה`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `חלק ${part} מתוך ${total}`,
  onThisPageLabel: 'בעמוד הזה',
  writtenByLabel: 'נכתב על ידי',
  aboutTheAuthorLabel: 'על הכותב',
  youAreHereLabel: 'אתם כאן',
  newerArticleLabel: 'חדש יותר',
  olderArticleLabel: 'ישן יותר',
  moreArticlesNavigationLabel: 'עוד מאמרים',
  keepReadingHeading: 'להמשיך לקרוא',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `עוד ב${tag}`,
  interactionsHeading: 'תגובות',
  reactionsGroupLabel: 'תגובות',
  likeLabel: 'לייק',
  commentsHeading: 'שיחה',
  interactionsNeedScriptNotice: 'תגובות והערות דורשות JavaScript.',
  showMoreCommentsLabel: 'הצגת עוד הערות',
  shareLabel: 'שיתוף',
  copyLinkLabel: 'העתקת קישור למאמר',
  saveForLaterLabel: 'שמירה לאחר כך',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `שיתוף ב-${network}`,
  shareByEmailLabel: 'שיתוף באימייל',
  shareNativeLabel: 'שיתוף המאמר',
  followLabel: 'מעקב',
  followingLabel: 'במעקב',
  unfollowLabel: 'הפסקת מעקב',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `מעקב אחרי ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `הפסקת מעקב אחרי ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `מעכשיו אתם עוקבים אחרי ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `הפסקתם לעקוב אחרי ${name}.`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `עוקבים: ${count}`,
  followersTeamHint: 'רק הצוות של האתר שלך רואה זאת',
  followDisabledMessage: 'מעקב אינו זמין באתר הזה כרגע.',
  followAuthorMissingMessage: 'אי אפשר לעקוב אחרי הכותב הזה כרגע.',
  audienceNetworkError: 'אין חיבור ל-Galascribe. נסו שוב.',
  audienceRateLimited: 'יותר מדי ניסיונות. נסו שוב בעוד רגע.',
  audienceGenericError: 'משהו השתבש. נסו שוב.',
  audienceStorageBlocked: 'הדפדפן חסם אחסון שהאתר צריך כדי לחבר אתכם.',
  audienceSignInUnsupported: 'הדפדפן הזה לא יכול לחבר אתכם בעמוד הזה.',
  audienceSignInFailed: 'ההתחברות לא הושלמה. נסו שוב.',
  audienceSignInInvalid: 'קישור ההתחברות לא תקין. נסו שוב.',
  honeypotLabel: 'השאירו שדה זה ריק',
  fieldRequiredMessage: 'שדה חובה.',
  fieldInvalidMessage: 'בדקו את השדה.',
  newsletterEmailLabel: 'כתובת אימייל',
  newsletterCheckInbox: 'בדקו את תיבת הדואר לאישור',
  newsletterFullMessage: 'הניוזלטר הזה לא מקבל מנויים חדשים כרגע.',
  newsletterEmailInvalid: 'הזינו כתובת אימייל תקינה.',
  contactLinkLabel: 'יצירת קשר',
  contactPageTitle: 'יצירת קשר',
  contactDefaultIntro: 'יש שאלה או משהו לומר? שלחו הודעה והכותב יענה באימייל.',
  contactNameLabel: 'שם',
  contactEmailLabel: 'אימייל',
  contactMessageLabel: 'הודעה',
  contactWebsiteLabel: 'אתר (לא חובה)',
  contactPhoneLabel: 'טלפון (לא חובה)',
  contactSubmitLabel: 'שליחת הודעה',
  contactNoscript: 'הטופס דורש JavaScript. הפעילו אותו כדי לשלוח הודעה.',
  contactSent: 'תודה, ההודעה נשלחה.',
  contactUnavailable: 'הטופס לא מקבל הודעות כרגע.',
  contactRateLimited: 'יותר מדי הודעות מכאן. נסו שוב מאוחר יותר.',
  contactMessageLinks: 'ההודעה יכולה לכלול עד שני קישורים.',
  tagListLabel: 'תגיות',
  tagKickerLabel: 'תגית',
  seriesKickerLabel: 'סדרה',
  archiveKickerLabel: 'ארכיון',
  authorKickerLabel: 'כותב',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) =>
    `${count === '1' ? 'מאמר אחד' : `${count} מאמרים`}`,
  emptyListingLabel: 'עדיין אין מאמרים.',
  editionsNavigationLabel: 'מהדורות',
  editionOriginalLabel: 'מקור',
  editionQuickReadLabel: 'קריאה מהירה',
  editionStandardLabel: 'רגילה',
  editionDeepDiveLabel: 'צלילה לעומק',
  editionNoticeLabel: 'מהדורה שנוצרה ואושרה על ידי הכותב; המקור הוא הקובע',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'אודות',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `עודכן ב-${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `פוסטים עם התגית “${tag}”`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count === '1' ? 'מאמר אחד' : `${count} מאמרים`} עם התגית ${tag} ב-${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, סדרה של ${count === '1' ? 'חלק אחד' : `${count} חלקים`} ב-${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `ארכיון ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count === '1' ? 'מאמר אחד' : `${count} מאמרים`} שפורסמו ב-${year} ב-${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `מאמרים מאת ${name} ב-${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `עיינו ב-${count} הנושאים של ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `עיינו ב-${count} הסדרות שפורסמו ב-${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `כל המאמרים ב-${publication}, ${count} בסך הכול, לפי שנה.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `כל המאמרים ב-${publication}, החדשים בראש.`,
  exploreColumnLabel: 'גלו',
  rssFeedLabel: 'פיד RSS',
  languageKickerLabel: 'שפה',
  languageSwitcherLabel: 'שפות',
  languageChipsLabel: 'שפות זמינות',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? 'מאמר אחד' : `${count} מאמרים`} ב${language} ב-${publication}.`,
  postRemovedHeading: 'הפוסט הזה הוסר',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `הוא הוסר ב-${date}.`,
  postRemovedHomeLabel: 'מעבר לדף הבית',
  versionPageHeading: 'גרסת האתר',
  versionTemplateLabel: 'תבנית',
  versionThemeLabel: 'ערכת נושא',
  versionSchemasLabel: 'סכמות',
  versionToolchainLabel: 'כלי פרסום',
  versionCommitLabel: 'קומיט מקור',
  versionBuiltAtLabel: 'נבנה ב',
  listenNavLabel: 'האזנה',
  listenNavCurrentLabel: 'האזנה לפוסט הזה',
  listenInviteTitle: 'ידיים עסוקות? אפשר להאזין במקום.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `הפוסט הזה זמין גם כשיחה של ${minutes} דקות. מתאים לנסיעה, לאימון או לשטיפת כלים.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `הפוסט הזה זמין גם כהקראה של ${minutes} דקות. מתאים לנסיעה, לאימון או לשטיפת כלים.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `הפוסט הזה זמין גם כוויכוח של ${minutes} דקות. מתאים לנסיעה, לאימון או לשטיפת כלים.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `הפוסט הזה זמין גם כסקצ׳ של ${minutes} דקות. מתאים לנסיעה, לאימון או לשטיפת כלים.`,
  listenInvitePlayLabel: 'הפעלה',
  listenInviteDeclineLabel: 'לא, תודה',
  listenInviteNote: 'קולות AI, בעיבוד של הפוסט הזה.',
  listenInviteCloseLabel: 'סגירה לעכשיו',
  listenPlayerRegionLabel: 'נגן שמע',
  listenPlayerNowPlayingLabel: 'מתנגן עכשיו',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} מתוך ${count}`,
  listenPlayerPlayLabel: 'ניגון',
  listenPlayerPauseLabel: 'השהיה',
  listenPlayerBackLabel: 'אחורה 15 שניות',
  listenPlayerPreviousLabel: 'הפרק הקודם',
  listenPlayerNextLabel: 'הפרק הבא',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `מהירות ניגון ${rate}×`,
  listenPlayerSeekLabel: 'מיקום',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} מתוך ${total}`,
  listenPlayerCloseLabel: 'עצירה וסגירה',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `מתנגן: ${title}`,
  listenListHeading: 'האזנה לבלוג הזה',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) =>
    count === '1' ? `פרק אחד · ${duration}` : `${count} פרקים · ${duration}`,
  listenListPlayAllLabel: 'ניגון הכול',
  listenListShuffleLabel: 'ערבוב',
  listenListOrderLabel: 'סדר',
  listenListNewestLabel: 'החדשים קודם',
  listenListOldestLabel: 'הישנים קודם',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `הצגת הכול (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `ניגון ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} דק׳`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} שע׳ ${minutes} דק׳`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('he', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
