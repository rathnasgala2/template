/**
 * Chrome message catalog for the `ta` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'உள்ளடக்கத்திற்குச் செல்',
  homeLinkLabel: 'முகப்பு',
  primaryNavigationLabel: 'முதன்மை',
  footerNavigationLabel: 'அடிக்குறிப்பு',
  breadcrumbNavigationLabel: 'வழித்தடம்',
  paginationNavigationLabel: 'பக்க எண்கள்',
  previousPageLabel: 'முந்தையது',
  nextPageLabel: 'அடுத்தது',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `பக்கம் ${current} / ${total}`,
  authorsSectionLabel: 'எழுத்தாளர்கள்',
  tagsSectionLabel: 'குறிச்சொற்கள்',
  seriesSectionLabel: 'தொடர்',
  archiveSectionLabel: 'காப்பகம்',
  indexHeading: 'அனைத்துக் கட்டுரைகள்',
  authorsIndexLabel: 'எழுத்தாளர்கள்',
  tagIndexLabelPrefix: 'குறிச்சொல்:',
  seriesIndexLabelPrefix: 'தொடர்:',
  archiveYearLabelPrefix: 'காப்பகம்:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName} பற்றி`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `எழுதியவர்: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, புதிய தாவலில் திறக்கும்',
  footerLegalLabel: 'சட்டம்',
  termsLinkLabel: 'விதிமுறைகள்',
  privacyLinkLabel: 'தனியுரிமை',
  consentRegionLabel: 'தனியுரிமைத் தேர்வுகள்',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `வாசகர்களைப் புரிந்துகொள்ள இந்தத் தளம் ${providerName} சேவையைப் பயன்படுத்த விரும்புகிறது. ` +
    'நீங்கள் ஏற்கும் வரை எதுவும் ஏற்றப்படாது; உங்கள் தேர்வை எப்போது வேண்டுமானாலும் ' +
    'அடிக்குறிப்பிலிருந்து மாற்றலாம்.',
  consentAcceptLabel: 'பகுப்பாய்வை ஏற்கிறேன்',
  consentDeclineLabel: 'மறுக்கிறேன்',
  consentOpenLabel: 'தனியுரிமைத் தேர்வுகள்',
  errorPageHeading: 'பக்கம் கிடைக்கவில்லை',
  errorPageBody:
    'நீங்கள் தேடிய பக்கம் கிடைக்கவில்லை. அது நகர்த்தப்பட்டிருக்கலாம், ' +
    'பெயர் மாற்றப்பட்டிருக்கலாம் அல்லது நீக்கப்பட்டிருக்கலாம்.',
  errorPageReturnHomeLabel: 'முகப்புப் பக்கத்திற்குத் திரும்பு',
  appearanceControlLabel: 'தோற்றம்',
  appearanceModeLightLabel: 'ஒளி',
  appearanceModeDarkLabel: 'இருள்',
  appearanceModeSystemLabel: 'சாதனம்',
  searchButtonLabel: 'தேடு',
  searchButtonAriaLabel: 'கட்டுரைகளைத் தேடு',
  searchPlaceholderLabel: 'வெளியீட்டில் தேடு',
  searchEmptyLabel: 'உங்கள் தேடலுக்குப் பொருந்தும் கட்டுரைகள் இல்லை.',
  searchUnavailableLabel: 'தேடல் இப்போது கிடைக்கவில்லை.',
  copyCodeLabel: 'நகலெடு',
  copiedLabel: 'நகலெடுக்கப்பட்டது',
  linkCopiedLabel: 'இணைப்பு நகலெடுக்கப்பட்டது.',
  copyBlockedLabel:
    'இங்கு நகலெடுக்க அனுமதி இல்லை. உலாவியிலிருந்து முகவரியை நகலெடுக்கவும்.',
  codeSelectedLabel:
    'குறியீடு தேர்ந்தெடுக்கப்பட்டது. நகலெடுக்க Ctrl C அல்லது Command C அழுத்தவும்.',
  savedLabel: 'பின்னர் படிக்கச் சேமிக்கப்பட்டது.',
  unsavedLabel: 'சேமித்த கட்டுரைகளிலிருந்து நீக்கப்பட்டது.',
  menuSummaryLabel: 'பட்டி',
  featuredLabel: 'சிறப்பு',
  readEssayLabel: 'கட்டுரையைப் படி',
  latestHeading: 'சமீபத்தியவை',
  moreArticlesHeading: 'மேலும் கட்டுரைகள்',
  browseByTagLabel: 'குறிச்சொல்லால் தேடு',
  seriesCardLabel: 'தொடர்',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} பகுதிகள்`,
  startSeriesLabel: 'பகுதி 1 இலிருந்து தொடங்கு',
  newsletterLabel: 'செய்திமடல்',
  newsletterActionLabel: 'சந்தா செய்',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) =>
    `${new Intl.NumberFormat('ta').format(Number(minutes))} நிமிட வாசிப்பு`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `பகுதி ${part} / ${total}`,
  onThisPageLabel: 'இந்தப் பக்கத்தில்',
  writtenByLabel: 'எழுதியவர்',
  aboutTheAuthorLabel: 'எழுத்தாளர் பற்றி',
  youAreHereLabel: 'நீங்கள் இங்கே இருக்கிறீர்கள்',
  newerArticleLabel: 'புதியது',
  olderArticleLabel: 'பழையது',
  moreArticlesNavigationLabel: 'மேலும் கட்டுரைகள்',
  keepReadingHeading: 'தொடர்ந்து படியுங்கள்',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `${tag} பிரிவில் மேலும்`,
  interactionsHeading: 'எதிர்வினைகள்',
  reactionsGroupLabel: 'எதிர்வினைகள்',
  likeLabel: 'விருப்பம்',
  commentsHeading: 'உரையாடல்',
  interactionsNeedScriptNotice:
    'எதிர்வினைகளுக்கும் கருத்துகளுக்கும் JavaScript தேவை.',
  showMoreCommentsLabel: 'மேலும் கருத்துகளைக் காட்டு',
  shareLabel: 'பகிர்',
  copyLinkLabel: 'இந்தக் கட்டுரையின் இணைப்பை நகலெடு',
  saveForLaterLabel: 'பின்னர் படிக்கச் சேமி',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `${network} இல் பகிர்`,
  shareByEmailLabel: 'மின்னஞ்சலில் பகிர்',
  shareNativeLabel: 'இந்தக் கட்டுரையைப் பகிர்',
  followLabel: 'பின்தொடர்',
  followingLabel: 'பின்தொடர்கிறீர்கள்',
  unfollowLabel: 'பின்தொடர்வதை நிறுத்து',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name} ஐப் பின்தொடர்`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name} ஐப் பின்தொடர்வதை நிறுத்து`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) =>
    `நீங்கள் இப்போது ${name} ஐப் பின்தொடர்கிறீர்கள்.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `நீங்கள் இனி ${name} ஐப் பின்தொடரவில்லை.`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `${count} பின்தொடர்பவர்கள்`,
  followersTeamHint: 'இதை உங்கள் தளத்தின் குழு மட்டுமே பார்க்கும்',
  followDisabledMessage: 'இந்தத் தளத்தில் பின்தொடர்தல் தற்போது கிடைக்கவில்லை.',
  followAuthorMissingMessage: 'இந்த எழுத்தாளரை இப்போது பின்தொடர முடியாது.',
  audienceNetworkError: 'Galascribe ஐ அடைய முடியவில்லை. மீண்டும் முயலவும்.',
  audienceRateLimited:
    'மிக அதிக முயற்சிகள். சிறிது நேரம் கழித்து மீண்டும் முயலவும்.',
  audienceGenericError: 'ஏதோ தவறு நேர்ந்தது. மீண்டும் முயலவும்.',
  audienceStorageBlocked:
    'உங்களை உள்நுழையச் செய்ய இந்தத் தளத்திற்குத் தேவையான சேமிப்பிடத்தை உங்கள் உலாவி தடுத்தது.',
  audienceSignInUnsupported:
    'இந்த உலாவியால் இந்தப் பக்கத்தில் உங்களை உள்நுழையச் செய்ய முடியாது.',
  audienceSignInFailed: 'உள்நுழைவு முடியவில்லை. மீண்டும் முயலவும்.',
  audienceSignInInvalid:
    'அந்த உள்நுழைவு இணைப்பு செல்லுபடியாகவில்லை. மீண்டும் முயலவும்.',
  honeypotLabel: 'இந்தப் புலத்தை காலியாக விடவும்',
  fieldRequiredMessage: 'இந்தப் புலம் தேவை.',
  fieldInvalidMessage: 'இந்தப் புலத்தைச் சரிபார்க்கவும்.',
  newsletterEmailLabel: 'மின்னஞ்சல் முகவரி',
  newsletterCheckInbox: 'உறுதிப்படுத்த உங்கள் இன்பாக்ஸைப் பாருங்கள்',
  newsletterFullMessage:
    'இந்தச் செய்திமடல் இப்போது புதிய சந்தாதாரர்களை ஏற்கவில்லை.',
  newsletterEmailInvalid: 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.',
  contactLinkLabel: 'தொடர்புக்கு',
  contactPageTitle: 'தொடர்பு',
  contactDefaultIntro:
    'கேள்வி அல்லது சொல்ல ஏதேனும் உள்ளதா? ஒரு செய்தியை அனுப்புங்கள்; எழுத்தாளர் மின்னஞ்சலில் பதிலளிப்பார்.',
  contactNameLabel: 'பெயர்',
  contactEmailLabel: 'மின்னஞ்சல்',
  contactMessageLabel: 'செய்தி',
  contactWebsiteLabel: 'இணையதளம் (விருப்பம்)',
  contactPhoneLabel: 'தொலைபேசி (விருப்பம்)',
  contactSubmitLabel: 'செய்தியை அனுப்பு',
  contactNoscript:
    'இந்தப் படிவத்திற்கு JavaScript தேவை. செய்தி அனுப்ப அதை இயக்கவும்.',
  contactSent: 'நன்றி, உங்கள் செய்தி அனுப்பப்பட்டது.',
  contactUnavailable: 'இந்தப் படிவம் இப்போது செய்திகளை ஏற்கவில்லை.',
  contactRateLimited:
    'இங்கிருந்து மிக அதிக செய்திகள். பிறகு மீண்டும் முயலவும்.',
  contactMessageLinks:
    'உங்கள் செய்தியில் அதிகபட்சம் இரண்டு இணைப்புகள் இருக்கலாம்.',
  tagListLabel: 'குறிச்சொற்கள்',
  tagKickerLabel: 'குறிச்சொல்',
  seriesKickerLabel: 'தொடர்',
  archiveKickerLabel: 'காப்பகம்',
  authorKickerLabel: 'எழுத்தாளர்',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} கட்டுரைகள்`,
  emptyListingLabel: 'இன்னும் கட்டுரைகள் இல்லை.',
  editionsNavigationLabel: 'பதிப்புகள்',
  editionOriginalLabel: 'மூலம்',
  editionQuickReadLabel: 'விரைவு வாசிப்பு',
  editionStandardLabel: 'நிலையான பதிப்பு',
  editionDeepDiveLabel: 'ஆழ்ந்த பார்வை',
  editionNoticeLabel:
    'உருவாக்கப்பட்ட பதிப்பு, எழுத்தாளரால் சரிபார்க்கப்பட்டது; மூலக் கட்டுரையே அடிப்படை',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'பற்றி',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `புதுப்பிக்கப்பட்டது ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `“${tag}” குறிச்சொல் இடப்பட்ட இடுகைகள்`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication} தளத்தில் ${tag} என்று குறிக்கப்பட்ட ${count} கட்டுரைகள்.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}: ${publication} தளத்தில் ${count} பகுதிகள் கொண்ட தொடர்.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `காப்பகம் ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication} தளத்தில் ${year} ஆண்டில் வெளியான ${count} கட்டுரைகள்.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${publication} தளத்தில் ${name} எழுதிய கட்டுரைகள்.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `${publication} தளத்தில் உள்ள ${count} தலைப்புகளைப் பாருங்கள்.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `${publication} தளத்தில் வெளியான ${count} தொடர்களைப் பாருங்கள்.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication} தளத்தின் அனைத்துக் கட்டுரைகளும், மொத்தம் ${count}, ஆண்டு வாரியாக.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `${publication} தளத்தின் அனைத்துக் கட்டுரைகளும், புதியவை முதலில்.`,
  exploreColumnLabel: 'ஆராயுங்கள்',
  rssFeedLabel: 'RSS ஊட்டம்',
  languageKickerLabel: 'மொழி',
  languageSwitcherLabel: 'மொழிகள்',
  languageChipsLabel: 'கிடைக்கும் மொழிகள்',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication} தளத்தில் ${language} மொழியில் ${count} கட்டுரைகள்.`,
  postRemovedHeading: 'இந்த இடுகை நீக்கப்பட்டது',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `இது ${date} அன்று நீக்கப்பட்டது.`,
  postRemovedHomeLabel: 'முகப்புப் பக்கத்திற்குச் செல்',
  versionPageHeading: 'தளப் பதிப்பு',
  versionTemplateLabel: 'டெம்ப்ளேட்',
  versionThemeLabel: 'தீம்',
  versionSchemasLabel: 'ஸ்கீமாக்கள்',
  versionToolchainLabel: 'வெளியீட்டுக் கருவித்தொடர்',
  versionCommitLabel: 'மூலக் கமிட்',
  versionBuiltAtLabel: 'உருவாக்கிய நேரம்',
  listenNavLabel: 'கேளுங்கள்',
  listenNavCurrentLabel: 'இந்தப் பதிவைக் கேளுங்கள்',
  listenInviteTitle: 'கைகள் வேலையில் உள்ளனவா? கேளுங்கள்.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `இந்தப் பதிவு ${minutes} நிமிட உரையாடலாகவும் உள்ளது. பயணம், உடற்பயிற்சி அல்லது பாத்திரம் கழுவும்போது ஏற்றது.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `இந்தப் பதிவு ${minutes} நிமிட ஒலிவடிவ வாசிப்பாகவும் உள்ளது. பயணம், உடற்பயிற்சி அல்லது பாத்திரம் கழுவும்போது ஏற்றது.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `இந்தப் பதிவு ${minutes} நிமிட விவாதமாகவும் உள்ளது. பயணம், உடற்பயிற்சி அல்லது பாத்திரம் கழுவும்போது ஏற்றது.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `இந்தப் பதிவு ${minutes} நிமிட சிறு நாடகமாகவும் உள்ளது. பயணம், உடற்பயிற்சி அல்லது பாத்திரம் கழுவும்போது ஏற்றது.`,
  listenInvitePlayLabel: 'இயக்கு',
  listenInviteDeclineLabel: 'வேண்டாம், நன்றி',
  listenInviteNote: 'AI குரல்கள், இந்தப் பதிவிலிருந்து தழுவப்பட்டவை.',
  listenInviteCloseLabel: 'இப்போதைக்கு மூடு',
  listenPlayerRegionLabel: 'ஆடியோ பிளேயர்',
  listenPlayerNowPlayingLabel: 'இப்போது இயங்குகிறது',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${count} இல் ${index}`,
  listenPlayerPlayLabel: 'இயக்கு',
  listenPlayerPauseLabel: 'இடைநிறுத்து',
  listenPlayerBackLabel: '15 விநாடி பின்னே',
  listenPlayerPreviousLabel: 'முந்தைய அத்தியாயம்',
  listenPlayerNextLabel: 'அடுத்த அத்தியாயம்',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `இயக்க வேகம் ${rate}×`,
  listenPlayerSeekLabel: 'நிலை',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${total} இல் ${elapsed}`,
  listenPlayerCloseLabel: 'நிறுத்தி மூடு',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `இயங்குகிறது: ${title}`,
  listenListHeading: 'இந்த வலைப்பதிவைக் கேளுங்கள்',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) =>
    `${count} அத்தியாயங்கள் · ${duration}`,
  listenListPlayAllLabel: 'அனைத்தையும் இயக்கு',
  listenListShuffleLabel: 'கலக்கு',
  listenListOrderLabel: 'வரிசை',
  listenListNewestLabel: 'புதியவை முதலில்',
  listenListOldestLabel: 'பழையவை முதலில்',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `அனைத்தையும் காட்டு (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `${title} ஐ இயக்கு`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} நிமிடம்`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) =>
    `${hours} மணி ${minutes} நிமிடம்`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('ta', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
