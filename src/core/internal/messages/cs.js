/**
 * Chrome message catalog for the `cs` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Přejít na obsah',
  homeLinkLabel: 'Domů',
  primaryNavigationLabel: 'Hlavní',
  footerNavigationLabel: 'Patička',
  breadcrumbNavigationLabel: 'Drobečková navigace',
  paginationNavigationLabel: 'Stránkování',
  previousPageLabel: 'Předchozí',
  nextPageLabel: 'Další',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Strana ${current} z ${total}`,
  authorsSectionLabel: 'Autoři',
  tagsSectionLabel: 'Štítky',
  seriesSectionLabel: 'Série',
  archiveSectionLabel: 'Archiv',
  indexHeading: 'Všechny články',
  authorsIndexLabel: 'Autoři',
  tagIndexLabelPrefix: 'Štítek:',
  seriesIndexLabelPrefix: 'Série:',
  archiveYearLabelPrefix: 'Archiv:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `O autorovi: ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Autor: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, otevře se v nové záložce',
  footerLegalLabel: 'Právní informace',
  termsLinkLabel: 'Podmínky',
  privacyLinkLabel: 'Soukromí',
  consentRegionLabel: 'Nastavení soukromí',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Tento web by rád používal ${providerName}, aby lépe poznal své čtenáře. Dokud nesouhlasíte, nic se nenačítá a svou volbu můžete kdykoli změnit v patičce.`,
  consentAcceptLabel: 'Povolit analytiku',
  consentDeclineLabel: 'Odmítnout',
  consentOpenLabel: 'Nastavení soukromí',
  errorPageHeading: 'Stránka nenalezena',
  errorPageBody:
    'Stránka, kterou hledáte, nebyla nalezena. Mohla být přesunuta, přejmenována nebo odstraněna.',
  errorPageReturnHomeLabel: 'Zpět na úvodní stránku',
  appearanceControlLabel: 'Vzhled',
  appearanceModeLightLabel: 'Světlý',
  appearanceModeDarkLabel: 'Tmavý',
  appearanceModeSystemLabel: 'Systémový',
  searchButtonLabel: 'Hledat',
  searchButtonAriaLabel: 'Hledat v článcích',
  searchPlaceholderLabel: 'Hledat v publikaci',
  searchEmptyLabel: 'Vašemu hledání neodpovídá žádný článek.',
  searchUnavailableLabel: 'Hledání teď není dostupné.',
  copyCodeLabel: 'Kopírovat',
  copiedLabel: 'Zkopírováno',
  linkCopiedLabel: 'Odkaz zkopírován.',
  copyBlockedLabel:
    'Kopírování je zde zablokováno. Zkopírujte adresu z prohlížeče.',
  codeSelectedLabel:
    'Kód vybrán. Zkopírujte ho stisknutím Ctrl C nebo Command C.',
  savedLabel: 'Uloženo na později.',
  unsavedLabel: 'Odebráno z uložených článků.',
  menuSummaryLabel: 'Nabídka',
  featuredLabel: 'Doporučené',
  readEssayLabel: 'Číst esej',
  latestHeading: 'Nejnovější',
  moreArticlesHeading: 'Další články',
  browseByTagLabel: 'Procházet podle štítků',
  seriesCardLabel: 'Série',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`Dílů: ${count}`}`,
  startSeriesLabel: 'Začít dílem 1',
  newsletterLabel: 'Newsletter',
  newsletterActionLabel: 'Odebírat',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min čtení`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Díl ${part} z ${total}`,
  onThisPageLabel: 'Na této stránce',
  writtenByLabel: 'Autor',
  aboutTheAuthorLabel: 'O autorovi',
  youAreHereLabel: 'Jste zde',
  newerArticleLabel: 'Novější',
  olderArticleLabel: 'Starší',
  moreArticlesNavigationLabel: 'Další články',
  keepReadingHeading: 'Číst dál',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Více ve štítku ${tag}`,
  interactionsHeading: 'Reakce',
  reactionsGroupLabel: 'Reakce',
  likeLabel: 'To se mi líbí',
  commentsHeading: 'Diskuse',
  interactionsNeedScriptNotice: 'Reakce a komentáře vyžadují JavaScript.',
  showMoreCommentsLabel: 'Zobrazit další komentáře',
  shareLabel: 'Sdílet',
  copyLinkLabel: 'Kopírovat odkaz na tento článek',
  saveForLaterLabel: 'Uložit na později',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Sdílet na ${network}`,
  shareByEmailLabel: 'Sdílet e-mailem',
  shareNativeLabel: 'Sdílet tento článek',
  followLabel: 'Sledovat',
  followingLabel: 'Sledujete',
  unfollowLabel: 'Přestat sledovat',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Sledovat ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Přestat sledovat ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Nyní sledujete ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Už nesledujete ${name}.`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `Sledujících: ${count}`,
  followersTeamHint: 'Vidí to jen tým vašeho webu',
  followDisabledMessage: 'Sledování teď na tomto webu není dostupné.',
  followAuthorMissingMessage: 'Tohoto autora teď nelze sledovat.',
  audienceNetworkError:
    'Galascribe se nepodařilo kontaktovat. Zkuste to znovu.',
  audienceRateLimited: 'Příliš mnoho pokusů. Zkuste to za chvíli.',
  audienceGenericError: 'Něco se pokazilo. Zkuste to znovu.',
  audienceStorageBlocked:
    'Prohlížeč zablokoval úložiště, které web potřebuje k přihlášení.',
  audienceSignInUnsupported:
    'Tento prohlížeč vás na této stránce nemůže přihlásit.',
  audienceSignInFailed: 'Přihlášení se nedokončilo. Zkuste to znovu.',
  audienceSignInInvalid:
    'Tento přihlašovací odkaz nebyl platný. Zkuste to znovu.',
  honeypotLabel: 'Toto pole nechte prázdné',
  fieldRequiredMessage: 'Toto pole je povinné.',
  fieldInvalidMessage: 'Zkontrolujte toto pole.',
  newsletterEmailLabel: 'E-mailová adresa',
  newsletterCheckInbox: 'Potvrďte v doručené poště',
  newsletterFullMessage: 'Tento newsletter teď nepřijímá nové odběratele.',
  newsletterEmailInvalid: 'Zadejte platnou e-mailovou adresu.',
  contactLinkLabel: 'Kontakt',
  contactPageTitle: 'Kontakt',
  contactDefaultIntro:
    'Máte otázku nebo co říct? Pošlete zprávu a autor odpoví e-mailem.',
  contactNameLabel: 'Jméno',
  contactEmailLabel: 'E-mail',
  contactMessageLabel: 'Zpráva',
  contactWebsiteLabel: 'Web (nepovinné)',
  contactPhoneLabel: 'Telefon (nepovinné)',
  contactSubmitLabel: 'Odeslat zprávu',
  contactNoscript:
    'Tento formulář vyžaduje JavaScript. Zapněte ho, abyste mohli odeslat zprávu.',
  contactSent: 'Děkujeme, vaše zpráva byla odeslána.',
  contactUnavailable: 'Tento formulář teď nepřijímá zprávy.',
  contactRateLimited: 'Příliš mnoho zpráv odsud. Zkuste to později.',
  contactMessageLinks: 'Zpráva může obsahovat nejvýše dva odkazy.',
  tagListLabel: 'Štítky',
  tagKickerLabel: 'Štítek',
  seriesKickerLabel: 'Série',
  archiveKickerLabel: 'Archiv',
  authorKickerLabel: 'Autor',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`Článků: ${count}`}`,
  emptyListingLabel: 'Zatím žádné články.',
  editionsNavigationLabel: 'Verze',
  editionOriginalLabel: 'Originál',
  editionQuickReadLabel: 'Rychlé čtení',
  editionStandardLabel: 'Standardní',
  editionDeepDiveLabel: 'Do hloubky',
  editionNoticeLabel:
    'Vygenerovaná verze, zkontrolovaná autorem; rozhodující je originál',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'O nás',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Aktualizováno: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Příspěvky se štítkem „${tag}“`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `Články se štítkem ${tag} na ${publication}. ${`Článků: ${count}`}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}: série na ${publication}. ${`Dílů: ${count}`}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Archiv ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `Články z roku ${year} na ${publication}. ${`Článků: ${count}`}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Články autora ${name} na ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Témata na ${publication}. ${`Témat: ${count}`}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Série na ${publication}. Celkem: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Všechny články na ${publication} podle roků. Celkem: ${count}.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Všechny články na ${publication}, od nejnovějších.`,
  exploreColumnLabel: 'Objevovat',
  rssFeedLabel: 'RSS kanál',
  languageKickerLabel: 'Jazyk',
  languageSwitcherLabel: 'Jazyky',
  languageChipsLabel: 'Dostupné jazyky',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `Články v jazyce ${language} na ${publication}. ${`Článků: ${count}`}.`,
  postRemovedHeading: 'Tento příspěvek byl odstraněn',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Byl odstraněn ${date}.`,
  postRemovedHomeLabel: 'Přejít na úvodní stránku',
  versionPageHeading: 'Verze webu',
  versionTemplateLabel: 'Šablona',
  versionThemeLabel: 'Motiv',
  versionSchemasLabel: 'Schémata',
  versionToolchainLabel: 'Publikační nástroje',
  versionCommitLabel: 'Zdrojový commit',
  versionBuiltAtLabel: 'Sestaveno',
  listenNavLabel: 'Poslouchat',
  listenNavCurrentLabel: 'Poslechnout si tento článek',
  listenInviteTitle: 'Máte plné ruce? Poslouchejte.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Tento článek existuje i jako rozhovor na ${minutes} min. Hodí se na cestu autem, do posilovny nebo k mytí nádobí.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Tento článek existuje i jako vyprávění na ${minutes} min. Hodí se na cestu autem, do posilovny nebo k mytí nádobí.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Tento článek existuje i jako debata na ${minutes} min. Hodí se na cestu autem, do posilovny nebo k mytí nádobí.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Tento článek existuje i jako scénka na ${minutes} min. Hodí se na cestu autem, do posilovny nebo k mytí nádobí.`,
  listenInvitePlayLabel: 'Přehrát',
  listenInviteDeclineLabel: 'Ne, děkuji',
  listenInviteNote: 'Hlasy AI, upraveno podle tohoto článku.',
  listenInviteCloseLabel: 'Zavřít prozatím',
  listenPlayerRegionLabel: 'Audio přehrávač',
  listenPlayerNowPlayingLabel: 'Právě hraje',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} z ${count}`,
  listenPlayerPlayLabel: 'Přehrát',
  listenPlayerPauseLabel: 'Pozastavit',
  listenPlayerBackLabel: 'O 15 sekund zpět',
  listenPlayerPreviousLabel: 'Předchozí epizoda',
  listenPlayerNextLabel: 'Další epizoda',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Rychlost přehrávání ${rate}×`,
  listenPlayerSeekLabel: 'Pozice',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} z ${total}`,
  listenPlayerCloseLabel: 'Zastavit a zavřít',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Právě hraje: ${title}`,
  listenListHeading: 'Poslouchejte tento blog',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `Epizod: ${count} · ${duration}`,
  listenListPlayAllLabel: 'Přehrát vše',
  listenListShuffleLabel: 'Náhodně',
  listenListOrderLabel: 'Pořadí',
  listenListNewestLabel: 'Nejnovější první',
  listenListOldestLabel: 'Nejstarší první',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Zobrazit všech ${count}`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Přehrát: ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} h ${minutes} min`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('cs', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
