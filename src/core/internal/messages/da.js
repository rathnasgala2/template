/**
 * Chrome message catalog for the `da` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Gå til indhold',
  homeLinkLabel: 'Forside',
  primaryNavigationLabel: 'Hovedmenu',
  footerNavigationLabel: 'Sidefod',
  breadcrumbNavigationLabel: 'Sti',
  paginationNavigationLabel: 'Sidenavigation',
  previousPageLabel: 'Forrige',
  nextPageLabel: 'Næste',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Side ${current} af ${total}`,
  authorsSectionLabel: 'Forfattere',
  tagsSectionLabel: 'Tags',
  seriesSectionLabel: 'Serier',
  archiveSectionLabel: 'Arkiv',
  indexHeading: 'Alle artikler',
  authorsIndexLabel: 'Forfattere',
  tagIndexLabelPrefix: 'Tag:',
  seriesIndexLabelPrefix: 'Serie:',
  archiveYearLabelPrefix: 'Arkiv:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Om ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Af ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, åbner i en ny fane',
  footerLegalLabel: 'Juridisk',
  termsLinkLabel: 'Vilkår',
  privacyLinkLabel: 'Privatliv',
  consentRegionLabel: 'Privatlivsvalg',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Dette websted vil gerne bruge ${providerName} til at forstå, hvordan det læses. Der indlæses ikke noget, før du accepterer, og du kan til enhver tid ændre dit valg i sidefoden.`,
  consentAcceptLabel: 'Accepter statistik',
  consentDeclineLabel: 'Afvis',
  consentOpenLabel: 'Privatlivsvalg',
  errorPageHeading: 'Siden blev ikke fundet',
  errorPageBody:
    'Den side, du leder efter, kunne ikke findes. Den kan være flyttet, omdøbt eller fjernet.',
  errorPageReturnHomeLabel: 'Tilbage til forsiden',
  appearanceControlLabel: 'Udseende',
  appearanceModeLightLabel: 'Lys',
  appearanceModeDarkLabel: 'Mørk',
  appearanceModeSystemLabel: 'System',
  searchButtonLabel: 'Søg',
  searchButtonAriaLabel: 'Søg i artikler',
  searchPlaceholderLabel: 'Søg i publikationen',
  searchEmptyLabel: 'Ingen artikler matcher din søgning.',
  searchUnavailableLabel: 'Søgning er ikke tilgængelig lige nu.',
  copyCodeLabel: 'Kopiér',
  copiedLabel: 'Kopieret',
  linkCopiedLabel: 'Linket er kopieret.',
  copyBlockedLabel:
    'Kopiering er blokeret her. Kopiér adressen fra din browser.',
  codeSelectedLabel:
    'Koden er markeret. Tryk Ctrl C eller Command C for at kopiere.',
  savedLabel: 'Gemt til senere.',
  unsavedLabel: 'Fjernet fra gemte artikler.',
  menuSummaryLabel: 'Menu',
  featuredLabel: 'Fremhævet',
  readEssayLabel: 'Læs essayet',
  latestHeading: 'Seneste',
  moreArticlesHeading: 'Flere artikler',
  browseByTagLabel: 'Gennemse efter tag',
  seriesCardLabel: 'Serie',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count === '1' ? '1 del' : `${count} dele`}`,
  startSeriesLabel: 'Start med del 1',
  newsletterLabel: 'Nyhedsbrev',
  newsletterActionLabel: 'Tilmeld',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min. læsning`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Del ${part} af ${total}`,
  onThisPageLabel: 'På denne side',
  writtenByLabel: 'Skrevet af',
  aboutTheAuthorLabel: 'Om forfatteren',
  youAreHereLabel: 'Du er her',
  newerArticleLabel: 'Nyere',
  olderArticleLabel: 'Ældre',
  moreArticlesNavigationLabel: 'Flere artikler',
  keepReadingHeading: 'Læs videre',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Mere i ${tag}`,
  interactionsHeading: 'Reaktioner',
  reactionsGroupLabel: 'Reaktioner',
  likeLabel: 'Synes godt om',
  commentsHeading: 'Samtale',
  interactionsNeedScriptNotice: 'Reaktioner og kommentarer kræver JavaScript.',
  showMoreCommentsLabel: 'Vis flere kommentarer',
  shareLabel: 'Del',
  copyLinkLabel: 'Kopiér link til artiklen',
  saveForLaterLabel: 'Gem til senere',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Del på ${network}`,
  shareByEmailLabel: 'Del via e-mail',
  shareNativeLabel: 'Del denne artikel',
  followLabel: 'Følg',
  followingLabel: 'Følger',
  unfollowLabel: 'Følg ikke længere',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Følg ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Følg ikke længere ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Du følger nu ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Du følger ikke længere ${name}.`,
  followDisabledMessage:
    'Det er ikke muligt at følge på dette websted lige nu.',
  followAuthorMissingMessage: 'Denne forfatter kan ikke følges lige nu.',
  audienceNetworkError: 'Kunne ikke få kontakt til Galascribe. Prøv igen.',
  audienceRateLimited: 'For mange forsøg. Prøv igen om lidt.',
  audienceGenericError: 'Noget gik galt. Prøv igen.',
  audienceStorageBlocked:
    'Din browser blokerede den lagring, som dette websted skal bruge til at logge dig ind.',
  audienceSignInUnsupported:
    'Denne browser kan ikke logge dig ind på denne side.',
  audienceSignInFailed: 'Login blev ikke gennemført. Prøv igen.',
  audienceSignInInvalid: 'Login-linket var ugyldigt. Prøv igen.',
  honeypotLabel: 'Lad dette felt stå tomt',
  fieldRequiredMessage: 'Dette felt er påkrævet.',
  fieldInvalidMessage: 'Tjek dette felt.',
  newsletterEmailLabel: 'E-mailadresse',
  newsletterCheckInbox: 'Tjek din indbakke for at bekræfte',
  newsletterFullMessage:
    'Dette nyhedsbrev tager ikke imod nye abonnenter lige nu.',
  newsletterEmailInvalid: 'Indtast en gyldig e-mailadresse.',
  contactLinkLabel: 'Kontakt',
  contactPageTitle: 'Kontakt',
  contactDefaultIntro:
    'Har du et spørgsmål eller noget på hjerte? Send en besked, så svarer forfatteren på e-mail.',
  contactNameLabel: 'Navn',
  contactEmailLabel: 'E-mail',
  contactMessageLabel: 'Besked',
  contactWebsiteLabel: 'Websted (valgfrit)',
  contactPhoneLabel: 'Telefon (valgfrit)',
  contactSubmitLabel: 'Send besked',
  contactNoscript:
    'Denne formular kræver JavaScript. Slå det til for at sende en besked.',
  contactSent: 'Tak, din besked er sendt.',
  contactUnavailable: 'Denne formular tager ikke imod beskeder lige nu.',
  contactRateLimited: 'For mange beskeder herfra. Prøv igen senere.',
  contactMessageLinks: 'Din besked må højst indeholde to links.',
  tagListLabel: 'Tags',
  tagKickerLabel: 'Tag',
  seriesKickerLabel: 'Serie',
  archiveKickerLabel: 'Arkiv',
  authorKickerLabel: 'Forfatter',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) =>
    `${count === '1' ? '1 artikel' : `${count} artikler`}`,
  emptyListingLabel: 'Ingen artikler endnu.',
  editionsNavigationLabel: 'Udgaver',
  editionOriginalLabel: 'Original',
  editionQuickReadLabel: 'Hurtiglæsning',
  editionStandardLabel: 'Standard',
  editionDeepDiveLabel: 'Dybdegående',
  editionNoticeLabel:
    'Genereret udgave, gennemgået af forfatteren; originalen er referencen',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Om',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Opdateret ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Indlæg med tagget ”${tag}”`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count === '1' ? '1 artikel' : `${count} artikler`} med tagget ${tag} på ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, en serie i ${count === '1' ? '1 del' : `${count} dele`} på ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arkiv ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count === '1' ? '1 artikel' : `${count} artikler`} udgivet i ${year} på ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Artikler skrevet af ${name} på ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Gennemse de ${count} emner på ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Gennemse de ${count} serier udgivet på ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Alle artikler på ${publication}, ${count} i alt, efter år.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Alle artikler på ${publication}, nyeste først.`,
  exploreColumnLabel: 'Udforsk',
  rssFeedLabel: 'RSS-feed',
  languageKickerLabel: 'Sprog',
  languageSwitcherLabel: 'Sprog',
  languageChipsLabel: 'Tilgængelige sprog',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? '1 artikel' : `${count} artikler`} på ${language} på ${publication}.`,
  postRemovedHeading: 'Dette indlæg er fjernet',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Det blev fjernet den ${date}.`,
  postRemovedHomeLabel: 'Gå til forsiden',
  versionPageHeading: 'Webstedets version',
  versionTemplateLabel: 'Skabelon',
  versionThemeLabel: 'Tema',
  versionSchemasLabel: 'Skemaer',
  versionToolchainLabel: 'Udgivelsesværktøjer',
  versionCommitLabel: 'Kildecommit',
  versionBuiltAtLabel: 'Bygget',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('da', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
