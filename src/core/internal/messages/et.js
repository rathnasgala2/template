/**
 * Chrome message catalog for the `et` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Mine sisu juurde',
  homeLinkLabel: 'Avaleht',
  primaryNavigationLabel: 'Peamenüü',
  footerNavigationLabel: 'Jalus',
  breadcrumbNavigationLabel: 'Asukoht',
  paginationNavigationLabel: 'Lehekülgede valik',
  previousPageLabel: 'Eelmine',
  nextPageLabel: 'Järgmine',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Lehekülg ${current} / ${total}`,
  authorsSectionLabel: 'Autorid',
  tagsSectionLabel: 'Sildid',
  seriesSectionLabel: 'Sarjad',
  archiveSectionLabel: 'Arhiiv',
  indexHeading: 'Kõik artiklid',
  authorsIndexLabel: 'Autorid',
  tagIndexLabelPrefix: 'Silt:',
  seriesIndexLabelPrefix: 'Sari:',
  archiveYearLabelPrefix: 'Arhiiv:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Autorist ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Autor ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, avaneb uuel vahekaardil',
  footerLegalLabel: 'Õiguslik teave',
  termsLinkLabel: 'Tingimused',
  privacyLinkLabel: 'Privaatsus',
  consentRegionLabel: 'Privaatsusvalikud',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `See sait sooviks kasutada teenust ${providerName}, et mõista lugejaskonda. Midagi ei laadita enne, kui nõustute, ja valikut saab alati jaluses muuta.`,
  consentAcceptLabel: 'Nõustu analüütikaga',
  consentDeclineLabel: 'Keeldu',
  consentOpenLabel: 'Privaatsusvalikud',
  errorPageHeading: 'Lehte ei leitud',
  errorPageBody:
    'Otsitud lehte ei leitud. See võib olla teisaldatud, ümber nimetatud või eemaldatud.',
  errorPageReturnHomeLabel: 'Tagasi avalehele',
  appearanceControlLabel: 'Välimus',
  appearanceModeLightLabel: 'Hele',
  appearanceModeDarkLabel: 'Tume',
  appearanceModeSystemLabel: 'Süsteem',
  searchButtonLabel: 'Otsi',
  searchButtonAriaLabel: 'Otsi artikleid',
  searchPlaceholderLabel: 'Otsi väljaandest',
  searchEmptyLabel: 'Otsingule ei vasta ükski artikkel.',
  searchUnavailableLabel: 'Otsing pole praegu saadaval.',
  copyCodeLabel: 'Kopeeri',
  copiedLabel: 'Kopeeritud',
  linkCopiedLabel: 'Link kopeeritud.',
  copyBlockedLabel:
    'Kopeerimine on siin blokeeritud. Kopeeri aadress brauserist.',
  codeSelectedLabel: 'Kood valitud. Kopeerimiseks vajuta Ctrl C või Command C.',
  savedLabel: 'Salvestatud hilisemaks.',
  unsavedLabel: 'Eemaldatud salvestatud artiklite hulgast.',
  menuSummaryLabel: 'Menüü',
  featuredLabel: 'Esiletõstetud',
  readEssayLabel: 'Loe esseed',
  latestHeading: 'Uusimad',
  moreArticlesHeading: 'Veel artikleid',
  browseByTagLabel: 'Sirvi siltide järgi',
  seriesCardLabel: 'Sari',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count === '1' ? '1 osa' : `${count} osa`}`,
  startSeriesLabel: 'Alusta 1. osast',
  newsletterLabel: 'Uudiskiri',
  newsletterActionLabel: 'Telli',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min lugemist`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Osa ${part} / ${total}`,
  onThisPageLabel: 'Sellel lehel',
  writtenByLabel: 'Autor',
  aboutTheAuthorLabel: 'Autorist',
  youAreHereLabel: 'Oled siin',
  newerArticleLabel: 'Uuem',
  olderArticleLabel: 'Vanem',
  moreArticlesNavigationLabel: 'Veel artikleid',
  keepReadingHeading: 'Loe edasi',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Veel sildi ${tag} all`,
  interactionsHeading: 'Vastused',
  reactionsGroupLabel: 'Reaktsioonid',
  likeLabel: 'Meeldib',
  commentsHeading: 'Vestlus',
  interactionsNeedScriptNotice:
    'Reaktsioonid ja kommentaarid vajavad JavaScripti.',
  showMoreCommentsLabel: 'Näita rohkem kommentaare',
  shareLabel: 'Jaga',
  copyLinkLabel: 'Kopeeri artikli link',
  saveForLaterLabel: 'Salvesta hilisemaks',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Jaga: ${network}`,
  shareByEmailLabel: 'Jaga e-kirjaga',
  shareNativeLabel: 'Jaga seda artiklit',
  followLabel: 'Jälgi',
  followingLabel: 'Jälgid',
  unfollowLabel: 'Lõpeta jälgimine',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Jälgi: ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Lõpeta jälgimine: ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Jälgid nüüd: ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Enam ei jälgi: ${name}.`,
  followDisabledMessage: 'Jälgimine pole sellel saidil praegu saadaval.',
  followAuthorMissingMessage: 'Seda autorit ei saa praegu jälgida.',
  audienceNetworkError: "Galascribe'iga ei saanud ühendust. Proovi uuesti.",
  audienceRateLimited: 'Liiga palju katseid. Proovi hetke pärast uuesti.',
  audienceGenericError: 'Midagi läks valesti. Proovi uuesti.',
  audienceStorageBlocked:
    'Sinu brauser blokeeris salvestusruumi, mida sait sisselogimiseks vajab.',
  audienceSignInUnsupported:
    'See brauser ei saa sind sellel lehel sisse logida.',
  audienceSignInFailed: 'Sisselogimine ei lõppenud. Proovi uuesti.',
  audienceSignInInvalid: 'Sisselogimislink ei kehtinud. Proovi uuesti.',
  honeypotLabel: 'Jäta see väli tühjaks',
  fieldRequiredMessage: 'See väli on kohustuslik.',
  fieldInvalidMessage: 'Kontrolli seda välja.',
  newsletterEmailLabel: 'E-posti aadress',
  newsletterCheckInbox: 'Kinnitamiseks vaata oma postkasti',
  newsletterFullMessage: 'See uudiskiri ei võta praegu uusi tellijaid vastu.',
  newsletterEmailInvalid: 'Sisesta kehtiv e-posti aadress.',
  contactLinkLabel: 'Kontakt',
  contactPageTitle: 'Kontakt',
  contactDefaultIntro:
    'Kas on küsimus või midagi öelda? Saada sõnum ja autor vastab e-postiga.',
  contactNameLabel: 'Nimi',
  contactEmailLabel: 'E-post',
  contactMessageLabel: 'Sõnum',
  contactWebsiteLabel: 'Veebisait (valikuline)',
  contactPhoneLabel: 'Telefon (valikuline)',
  contactSubmitLabel: 'Saada sõnum',
  contactNoscript:
    'See vorm vajab JavaScripti. Sõnumi saatmiseks lülita see sisse.',
  contactSent: 'Aitäh, sinu sõnum on saadetud.',
  contactUnavailable: 'See vorm ei võta praegu sõnumeid vastu.',
  contactRateLimited:
    'Siit on tulnud liiga palju sõnumeid. Proovi hiljem uuesti.',
  contactMessageLinks: 'Sõnumis võib olla kuni kaks linki.',
  tagListLabel: 'Sildid',
  tagKickerLabel: 'Silt',
  seriesKickerLabel: 'Sari',
  archiveKickerLabel: 'Arhiiv',
  authorKickerLabel: 'Autor',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) =>
    `${count === '1' ? '1 artikkel' : `${count} artiklit`}`,
  emptyListingLabel: 'Artikleid veel pole.',
  editionsNavigationLabel: 'Väljaanded',
  editionOriginalLabel: 'Originaal',
  editionQuickReadLabel: 'Kiirlugemine',
  editionStandardLabel: 'Tavaline',
  editionDeepDiveLabel: 'Põhjalik',
  editionNoticeLabel:
    'Loodud väljaanne, mille autor on üle vaadanud; aluseks on originaal',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Meist',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Uuendatud ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Sildiga „${tag}” postitused`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count === '1' ? '1 artikkel' : `${count} artiklit`} sildiga ${tag} väljaandes ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, ${count === '1' ? '1 osa' : `${count} osa`} sisaldav sari väljaandes ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arhiiv ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count === '1' ? '1 artikkel' : `${count} artiklit`} avaldatud aastal ${year} väljaandes ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Autori ${name} artiklid väljaandes ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Sirvi väljaande ${publication} ${count} teemat.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Sirvi väljaandes ${publication} avaldatud ${count} sarja.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Kõik väljaande ${publication} artiklid aastate kaupa, kokku ${count}.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Kõik väljaande ${publication} artiklid, uuemad ees.`,
  exploreColumnLabel: 'Avasta',
  rssFeedLabel: 'RSS-voog',
  languageKickerLabel: 'Keel',
  languageSwitcherLabel: 'Keeled',
  languageChipsLabel: 'Saadaolevad keeled',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? '1 artikkel' : `${count} artiklit`} keeles ${language} väljaandes ${publication}.`,
  postRemovedHeading: 'See postitus eemaldati',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `See eemaldati ${date}.`,
  postRemovedHomeLabel: 'Mine avalehele',
  versionPageHeading: 'Saidi versioon',
  versionTemplateLabel: 'Mall',
  versionThemeLabel: 'Teema',
  versionSchemasLabel: 'Skeemid',
  versionToolchainLabel: 'Avaldamisvahendid',
  versionCommitLabel: 'Lähtekommit',
  versionBuiltAtLabel: 'Ehitatud',
  listenNavLabel: 'Kuula',
  listenNavCurrentLabel: 'Kuula seda postitust',
  listenInviteTitle: 'Käed hõivatud? Kuula hoopis.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `See postitus on ka ${minutes}-minutiline vestlus. Sobib autosõiduks, trenniks või nõudepesuks.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `See postitus on ka ${minutes}-minutiline ettelugemine. Sobib autosõiduks, trenniks või nõudepesuks.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `See postitus on ka ${minutes}-minutiline arutelu. Sobib autosõiduks, trenniks või nõudepesuks.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `See postitus on ka ${minutes}-minutiline sketš. Sobib autosõiduks, trenniks või nõudepesuks.`,
  listenInvitePlayLabel: 'Esita',
  listenInviteDeclineLabel: 'Ei aitäh',
  listenInviteNote: 'Tehisintellekti hääled, kohandatud sellest postitusest.',
  listenInviteCloseLabel: 'Sulge praegu',
  listenPlayerRegionLabel: 'Heliesitaja',
  listenPlayerNowPlayingLabel: 'Praegu mängib',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} / ${count}`,
  listenPlayerPlayLabel: 'Esita',
  listenPlayerPauseLabel: 'Paus',
  listenPlayerBackLabel: '15 sekundit tagasi',
  listenPlayerPreviousLabel: 'Eelmine osa',
  listenPlayerNextLabel: 'Järgmine osa',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Taasesituse kiirus ${rate}×`,
  listenPlayerSeekLabel: 'Asukoht',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} / ${total}`,
  listenPlayerCloseLabel: 'Peata ja sulge',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Praegu mängib: ${title}`,
  listenListHeading: 'Kuula seda ajaveebi',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count} osa · ${duration}`,
  listenListPlayAllLabel: 'Esita kõik',
  listenListShuffleLabel: 'Sega',
  listenListOrderLabel: 'Järjekord',
  listenListNewestLabel: 'Uuemad enne',
  listenListOldestLabel: 'Vanemad enne',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Näita kõiki (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Esita ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} h ${minutes} min`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('et', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
