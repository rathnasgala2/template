/**
 * Chrome message catalog for the `lt` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Pereiti prie turinio',
  homeLinkLabel: 'Pradžia',
  primaryNavigationLabel: 'Pagrindinis meniu',
  footerNavigationLabel: 'Poraštė',
  breadcrumbNavigationLabel: 'Kelias',
  paginationNavigationLabel: 'Puslapiavimas',
  previousPageLabel: 'Ankstesnis',
  nextPageLabel: 'Kitas',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `${current} puslapis iš ${total}`,
  authorsSectionLabel: 'Autoriai',
  tagsSectionLabel: 'Žymos',
  seriesSectionLabel: 'Ciklai',
  archiveSectionLabel: 'Archyvas',
  indexHeading: 'Visi straipsniai',
  authorsIndexLabel: 'Autoriai',
  tagIndexLabelPrefix: 'Žyma:',
  seriesIndexLabelPrefix: 'Ciklas:',
  archiveYearLabelPrefix: 'Archyvas:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Apie autorių ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Autorius: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, atsidaro naujame skirtuke',
  footerLegalLabel: 'Teisinė informacija',
  termsLinkLabel: 'Sąlygos',
  privacyLinkLabel: 'Privatumas',
  consentRegionLabel: 'Privatumo pasirinkimai',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Ši svetainė norėtų naudoti ${providerName}, kad suprastų skaitomumą. Nieko neįkeliama, kol nesutinkate, o pasirinkimą bet kada galite pakeisti poraštėje.`,
  consentAcceptLabel: 'Sutikti su analitika',
  consentDeclineLabel: 'Atmesti',
  consentOpenLabel: 'Privatumo pasirinkimai',
  errorPageHeading: 'Puslapis nerastas',
  errorPageBody:
    'Ieškomo puslapio rasti nepavyko. Jis galėjo būti perkeltas, pervadintas arba pašalintas.',
  errorPageReturnHomeLabel: 'Grįžti į pradžią',
  appearanceControlLabel: 'Išvaizda',
  appearanceModeLightLabel: 'Šviesi',
  appearanceModeDarkLabel: 'Tamsi',
  appearanceModeSystemLabel: 'Sistemos',
  searchButtonLabel: 'Ieškoti',
  searchButtonAriaLabel: 'Ieškoti straipsnių',
  searchPlaceholderLabel: 'Ieškoti leidinyje',
  searchEmptyLabel: 'Nėra straipsnių, atitinkančių paiešką.',
  searchUnavailableLabel: 'Paieška šiuo metu nepasiekiama.',
  copyCodeLabel: 'Kopijuoti',
  copiedLabel: 'Nukopijuota',
  linkCopiedLabel: 'Nuoroda nukopijuota.',
  copyBlockedLabel:
    'Kopijuoti čia neleidžiama. Nukopijuokite adresą iš naršyklės.',
  codeSelectedLabel:
    'Kodas pažymėtas. Paspauskite Ctrl C arba Command C, kad nukopijuotumėte.',
  savedLabel: 'Išsaugota vėliau.',
  unsavedLabel: 'Pašalinta iš išsaugotų straipsnių.',
  menuSummaryLabel: 'Meniu',
  featuredLabel: 'Rekomenduojama',
  readEssayLabel: 'Skaityti esė',
  latestHeading: 'Naujausi',
  moreArticlesHeading: 'Daugiau straipsnių',
  browseByTagLabel: 'Naršyti pagal žymas',
  seriesCardLabel: 'Ciklas',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`Dalių: ${count}`}`,
  startSeriesLabel: 'Pradėti nuo 1 dalies',
  newsletterLabel: 'Naujienlaiškis',
  newsletterActionLabel: 'Prenumeruoti',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `Skaitymo laikas: ${minutes} min.`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `${part} dalis iš ${total}`,
  onThisPageLabel: 'Šiame puslapyje',
  writtenByLabel: 'Parašė',
  aboutTheAuthorLabel: 'Apie autorių',
  youAreHereLabel: 'Esate čia',
  newerArticleLabel: 'Naujesnis',
  olderArticleLabel: 'Senesnis',
  moreArticlesNavigationLabel: 'Daugiau straipsnių',
  keepReadingHeading: 'Skaitykite toliau',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Daugiau: ${tag}`,
  interactionsHeading: 'Atsiliepimai',
  reactionsGroupLabel: 'Reakcijos',
  likeLabel: 'Patinka',
  commentsHeading: 'Diskusija',
  interactionsNeedScriptNotice: 'Reakcijoms ir komentarams reikia JavaScript.',
  showMoreCommentsLabel: 'Rodyti daugiau komentarų',
  shareLabel: 'Dalintis',
  copyLinkLabel: 'Kopijuoti nuorodą į straipsnį',
  saveForLaterLabel: 'Išsaugoti vėliau',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Dalintis per ${network}`,
  shareByEmailLabel: 'Dalintis el. paštu',
  shareNativeLabel: 'Dalintis šiuo straipsniu',
  followLabel: 'Sekti',
  followingLabel: 'Sekate',
  unfollowLabel: 'Nebesekti',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Sekti: ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Nebesekti: ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Dabar sekate: ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Nebesekate: ${name}.`,
  followDisabledMessage: 'Sekti šioje svetainėje šiuo metu negalima.',
  followAuthorMissingMessage: 'Šio autoriaus šiuo metu sekti negalima.',
  audienceNetworkError:
    'Nepavyko susisiekti su Galascribe. Bandykite dar kartą.',
  audienceRateLimited: 'Per daug bandymų. Pabandykite dar kartą po akimirkos.',
  audienceGenericError: 'Kažkas nepavyko. Bandykite dar kartą.',
  audienceStorageBlocked:
    'Naršyklė užblokavo saugyklą, kurios svetainei reikia prisijungimui.',
  audienceSignInUnsupported:
    'Ši naršyklė negali jūsų prijungti šiame puslapyje.',
  audienceSignInFailed: 'Prisijungimas neužbaigtas. Bandykite dar kartą.',
  audienceSignInInvalid: 'Prisijungimo nuoroda negalioja. Bandykite dar kartą.',
  honeypotLabel: 'Palikite šį lauką tuščią',
  fieldRequiredMessage: 'Šis laukas privalomas.',
  fieldInvalidMessage: 'Patikrinkite šį lauką.',
  newsletterEmailLabel: 'El. pašto adresas',
  newsletterCheckInbox: 'Patvirtinkite per savo gautųjų laiškus',
  newsletterFullMessage:
    'Šis naujienlaiškis šiuo metu nepriima naujų prenumeratorių.',
  newsletterEmailInvalid: 'Įveskite tinkamą el. pašto adresą.',
  contactLinkLabel: 'Kontaktai',
  contactPageTitle: 'Kontaktai',
  contactDefaultIntro:
    'Turite klausimą ar norite kažką pasakyti? Parašykite žinutę, o autorius atsakys el. paštu.',
  contactNameLabel: 'Vardas',
  contactEmailLabel: 'El. paštas',
  contactMessageLabel: 'Žinutė',
  contactWebsiteLabel: 'Svetainė (neprivaloma)',
  contactPhoneLabel: 'Telefonas (neprivaloma)',
  contactSubmitLabel: 'Siųsti žinutę',
  contactNoscript:
    'Šiai formai reikia JavaScript. Įjunkite jį, kad galėtumėte siųsti žinutę.',
  contactSent: 'Ačiū, jūsų žinutė išsiųsta.',
  contactUnavailable: 'Ši forma šiuo metu nepriima žinučių.',
  contactRateLimited: 'Per daug žinučių iš čia. Bandykite vėliau.',
  contactMessageLinks: 'Žinutėje gali būti daugiausia dvi nuorodos.',
  tagListLabel: 'Žymos',
  tagKickerLabel: 'Žyma',
  seriesKickerLabel: 'Ciklas',
  archiveKickerLabel: 'Archyvas',
  authorKickerLabel: 'Autorius',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`Straipsnių: ${count}`}`,
  emptyListingLabel: 'Straipsnių dar nėra.',
  editionsNavigationLabel: 'Versijos',
  editionOriginalLabel: 'Originalas',
  editionQuickReadLabel: 'Greitas skaitymas',
  editionStandardLabel: 'Standartinė',
  editionDeepDiveLabel: 'Išsami',
  editionNoticeLabel:
    'Sugeneruota versija, peržiūrėta autoriaus; pagrindinis yra originalas',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Apie',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Atnaujinta ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Įrašai su žyma „${tag}“`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `Žyma ${tag} svetainėje ${publication}. ${`Straipsnių: ${count}`}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, ciklas svetainėje ${publication}. ${`Dalių: ${count}`}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Archyvas ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `Paskelbta ${year} m. svetainėje ${publication}. ${`Straipsnių: ${count}`}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Autoriaus ${name} straipsniai svetainėje ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Naršykite temas svetainėje ${publication}. Iš viso: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Naršykite ciklus svetainėje ${publication}. Iš viso: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Visi ${publication} straipsniai pagal metus. Iš viso: ${count}.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Visi ${publication} straipsniai, naujausi pirmi.`,
  exploreColumnLabel: 'Naršyti',
  rssFeedLabel: 'RSS srautas',
  languageKickerLabel: 'Kalba',
  languageSwitcherLabel: 'Kalbos',
  languageChipsLabel: 'Prieinamos kalbos',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `Kalba: ${language}, ${publication}. ${`Straipsnių: ${count}`}.`,
  postRemovedHeading: 'Šis įrašas pašalintas',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Jis pašalintas ${date}.`,
  postRemovedHomeLabel: 'Eiti į pradžią',
  versionPageHeading: 'Svetainės versija',
  versionTemplateLabel: 'Šablonas',
  versionThemeLabel: 'Tema',
  versionSchemasLabel: 'Schemos',
  versionToolchainLabel: 'Publikavimo įrankiai',
  versionCommitLabel: 'Šaltinio commit',
  versionBuiltAtLabel: 'Sukurta',
  listenNavLabel: 'Klausyti',
  listenNavCurrentLabel: 'Klausyti šio įrašo',
  listenInviteTitle: 'Užimtos rankos? Verčiau paklausykite.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Šis įrašas turi ir pokalbio versiją, trukmė ${minutes} min. Tinka kelionei, treniruotei ar indų plovimui.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Šis įrašas turi ir įgarsintą versiją, trukmė ${minutes} min. Tinka kelionei, treniruotei ar indų plovimui.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Šis įrašas turi ir diskusijos versiją, trukmė ${minutes} min. Tinka kelionei, treniruotei ar indų plovimui.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Šis įrašas turi ir skečo versiją, trukmė ${minutes} min. Tinka kelionei, treniruotei ar indų plovimui.`,
  listenInvitePlayLabel: 'Leisti',
  listenInviteDeclineLabel: 'Ne, ačiū',
  listenInviteNote: 'DI balsai, pritaikyta pagal šį įrašą.',
  listenInviteCloseLabel: 'Kol kas uždaryti',
  listenPlayerRegionLabel: 'Garso grotuvas',
  listenPlayerNowPlayingLabel: 'Dabar groja',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} iš ${count}`,
  listenPlayerPlayLabel: 'Leisti',
  listenPlayerPauseLabel: 'Pauzė',
  listenPlayerBackLabel: '15 sekundžių atgal',
  listenPlayerPreviousLabel: 'Ankstesnis epizodas',
  listenPlayerNextLabel: 'Kitas epizodas',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Atkūrimo greitis ${rate}×`,
  listenPlayerSeekLabel: 'Padėtis',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} iš ${total}`,
  listenPlayerCloseLabel: 'Sustabdyti ir uždaryti',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Dabar groja: ${title}`,
  listenListHeading: 'Klausykite šio tinklaraščio',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `Epizodų: ${count} · ${duration}`,
  listenListPlayAllLabel: 'Leisti visus',
  listenListShuffleLabel: 'Atsitiktinai',
  listenListOrderLabel: 'Tvarka',
  listenListNewestLabel: 'Naujausi pirmi',
  listenListOldestLabel: 'Seniausi pirmi',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Rodyti visus (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Leisti: ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min.`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) =>
    `${hours} val. ${minutes} min.`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('lt', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
