/**
 * Chrome message catalog for the `lv` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Pāriet uz saturu',
  homeLinkLabel: 'Sākums',
  primaryNavigationLabel: 'Galvenā izvēlne',
  footerNavigationLabel: 'Kājene',
  breadcrumbNavigationLabel: 'Ceļš',
  paginationNavigationLabel: 'Lappušu pārlūkošana',
  previousPageLabel: 'Iepriekšējā',
  nextPageLabel: 'Nākamā',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `${current}. lappuse no ${total}`,
  authorsSectionLabel: 'Autori',
  tagsSectionLabel: 'Birkas',
  seriesSectionLabel: 'Sērijas',
  archiveSectionLabel: 'Arhīvs',
  indexHeading: 'Visi raksti',
  authorsIndexLabel: 'Autori',
  tagIndexLabelPrefix: 'Birka:',
  seriesIndexLabelPrefix: 'Sērija:',
  archiveYearLabelPrefix: 'Arhīvs:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Par autoru ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Autors: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, atveras jaunā cilnē',
  footerLegalLabel: 'Juridiskā informācija',
  termsLinkLabel: 'Noteikumi',
  privacyLinkLabel: 'Privātums',
  consentRegionLabel: 'Privātuma izvēles',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Šī vietne vēlētos izmantot ${providerName}, lai izprastu lasītājus. Nekas netiek ielādēts, kamēr nepiekrītat, un izvēli varat jebkurā brīdī mainīt kājenē.`,
  consentAcceptLabel: 'Piekrist analītikai',
  consentDeclineLabel: 'Noraidīt',
  consentOpenLabel: 'Privātuma izvēles',
  errorPageHeading: 'Lapa nav atrasta',
  errorPageBody:
    'Meklētā lapa netika atrasta. Iespējams, tā ir pārvietota, pārdēvēta vai noņemta.',
  errorPageReturnHomeLabel: 'Atpakaļ uz sākumlapu',
  appearanceControlLabel: 'Izskats',
  appearanceModeLightLabel: 'Gaišs',
  appearanceModeDarkLabel: 'Tumšs',
  appearanceModeSystemLabel: 'Sistēmas',
  searchButtonLabel: 'Meklēt',
  searchButtonAriaLabel: 'Meklēt rakstos',
  searchPlaceholderLabel: 'Meklēt izdevumā',
  searchEmptyLabel: 'Meklējumam neatbilst neviens raksts.',
  searchUnavailableLabel: 'Meklēšana pašlaik nav pieejama.',
  copyCodeLabel: 'Kopēt',
  copiedLabel: 'Nokopēts',
  linkCopiedLabel: 'Saite nokopēta.',
  copyBlockedLabel: 'Kopēšana šeit ir bloķēta. Nokopējiet adresi no pārlūka.',
  codeSelectedLabel:
    'Kods atlasīts. Nospiediet Ctrl C vai Command C, lai kopētu.',
  savedLabel: 'Saglabāts vēlākam.',
  unsavedLabel: 'Noņemts no saglabātajiem rakstiem.',
  menuSummaryLabel: 'Izvēlne',
  featuredLabel: 'Izceltais',
  readEssayLabel: 'Lasīt eseju',
  latestHeading: 'Jaunākie',
  moreArticlesHeading: 'Vairāk rakstu',
  browseByTagLabel: 'Pārlūkot pēc birkām',
  seriesCardLabel: 'Sērija',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`Daļas: ${count}`}`,
  startSeriesLabel: 'Sākt ar 1. daļu',
  newsletterLabel: 'Jaunumu vēstule',
  newsletterActionLabel: 'Abonēt',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `Lasīšanas laiks: ${minutes} min`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `${part}. daļa no ${total}`,
  onThisPageLabel: 'Šajā lapā',
  writtenByLabel: 'Autors',
  aboutTheAuthorLabel: 'Par autoru',
  youAreHereLabel: 'Jūs esat šeit',
  newerArticleLabel: 'Jaunāks',
  olderArticleLabel: 'Vecāks',
  moreArticlesNavigationLabel: 'Vairāk rakstu',
  keepReadingHeading: 'Lasiet tālāk',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Vairāk: ${tag}`,
  interactionsHeading: 'Atsauksmes',
  reactionsGroupLabel: 'Reakcijas',
  likeLabel: 'Patīk',
  commentsHeading: 'Saruna',
  interactionsNeedScriptNotice:
    'Reakcijām un komentāriem nepieciešams JavaScript.',
  showMoreCommentsLabel: 'Rādīt vairāk komentāru',
  shareLabel: 'Dalīties',
  copyLinkLabel: 'Kopēt raksta saiti',
  saveForLaterLabel: 'Saglabāt vēlākam',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Dalīties vietnē ${network}`,
  shareByEmailLabel: 'Dalīties e-pastā',
  shareNativeLabel: 'Dalīties ar šo rakstu',
  followLabel: 'Sekot',
  followingLabel: 'Sekojat',
  unfollowLabel: 'Pārstāt sekot',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Sekot: ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Pārstāt sekot: ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Tagad sekojat: ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Vairs nesekojat: ${name}.`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `Sekotāji: ${count}`,
  followersTeamHint: 'To redz tikai jūsu vietnes komanda',
  followDisabledMessage: 'Sekošana šajā vietnē pašlaik nav pieejama.',
  followAuthorMissingMessage: 'Šim autoram pašlaik nevar sekot.',
  audienceNetworkError: 'Neizdevās sazināties ar Galascribe. Mēģiniet vēlreiz.',
  audienceRateLimited: 'Pārāk daudz mēģinājumu. Mēģiniet vēlreiz pēc brīža.',
  audienceGenericError: 'Kaut kas nogāja greizi. Mēģiniet vēlreiz.',
  audienceStorageBlocked:
    'Pārlūks bloķēja krātuvi, kas vietnei nepieciešama pieteikšanai.',
  audienceSignInUnsupported: 'Šis pārlūks nevar jūs pieteikt šajā lapā.',
  audienceSignInFailed: 'Pieteikšanās netika pabeigta. Mēģiniet vēlreiz.',
  audienceSignInInvalid: 'Pieteikšanās saite nebija derīga. Mēģiniet vēlreiz.',
  honeypotLabel: 'Atstājiet šo lauku tukšu',
  fieldRequiredMessage: 'Šis lauks ir obligāts.',
  fieldInvalidMessage: 'Pārbaudiet šo lauku.',
  newsletterEmailLabel: 'E-pasta adrese',
  newsletterCheckInbox: 'Apstiprināšanai pārbaudiet savu pastkasti',
  newsletterFullMessage:
    'Šī jaunumu vēstule pašlaik nepieņem jaunus abonentus.',
  newsletterEmailInvalid: 'Ievadiet derīgu e-pasta adresi.',
  contactLinkLabel: 'Kontakti',
  contactPageTitle: 'Kontakti',
  contactDefaultIntro:
    'Vai jums ir jautājums vai kas sakāms? Nosūtiet ziņu, un autors atbildēs pa e-pastu.',
  contactNameLabel: 'Vārds',
  contactEmailLabel: 'E-pasts',
  contactMessageLabel: 'Ziņa',
  contactWebsiteLabel: 'Vietne (neobligāti)',
  contactPhoneLabel: 'Tālrunis (neobligāti)',
  contactSubmitLabel: 'Sūtīt ziņu',
  contactNoscript:
    'Šai veidlapai nepieciešams JavaScript. Ieslēdziet to, lai nosūtītu ziņu.',
  contactSent: 'Paldies, jūsu ziņa ir nosūtīta.',
  contactUnavailable: 'Šī veidlapa pašlaik nepieņem ziņas.',
  contactRateLimited: 'No šejienes ir pārāk daudz ziņu. Mēģiniet vēlāk.',
  contactMessageLinks: 'Ziņā drīkst būt ne vairāk kā divas saites.',
  tagListLabel: 'Birkas',
  tagKickerLabel: 'Birka',
  seriesKickerLabel: 'Sērija',
  archiveKickerLabel: 'Arhīvs',
  authorKickerLabel: 'Autors',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`Raksti: ${count}`}`,
  emptyListingLabel: 'Rakstu vēl nav.',
  editionsNavigationLabel: 'Izdevumi',
  editionOriginalLabel: 'Oriģināls',
  editionQuickReadLabel: 'Ātrā lasāmviela',
  editionStandardLabel: 'Standarta',
  editionDeepDiveLabel: 'Padziļināti',
  editionNoticeLabel:
    'Ģenerēts izdevums, ko pārskatījis autors; noteicošais ir oriģināls',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Par mums',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Atjaunināts ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Ieraksti ar birku „${tag}”`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `Birka ${tag} vietnē ${publication}. ${`Raksti: ${count}`}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, sērija vietnē ${publication}. ${`Daļas: ${count}`}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arhīvs ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `Publicēts ${year}. gadā vietnē ${publication}. ${`Raksti: ${count}`}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Autora ${name} raksti vietnē ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Pārlūkojiet tēmas vietnē ${publication}. Kopā: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Pārlūkojiet sērijas vietnē ${publication}. Kopā: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Visi raksti vietnē ${publication} pa gadiem. Kopā: ${count}.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Visi raksti vietnē ${publication}, jaunākie vispirms.`,
  exploreColumnLabel: 'Izpētīt',
  rssFeedLabel: 'RSS plūsma',
  languageKickerLabel: 'Valoda',
  languageSwitcherLabel: 'Valodas',
  languageChipsLabel: 'Pieejamās valodas',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `Valoda: ${language}, ${publication}. ${`Raksti: ${count}`}.`,
  postRemovedHeading: 'Šis ieraksts ir noņemts',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Tas tika noņemts ${date}.`,
  postRemovedHomeLabel: 'Doties uz sākumlapu',
  versionPageHeading: 'Vietnes versija',
  versionTemplateLabel: 'Veidne',
  versionThemeLabel: 'Motīvs',
  versionSchemasLabel: 'Shēmas',
  versionToolchainLabel: 'Publicēšanas rīki',
  versionCommitLabel: 'Avota commit',
  versionBuiltAtLabel: 'Izveidots',
  listenNavLabel: 'Klausīties',
  listenNavCurrentLabel: 'Klausīties šo ierakstu',
  listenInviteTitle: 'Rokas aizņemtas? Labāk paklausies.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Šim ierakstam ir arī sarunas versija, ${minutes} min. Der braucienam, treniņam vai trauku mazgāšanai.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Šim ierakstam ir arī ierunāta versija, ${minutes} min. Der braucienam, treniņam vai trauku mazgāšanai.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Šim ierakstam ir arī diskusijas versija, ${minutes} min. Der braucienam, treniņam vai trauku mazgāšanai.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Šim ierakstam ir arī skeča versija, ${minutes} min. Der braucienam, treniņam vai trauku mazgāšanai.`,
  listenInvitePlayLabel: 'Atskaņot',
  listenInviteDeclineLabel: 'Nē, paldies',
  listenInviteNote: 'MI balsis, pielāgots pēc šī ieraksta.',
  listenInviteCloseLabel: 'Aizvērt pagaidām',
  listenPlayerRegionLabel: 'Audio atskaņotājs',
  listenPlayerNowPlayingLabel: 'Tagad skan',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} no ${count}`,
  listenPlayerPlayLabel: 'Atskaņot',
  listenPlayerPauseLabel: 'Pauze',
  listenPlayerBackLabel: '15 sekundes atpakaļ',
  listenPlayerPreviousLabel: 'Iepriekšējā epizode',
  listenPlayerNextLabel: 'Nākamā epizode',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Atskaņošanas ātrums ${rate}×`,
  listenPlayerSeekLabel: 'Pozīcija',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} no ${total}`,
  listenPlayerCloseLabel: 'Apturēt un aizvērt',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Tagad skan: ${title}`,
  listenListHeading: 'Klausīties šo emuāru',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `Epizodes: ${count} · ${duration}`,
  listenListPlayAllLabel: 'Atskaņot visu',
  listenListShuffleLabel: 'Jaukti',
  listenListOrderLabel: 'Secība',
  listenListNewestLabel: 'Jaunākie vispirms',
  listenListOldestLabel: 'Vecākie vispirms',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Rādīt visus (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Atskaņot: ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} h ${minutes} min`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('lv', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
