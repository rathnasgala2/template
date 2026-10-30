/**
 * Chrome message catalog for the `bs` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Preskoči na sadržaj',
  homeLinkLabel: 'Početna',
  primaryNavigationLabel: 'Glavna',
  footerNavigationLabel: 'Podnožje',
  breadcrumbNavigationLabel: 'Putanja',
  paginationNavigationLabel: 'Straničenje',
  previousPageLabel: 'Prethodna',
  nextPageLabel: 'Sljedeća',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Stranica ${current} od ${total}`,
  authorsSectionLabel: 'Autori',
  tagsSectionLabel: 'Oznake',
  seriesSectionLabel: 'Serijal',
  archiveSectionLabel: 'Arhiva',
  indexHeading: 'Svi članci',
  authorsIndexLabel: 'Autori',
  tagIndexLabelPrefix: 'Oznaka:',
  seriesIndexLabelPrefix: 'Serijal:',
  archiveYearLabelPrefix: 'Arhiva:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `O autoru: ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Autor: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, otvara se u novom tabu',
  footerLegalLabel: 'Pravno',
  termsLinkLabel: 'Uvjeti',
  privacyLinkLabel: 'Privatnost',
  consentRegionLabel: 'Postavke privatnosti',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Ova stranica želi koristiti ${providerName} da bi razumjela čitanost. Ništa se ne učitava dok ne prihvatite, a izbor možete promijeniti bilo kada u podnožju.`,
  consentAcceptLabel: 'Prihvati analitiku',
  consentDeclineLabel: 'Odbij',
  consentOpenLabel: 'Postavke privatnosti',
  errorPageHeading: 'Stranica nije pronađena',
  errorPageBody:
    'Stranica koju tražite nije pronađena. Možda je premještena, preimenovana ili uklonjena.',
  errorPageReturnHomeLabel: 'Povratak na početnu stranicu',
  appearanceControlLabel: 'Izgled',
  appearanceModeLightLabel: 'Svijetli',
  appearanceModeDarkLabel: 'Tamni',
  appearanceModeSystemLabel: 'Sistemski',
  searchButtonLabel: 'Traži',
  searchButtonAriaLabel: 'Pretraži članke',
  searchPlaceholderLabel: 'Pretraži publikaciju',
  searchEmptyLabel: 'Nijedan članak ne odgovara pretrazi.',
  searchUnavailableLabel: 'Pretraga trenutno nije dostupna.',
  copyCodeLabel: 'Kopiraj',
  copiedLabel: 'Kopirano',
  linkCopiedLabel: 'Link je kopiran.',
  copyBlockedLabel:
    'Kopiranje je ovdje blokirano. Kopirajte adresu iz preglednika.',
  codeSelectedLabel:
    'Kod je označen. Pritisnite Ctrl C ili Command C za kopiranje.',
  savedLabel: 'Sačuvano za kasnije.',
  unsavedLabel: 'Uklonjeno iz sačuvanih članaka.',
  menuSummaryLabel: 'Meni',
  featuredLabel: 'Izdvojeno',
  readEssayLabel: 'Pročitaj esej',
  latestHeading: 'Najnovije',
  moreArticlesHeading: 'Još članaka',
  browseByTagLabel: 'Pregled po oznakama',
  seriesCardLabel: 'Serijal',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} dijelova`,
  startSeriesLabel: 'Počni od 1. dijela',
  newsletterLabel: 'Newsletter',
  newsletterActionLabel: 'Pretplati se',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min čitanja`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Dio ${part} od ${total}`,
  onThisPageLabel: 'Na ovoj stranici',
  writtenByLabel: 'Autor',
  aboutTheAuthorLabel: 'O autoru',
  youAreHereLabel: 'Ovdje se nalazite',
  newerArticleLabel: 'Novije',
  olderArticleLabel: 'Starije',
  moreArticlesNavigationLabel: 'Još članaka',
  keepReadingHeading: 'Nastavite čitati',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Više u oznaci ${tag}`,
  interactionsHeading: 'Reakcije',
  reactionsGroupLabel: 'Reakcije',
  likeLabel: 'Sviđa mi se',
  commentsHeading: 'Razgovor',
  interactionsNeedScriptNotice: 'Reakcije i komentari zahtijevaju JavaScript.',
  showMoreCommentsLabel: 'Prikaži više komentara',
  shareLabel: 'Podijeli',
  copyLinkLabel: 'Kopiraj link ovog članka',
  saveForLaterLabel: 'Sačuvaj za kasnije',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Podijeli na ${network}`,
  shareByEmailLabel: 'Podijeli e-poštom',
  shareNativeLabel: 'Podijeli ovaj članak',
  followLabel: 'Prati',
  followingLabel: 'Pratite',
  unfollowLabel: 'Otprati',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Prati ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Otprati ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Sada pratite ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Više ne pratite ${name}.`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `Pratilaca: ${count}`,
  followersTeamHint: 'Ovo vidi samo tim vaše stranice',
  followDisabledMessage: 'Praćenje trenutno nije dostupno na ovoj stranici.',
  followAuthorMissingMessage: 'Ovog autora trenutno nije moguće pratiti.',
  audienceNetworkError: 'Nije moguće doći do Galascribe. Pokušajte ponovo.',
  audienceRateLimited: 'Previše pokušaja. Pokušajte ponovo za trenutak.',
  audienceGenericError: 'Nešto je pošlo po zlu. Pokušajte ponovo.',
  audienceStorageBlocked:
    'Vaš preglednik je blokirao pohranu koja je ovoj stranici potrebna za prijavu.',
  audienceSignInUnsupported:
    'Ovaj preglednik vas ne može prijaviti na ovoj stranici.',
  audienceSignInFailed: 'Prijava nije završena. Pokušajte ponovo.',
  audienceSignInInvalid: 'Link za prijavu nije bio važeći. Pokušajte ponovo.',
  honeypotLabel: 'Ostavite ovo polje praznim',
  fieldRequiredMessage: 'Ovo polje je obavezno.',
  fieldInvalidMessage: 'Provjerite ovo polje.',
  newsletterEmailLabel: 'E-mail adresa',
  newsletterCheckInbox: 'Provjerite sanduče za potvrdu',
  newsletterFullMessage: 'Ovaj newsletter trenutno ne prima nove pretplatnike.',
  newsletterEmailInvalid: 'Unesite ispravnu e-mail adresu.',
  contactLinkLabel: 'Kontakt',
  contactPageTitle: 'Kontakt',
  contactDefaultIntro:
    'Imate pitanje ili nešto da kažete? Pošaljite poruku, autor će odgovoriti e-poštom.',
  contactNameLabel: 'Ime',
  contactEmailLabel: 'E-pošta',
  contactMessageLabel: 'Poruka',
  contactWebsiteLabel: 'Web stranica (neobavezno)',
  contactPhoneLabel: 'Telefon (neobavezno)',
  contactSubmitLabel: 'Pošalji poruku',
  contactNoscript:
    'Ovaj obrazac zahtijeva JavaScript. Uključite ga da biste poslali poruku.',
  contactSent: 'Hvala, vaša poruka je poslana.',
  contactUnavailable: 'Ovaj obrazac trenutno ne prima poruke.',
  contactRateLimited: 'Previše poruka odavde. Pokušajte kasnije.',
  contactMessageLinks: 'Vaša poruka može sadržavati najviše dva linka.',
  tagListLabel: 'Oznake',
  tagKickerLabel: 'Oznaka',
  seriesKickerLabel: 'Serijal',
  archiveKickerLabel: 'Arhiva',
  authorKickerLabel: 'Autor',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} članaka`,
  emptyListingLabel: 'Još nema članaka.',
  editionsNavigationLabel: 'Izdanja',
  editionOriginalLabel: 'Original',
  editionQuickReadLabel: 'Brzo čitanje',
  editionStandardLabel: 'Standardno',
  editionDeepDiveLabel: 'Detaljno',
  editionNoticeLabel:
    'Generisano izdanje, pregledao autor; original je mjerodavan',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'O nama',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Ažurirano ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Članci s oznakom „${tag}“`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `Članci (${count}) s oznakom ${tag} na ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, serijal od ${count} dijelova na ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arhiva ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `Članci (${count}) objavljeni ${year}. na ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Članci koje je napisao ${name} na ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Pregledajte teme (${count}) obrađene na ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Pregledajte serijale (${count}) objavljene na ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Svi članci na ${publication}, ukupno ${count}, po godinama.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Svi članci na ${publication}, najnoviji prvi.`,
  exploreColumnLabel: 'Istražite',
  rssFeedLabel: 'RSS feed',
  languageKickerLabel: 'Jezik',
  languageSwitcherLabel: 'Jezici',
  languageChipsLabel: 'Dostupni jezici',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `Članci (${count}) na jeziku ${language} na ${publication}.`,
  postRemovedHeading: 'Ovaj post je uklonjen',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Uklonjen je ${date}.`,
  postRemovedHomeLabel: 'Idi na početnu stranicu',
  versionPageHeading: 'Verzija stranice',
  versionTemplateLabel: 'Šablon',
  versionThemeLabel: 'Tema',
  versionSchemasLabel: 'Šeme',
  versionToolchainLabel: 'Alati za objavu',
  versionCommitLabel: 'Izvorni commit',
  versionBuiltAtLabel: 'Izgrađeno',
  listenNavLabel: 'Slušaj',
  listenNavCurrentLabel: 'Slušaj ovaj članak',
  listenInviteTitle: 'Zauzete ruke? Radije slušaj.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Ovaj članak je dostupan i kao razgovor od ${minutes} min. Pogodno za vožnju, trening ili pranje suđa.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Ovaj članak je dostupan i kao naracija od ${minutes} min. Pogodno za vožnju, trening ili pranje suđa.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Ovaj članak je dostupan i kao rasprava od ${minutes} min. Pogodno za vožnju, trening ili pranje suđa.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Ovaj članak je dostupan i kao skeč od ${minutes} min. Pogodno za vožnju, trening ili pranje suđa.`,
  listenInvitePlayLabel: 'Pusti',
  listenInviteDeclineLabel: 'Ne, hvala',
  listenInviteNote: 'AI glasovi, prilagođeno prema ovom članku.',
  listenInviteCloseLabel: 'Zatvori za sada',
  listenPlayerRegionLabel: 'Audio plejer',
  listenPlayerNowPlayingLabel: 'Trenutno svira',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} od ${count}`,
  listenPlayerPlayLabel: 'Reproduciraj',
  listenPlayerPauseLabel: 'Pauziraj',
  listenPlayerBackLabel: 'Nazad 15 sekundi',
  listenPlayerPreviousLabel: 'Prethodna epizoda',
  listenPlayerNextLabel: 'Sljedeća epizoda',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Brzina reprodukcije ${rate}×`,
  listenPlayerSeekLabel: 'Pozicija',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} od ${total}`,
  listenPlayerCloseLabel: 'Zaustavi i zatvori',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Svira: ${title}`,
  listenListHeading: 'Slušaj ovaj blog',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `Epizoda: ${count} · ${duration}`,
  listenListPlayAllLabel: 'Reproduciraj sve',
  listenListShuffleLabel: 'Nasumično',
  listenListOrderLabel: 'Redoslijed',
  listenListNewestLabel: 'Najnovije prvo',
  listenListOldestLabel: 'Najstarije prvo',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Prikaži sve (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Reproduciraj: ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} h ${minutes} min`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('bs', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
