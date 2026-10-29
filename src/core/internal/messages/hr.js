/**
 * Chrome message catalog for the `hr` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Preskoči na sadržaj',
  homeLinkLabel: 'Početna',
  primaryNavigationLabel: 'Glavni izbornik',
  footerNavigationLabel: 'Podnožje',
  breadcrumbNavigationLabel: 'Putanja',
  paginationNavigationLabel: 'Straničenje',
  previousPageLabel: 'Prethodno',
  nextPageLabel: 'Sljedeće',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Stranica ${current} od ${total}`,
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
  termsLinkLabel: 'Uvjeti',
  privacyLinkLabel: 'Privatnost',
  consentRegionLabel: 'Postavke privatnosti',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Ova bi stranica željela koristiti ${providerName} kako bi razumjela čitanost. Ništa se ne učitava dok ne prihvatite, a odabir možete promijeniti bilo kada u podnožju.`,
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
  appearanceModeSystemLabel: 'Sustavski',
  searchButtonLabel: 'Traži',
  searchButtonAriaLabel: 'Pretraži članke',
  searchPlaceholderLabel: 'Pretraži publikaciju',
  searchEmptyLabel: 'Nijedan članak ne odgovara pretrazi.',
  searchUnavailableLabel: 'Pretraživanje trenutačno nije dostupno.',
  copyCodeLabel: 'Kopiraj',
  copiedLabel: 'Kopirano',
  linkCopiedLabel: 'Poveznica je kopirana.',
  copyBlockedLabel:
    'Kopiranje je ovdje blokirano. Kopirajte adresu iz preglednika.',
  codeSelectedLabel:
    'Kôd je odabran. Pritisnite Ctrl C ili Command C za kopiranje.',
  savedLabel: 'Spremljeno za kasnije.',
  unsavedLabel: 'Uklonjeno iz spremljenih članaka.',
  menuSummaryLabel: 'Izbornik',
  featuredLabel: 'Izdvojeno',
  readEssayLabel: 'Pročitaj esej',
  latestHeading: 'Najnovije',
  moreArticlesHeading: 'Još članaka',
  browseByTagLabel: 'Pregledaj po oznaci',
  seriesCardLabel: 'Serija',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`Dijelovi: ${count}`}`,
  startSeriesLabel: 'Počni s 1. dijelom',
  newsletterLabel: 'Newsletter',
  newsletterActionLabel: 'Pretplati se',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min čitanja`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Dio ${part} od ${total}`,
  onThisPageLabel: 'Na ovoj stranici',
  writtenByLabel: 'Napisao/la',
  aboutTheAuthorLabel: 'O autoru',
  youAreHereLabel: 'Ovdje ste',
  newerArticleLabel: 'Novije',
  olderArticleLabel: 'Starije',
  moreArticlesNavigationLabel: 'Još članaka',
  keepReadingHeading: 'Nastavite čitati',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Više u: ${tag}`,
  interactionsHeading: 'Odgovori',
  reactionsGroupLabel: 'Reakcije',
  likeLabel: 'Sviđa mi se',
  commentsHeading: 'Razgovor',
  interactionsNeedScriptNotice: 'Reakcije i komentari trebaju JavaScript.',
  showMoreCommentsLabel: 'Prikaži još komentara',
  shareLabel: 'Podijeli',
  copyLinkLabel: 'Kopiraj poveznicu na članak',
  saveForLaterLabel: 'Spremi za kasnije',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Podijeli na ${network}`,
  shareByEmailLabel: 'Podijeli e-poštom',
  shareNativeLabel: 'Podijeli ovaj članak',
  followLabel: 'Prati',
  followingLabel: 'Pratite',
  unfollowLabel: 'Prestani pratiti',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Prati: ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Prestani pratiti: ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Sada pratite: ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Više ne pratite: ${name}.`,
  followDisabledMessage: 'Praćenje na ovoj stranici trenutačno nije dostupno.',
  followAuthorMissingMessage: 'Ovog autora trenutačno nije moguće pratiti.',
  audienceNetworkError: 'Nije moguće doći do Galascribea. Pokušajte ponovno.',
  audienceRateLimited: 'Previše pokušaja. Pokušajte ponovno za trenutak.',
  audienceGenericError: 'Nešto je pošlo po zlu. Pokušajte ponovno.',
  audienceStorageBlocked:
    'Preglednik je blokirao pohranu koju stranica treba za prijavu.',
  audienceSignInUnsupported:
    'Ovaj preglednik ne može vas prijaviti na ovoj stranici.',
  audienceSignInFailed: 'Prijava nije dovršena. Pokušajte ponovno.',
  audienceSignInInvalid:
    'Poveznica za prijavu nije valjana. Pokušajte ponovno.',
  honeypotLabel: 'Ostavite ovo polje praznim',
  fieldRequiredMessage: 'Ovo je polje obavezno.',
  fieldInvalidMessage: 'Provjerite ovo polje.',
  newsletterEmailLabel: 'Adresa e-pošte',
  newsletterCheckInbox: 'Potvrdite u svom sandučiću',
  newsletterFullMessage:
    'Ovaj newsletter trenutačno ne prima nove pretplatnike.',
  newsletterEmailInvalid: 'Unesite valjanu adresu e-pošte.',
  contactLinkLabel: 'Kontakt',
  contactPageTitle: 'Kontakt',
  contactDefaultIntro:
    'Imate pitanje ili nešto za reći? Pošaljite poruku, a autor će odgovoriti e-poštom.',
  contactNameLabel: 'Ime',
  contactEmailLabel: 'E-pošta',
  contactMessageLabel: 'Poruka',
  contactWebsiteLabel: 'Web-mjesto (neobavezno)',
  contactPhoneLabel: 'Telefon (neobavezno)',
  contactSubmitLabel: 'Pošalji poruku',
  contactNoscript:
    'Ovaj obrazac treba JavaScript. Uključite ga za slanje poruke.',
  contactSent: 'Hvala, vaša je poruka poslana.',
  contactUnavailable: 'Ovaj obrazac trenutačno ne prima poruke.',
  contactRateLimited: 'Previše poruka odavde. Pokušajte kasnije.',
  contactMessageLinks: 'Poruka može sadržavati najviše dvije poveznice.',
  tagListLabel: 'Oznake',
  tagKickerLabel: 'Oznaka',
  seriesKickerLabel: 'Serija',
  archiveKickerLabel: 'Arhiva',
  authorKickerLabel: 'Autor',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`Članci: ${count}`}`,
  emptyListingLabel: 'Još nema članaka.',
  editionsNavigationLabel: 'Izdanja',
  editionOriginalLabel: 'Izvornik',
  editionQuickReadLabel: 'Brzo čitanje',
  editionStandardLabel: 'Standardno',
  editionDeepDiveLabel: 'Dubinski',
  editionNoticeLabel:
    'Generirano izdanje koje je pregledao autor; mjerodavan je izvornik',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'O nama',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Ažurirano ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Objave s oznakom „${tag}”`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `Oznaka ${tag} na ${publication}. ${`Članci: ${count}`}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, serija na ${publication}. ${`Dijelovi: ${count}`}.`,
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
  postRemovedHeading: 'Ova je objava uklonjena',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Uklonjena je ${date}.`,
  postRemovedHomeLabel: 'Idi na početnu stranicu',
  versionPageHeading: 'Inačica stranice',
  versionTemplateLabel: 'Predložak',
  versionThemeLabel: 'Tema',
  versionSchemasLabel: 'Sheme',
  versionToolchainLabel: 'Alati za objavu',
  versionCommitLabel: 'Izvorni commit',
  versionBuiltAtLabel: 'Izgrađeno',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('hr', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
