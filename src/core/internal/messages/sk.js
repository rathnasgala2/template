/**
 * Chrome message catalog for the `sk` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Preskočiť na obsah',
  homeLinkLabel: 'Domov',
  primaryNavigationLabel: 'Hlavná ponuka',
  footerNavigationLabel: 'Päta',
  breadcrumbNavigationLabel: 'Cesta',
  paginationNavigationLabel: 'Stránkovanie',
  previousPageLabel: 'Predchádzajúce',
  nextPageLabel: 'Ďalšie',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Strana ${current} z ${total}`,
  authorsSectionLabel: 'Autori',
  tagsSectionLabel: 'Štítky',
  seriesSectionLabel: 'Série',
  archiveSectionLabel: 'Archív',
  indexHeading: 'Všetky články',
  authorsIndexLabel: 'Autori',
  tagIndexLabelPrefix: 'Štítok:',
  seriesIndexLabelPrefix: 'Séria:',
  archiveYearLabelPrefix: 'Archív:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `O autorovi ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Autor: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, otvorí sa na novej karte',
  footerLegalLabel: 'Právne informácie',
  termsLinkLabel: 'Podmienky',
  privacyLinkLabel: 'Súkromie',
  consentRegionLabel: 'Voľby súkromia',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Táto stránka by chcela používať ${providerName} na zisťovanie čítanosti. Nič sa nenačíta, kým nesúhlasíte, a svoju voľbu môžete kedykoľvek zmeniť v päte stránky.`,
  consentAcceptLabel: 'Povoliť analytiku',
  consentDeclineLabel: 'Odmietnuť',
  consentOpenLabel: 'Voľby súkromia',
  errorPageHeading: 'Stránka sa nenašla',
  errorPageBody:
    'Stránka, ktorú hľadáte, sa nenašla. Mohla byť presunutá, premenovaná alebo odstránená.',
  errorPageReturnHomeLabel: 'Späť na domovskú stránku',
  appearanceControlLabel: 'Vzhľad',
  appearanceModeLightLabel: 'Svetlý',
  appearanceModeDarkLabel: 'Tmavý',
  appearanceModeSystemLabel: 'Systémový',
  searchButtonLabel: 'Hľadať',
  searchButtonAriaLabel: 'Hľadať v článkoch',
  searchPlaceholderLabel: 'Hľadať v publikácii',
  searchEmptyLabel: 'Vášmu hľadaniu nezodpovedá žiadny článok.',
  searchUnavailableLabel: 'Vyhľadávanie momentálne nie je dostupné.',
  copyCodeLabel: 'Kopírovať',
  copiedLabel: 'Skopírované',
  linkCopiedLabel: 'Odkaz bol skopírovaný.',
  copyBlockedLabel:
    'Kopírovanie je tu zablokované. Skopírujte adresu z prehliadača.',
  codeSelectedLabel:
    'Kód je vybraný. Skopírujete ho stlačením Ctrl C alebo Command C.',
  savedLabel: 'Uložené na neskôr.',
  unsavedLabel: 'Odstránené z uložených článkov.',
  menuSummaryLabel: 'Ponuka',
  featuredLabel: 'Odporúčané',
  readEssayLabel: 'Prečítať esej',
  latestHeading: 'Najnovšie',
  moreArticlesHeading: 'Ďalšie články',
  browseByTagLabel: 'Prehliadať podľa štítkov',
  seriesCardLabel: 'Séria',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`Časti: ${count}`}`,
  startSeriesLabel: 'Začať 1. časťou',
  newsletterLabel: 'Newsletter',
  newsletterActionLabel: 'Odoberať',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min čítania`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Časť ${part} z ${total}`,
  onThisPageLabel: 'Na tejto stránke',
  writtenByLabel: 'Napísal(a)',
  aboutTheAuthorLabel: 'O autorovi',
  youAreHereLabel: 'Ste tu',
  newerArticleLabel: 'Novšie',
  olderArticleLabel: 'Staršie',
  moreArticlesNavigationLabel: 'Ďalšie články',
  keepReadingHeading: 'Čítajte ďalej',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Viac k téme ${tag}`,
  interactionsHeading: 'Reakcie',
  reactionsGroupLabel: 'Reakcie',
  likeLabel: 'Páči sa mi',
  commentsHeading: 'Diskusia',
  interactionsNeedScriptNotice: 'Reakcie a komentáre vyžadujú JavaScript.',
  showMoreCommentsLabel: 'Zobraziť ďalšie komentáre',
  shareLabel: 'Zdieľať',
  copyLinkLabel: 'Kopírovať odkaz na článok',
  saveForLaterLabel: 'Uložiť na neskôr',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Zdieľať na ${network}`,
  shareByEmailLabel: 'Zdieľať e-mailom',
  shareNativeLabel: 'Zdieľať tento článok',
  followLabel: 'Sledovať',
  followingLabel: 'Sledujete',
  unfollowLabel: 'Prestať sledovať',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Sledovať: ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Prestať sledovať: ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Teraz sledujete: ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Už nesledujete: ${name}.`,
  followDisabledMessage:
    'Sledovanie na tejto stránke momentálne nie je dostupné.',
  followAuthorMissingMessage: 'Tohto autora momentálne nemožno sledovať.',
  audienceNetworkError: 'Nepodarilo sa spojiť s Galascribe. Skúste to znova.',
  audienceRateLimited: 'Príliš veľa pokusov. Skúste to o chvíľu znova.',
  audienceGenericError: 'Niečo sa pokazilo. Skúste to znova.',
  audienceStorageBlocked:
    'Váš prehliadač zablokoval úložisko, ktoré stránka potrebuje na prihlásenie.',
  audienceSignInUnsupported:
    'Tento prehliadač vás na tejto stránke nemôže prihlásiť.',
  audienceSignInFailed: 'Prihlásenie sa nedokončilo. Skúste to znova.',
  audienceSignInInvalid: 'Prihlasovací odkaz nebol platný. Skúste to znova.',
  honeypotLabel: 'Toto pole nechajte prázdne',
  fieldRequiredMessage: 'Toto pole je povinné.',
  fieldInvalidMessage: 'Skontrolujte toto pole.',
  newsletterEmailLabel: 'E-mailová adresa',
  newsletterCheckInbox: 'Potvrďte v doručenej pošte',
  newsletterFullMessage:
    'Tento newsletter momentálne neprijíma nových odberateľov.',
  newsletterEmailInvalid: 'Zadajte platnú e-mailovú adresu.',
  contactLinkLabel: 'Kontakt',
  contactPageTitle: 'Kontakt',
  contactDefaultIntro:
    'Máte otázku alebo niečo na srdci? Pošlite správu a autor odpovie e-mailom.',
  contactNameLabel: 'Meno',
  contactEmailLabel: 'E-mail',
  contactMessageLabel: 'Správa',
  contactWebsiteLabel: 'Web (nepovinné)',
  contactPhoneLabel: 'Telefón (nepovinné)',
  contactSubmitLabel: 'Odoslať správu',
  contactNoscript:
    'Tento formulár vyžaduje JavaScript. Zapnite ho, aby ste mohli odoslať správu.',
  contactSent: 'Ďakujeme, vaša správa bola odoslaná.',
  contactUnavailable: 'Tento formulár momentálne neprijíma správy.',
  contactRateLimited: 'Príliš veľa správ odtiaľto. Skúste to neskôr.',
  contactMessageLinks: 'Správa môže obsahovať najviac dva odkazy.',
  tagListLabel: 'Štítky',
  tagKickerLabel: 'Štítok',
  seriesKickerLabel: 'Séria',
  archiveKickerLabel: 'Archív',
  authorKickerLabel: 'Autor',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`Články: ${count}`}`,
  emptyListingLabel: 'Zatiaľ žiadne články.',
  editionsNavigationLabel: 'Verzie',
  editionOriginalLabel: 'Originál',
  editionQuickReadLabel: 'Rýchle čítanie',
  editionStandardLabel: 'Štandardná',
  editionDeepDiveLabel: 'Do hĺbky',
  editionNoticeLabel:
    'Vygenerovaná verzia skontrolovaná autorom; rozhodujúci je originál',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'O nás',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Aktualizované ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Príspevky so štítkom „${tag}“`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `Štítok ${tag} na ${publication}. ${`Články: ${count}`}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, séria na ${publication}. ${`Časti: ${count}`}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Archív ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `Zverejnené v roku ${year} na ${publication}. ${`Články: ${count}`}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Články od autora ${name} na ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Prehliadajte témy na ${publication}. Spolu: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Prehliadajte série na ${publication}. Spolu: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Všetky články na ${publication} podľa rokov. Spolu: ${count}.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Všetky články na ${publication}, najnovšie ako prvé.`,
  exploreColumnLabel: 'Preskúmať',
  rssFeedLabel: 'RSS kanál',
  languageKickerLabel: 'Jazyk',
  languageSwitcherLabel: 'Jazyky',
  languageChipsLabel: 'Dostupné jazyky',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `Jazyk ${language} na ${publication}. ${`Články: ${count}`}.`,
  postRemovedHeading: 'Tento príspevok bol odstránený',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Bol odstránený ${date}.`,
  postRemovedHomeLabel: 'Prejsť na domovskú stránku',
  versionPageHeading: 'Verzia stránky',
  versionTemplateLabel: 'Šablóna',
  versionThemeLabel: 'Téma',
  versionSchemasLabel: 'Schémy',
  versionToolchainLabel: 'Nástroje na publikovanie',
  versionCommitLabel: 'Zdrojový commit',
  versionBuiltAtLabel: 'Zostavené',
  listenNavLabel: 'Počúvať',
  listenNavCurrentLabel: 'Počúvať tento článok',
  listenInviteTitle: 'Máte plné ruky? Radšej počúvajte.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Tento článok existuje aj ako rozhovor na ${minutes} min. Hodí sa na cestu autom, do posilňovne alebo k umývaniu riadu.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Tento článok existuje aj ako rozprávanie na ${minutes} min. Hodí sa na cestu autom, do posilňovne alebo k umývaniu riadu.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Tento článok existuje aj ako debata na ${minutes} min. Hodí sa na cestu autom, do posilňovne alebo k umývaniu riadu.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Tento článok existuje aj ako scénka na ${minutes} min. Hodí sa na cestu autom, do posilňovne alebo k umývaniu riadu.`,
  listenInvitePlayLabel: 'Prehrať',
  listenInviteDeclineLabel: 'Nie, ďakujem',
  listenInviteNote: 'Hlasy AI, upravené podľa tohto článku.',
  listenInviteCloseLabel: 'Zatvoriť zatiaľ',
  listenPlayerRegionLabel: 'Audio prehrávač',
  listenPlayerNowPlayingLabel: 'Práve hrá',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} z ${count}`,
  listenPlayerPlayLabel: 'Prehrať',
  listenPlayerPauseLabel: 'Pozastaviť',
  listenPlayerBackLabel: 'O 15 sekúnd späť',
  listenPlayerPreviousLabel: 'Predchádzajúca epizóda',
  listenPlayerNextLabel: 'Ďalšia epizóda',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Rýchlosť prehrávania ${rate}×`,
  listenPlayerSeekLabel: 'Pozícia',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} z ${total}`,
  listenPlayerCloseLabel: 'Zastaviť a zavrieť',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Práve hrá: ${title}`,
  listenListHeading: 'Počúvajte tento blog',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `Epizód: ${count} · ${duration}`,
  listenListPlayAllLabel: 'Prehrať všetko',
  listenListShuffleLabel: 'Náhodne',
  listenListOrderLabel: 'Poradie',
  listenListNewestLabel: 'Najnovšie prvé',
  listenListOldestLabel: 'Najstaršie prvé',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Zobraziť všetkých ${count}`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Prehrať: ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} h ${minutes} min`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('sk', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
