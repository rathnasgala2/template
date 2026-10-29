/**
 * Chrome message catalog for the `fi` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Siirry sisältöön',
  homeLinkLabel: 'Etusivu',
  primaryNavigationLabel: 'Päävalikko',
  footerNavigationLabel: 'Alatunniste',
  breadcrumbNavigationLabel: 'Polku',
  paginationNavigationLabel: 'Sivutus',
  previousPageLabel: 'Edellinen',
  nextPageLabel: 'Seuraava',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Sivu ${current} / ${total}`,
  authorsSectionLabel: 'Kirjoittajat',
  tagsSectionLabel: 'Tunnisteet',
  seriesSectionLabel: 'Sarjat',
  archiveSectionLabel: 'Arkisto',
  indexHeading: 'Kaikki artikkelit',
  authorsIndexLabel: 'Kirjoittajat',
  tagIndexLabelPrefix: 'Tunniste:',
  seriesIndexLabelPrefix: 'Sarja:',
  archiveYearLabelPrefix: 'Arkisto:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Tietoa kirjoittajasta ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Kirjoittanut ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, avautuu uudelle välilehdelle',
  footerLegalLabel: 'Lakiasiat',
  termsLinkLabel: 'Ehdot',
  privacyLinkLabel: 'Tietosuoja',
  consentRegionLabel: 'Tietosuojavalinnat',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Tämä sivusto haluaisi käyttää palvelua ${providerName} lukijamäärien ymmärtämiseen. Mitään ei ladata, ennen kuin hyväksyt, ja voit muuttaa valintaasi milloin tahansa alatunnisteesta.`,
  consentAcceptLabel: 'Hyväksy analytiikka',
  consentDeclineLabel: 'Hylkää',
  consentOpenLabel: 'Tietosuojavalinnat',
  errorPageHeading: 'Sivua ei löytynyt',
  errorPageBody:
    'Etsimääsi sivua ei löytynyt. Se on voitu siirtää, nimetä uudelleen tai poistaa.',
  errorPageReturnHomeLabel: 'Palaa etusivulle',
  appearanceControlLabel: 'Ulkoasu',
  appearanceModeLightLabel: 'Vaalea',
  appearanceModeDarkLabel: 'Tumma',
  appearanceModeSystemLabel: 'Järjestelmä',
  searchButtonLabel: 'Haku',
  searchButtonAriaLabel: 'Hae artikkeleita',
  searchPlaceholderLabel: 'Hae julkaisusta',
  searchEmptyLabel: 'Haulla ei löytynyt artikkeleita.',
  searchUnavailableLabel: 'Haku ei ole juuri nyt käytettävissä.',
  copyCodeLabel: 'Kopioi',
  copiedLabel: 'Kopioitu',
  linkCopiedLabel: 'Linkki kopioitu.',
  copyBlockedLabel: 'Kopiointi on estetty täällä. Kopioi osoite selaimesta.',
  codeSelectedLabel: 'Koodi valittu. Kopioi painamalla Ctrl C tai Command C.',
  savedLabel: 'Tallennettu myöhemmäksi.',
  unsavedLabel: 'Poistettu tallennetuista artikkeleista.',
  menuSummaryLabel: 'Valikko',
  featuredLabel: 'Suositeltu',
  readEssayLabel: 'Lue essee',
  latestHeading: 'Uusimmat',
  moreArticlesHeading: 'Lisää artikkeleita',
  browseByTagLabel: 'Selaa tunnisteittain',
  seriesCardLabel: 'Sarja',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count === '1' ? '1 osa' : `${count} osaa`}`,
  startSeriesLabel: 'Aloita osasta 1',
  newsletterLabel: 'Uutiskirje',
  newsletterActionLabel: 'Tilaa',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `Lukuaika ${minutes} min`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Osa ${part} / ${total}`,
  onThisPageLabel: 'Tällä sivulla',
  writtenByLabel: 'Kirjoittanut',
  aboutTheAuthorLabel: 'Tietoa kirjoittajasta',
  youAreHereLabel: 'Olet tässä',
  newerArticleLabel: 'Uudempi',
  olderArticleLabel: 'Vanhempi',
  moreArticlesNavigationLabel: 'Lisää artikkeleita',
  keepReadingHeading: 'Jatka lukemista',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Lisää aiheesta ${tag}`,
  interactionsHeading: 'Reaktiot',
  reactionsGroupLabel: 'Reaktiot',
  likeLabel: 'Tykkää',
  commentsHeading: 'Keskustelu',
  interactionsNeedScriptNotice: 'Reaktiot ja kommentit vaativat JavaScriptin.',
  showMoreCommentsLabel: 'Näytä lisää kommentteja',
  shareLabel: 'Jaa',
  copyLinkLabel: 'Kopioi artikkelin linkki',
  saveForLaterLabel: 'Tallenna myöhemmäksi',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Jaa palvelussa ${network}`,
  shareByEmailLabel: 'Jaa sähköpostilla',
  shareNativeLabel: 'Jaa tämä artikkeli',
  followLabel: 'Seuraa',
  followingLabel: 'Seurataan',
  unfollowLabel: 'Lopeta seuraaminen',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Seuraa: ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Lopeta seuraaminen: ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Seuraat nyt: ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Et enää seuraa: ${name}.`,
  followDisabledMessage:
    'Seuraaminen ei ole tällä sivustolla käytettävissä juuri nyt.',
  followAuthorMissingMessage: 'Tätä kirjoittajaa ei voi seurata juuri nyt.',
  audienceNetworkError: 'Galascribeen ei saatu yhteyttä. Yritä uudelleen.',
  audienceRateLimited: 'Liian monta yritystä. Yritä hetken kuluttua uudelleen.',
  audienceGenericError: 'Jokin meni pieleen. Yritä uudelleen.',
  audienceStorageBlocked:
    'Selaimesi esti tallennustilan, jota sivusto tarvitsee kirjautumiseen.',
  audienceSignInUnsupported:
    'Tämä selain ei voi kirjata sinua sisään tällä sivulla.',
  audienceSignInFailed: 'Kirjautuminen ei onnistunut. Yritä uudelleen.',
  audienceSignInInvalid: 'Kirjautumislinkki ei kelvannut. Yritä uudelleen.',
  honeypotLabel: 'Jätä tämä kenttä tyhjäksi',
  fieldRequiredMessage: 'Tämä kenttä on pakollinen.',
  fieldInvalidMessage: 'Tarkista tämä kenttä.',
  newsletterEmailLabel: 'Sähköpostiosoite',
  newsletterCheckInbox: 'Vahvista tilaus saapuneista viesteistä',
  newsletterFullMessage: 'Tämä uutiskirje ei ota uusia tilaajia juuri nyt.',
  newsletterEmailInvalid: 'Anna kelvollinen sähköpostiosoite.',
  contactLinkLabel: 'Yhteystiedot',
  contactPageTitle: 'Yhteystiedot',
  contactDefaultIntro:
    'Onko sinulla kysymys tai asiaa? Lähetä viesti, niin kirjoittaja vastaa sähköpostilla.',
  contactNameLabel: 'Nimi',
  contactEmailLabel: 'Sähköposti',
  contactMessageLabel: 'Viesti',
  contactWebsiteLabel: 'Verkkosivusto (valinnainen)',
  contactPhoneLabel: 'Puhelin (valinnainen)',
  contactSubmitLabel: 'Lähetä viesti',
  contactNoscript:
    'Lomake vaatii JavaScriptin. Ota se käyttöön lähettääksesi viestin.',
  contactSent: 'Kiitos, viestisi on lähetetty.',
  contactUnavailable: 'Tämä lomake ei ota viestejä vastaan juuri nyt.',
  contactRateLimited:
    'Täältä on tullut liian monta viestiä. Yritä myöhemmin uudelleen.',
  contactMessageLinks: 'Viestissä voi olla enintään kaksi linkkiä.',
  tagListLabel: 'Tunnisteet',
  tagKickerLabel: 'Tunniste',
  seriesKickerLabel: 'Sarja',
  archiveKickerLabel: 'Arkisto',
  authorKickerLabel: 'Kirjoittaja',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) =>
    `${count === '1' ? '1 artikkeli' : `${count} artikkelia`}`,
  emptyListingLabel: 'Ei vielä artikkeleita.',
  editionsNavigationLabel: 'Versiot',
  editionOriginalLabel: 'Alkuperäinen',
  editionQuickReadLabel: 'Pikaluku',
  editionStandardLabel: 'Vakio',
  editionDeepDiveLabel: 'Syväsukellus',
  editionNoticeLabel:
    'Luotu versio, kirjoittajan tarkistama; alkuperäinen on ensisijainen',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Tietoa',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Päivitetty ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Tunnisteella ”${tag}” merkityt kirjoitukset`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count === '1' ? '1 artikkeli' : `${count} artikkelia`}, tunniste ${tag}, julkaisussa ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, ${count === '1' ? '1 osa' : `${count} osaa`} käsittävä sarja julkaisussa ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arkisto ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count === '1' ? '1 artikkeli' : `${count} artikkelia`} julkaistu vuonna ${year} julkaisussa ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Kirjoittajan ${name} artikkelit julkaisussa ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Selaa julkaisun ${publication} ${count} aihetta.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Selaa julkaisun ${publication} ${count} sarjaa.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Kaikki julkaisun ${publication} artikkelit vuosittain, yhteensä ${count}.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Kaikki julkaisun ${publication} artikkelit, uusimmat ensin.`,
  exploreColumnLabel: 'Tutustu',
  rssFeedLabel: 'RSS-syöte',
  languageKickerLabel: 'Kieli',
  languageSwitcherLabel: 'Kielet',
  languageChipsLabel: 'Saatavilla olevat kielet',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? '1 artikkeli' : `${count} artikkelia`} kielellä ${language} julkaisussa ${publication}.`,
  postRemovedHeading: 'Tämä kirjoitus on poistettu',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Se poistettiin ${date}.`,
  postRemovedHomeLabel: 'Siirry etusivulle',
  versionPageHeading: 'Sivuston versio',
  versionTemplateLabel: 'Pohja',
  versionThemeLabel: 'Teema',
  versionSchemasLabel: 'Skeemat',
  versionToolchainLabel: 'Julkaisutyökalut',
  versionCommitLabel: 'Lähdekommitti',
  versionBuiltAtLabel: 'Rakennettu',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('fi', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
