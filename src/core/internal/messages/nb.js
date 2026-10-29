/**
 * Chrome message catalog for the `nb` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Hopp til innhold',
  homeLinkLabel: 'Hjem',
  primaryNavigationLabel: 'Hovedmeny',
  footerNavigationLabel: 'Bunntekst',
  breadcrumbNavigationLabel: 'Brødsmulesti',
  paginationNavigationLabel: 'Sidenavigering',
  previousPageLabel: 'Forrige',
  nextPageLabel: 'Neste',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Side ${current} av ${total}`,
  authorsSectionLabel: 'Forfattere',
  tagsSectionLabel: 'Emneord',
  seriesSectionLabel: 'Serier',
  archiveSectionLabel: 'Arkiv',
  indexHeading: 'Alle artikler',
  authorsIndexLabel: 'Forfattere',
  tagIndexLabelPrefix: 'Emneord:',
  seriesIndexLabelPrefix: 'Serie:',
  archiveYearLabelPrefix: 'Arkiv:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Om ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Av ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, åpnes i en ny fane',
  footerLegalLabel: 'Juridisk',
  termsLinkLabel: 'Vilkår',
  privacyLinkLabel: 'Personvern',
  consentRegionLabel: 'Personvernvalg',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Dette nettstedet vil gjerne bruke ${providerName} for å forstå hvordan det leses. Ingenting lastes før du godtar, og du kan når som helst endre valget i bunnteksten.`,
  consentAcceptLabel: 'Godta statistikk',
  consentDeclineLabel: 'Avslå',
  consentOpenLabel: 'Personvernvalg',
  errorPageHeading: 'Siden ble ikke funnet',
  errorPageBody:
    'Siden du leter etter, ble ikke funnet. Den kan ha blitt flyttet, omdøpt eller fjernet.',
  errorPageReturnHomeLabel: 'Tilbake til forsiden',
  appearanceControlLabel: 'Utseende',
  appearanceModeLightLabel: 'Lys',
  appearanceModeDarkLabel: 'Mørk',
  appearanceModeSystemLabel: 'System',
  searchButtonLabel: 'Søk',
  searchButtonAriaLabel: 'Søk i artikler',
  searchPlaceholderLabel: 'Søk i publikasjonen',
  searchEmptyLabel: 'Ingen artikler samsvarer med søket.',
  searchUnavailableLabel: 'Søk er ikke tilgjengelig akkurat nå.',
  copyCodeLabel: 'Kopier',
  copiedLabel: 'Kopiert',
  linkCopiedLabel: 'Lenken er kopiert.',
  copyBlockedLabel:
    'Kopiering er blokkert her. Kopier adressen fra nettleseren.',
  codeSelectedLabel:
    'Koden er markert. Trykk Ctrl C eller Command C for å kopiere.',
  savedLabel: 'Lagret til senere.',
  unsavedLabel: 'Fjernet fra lagrede artikler.',
  menuSummaryLabel: 'Meny',
  featuredLabel: 'Utvalgt',
  readEssayLabel: 'Les essayet',
  latestHeading: 'Siste',
  moreArticlesHeading: 'Flere artikler',
  browseByTagLabel: 'Bla etter emneord',
  seriesCardLabel: 'Serie',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count === '1' ? '1 del' : `${count} deler`}`,
  startSeriesLabel: 'Start med del 1',
  newsletterLabel: 'Nyhetsbrev',
  newsletterActionLabel: 'Abonner',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min lesetid`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Del ${part} av ${total}`,
  onThisPageLabel: 'På denne siden',
  writtenByLabel: 'Skrevet av',
  aboutTheAuthorLabel: 'Om forfatteren',
  youAreHereLabel: 'Du er her',
  newerArticleLabel: 'Nyere',
  olderArticleLabel: 'Eldre',
  moreArticlesNavigationLabel: 'Flere artikler',
  keepReadingHeading: 'Les videre',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Mer i ${tag}`,
  interactionsHeading: 'Reaksjoner',
  reactionsGroupLabel: 'Reaksjoner',
  likeLabel: 'Lik',
  commentsHeading: 'Samtale',
  interactionsNeedScriptNotice: 'Reaksjoner og kommentarer krever JavaScript.',
  showMoreCommentsLabel: 'Vis flere kommentarer',
  shareLabel: 'Del',
  copyLinkLabel: 'Kopier lenken til artikkelen',
  saveForLaterLabel: 'Lagre til senere',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Del på ${network}`,
  shareByEmailLabel: 'Del på e-post',
  shareNativeLabel: 'Del denne artikkelen',
  followLabel: 'Følg',
  followingLabel: 'Følger',
  unfollowLabel: 'Slutt å følge',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Følg ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Slutt å følge ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Du følger nå ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Du følger ikke lenger ${name}.`,
  followDisabledMessage:
    'Det er ikke mulig å følge på dette nettstedet akkurat nå.',
  followAuthorMissingMessage: 'Denne forfatteren kan ikke følges akkurat nå.',
  audienceNetworkError: 'Fikk ikke kontakt med Galascribe. Prøv igjen.',
  audienceRateLimited: 'For mange forsøk. Prøv igjen om litt.',
  audienceGenericError: 'Noe gikk galt. Prøv igjen.',
  audienceStorageBlocked:
    'Nettleseren blokkerte lagringen nettstedet trenger for å logge deg inn.',
  audienceSignInUnsupported:
    'Denne nettleseren kan ikke logge deg inn på denne siden.',
  audienceSignInFailed: 'Innloggingen ble ikke fullført. Prøv igjen.',
  audienceSignInInvalid: 'Innloggingslenken var ugyldig. Prøv igjen.',
  honeypotLabel: 'La dette feltet stå tomt',
  fieldRequiredMessage: 'Dette feltet er obligatorisk.',
  fieldInvalidMessage: 'Sjekk dette feltet.',
  newsletterEmailLabel: 'E-postadresse',
  newsletterCheckInbox: 'Sjekk innboksen for å bekrefte',
  newsletterFullMessage:
    'Dette nyhetsbrevet tar ikke imot nye abonnenter akkurat nå.',
  newsletterEmailInvalid: 'Skriv inn en gyldig e-postadresse.',
  contactLinkLabel: 'Kontakt',
  contactPageTitle: 'Kontakt',
  contactDefaultIntro:
    'Har du et spørsmål eller noe på hjertet? Send en melding, så svarer forfatteren på e-post.',
  contactNameLabel: 'Navn',
  contactEmailLabel: 'E-post',
  contactMessageLabel: 'Melding',
  contactWebsiteLabel: 'Nettsted (valgfritt)',
  contactPhoneLabel: 'Telefon (valgfritt)',
  contactSubmitLabel: 'Send melding',
  contactNoscript:
    'Dette skjemaet krever JavaScript. Slå det på for å sende en melding.',
  contactSent: 'Takk, meldingen din er sendt.',
  contactUnavailable: 'Dette skjemaet tar ikke imot meldinger akkurat nå.',
  contactRateLimited: 'For mange meldinger herfra. Prøv igjen senere.',
  contactMessageLinks: 'Meldingen kan inneholde maks to lenker.',
  tagListLabel: 'Emneord',
  tagKickerLabel: 'Emneord',
  seriesKickerLabel: 'Serie',
  archiveKickerLabel: 'Arkiv',
  authorKickerLabel: 'Forfatter',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) =>
    `${count === '1' ? '1 artikkel' : `${count} artikler`}`,
  emptyListingLabel: 'Ingen artikler ennå.',
  editionsNavigationLabel: 'Utgaver',
  editionOriginalLabel: 'Original',
  editionQuickReadLabel: 'Hurtiglesing',
  editionStandardLabel: 'Standard',
  editionDeepDiveLabel: 'Dybdeanalyse',
  editionNoticeLabel:
    'Generert utgave, gjennomgått av forfatteren; originalen er referansen',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Om',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Oppdatert ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Innlegg merket «${tag}»`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count === '1' ? '1 artikkel' : `${count} artikler`} merket ${tag} på ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, en serie med ${count === '1' ? '1 del' : `${count} deler`} på ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arkiv ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count === '1' ? '1 artikkel' : `${count} artikler`} publisert i ${year} på ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Artikler skrevet av ${name} på ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Bla gjennom de ${count} emnene på ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Bla gjennom de ${count} seriene publisert på ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Alle artikler på ${publication}, ${count} totalt, etter år.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Alle artikler på ${publication}, nyeste først.`,
  exploreColumnLabel: 'Utforsk',
  rssFeedLabel: 'RSS-strøm',
  languageKickerLabel: 'Språk',
  languageSwitcherLabel: 'Språk',
  languageChipsLabel: 'Tilgjengelige språk',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? '1 artikkel' : `${count} artikler`} på ${language} på ${publication}.`,
  postRemovedHeading: 'Dette innlegget er fjernet',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Det ble fjernet ${date}.`,
  postRemovedHomeLabel: 'Gå til forsiden',
  versionPageHeading: 'Nettstedets versjon',
  versionTemplateLabel: 'Mal',
  versionThemeLabel: 'Tema',
  versionSchemasLabel: 'Skjemaer',
  versionToolchainLabel: 'Publiseringsverktøy',
  versionCommitLabel: 'Kildecommit',
  versionBuiltAtLabel: 'Bygget',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('nb', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
