/**
 * Chrome message catalog for the `bn` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'মূল লেখায় যান',
  homeLinkLabel: 'হোম',
  primaryNavigationLabel: 'প্রধান',
  footerNavigationLabel: 'ফুটার',
  breadcrumbNavigationLabel: 'ব্রেডক্রাম্ব',
  paginationNavigationLabel: 'পৃষ্ঠা সংখ্যা',
  previousPageLabel: 'আগের',
  nextPageLabel: 'পরের',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `পৃষ্ঠা ${current} / ${total}`,
  authorsSectionLabel: 'লেখকগণ',
  tagsSectionLabel: 'ট্যাগ',
  seriesSectionLabel: 'সিরিজ',
  archiveSectionLabel: 'আর্কাইভ',
  indexHeading: 'সব লেখা',
  authorsIndexLabel: 'লেখকগণ',
  tagIndexLabelPrefix: 'ট্যাগ:',
  seriesIndexLabelPrefix: 'সিরিজ:',
  archiveYearLabelPrefix: 'আর্কাইভ:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName} সম্পর্কে`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `${displayName}-এর লেখা`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, নতুন ট্যাবে খুলবে',
  footerLegalLabel: 'আইনি',
  termsLinkLabel: 'শর্তাবলি',
  privacyLinkLabel: 'গোপনীয়তা',
  consentRegionLabel: 'গোপনীয়তার পছন্দ',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `পাঠক সংখ্যা বুঝতে এই সাইট ${providerName} ব্যবহার করতে চায়। আপনি অনুমতি না দেওয়া পর্যন্ত কিছুই লোড হবে না, আর ফুটার থেকে যেকোনো সময় পছন্দ বদলাতে পারবেন।`,
  consentAcceptLabel: 'অ্যানালিটিক্স অনুমতি দিন',
  consentDeclineLabel: 'প্রত্যাখ্যান',
  consentOpenLabel: 'গোপনীয়তার পছন্দ',
  errorPageHeading: 'পৃষ্ঠাটি পাওয়া যায়নি',
  errorPageBody:
    'আপনি যে পৃষ্ঠাটি খুঁজছিলেন সেটি পাওয়া যায়নি। হয়তো সেটি সরানো, নাম বদল বা মুছে ফেলা হয়েছে।',
  errorPageReturnHomeLabel: 'হোম পৃষ্ঠায় ফিরুন',
  appearanceControlLabel: 'চেহারা',
  appearanceModeLightLabel: 'হালকা',
  appearanceModeDarkLabel: 'গাঢ়',
  appearanceModeSystemLabel: 'সিস্টেম',
  searchButtonLabel: 'খুঁজুন',
  searchButtonAriaLabel: 'লেখা খুঁজুন',
  searchPlaceholderLabel: 'প্রকাশনায় খুঁজুন',
  searchEmptyLabel: 'আপনার খোঁজের সাথে মেলে এমন লেখা নেই।',
  searchUnavailableLabel: 'এখন খোঁজা সম্ভব হচ্ছে না।',
  copyCodeLabel: 'কপি',
  copiedLabel: 'কপি হয়েছে',
  linkCopiedLabel: 'লিংক কপি হয়েছে।',
  copyBlockedLabel: 'এখানে কপি করা বন্ধ। ব্রাউজার থেকে ঠিকানাটি কপি করুন।',
  codeSelectedLabel: 'কোড নির্বাচিত। কপি করতে Ctrl C বা Command C চাপুন।',
  savedLabel: 'পরে পড়ার জন্য সংরক্ষিত।',
  unsavedLabel: 'সংরক্ষিত লেখা থেকে সরানো হয়েছে।',
  menuSummaryLabel: 'মেনু',
  featuredLabel: 'বিশেষ',
  readEssayLabel: 'রচনাটি পড়ুন',
  latestHeading: 'সর্বশেষ',
  moreArticlesHeading: 'আরও লেখা',
  browseByTagLabel: 'ট্যাগ ধরে দেখুন',
  seriesCardLabel: 'সিরিজ',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count}টি পর্ব`,
  startSeriesLabel: 'প্রথম পর্ব থেকে শুরু করুন',
  newsletterLabel: 'নিউজলেটার',
  newsletterActionLabel: 'সাবস্ক্রাইব',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `পড়তে ${minutes} মিনিট`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `পর্ব ${part} / ${total}`,
  onThisPageLabel: 'এই পৃষ্ঠায়',
  writtenByLabel: 'লেখক',
  aboutTheAuthorLabel: 'লেখক পরিচিতি',
  youAreHereLabel: 'আপনি এখানে আছেন',
  newerArticleLabel: 'নতুনতর',
  olderArticleLabel: 'পুরনো',
  moreArticlesNavigationLabel: 'আরও লেখা',
  keepReadingHeading: 'পড়তে থাকুন',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `${tag}-এ আরও`,
  interactionsHeading: 'প্রতিক্রিয়া',
  reactionsGroupLabel: 'রিঅ্যাকশন',
  likeLabel: 'লাইক',
  commentsHeading: 'আলোচনা',
  interactionsNeedScriptNotice: 'রিঅ্যাকশন ও মন্তব্যের জন্য JavaScript দরকার।',
  showMoreCommentsLabel: 'আরও মন্তব্য দেখুন',
  shareLabel: 'শেয়ার',
  copyLinkLabel: 'এই লেখার লিংক কপি করুন',
  saveForLaterLabel: 'পরে পড়ার জন্য রাখুন',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `${network}-এ শেয়ার করুন`,
  shareByEmailLabel: 'ইমেইলে শেয়ার করুন',
  shareNativeLabel: 'এই লেখা শেয়ার করুন',
  followLabel: 'ফলো',
  followingLabel: 'ফলো করছেন',
  unfollowLabel: 'আনফলো',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name}-কে ফলো করুন`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name}-কে আনফলো করুন`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `আপনি এখন ${name}-কে ফলো করছেন।`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `আপনি আর ${name}-কে ফলো করছেন না।`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `${count} জন অনুসারী`,
  followersTeamHint: 'শুধু আপনার সাইটের টিম এটি দেখতে পায়',
  followDisabledMessage: 'এই সাইটে এখন ফলো করা যাচ্ছে না।',
  followAuthorMissingMessage: 'এই লেখককে এখন ফলো করা যাচ্ছে না।',
  audienceNetworkError: 'Galascribe-এ পৌঁছানো গেল না। আবার চেষ্টা করুন।',
  audienceRateLimited: 'অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করুন।',
  audienceGenericError: 'কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।',
  audienceStorageBlocked:
    'সাইন ইনের জন্য এই সাইটের দরকারি স্টোরেজ আপনার ব্রাউজার আটকে দিয়েছে।',
  audienceSignInUnsupported:
    'এই ব্রাউজার দিয়ে এই পৃষ্ঠায় সাইন ইন করা যাচ্ছে না।',
  audienceSignInFailed: 'সাইন ইন সম্পূর্ণ হয়নি। আবার চেষ্টা করুন।',
  audienceSignInInvalid: 'সাইন ইন লিংকটি বৈধ ছিল না। আবার চেষ্টা করুন।',
  honeypotLabel: 'এই ঘরটি খালি রাখুন',
  fieldRequiredMessage: 'এই ঘরটি পূরণ করা আবশ্যক।',
  fieldInvalidMessage: 'ঘরটি আবার দেখুন।',
  newsletterEmailLabel: 'ইমেইল ঠিকানা',
  newsletterCheckInbox: 'নিশ্চিত করতে ইনবক্স দেখুন',
  newsletterFullMessage: 'এই নিউজলেটার এখন নতুন সাবস্ক্রাইবার নিচ্ছে না।',
  newsletterEmailInvalid: 'সঠিক ইমেইল ঠিকানা দিন।',
  contactLinkLabel: 'যোগাযোগ',
  contactPageTitle: 'যোগাযোগ',
  contactDefaultIntro:
    'কোনো প্রশ্ন বা কিছু বলার আছে? বার্তা পাঠান, লেখক ইমেইলে উত্তর দেবেন।',
  contactNameLabel: 'নাম',
  contactEmailLabel: 'ইমেইল',
  contactMessageLabel: 'বার্তা',
  contactWebsiteLabel: 'ওয়েবসাইট (ঐচ্ছিক)',
  contactPhoneLabel: 'ফোন (ঐচ্ছিক)',
  contactSubmitLabel: 'বার্তা পাঠান',
  contactNoscript:
    'এই ফর্মের জন্য JavaScript দরকার। বার্তা পাঠাতে এটি চালু করুন।',
  contactSent: 'ধন্যবাদ, আপনার বার্তা পাঠানো হয়েছে।',
  contactUnavailable: 'এই ফর্ম এখন বার্তা নিচ্ছে না।',
  contactRateLimited: 'এখান থেকে অনেক বার্তা এসেছে। পরে আবার চেষ্টা করুন।',
  contactMessageLinks: 'আপনার বার্তায় সর্বোচ্চ দুটি লিংক থাকতে পারে।',
  tagListLabel: 'ট্যাগ',
  tagKickerLabel: 'ট্যাগ',
  seriesKickerLabel: 'সিরিজ',
  archiveKickerLabel: 'আর্কাইভ',
  authorKickerLabel: 'লেখক',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count}টি লেখা`,
  emptyListingLabel: 'এখনও কোনো লেখা নেই।',
  editionsNavigationLabel: 'সংস্করণ',
  editionOriginalLabel: 'মূল',
  editionQuickReadLabel: 'দ্রুত পাঠ',
  editionStandardLabel: 'স্ট্যান্ডার্ড',
  editionDeepDiveLabel: 'গভীর পাঠ',
  editionNoticeLabel:
    'তৈরি করা সংস্করণ, লেখক যাচাই করেছেন; মূল লেখাটিই প্রামাণ্য',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'পরিচিতি',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `হালনাগাদ ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `“${tag}” ট্যাগের লেখা`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication}-এ ${tag} ট্যাগের ${count}টি লেখা।`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, ${publication}-এর ${count} পর্বের একটি সিরিজ।`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `আর্কাইভ ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication}-এ ${year} সালে প্রকাশিত ${count}টি লেখা।`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${publication}-এ ${name}-এর লেখা।`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `${publication}-এ আলোচিত ${count}টি বিষয় দেখুন।`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `${publication}-এ প্রকাশিত ${count}টি সিরিজ দেখুন।`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication}-এর সব লেখা, মোট ${count}টি, বছর অনুযায়ী।`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) => `${publication}-এর সব লেখা, নতুন আগে।`,
  exploreColumnLabel: 'ঘুরে দেখুন',
  rssFeedLabel: 'RSS ফিড',
  languageKickerLabel: 'ভাষা',
  languageSwitcherLabel: 'ভাষা',
  languageChipsLabel: 'উপলব্ধ ভাষা',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication}-এ ${language} ভাষায় ${count}টি লেখা।`,
  postRemovedHeading: 'এই লেখাটি সরানো হয়েছে',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `এটি ${date} তারিখে সরানো হয়েছে।`,
  postRemovedHomeLabel: 'হোম পৃষ্ঠায় যান',
  versionPageHeading: 'সাইটের সংস্করণ',
  versionTemplateLabel: 'টেমপ্লেট',
  versionThemeLabel: 'থিম',
  versionSchemasLabel: 'স্কিমা',
  versionToolchainLabel: 'পাবলিশ টুলচেইন',
  versionCommitLabel: 'সোর্স কমিট',
  versionBuiltAtLabel: 'তৈরির সময়',
  listenNavLabel: 'শুনুন',
  listenNavCurrentLabel: 'এই লেখাটি শুনুন',
  listenInviteTitle: 'হাত ব্যস্ত? বরং শুনুন।',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `এই লেখাটি ${minutes} মিনিটের আলাপ হিসেবেও আছে। গাড়িতে, ব্যায়ামের সময় বা বাসন ধোয়ার সময় উপযোগী।`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `এই লেখাটি ${minutes} মিনিটের পাঠ হিসেবেও আছে। গাড়িতে, ব্যায়ামের সময় বা বাসন ধোয়ার সময় উপযোগী।`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `এই লেখাটি ${minutes} মিনিটের বিতর্ক হিসেবেও আছে। গাড়িতে, ব্যায়ামের সময় বা বাসন ধোয়ার সময় উপযোগী।`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `এই লেখাটি ${minutes} মিনিটের স্কিট হিসেবেও আছে। গাড়িতে, ব্যায়ামের সময় বা বাসন ধোয়ার সময় উপযোগী।`,
  listenInvitePlayLabel: 'চালান',
  listenInviteDeclineLabel: 'না, ধন্যবাদ',
  listenInviteNote: 'এআই কণ্ঠ, এই লেখা থেকে রূপান্তরিত।',
  listenInviteCloseLabel: 'এখনকার মতো বন্ধ করুন',
  listenPlayerRegionLabel: 'অডিও প্লেয়ার',
  listenPlayerNowPlayingLabel: 'এখন চলছে',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${count}-এর মধ্যে ${index}`,
  listenPlayerPlayLabel: 'চালান',
  listenPlayerPauseLabel: 'বিরতি',
  listenPlayerBackLabel: '15 সেকেন্ড পিছনে',
  listenPlayerPreviousLabel: 'আগের পর্ব',
  listenPlayerNextLabel: 'পরের পর্ব',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `প্লেব্যাক গতি ${rate}×`,
  listenPlayerSeekLabel: 'অবস্থান',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${total}-এর মধ্যে ${elapsed}`,
  listenPlayerCloseLabel: 'থামান ও বন্ধ করুন',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `চলছে: ${title}`,
  listenListHeading: 'এই ব্লগটি শুনুন',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count}টি পর্ব · ${duration}`,
  listenListPlayAllLabel: 'সব চালান',
  listenListShuffleLabel: 'এলোমেলো',
  listenListOrderLabel: 'ক্রম',
  listenListNewestLabel: 'নতুন আগে',
  listenListOldestLabel: 'পুরোনো আগে',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `সব ${count}টি দেখান`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `${title} চালান`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} মিনিট`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) =>
    `${hours} ঘণ্টা ${minutes} মিনিট`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('bn', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
