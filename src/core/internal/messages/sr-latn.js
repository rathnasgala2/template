/**
 * Chrome message catalog for the `sr-Latn` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Pređi na sadržaj',
  homeLinkLabel: 'Početna',
  primaryNavigationLabel: 'Glavni meni',
  footerNavigationLabel: 'Podnožje',
  breadcrumbNavigationLabel: 'Putanja',
  paginationNavigationLabel: 'Straničenje',
  previousPageLabel: 'Prethodno',
  nextPageLabel: 'Sledeće',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Strana ${current} od ${total}`,
  authorsSectionLabel: 'Autori',
  tagsSectionLabel: 'Oznake',
  seriesSectionLabel: 'Serije',
  archiveSectionLabel: 'Arhiva',
  indexHeading: 'Svi članci',
  authorsIndexLabel: 'Autori',
  tagIndexLabelPrefix: 'Oznaka:',
  seriesIndexLabelPrefix: 'Serija:',
  archiveYearLabelPrefix: 'Arhiva:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `O autoru: ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Autor: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, otvara se u novoj kartici',
  footerLegalLabel: 'Pravne informacije',
  termsLinkLabel: 'Uslovi',
  privacyLinkLabel: 'Privatnost',
  consentRegionLabel: 'Podešavanja privatnosti',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Ovaj sajt bi želeo da koristi ${providerName} da bi razumeo čitanost. Ništa se ne učitava dok ne prihvatite, a izbor možete da promenite bilo kada u podnožju.`,
  consentAcceptLabel: 'Prihvati analitiku',
  consentDeclineLabel: 'Odbij',
  consentOpenLabel: 'Podešavanja privatnosti',
  errorPageHeading: 'Stranica nije pronađena',
  errorPageBody:
    'Stranica koju tražite nije pronađena. Možda je premeštena, preimenovana ili uklonjena.',
  errorPageReturnHomeLabel: 'Nazad na početnu stranicu',
  appearanceControlLabel: 'Izgled',
  appearanceModeLightLabel: 'Svetla',
  appearanceModeDarkLabel: 'Tamna',
  appearanceModeSystemLabel: 'Sistemska',
  searchButtonLabel: 'Pretraga',
  searchButtonAriaLabel: 'Pretraži članke',
  searchPlaceholderLabel: 'Pretraži publikaciju',
  searchEmptyLabel: 'Nijedan članak ne odgovara pretrazi.',
  searchUnavailableLabel: 'Pretraga trenutno nije dostupna.',
  copyCodeLabel: 'Kopiraj',
  copiedLabel: 'Kopirano',
  linkCopiedLabel: 'Veza je kopirana.',
  copyBlockedLabel:
    'Kopiranje je ovde blokirano. Kopirajte adresu iz pregledača.',
  codeSelectedLabel:
    'Kôd je izabran. Pritisnite Ctrl C ili Command C da biste kopirali.',
  savedLabel: 'Sačuvano za kasnije.',
  unsavedLabel: 'Uklonjeno iz sačuvanih članaka.',
  menuSummaryLabel: 'Meni',
  featuredLabel: 'Izdvojeno',
  readEssayLabel: 'Pročitaj esej',
  latestHeading: 'Najnovije',
  moreArticlesHeading: 'Još članaka',
  browseByTagLabel: 'Pregledaj po oznaci',
  seriesCardLabel: 'Serija',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`Delovi: ${count}`}`,
  startSeriesLabel: 'Počni od 1. dela',
  newsletterLabel: 'Bilten',
  newsletterActionLabel: 'Pretplati se',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min čitanja`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Deo ${part} od ${total}`,
  onThisPageLabel: 'Na ovoj stranici',
  writtenByLabel: 'Napisao/la',
  aboutTheAuthorLabel: 'O autoru',
  youAreHereLabel: 'Ovde ste',
  newerArticleLabel: 'Novije',
  olderArticleLabel: 'Starije',
  moreArticlesNavigationLabel: 'Još članaka',
  keepReadingHeading: 'Nastavite da čitate',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Više u: ${tag}`,
  interactionsHeading: 'Odgovori',
  reactionsGroupLabel: 'Reakcije',
  likeLabel: 'Sviđa mi se',
  commentsHeading: 'Razgovor',
  interactionsNeedScriptNotice: 'Reakcije i komentari zahtevaju JavaScript.',
  showMoreCommentsLabel: 'Prikaži još komentara',
  shareLabel: 'Podeli',
  copyLinkLabel: 'Kopiraj vezu do članka',
  saveForLaterLabel: 'Sačuvaj za kasnije',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Podeli na ${network}`,
  shareByEmailLabel: 'Podeli e-poštom',
  shareNativeLabel: 'Podeli ovaj članak',
  followLabel: 'Prati',
  followingLabel: 'Pratite',
  unfollowLabel: 'Prestani da pratiš',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Prati: ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Prestani da pratiš: ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Sada pratite: ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Više ne pratite: ${name}.`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `Pratilaca: ${count}`,
  followersTeamHint: 'Ovo vidi samo tim vašeg sajta',
  followDisabledMessage: 'Praćenje na ovom sajtu trenutno nije dostupno.',
  followAuthorMissingMessage: 'Ovog autora trenutno nije moguće pratiti.',
  audienceNetworkError:
    'Nije moguće povezati se sa Galascribe. Pokušajte ponovo.',
  audienceRateLimited: 'Previše pokušaja. Pokušajte ponovo za trenutak.',
  audienceGenericError: 'Nešto je pošlo naopako. Pokušajte ponovo.',
  audienceStorageBlocked:
    'Pregledač je blokirao skladište koje sajt koristi za prijavu.',
  audienceSignInUnsupported:
    'Ovaj pregledač vas ne može prijaviti na ovoj stranici.',
  audienceSignInFailed: 'Prijava nije završena. Pokušajte ponovo.',
  audienceSignInInvalid: 'Veza za prijavu nije važeća. Pokušajte ponovo.',
  honeypotLabel: 'Ostavite ovo polje praznim',
  fieldRequiredMessage: 'Ovo polje je obavezno.',
  fieldInvalidMessage: 'Proverite ovo polje.',
  newsletterEmailLabel: 'Adresa e-pošte',
  newsletterCheckInbox: 'Potvrdite u prijemnom sandučetu',
  newsletterFullMessage: 'Ovaj bilten trenutno ne prima nove pretplatnike.',
  newsletterEmailInvalid: 'Unesite ispravnu adresu e-pošte.',
  contactLinkLabel: 'Kontakt',
  contactPageTitle: 'Kontakt',
  contactDefaultIntro:
    'Imate pitanje ili nešto da kažete? Pošaljite poruku, a autor će odgovoriti e-poštom.',
  contactNameLabel: 'Ime',
  contactEmailLabel: 'E-pošta',
  contactMessageLabel: 'Poruka',
  contactWebsiteLabel: 'Vebsajt (neobavezno)',
  contactPhoneLabel: 'Telefon (neobavezno)',
  contactSubmitLabel: 'Pošalji poruku',
  contactNoscript:
    'Ovaj obrazac zahteva JavaScript. Uključite ga da biste poslali poruku.',
  contactSent: 'Hvala, vaša poruka je poslata.',
  contactUnavailable: 'Ovaj obrazac trenutno ne prima poruke.',
  contactRateLimited: 'Previše poruka odavde. Pokušajte kasnije.',
  contactMessageLinks: 'Poruka može da sadrži najviše dve veze.',
  tagListLabel: 'Oznake',
  tagKickerLabel: 'Oznaka',
  seriesKickerLabel: 'Serija',
  archiveKickerLabel: 'Arhiva',
  authorKickerLabel: 'Autor',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`Članci: ${count}`}`,
  emptyListingLabel: 'Još nema članaka.',
  editionsNavigationLabel: 'Izdanja',
  editionOriginalLabel: 'Original',
  editionQuickReadLabel: 'Brzo čitanje',
  editionStandardLabel: 'Standardno',
  editionDeepDiveLabel: 'Dubinski',
  editionNoticeLabel:
    'Generisano izdanje koje je pregledao autor; merodavan je original',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'O nama',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Ažurirano ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Objave sa oznakom „${tag}”`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `Oznaka ${tag} na ${publication}. ${`Članci: ${count}`}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, serija na ${publication}. ${`Delovi: ${count}`}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arhiva ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `Objavljeno ${year}. na ${publication}. ${`Članci: ${count}`}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Članci autora ${name} na ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Pregledajte teme na ${publication}. Ukupno: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Pregledajte serije objavljene na ${publication}. Ukupno: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Svi članci na ${publication} po godinama. Ukupno: ${count}.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Svi članci na ${publication}, najnoviji prvi.`,
  exploreColumnLabel: 'Istražite',
  rssFeedLabel: 'RSS izvor',
  languageKickerLabel: 'Jezik',
  languageSwitcherLabel: 'Jezici',
  languageChipsLabel: 'Dostupni jezici',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `Jezik: ${language}, ${publication}. ${`Članci: ${count}`}.`,
  postRemovedHeading: 'Ova objava je uklonjena',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Uklonjena je ${date}.`,
  postRemovedHomeLabel: 'Idi na početnu stranicu',
  versionPageHeading: 'Verzija sajta',
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
    `Ovaj članak je dostupan i kao razgovor od ${minutes} min. Zgodno za vožnju, trening ili pranje sudova.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Ovaj članak je dostupan i kao naracija od ${minutes} min. Zgodno za vožnju, trening ili pranje sudova.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Ovaj članak je dostupan i kao rasprava od ${minutes} min. Zgodno za vožnju, trening ili pranje sudova.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Ovaj članak je dostupan i kao skeč od ${minutes} min. Zgodno za vožnju, trening ili pranje sudova.`,
  listenInvitePlayLabel: 'Pusti',
  listenInviteDeclineLabel: 'Ne, hvala',
  listenInviteNote: 'AI glasovi, prilagođeno prema ovom članku.',
  listenInviteCloseLabel: 'Zatvori za sada',
  listenPlayerRegionLabel: 'Audio plejer',
  listenPlayerNowPlayingLabel: 'Trenutno svira',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} od ${count}`,
  listenPlayerPlayLabel: 'Pusti',
  listenPlayerPauseLabel: 'Pauziraj',
  listenPlayerBackLabel: 'Nazad 15 sekundi',
  listenPlayerPreviousLabel: 'Prethodna epizoda',
  listenPlayerNextLabel: 'Sledeća epizoda',
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
  listenListPlayAllLabel: 'Pusti sve',
  listenListShuffleLabel: 'Nasumično',
  listenListOrderLabel: 'Redosled',
  listenListNewestLabel: 'Najnovije prvo',
  listenListOldestLabel: 'Najstarije prvo',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Prikaži sve (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Pusti: ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} h ${minutes} min`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('sr-Latn', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
