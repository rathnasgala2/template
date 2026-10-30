/**
 * Chrome message catalog for the `te` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'కంటెంట్‌కు వెళ్లండి',
  homeLinkLabel: 'హోమ్',
  primaryNavigationLabel: 'ప్రధాన',
  footerNavigationLabel: 'ఫుటర్',
  breadcrumbNavigationLabel: 'బ్రెడ్‌క్రంబ్',
  paginationNavigationLabel: 'పేజీలు',
  previousPageLabel: 'మునుపటి',
  nextPageLabel: 'తదుపరి',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `పేజీ ${current} / ${total}`,
  authorsSectionLabel: 'రచయితలు',
  tagsSectionLabel: 'ట్యాగ్‌లు',
  seriesSectionLabel: 'సిరీస్',
  archiveSectionLabel: 'ఆర్కైవ్',
  indexHeading: 'అన్ని వ్యాసాలు',
  authorsIndexLabel: 'రచయితలు',
  tagIndexLabelPrefix: 'ట్యాగ్:',
  seriesIndexLabelPrefix: 'సిరీస్:',
  archiveYearLabelPrefix: 'ఆర్కైవ్:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName} గురించి`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `రచన: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, కొత్త ట్యాబ్‌లో తెరుచుకుంటుంది',
  footerLegalLabel: 'చట్టపరమైన',
  termsLinkLabel: 'నిబంధనలు',
  privacyLinkLabel: 'గోప్యత',
  consentRegionLabel: 'గోప్యతా ఎంపికలు',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `పాఠకులను అర్థం చేసుకోవడానికి ఈ సైట్ ${providerName} ను ఉపయోగించాలనుకుంటోంది. మీరు అంగీకరించే వరకు ఏదీ లోడ్ కాదు, మీ ఎంపికను ఎప్పుడైనా ఫుటర్ నుండి మార్చవచ్చు.`,
  consentAcceptLabel: 'అనలిటిక్స్ అంగీకరించండి',
  consentDeclineLabel: 'తిరస్కరించండి',
  consentOpenLabel: 'గోప్యతా ఎంపికలు',
  errorPageHeading: 'పేజీ కనుగొనబడలేదు',
  errorPageBody:
    'మీరు వెతుకుతున్న పేజీ కనుగొనబడలేదు. దాన్ని తరలించి ఉండవచ్చు, పేరు మార్చి ఉండవచ్చు లేదా తొలగించి ఉండవచ్చు.',
  errorPageReturnHomeLabel: 'హోమ్ పేజీకి తిరిగి వెళ్లండి',
  appearanceControlLabel: 'రూపం',
  appearanceModeLightLabel: 'లైట్',
  appearanceModeDarkLabel: 'డార్క్',
  appearanceModeSystemLabel: 'సిస్టమ్',
  searchButtonLabel: 'వెతకండి',
  searchButtonAriaLabel: 'వ్యాసాలను వెతకండి',
  searchPlaceholderLabel: 'ప్రచురణలో వెతకండి',
  searchEmptyLabel: 'మీ శోధనకు సరిపడే వ్యాసాలు లేవు.',
  searchUnavailableLabel: 'శోధన ప్రస్తుతం అందుబాటులో లేదు.',
  copyCodeLabel: 'కాపీ చేయండి',
  copiedLabel: 'కాపీ అయింది',
  linkCopiedLabel: 'లింక్ కాపీ అయింది.',
  copyBlockedLabel:
    'ఇక్కడ కాపీ చేయడం నిరోధించబడింది. చిరునామాను మీ బ్రౌజర్ నుండి కాపీ చేయండి.',
  codeSelectedLabel:
    'కోడ్ ఎంచుకోబడింది. కాపీ చేయడానికి Ctrl C లేదా Command C నొక్కండి.',
  savedLabel: 'తర్వాత కోసం సేవ్ చేయబడింది.',
  unsavedLabel: 'సేవ్ చేసిన వ్యాసాల నుండి తొలగించబడింది.',
  menuSummaryLabel: 'మెనూ',
  featuredLabel: 'ప్రత్యేకం',
  readEssayLabel: 'వ్యాసం చదవండి',
  latestHeading: 'తాజావి',
  moreArticlesHeading: 'మరిన్ని వ్యాసాలు',
  browseByTagLabel: 'ట్యాగ్ వారీగా చూడండి',
  seriesCardLabel: 'సిరీస్',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} భాగాలు`,
  startSeriesLabel: 'భాగం 1 నుండి ప్రారంభించండి',
  newsletterLabel: 'న్యూస్‌లెటర్',
  newsletterActionLabel: 'సబ్‌స్క్రైబ్ చేయండి',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} నిమిషాల పఠనం`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `భాగం ${part} / ${total}`,
  onThisPageLabel: 'ఈ పేజీలో',
  writtenByLabel: 'రచయిత',
  aboutTheAuthorLabel: 'రచయిత గురించి',
  youAreHereLabel: 'మీరు ఇక్కడ ఉన్నారు',
  newerArticleLabel: 'కొత్తది',
  olderArticleLabel: 'పాతది',
  moreArticlesNavigationLabel: 'మరిన్ని వ్యాసాలు',
  keepReadingHeading: 'చదువుతూ ఉండండి',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `${tag} లో మరిన్ని`,
  interactionsHeading: 'స్పందనలు',
  reactionsGroupLabel: 'రియాక్షన్‌లు',
  likeLabel: 'ఇష్టం',
  commentsHeading: 'చర్చ',
  interactionsNeedScriptNotice: 'రియాక్షన్‌లు, వ్యాఖ్యలకు JavaScript అవసరం.',
  showMoreCommentsLabel: 'మరిన్ని వ్యాఖ్యలు చూపండి',
  shareLabel: 'షేర్ చేయండి',
  copyLinkLabel: 'ఈ వ్యాసం లింక్ కాపీ చేయండి',
  saveForLaterLabel: 'తర్వాత కోసం సేవ్ చేయండి',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `${network} లో షేర్ చేయండి`,
  shareByEmailLabel: 'ఇమెయిల్ ద్వారా షేర్ చేయండి',
  shareNativeLabel: 'ఈ వ్యాసాన్ని షేర్ చేయండి',
  followLabel: 'ఫాలో చేయండి',
  followingLabel: 'ఫాలో అవుతున్నారు',
  unfollowLabel: 'అన్‌ఫాలో చేయండి',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name} ను ఫాలో చేయండి`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name} ను అన్‌ఫాలో చేయండి`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `మీరు ఇప్పుడు ${name} ను ఫాలో అవుతున్నారు.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `మీరు ఇకపై ${name} ను ఫాలో అవ్వడం లేదు.`,
  followDisabledMessage: 'ఈ సైట్‌లో ప్రస్తుతం ఫాలో చేయడం అందుబాటులో లేదు.',
  followAuthorMissingMessage: 'ఈ రచయితను ప్రస్తుతం ఫాలో చేయడం సాధ్యం కాదు.',
  audienceNetworkError: 'Galascribe ను చేరుకోలేకపోయాం. మళ్లీ ప్రయత్నించండి.',
  audienceRateLimited:
    'చాలా ప్రయత్నాలు జరిగాయి. కొంత సేపటి తర్వాత మళ్లీ ప్రయత్నించండి.',
  audienceGenericError: 'ఏదో తప్పు జరిగింది. మళ్లీ ప్రయత్నించండి.',
  audienceStorageBlocked:
    'సైన్ ఇన్ కోసం ఈ సైట్‌కు అవసరమైన నిల్వను మీ బ్రౌజర్ నిరోధించింది.',
  audienceSignInUnsupported: 'ఈ బ్రౌజర్ ఈ పేజీలో సైన్ ఇన్ చేయలేదు.',
  audienceSignInFailed: 'సైన్ ఇన్ పూర్తి కాలేదు. మళ్లీ ప్రయత్నించండి.',
  audienceSignInInvalid:
    'ఆ సైన్ ఇన్ లింక్ చెల్లుబాటు కాలేదు. మళ్లీ ప్రయత్నించండి.',
  honeypotLabel: 'ఈ ఫీల్డ్‌ను ఖాళీగా ఉంచండి',
  fieldRequiredMessage: 'ఈ ఫీల్డ్ అవసరం.',
  fieldInvalidMessage: 'ఈ ఫీల్డ్‌ను తనిఖీ చేయండి.',
  newsletterEmailLabel: 'ఇమెయిల్ చిరునామా',
  newsletterCheckInbox: 'నిర్ధారించడానికి మీ ఇన్‌బాక్స్ చూడండి',
  newsletterFullMessage:
    'ఈ న్యూస్‌లెటర్ ప్రస్తుతం కొత్త సబ్‌స్క్రైబర్లను తీసుకోవడం లేదు.',
  newsletterEmailInvalid: 'చెల్లుబాటు అయ్యే ఇమెయిల్ చిరునామా నమోదు చేయండి.',
  contactLinkLabel: 'సంప్రదించండి',
  contactPageTitle: 'సంప్రదించండి',
  contactDefaultIntro:
    'ప్రశ్న లేదా చెప్పాలనుకున్నది ఉందా? సందేశం పంపండి, రచయిత ఇమెయిల్ ద్వారా సమాధానం ఇస్తారు.',
  contactNameLabel: 'పేరు',
  contactEmailLabel: 'ఇమెయిల్',
  contactMessageLabel: 'సందేశం',
  contactWebsiteLabel: 'వెబ్‌సైట్ (ఐచ్ఛికం)',
  contactPhoneLabel: 'ఫోన్ (ఐచ్ఛికం)',
  contactSubmitLabel: 'సందేశం పంపండి',
  contactNoscript:
    'ఈ ఫారమ్‌కు JavaScript అవసరం. సందేశం పంపడానికి దాన్ని ఆన్ చేయండి.',
  contactSent: 'ధన్యవాదాలు, మీ సందేశం పంపబడింది.',
  contactUnavailable: 'ఈ ఫారమ్ ప్రస్తుతం సందేశాలను స్వీకరించడం లేదు.',
  contactRateLimited:
    'ఇక్కడ నుండి చాలా సందేశాలు వచ్చాయి. తర్వాత మళ్లీ ప్రయత్నించండి.',
  contactMessageLinks: 'మీ సందేశంలో గరిష్టంగా రెండు లింక్‌లు ఉండవచ్చు.',
  tagListLabel: 'ట్యాగ్‌లు',
  tagKickerLabel: 'ట్యాగ్',
  seriesKickerLabel: 'సిరీస్',
  archiveKickerLabel: 'ఆర్కైవ్',
  authorKickerLabel: 'రచయిత',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} వ్యాసాలు`,
  emptyListingLabel: 'ఇంకా వ్యాసాలు లేవు.',
  editionsNavigationLabel: 'సంచికలు',
  editionOriginalLabel: 'అసలు',
  editionQuickReadLabel: 'త్వరిత పఠనం',
  editionStandardLabel: 'ప్రామాణికం',
  editionDeepDiveLabel: 'లోతైన పఠనం',
  editionNoticeLabel:
    'రూపొందించిన సంచిక, రచయిత సమీక్షించారు; అసలు వ్యాసమే ప్రమాణం',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'పరిచయం',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `నవీకరించబడింది: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `“${tag}” ట్యాగ్ ఉన్న వ్యాసాలు`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication} లో ${tag} ట్యాగ్ ఉన్న ${count} వ్యాసాలు.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, ${publication} లోని ${count} భాగాల సిరీస్.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `ఆర్కైవ్ ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication} లో ${year} లో ప్రచురితమైన ${count} వ్యాసాలు.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${publication} లో ${name} రాసిన వ్యాసాలు.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `${publication} లో కవర్ చేసిన ${count} అంశాలను చూడండి.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `${publication} లో ప్రచురితమైన ${count} సిరీస్‌లను చూడండి.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication} లోని అన్ని వ్యాసాలు, మొత్తం ${count}, సంవత్సరం వారీగా.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `${publication} లోని అన్ని వ్యాసాలు, కొత్తవి ముందు.`,
  exploreColumnLabel: 'అన్వేషించండి',
  rssFeedLabel: 'RSS ఫీడ్',
  languageKickerLabel: 'భాష',
  languageSwitcherLabel: 'భాషలు',
  languageChipsLabel: 'అందుబాటులో ఉన్న భాషలు',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication} లో ${language} భాషలో ${count} వ్యాసాలు.`,
  postRemovedHeading: 'ఈ పోస్ట్ తొలగించబడింది',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `దీన్ని ${date} న తొలగించారు.`,
  postRemovedHomeLabel: 'హోమ్ పేజీకి వెళ్లండి',
  versionPageHeading: 'సైట్ వెర్షన్',
  versionTemplateLabel: 'టెంప్లేట్',
  versionThemeLabel: 'థీమ్',
  versionSchemasLabel: 'స్కీమాలు',
  versionToolchainLabel: 'పబ్లిష్ టూల్‌చెయిన్',
  versionCommitLabel: 'సోర్స్ కమిట్',
  versionBuiltAtLabel: 'నిర్మించిన సమయం',
  listenNavLabel: 'వినండి',
  listenNavCurrentLabel: 'ఈ వ్యాసాన్ని వినండి',
  listenInviteTitle: 'చేతులు బిజీగా ఉన్నాయా? బదులుగా వినండి.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `ఈ వ్యాసం ${minutes} నిమిషాల సంభాషణగా కూడా ఉంది. ప్రయాణం, వ్యాయామం లేదా గిన్నెలు కడిగేటప్పుడు బాగుంటుంది.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `ఈ వ్యాసం ${minutes} నిమిషాల పఠనంగా కూడా ఉంది. ప్రయాణం, వ్యాయామం లేదా గిన్నెలు కడిగేటప్పుడు బాగుంటుంది.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `ఈ వ్యాసం ${minutes} నిమిషాల చర్చగా కూడా ఉంది. ప్రయాణం, వ్యాయామం లేదా గిన్నెలు కడిగేటప్పుడు బాగుంటుంది.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `ఈ వ్యాసం ${minutes} నిమిషాల స్కిట్‌గా కూడా ఉంది. ప్రయాణం, వ్యాయామం లేదా గిన్నెలు కడిగేటప్పుడు బాగుంటుంది.`,
  listenInvitePlayLabel: 'ప్లే చేయండి',
  listenInviteDeclineLabel: 'వద్దు, ధన్యవాదాలు',
  listenInviteNote: 'AI స్వరాలు, ఈ వ్యాసం ఆధారంగా రూపొందించినవి.',
  listenInviteCloseLabel: 'ప్రస్తుతానికి మూసివేయండి',
  listenPlayerRegionLabel: 'ఆడియో ప్లేయర్',
  listenPlayerNowPlayingLabel: 'ఇప్పుడు ప్లే అవుతోంది',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${count} లో ${index}`,
  listenPlayerPlayLabel: 'ప్లే',
  listenPlayerPauseLabel: 'పాజ్',
  listenPlayerBackLabel: '15 సెకన్లు వెనక్కి',
  listenPlayerPreviousLabel: 'మునుపటి ఎపిసోడ్',
  listenPlayerNextLabel: 'తదుపరి ఎపిసోడ్',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `ప్లేబ్యాక్ వేగం ${rate}×`,
  listenPlayerSeekLabel: 'స్థానం',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${total} లో ${elapsed}`,
  listenPlayerCloseLabel: 'ఆపి మూసివేయండి',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `ప్లే అవుతోంది: ${title}`,
  listenListHeading: 'ఈ బ్లాగ్‌ను వినండి',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count} ఎపిసోడ్లు · ${duration}`,
  listenListPlayAllLabel: 'అన్నీ ప్లే చేయండి',
  listenListShuffleLabel: 'షఫుల్',
  listenListOrderLabel: 'క్రమం',
  listenListNewestLabel: 'కొత్తవి మొదట',
  listenListOldestLabel: 'పాతవి మొదట',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `అన్ని ${count} చూపించు`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `${title} ప్లే చేయండి`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} నిమి`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} గం ${minutes} నిమి`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('te', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
