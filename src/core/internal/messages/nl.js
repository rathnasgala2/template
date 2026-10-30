/**
 * Chrome message catalog for the `nl` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Naar de inhoud',
  homeLinkLabel: 'Home',
  primaryNavigationLabel: 'Hoofdmenu',
  footerNavigationLabel: 'Voettekst',
  breadcrumbNavigationLabel: 'Kruimelpad',
  paginationNavigationLabel: 'Paginering',
  previousPageLabel: 'Vorige',
  nextPageLabel: 'Volgende',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Pagina ${current} van ${total}`,
  authorsSectionLabel: 'Auteurs',
  tagsSectionLabel: 'Tags',
  seriesSectionLabel: 'Series',
  archiveSectionLabel: 'Archief',
  indexHeading: 'Alle artikelen',
  authorsIndexLabel: 'Auteurs',
  tagIndexLabelPrefix: 'Tag:',
  seriesIndexLabelPrefix: 'Serie:',
  archiveYearLabelPrefix: 'Archief:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Over ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Door ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, opent in een nieuw tabblad',
  footerLegalLabel: 'Juridisch',
  termsLinkLabel: 'Voorwaarden',
  privacyLinkLabel: 'Privacy',
  consentRegionLabel: 'Privacykeuzes',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Deze site wil ${providerName} gebruiken om te begrijpen wie er leest. Er wordt niets geladen tot je akkoord gaat, en je kunt je keuze altijd wijzigen via de voettekst.`,
  consentAcceptLabel: 'Analyse accepteren',
  consentDeclineLabel: 'Weigeren',
  consentOpenLabel: 'Privacykeuzes',
  errorPageHeading: 'Pagina niet gevonden',
  errorPageBody:
    'De pagina die je zocht is niet gevonden. Mogelijk is ze verplaatst, hernoemd of verwijderd.',
  errorPageReturnHomeLabel: 'Terug naar de homepage',
  appearanceControlLabel: 'Weergave',
  appearanceModeLightLabel: 'Licht',
  appearanceModeDarkLabel: 'Donker',
  appearanceModeSystemLabel: 'Systeem',
  searchButtonLabel: 'Zoeken',
  searchButtonAriaLabel: 'Artikelen zoeken',
  searchPlaceholderLabel: 'Zoek in de publicatie',
  searchEmptyLabel: 'Geen artikelen gevonden voor je zoekopdracht.',
  searchUnavailableLabel: 'Zoeken is nu niet beschikbaar.',
  copyCodeLabel: 'Kopiëren',
  copiedLabel: 'Gekopieerd',
  linkCopiedLabel: 'Link gekopieerd.',
  copyBlockedLabel:
    'Kopiëren is hier geblokkeerd. Kopieer het adres uit je browser.',
  codeSelectedLabel:
    'Code geselecteerd. Druk op Ctrl C of Command C om te kopiëren.',
  savedLabel: 'Bewaard voor later.',
  unsavedLabel: 'Verwijderd uit bewaarde artikelen.',
  menuSummaryLabel: 'Menu',
  featuredLabel: 'Uitgelicht',
  readEssayLabel: 'Lees het essay',
  latestHeading: 'Nieuwste',
  moreArticlesHeading: 'Meer artikelen',
  browseByTagLabel: 'Bladeren op tag',
  seriesCardLabel: 'Serie',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count === '1' ? '1 deel' : `${count} delen`}`,
  startSeriesLabel: 'Begin bij deel 1',
  newsletterLabel: 'Nieuwsbrief',
  newsletterActionLabel: 'Inschrijven',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min leestijd`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Deel ${part} van ${total}`,
  onThisPageLabel: 'Op deze pagina',
  writtenByLabel: 'Geschreven door',
  aboutTheAuthorLabel: 'Over de auteur',
  youAreHereLabel: 'Je bent hier',
  newerArticleLabel: 'Nieuwer',
  olderArticleLabel: 'Ouder',
  moreArticlesNavigationLabel: 'Meer artikelen',
  keepReadingHeading: 'Lees verder',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Meer in ${tag}`,
  interactionsHeading: 'Reacties',
  reactionsGroupLabel: 'Reacties',
  likeLabel: 'Leuk',
  commentsHeading: 'Gesprek',
  interactionsNeedScriptNotice:
    'Reacties en commentaar hebben JavaScript nodig.',
  showMoreCommentsLabel: 'Meer reacties tonen',
  shareLabel: 'Delen',
  copyLinkLabel: 'Link naar dit artikel kopiëren',
  saveForLaterLabel: 'Bewaren voor later',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Delen op ${network}`,
  shareByEmailLabel: 'Delen per e-mail',
  shareNativeLabel: 'Dit artikel delen',
  followLabel: 'Volgen',
  followingLabel: 'Volgend',
  unfollowLabel: 'Ontvolgen',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name} volgen`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name} ontvolgen`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Je volgt nu ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Je volgt ${name} niet meer.`,
  followDisabledMessage: 'Volgen is op deze site nu niet beschikbaar.',
  followAuthorMissingMessage: 'Deze auteur kan nu niet worden gevolgd.',
  audienceNetworkError: 'Galascribe is niet bereikbaar. Probeer het opnieuw.',
  audienceRateLimited: 'Te veel pogingen. Probeer het zo meteen opnieuw.',
  audienceGenericError: 'Er ging iets mis. Probeer het opnieuw.',
  audienceStorageBlocked:
    'Je browser blokkeerde de opslag die deze site nodig heeft om je aan te melden.',
  audienceSignInUnsupported:
    'Deze browser kan je op deze pagina niet aanmelden.',
  audienceSignInFailed: 'Aanmelden is niet voltooid. Probeer het opnieuw.',
  audienceSignInInvalid:
    'Die aanmeldlink was niet geldig. Probeer het opnieuw.',
  honeypotLabel: 'Laat dit veld leeg',
  fieldRequiredMessage: 'Dit veld is verplicht.',
  fieldInvalidMessage: 'Controleer dit veld.',
  newsletterEmailLabel: 'E-mailadres',
  newsletterCheckInbox: 'Controleer je inbox om te bevestigen',
  newsletterFullMessage: 'Deze nieuwsbrief neemt nu geen nieuwe abonnees aan.',
  newsletterEmailInvalid: 'Voer een geldig e-mailadres in.',
  contactLinkLabel: 'Contact',
  contactPageTitle: 'Contact',
  contactDefaultIntro:
    'Een vraag of iets te zeggen? Stuur een bericht en de auteur antwoordt per e-mail.',
  contactNameLabel: 'Naam',
  contactEmailLabel: 'E-mail',
  contactMessageLabel: 'Bericht',
  contactWebsiteLabel: 'Website (optioneel)',
  contactPhoneLabel: 'Telefoon (optioneel)',
  contactSubmitLabel: 'Bericht versturen',
  contactNoscript:
    'Dit formulier heeft JavaScript nodig. Zet het aan om een bericht te sturen.',
  contactSent: 'Bedankt, je bericht is verzonden.',
  contactUnavailable: 'Dit formulier neemt nu geen berichten aan.',
  contactRateLimited: 'Te veel berichten van hier. Probeer het later opnieuw.',
  contactMessageLinks: 'Je bericht mag maximaal twee links bevatten.',
  tagListLabel: 'Tags',
  tagKickerLabel: 'Tag',
  seriesKickerLabel: 'Serie',
  archiveKickerLabel: 'Archief',
  authorKickerLabel: 'Auteur',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) =>
    `${count === '1' ? '1 artikel' : `${count} artikelen`}`,
  emptyListingLabel: 'Nog geen artikelen.',
  editionsNavigationLabel: 'Edities',
  editionOriginalLabel: 'Origineel',
  editionQuickReadLabel: 'Snel lezen',
  editionStandardLabel: 'Standaard',
  editionDeepDiveLabel: 'Verdieping',
  editionNoticeLabel:
    'Gegenereerde editie, gecontroleerd door de auteur; het origineel is leidend',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Over',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Bijgewerkt op ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Berichten met de tag “${tag}”`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count === '1' ? '1 artikel' : `${count} artikelen`} met de tag ${tag} op ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, een serie van ${count === '1' ? '1 deel' : `${count} delen`} op ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Archief ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count === '1' ? '1 artikel' : `${count} artikelen`} gepubliceerd in ${year} op ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Artikelen van ${name} op ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Blader door ${count === '1' ? '1 onderwerp' : `${count} onderwerpen`} op ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Blader door de ${count} series op ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Alle artikelen op ${publication}, ${count} in totaal, per jaar.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Alle artikelen op ${publication}, nieuwste eerst.`,
  exploreColumnLabel: 'Ontdekken',
  rssFeedLabel: 'RSS-feed',
  languageKickerLabel: 'Taal',
  languageSwitcherLabel: 'Talen',
  languageChipsLabel: 'Beschikbare talen',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? '1 artikel' : `${count} artikelen`} in het ${language} op ${publication}.`,
  postRemovedHeading: 'Dit bericht is verwijderd',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Het is verwijderd op ${date}.`,
  postRemovedHomeLabel: 'Naar de homepage',
  versionPageHeading: 'Siteversie',
  versionTemplateLabel: 'Sjabloon',
  versionThemeLabel: 'Thema',
  versionSchemasLabel: 'Schema’s',
  versionToolchainLabel: 'Publicatietoolchain',
  versionCommitLabel: 'Bron-commit',
  versionBuiltAtLabel: 'Gebouwd op',
  listenNavLabel: 'Luisteren',
  listenNavCurrentLabel: 'Luister naar dit artikel',
  listenInviteTitle: 'Handen vol? Luister dan liever.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Dit artikel is er ook als gesprek van ${minutes} min. Fijn voor onderweg, tijdens het sporten of bij de afwas.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Dit artikel is er ook als voorgelezen verhaal van ${minutes} min. Fijn voor onderweg, tijdens het sporten of bij de afwas.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Dit artikel is er ook als debat van ${minutes} min. Fijn voor onderweg, tijdens het sporten of bij de afwas.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Dit artikel is er ook als sketch van ${minutes} min. Fijn voor onderweg, tijdens het sporten of bij de afwas.`,
  listenInvitePlayLabel: 'Afspelen',
  listenInviteDeclineLabel: 'Nee, bedankt',
  listenInviteNote: 'AI-stemmen, gebaseerd op dit artikel.',
  listenInviteCloseLabel: 'Nu sluiten',
  listenPlayerRegionLabel: 'Audiospeler',
  listenPlayerNowPlayingLabel: 'Nu aan het afspelen',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} van ${count}`,
  listenPlayerPlayLabel: 'Afspelen',
  listenPlayerPauseLabel: 'Pauzeren',
  listenPlayerBackLabel: '15 seconden terug',
  listenPlayerPreviousLabel: 'Vorige aflevering',
  listenPlayerNextLabel: 'Volgende aflevering',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Afspeelsnelheid ${rate}×`,
  listenPlayerSeekLabel: 'Positie',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} van ${total}`,
  listenPlayerCloseLabel: 'Stoppen en sluiten',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Speelt nu: ${title}`,
  listenListHeading: 'Luister naar deze blog',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) =>
    count === '1'
      ? `1 aflevering · ${duration}`
      : `${count} afleveringen · ${duration}`,
  listenListPlayAllLabel: 'Alles afspelen',
  listenListShuffleLabel: 'Willekeurig',
  listenListOrderLabel: 'Volgorde',
  listenListNewestLabel: 'Nieuwste eerst',
  listenListOldestLabel: 'Oudste eerst',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Toon alle ${count}`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `${title} afspelen`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} u ${minutes} min`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('nl', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
