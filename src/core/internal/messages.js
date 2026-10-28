/**
 * Core-owned chrome message catalog: every user-visible chrome string comes
 * from a message catalog, not an inline literal, so localization can find
 * them.
 *
 * Every user-visible string this package's own generated chrome (skip link,
 * navigation labels, breadcrumb labels, pagination controls, generated
 * listing-page headings, the error page kind, the Light/Dark/System
 * appearance control's label and its three option labels) emits is looked
 * up here by key
 * rather than written inline at its call site. This renderer authors
 * exactly one catalog, `en` (the only language the golden fixture's own
 * core chrome is required to exercise); per-content localization of
 * *authored* content is
 * `publication`/`content` data, not core chrome, and full chrome
 * localization (additional catalogs, a locale-selection policy) is future
 * work this module is shaped to admit without changing any call site: every
 * lookup already goes through {@link getMessages}, keyed by a BCP-47 tag,
 * with a fixed fallback to `en` for a tag this catalog does not carry.
 *
 * @type {Readonly<Record<string, Readonly<Record<string, string | ((...args: string[]) => string)>>>>}
 */
const CATALOGS = Object.freeze({
  en: Object.freeze({
    skipToContent: 'Skip to content',
    homeLinkLabel: 'Home',
    primaryNavigationLabel: 'Primary',
    footerNavigationLabel: 'Footer',
    breadcrumbNavigationLabel: 'Breadcrumb',
    paginationNavigationLabel: 'Pagination',
    previousPageLabel: 'Previous',
    nextPageLabel: 'Next',
    /** @type {(current: string, total: string) => string} */
    pageStatusLabel: (current, total) => `Page ${current} of ${total}`,
    authorsSectionLabel: 'Authors',
    tagsSectionLabel: 'Tags',
    seriesSectionLabel: 'Series',
    archiveSectionLabel: 'Archive',
    indexHeading: 'All articles',
    authorsIndexLabel: 'Authors',
    tagIndexLabelPrefix: 'Tag:',
    seriesIndexLabelPrefix: 'Series:',
    archiveYearLabelPrefix: 'Archive:',
    /** @type {(displayName: string) => string} */
    aboutAuthorHeading: (displayName) => `About ${displayName}`,
    /** @type {(displayName: string) => string} */
    byLineLabel: (displayName) => `By ${displayName}`,
    footerCopyrightPrefix: '©',
    footerAttributionLabel: 'Galascribe',
    footerAttributionAriaLabel: 'Galascribe, opens in a new tab',
    footerLegalLabel: 'Legal',
    termsLinkLabel: 'Terms',
    privacyLinkLabel: 'Privacy',
    consentRegionLabel: 'Privacy choices',
    /** @type {(providerName: string) => string} */
    consentText: (providerName) =>
      `This site would like to use ${providerName} to understand readership. ` +
      'Nothing is loaded until you accept, and you can change your choice any ' +
      'time from the footer.',
    consentAcceptLabel: 'Accept analytics',
    consentDeclineLabel: 'Decline',
    consentOpenLabel: 'Privacy choices',
    errorPageHeading: 'Page not found',
    errorPageBody:
      'The page you were looking for could not be found. It may have been ' +
      'moved, renamed or removed.',
    errorPageReturnHomeLabel: 'Return to the home page',
    appearanceControlLabel: 'Appearance',
    appearanceModeLightLabel: 'Light',
    appearanceModeDarkLabel: 'Dark',
    appearanceModeSystemLabel: 'System',
    searchButtonLabel: 'Search',
    searchButtonAriaLabel: 'Search articles',
    searchPlaceholderLabel: 'Search the publication',
    searchEmptyLabel: 'No articles match your search.',
    searchUnavailableLabel: 'Search is unavailable right now.',
    copyCodeLabel: 'Copy',
    copiedLabel: 'Copied',
    linkCopiedLabel: 'Link copied.',
    copyBlockedLabel:
      'Copying is blocked here. Copy the address from your browser.',
    codeSelectedLabel: 'Code selected. Press Ctrl C or Command C to copy.',
    savedLabel: 'Saved for later.',
    unsavedLabel: 'Removed from saved articles.',
    menuSummaryLabel: 'Menu',
    featuredLabel: 'Featured',
    readEssayLabel: 'Read the essay',
    latestHeading: 'Latest',
    moreArticlesHeading: 'More articles',
    browseByTagLabel: 'Browse by tag',
    seriesCardLabel: 'Series',
    /** @type {(count: string) => string} */
    partsCountLabel: (count) => (count === '1' ? '1 part' : `${count} parts`),
    startSeriesLabel: 'Start with part 1',
    newsletterLabel: 'Newsletter',
    newsletterActionLabel: 'Subscribe',
    /** @type {(minutes: string) => string} */
    readingTimeLabel: (minutes) => `${minutes} min read`,
    /** @type {(part: string, total: string) => string} */
    seriesPartLabel: (part, total) => `Part ${part} of ${total}`,
    onThisPageLabel: 'On this page',
    writtenByLabel: 'Written by',
    aboutTheAuthorLabel: 'About the author',
    youAreHereLabel: 'You are here',
    newerArticleLabel: 'Newer',
    olderArticleLabel: 'Older',
    moreArticlesNavigationLabel: 'More articles',
    keepReadingHeading: 'Keep reading',
    /** @type {(tag: string) => string} */
    moreInTagLabel: (tag) => `More in ${tag}`,
    interactionsHeading: 'Responses',
    reactionsGroupLabel: 'Reactions',
    likeLabel: 'Like',
    commentsHeading: 'Conversation',
    interactionsNeedScriptNotice: 'Reactions and comments need JavaScript.',
    showMoreCommentsLabel: 'Show more comments',
    shareLabel: 'Share',
    copyLinkLabel: 'Copy link to this article',
    saveForLaterLabel: 'Save for later',
    /** @type {(network: string) => string} */
    shareOnLabel: (network) => `Share on ${network}`,
    shareByEmailLabel: 'Share by email',
    shareNativeLabel: 'Share this article',
    followLabel: 'Follow',
    followingLabel: 'Following',
    unfollowLabel: 'Unfollow',
    /** @type {(name: string) => string} */
    followAriaLabel: (name) => `Follow ${name}`,
    /** @type {(name: string) => string} */
    unfollowAriaLabel: (name) => `Unfollow ${name}`,
    /** @type {(name: string) => string} */
    followedAnnouncement: (name) => `You now follow ${name}.`,
    /** @type {(name: string) => string} */
    unfollowedAnnouncement: (name) => `You no longer follow ${name}.`,
    followDisabledMessage: "Following isn't available on this site right now.",
    followAuthorMissingMessage: "This author can't be followed right now.",
    audienceNetworkError: "Couldn't reach Galascribe. Try again.",
    audienceRateLimited: 'Too many attempts. Try again in a moment.',
    audienceGenericError: 'Something went wrong. Try again.',
    audienceStorageBlocked:
      'Your browser blocked storage this site needs to sign you in.',
    audienceSignInUnsupported: "This browser can't sign you in on this page.",
    audienceSignInFailed: "Sign-in didn't complete. Try again.",
    audienceSignInInvalid: "That sign-in link wasn't valid. Try again.",
    honeypotLabel: 'Leave this field empty',
    fieldRequiredMessage: 'This field is required.',
    fieldInvalidMessage: 'Check this field.',
    newsletterEmailLabel: 'Email address',
    newsletterCheckInbox: 'Check your inbox to confirm',
    newsletterFullMessage:
      "This newsletter isn't taking new subscribers right now.",
    newsletterEmailInvalid: 'Enter a valid email address.',
    contactLinkLabel: 'Contact',
    contactPageTitle: 'Contact',
    contactDefaultIntro:
      'Have a question or something to say? Send a message and the author will reply by email.',
    contactNameLabel: 'Name',
    contactEmailLabel: 'Email',
    contactMessageLabel: 'Message',
    contactWebsiteLabel: 'Website (optional)',
    contactPhoneLabel: 'Phone (optional)',
    contactSubmitLabel: 'Send message',
    contactNoscript:
      'This form needs JavaScript. Turn it on to send a message.',
    contactSent: 'Thanks, your message was sent.',
    contactUnavailable: "This form isn't accepting messages right now.",
    contactRateLimited: 'Too many messages from here. Try again later.',
    contactMessageLinks: 'Your message can have at most two links.',
    tagListLabel: 'Tags',
    tagKickerLabel: 'Tag',
    seriesKickerLabel: 'Series',
    archiveKickerLabel: 'Archive',
    authorKickerLabel: 'Author',
    /** @type {(count: string) => string} */
    articleCountLabel: (count) =>
      count === '1' ? '1 article' : `${count} articles`,
    emptyListingLabel: 'No articles yet.',
    editionsNavigationLabel: 'Editions',
    editionOriginalLabel: 'Original',
    editionQuickReadLabel: 'Quick read',
    editionStandardLabel: 'Standard',
    editionDeepDiveLabel: 'Deep dive',
    editionNoticeLabel:
      'Generated edition, reviewed by the author; the original is the reference',
    /** @type {(title: string, edition: string) => string} */
    editionPageTitle: (title, edition) => `${title} (${edition})`,
    aboutPageTitle: 'About',
    /** @type {(date: string) => string} */
    updatedLabel: (date) => `Updated ${date}`,
    /** @type {(tag: string) => string} */
    tagPageTitle: (tag) => `Posts tagged \u201c${tag}\u201d`,
    /** @type {(count: string, tag: string, publication: string) => string} */
    tagPageDescription: (count, tag, publication) =>
      `${count === '1' ? '1 article' : `${count} articles`} tagged ${tag} on ${publication}.`,
    /** @type {(count: string, name: string, publication: string) => string} */
    seriesPageDescription: (count, name, publication) =>
      `${name}, a series of ${count === '1' ? '1 part' : `${count} parts`} on ${publication}.`,
    /** @type {(year: string) => string} */
    archivePageTitle: (year) => `Archive ${year}`,
    /** @type {(count: string, year: string, publication: string) => string} */
    archivePageDescription: (count, year, publication) =>
      `${count === '1' ? '1 article' : `${count} articles`} published in ${year} on ${publication}.`,
    /** @type {(name: string, publication: string) => string} */
    authorPageDescription: (name, publication) =>
      `Articles written by ${name} on ${publication}.`,
    /** @type {(count: string, publication: string) => string} */
    tagsRootDescription: (count, publication) =>
      `Browse the ${count === '1' ? '1 topic' : `${count} topics`} covered on ${publication}.`,
    /** @type {(count: string, publication: string) => string} */
    seriesRootDescription: (count, publication) =>
      `Browse the ${count} series published on ${publication}.`,
    /** @type {(count: string, publication: string) => string} */
    archiveRootDescription: (count, publication) =>
      `Every article on ${publication}, ${count} in all, by year.`,
    /** @type {(publication: string) => string} */
    indexPageDescription: (publication) =>
      `All articles on ${publication}, newest first.`,
    exploreColumnLabel: 'Explore',
    rssFeedLabel: 'RSS feed',
    languageKickerLabel: 'Language',
    languageSwitcherLabel: 'Languages',
    languageChipsLabel: 'Available languages',
    /** @type {(count: string, language: string, publication: string) => string} */
    languageIndexDescription: (count, language, publication) =>
      `${count === '1' ? '1 article' : `${count} articles`} in ${language} on ${publication}.`,
    /** @type {(iso: string) => string} */
    formatDate: (iso) => {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
      if (!match) return iso;
      return `${months[Number(match[2]) - 1]} ${Number(match[3])}, ${match[1]}`;
    },
  }),
  ta: Object.freeze({
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
    followDisabledMessage:
      'இந்தத் தளத்தில் பின்தொடர்தல் தற்போது கிடைக்கவில்லை.',
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
  }),
});

/** @type {string} */
const DEFAULT_LOCALE = 'en';

/**
 * Resolve the message catalog for a BCP-47 language tag, falling back to the
 * default `en` catalog for any tag with no dedicated catalog (currently
 * every tag, since only `en` is authored in S2).
 *
 * @param {string} [bcp47] a language tag (typically
 *   `publication.defaultLanguage` or a per-content `frontmatter.language`)
 * @returns {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 *   the resolved catalog
 */
export function getMessages(bcp47) {
  const primarySubtag = (bcp47 ?? '').split('-')[0]?.toLowerCase() ?? '';
  return CATALOGS[primarySubtag] ?? CATALOGS[DEFAULT_LOCALE];
}
