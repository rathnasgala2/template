/**
 * Chrome message catalog for the `hu` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Ugrás a tartalomra',
  homeLinkLabel: 'Kezdőlap',
  primaryNavigationLabel: 'Főmenü',
  footerNavigationLabel: 'Lábléc',
  breadcrumbNavigationLabel: 'Morzsamenü',
  paginationNavigationLabel: 'Lapozás',
  previousPageLabel: 'Előző',
  nextPageLabel: 'Következő',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `${current}. oldal / ${total}`,
  authorsSectionLabel: 'Szerzők',
  tagsSectionLabel: 'Címkék',
  seriesSectionLabel: 'Sorozatok',
  archiveSectionLabel: 'Archívum',
  indexHeading: 'Minden cikk',
  authorsIndexLabel: 'Szerzők',
  tagIndexLabelPrefix: 'Címke:',
  seriesIndexLabelPrefix: 'Sorozat:',
  archiveYearLabelPrefix: 'Archívum:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName} névjegye`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Szerző: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, új lapon nyílik meg',
  footerLegalLabel: 'Jogi információk',
  termsLinkLabel: 'Feltételek',
  privacyLinkLabel: 'Adatvédelem',
  consentRegionLabel: 'Adatvédelmi beállítások',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Ez az oldal a(z) ${providerName} szolgáltatást szeretné használni az olvasottság méréséhez. Elfogadásig semmi sem töltődik be, a döntés pedig bármikor módosítható a láblécben.`,
  consentAcceptLabel: 'Statisztika engedélyezése',
  consentDeclineLabel: 'Elutasítom',
  consentOpenLabel: 'Adatvédelmi beállítások',
  errorPageHeading: 'Az oldal nem található',
  errorPageBody:
    'A keresett oldal nem található. Lehet, hogy áthelyezték, átnevezték vagy törölték.',
  errorPageReturnHomeLabel: 'Vissza a kezdőlapra',
  appearanceControlLabel: 'Megjelenés',
  appearanceModeLightLabel: 'Világos',
  appearanceModeDarkLabel: 'Sötét',
  appearanceModeSystemLabel: 'Rendszer',
  searchButtonLabel: 'Keresés',
  searchButtonAriaLabel: 'Keresés a cikkek között',
  searchPlaceholderLabel: 'Keresés a kiadványban',
  searchEmptyLabel: 'Nincs a keresésnek megfelelő cikk.',
  searchUnavailableLabel: 'A keresés jelenleg nem érhető el.',
  copyCodeLabel: 'Másolás',
  copiedLabel: 'Másolva',
  linkCopiedLabel: 'A hivatkozás másolva.',
  copyBlockedLabel:
    'A másolás itt le van tiltva. Másold ki a címet a böngészőből.',
  codeSelectedLabel:
    'A kód ki van jelölve. Másoláshoz nyomd meg a Ctrl C vagy a Command C billentyűt.',
  savedLabel: 'Elmentve későbbre.',
  unsavedLabel: 'Eltávolítva a mentett cikkek közül.',
  menuSummaryLabel: 'Menü',
  featuredLabel: 'Kiemelt',
  readEssayLabel: 'Az esszé elolvasása',
  latestHeading: 'Legújabb',
  moreArticlesHeading: 'További cikkek',
  browseByTagLabel: 'Böngészés címke szerint',
  seriesCardLabel: 'Sorozat',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count === '1' ? '1 rész' : `${count} rész`}`,
  startSeriesLabel: 'Kezdés az 1. résszel',
  newsletterLabel: 'Hírlevél',
  newsletterActionLabel: 'Feliratkozás',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} perc olvasás`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `${part}. rész / ${total}`,
  onThisPageLabel: 'Ezen az oldalon',
  writtenByLabel: 'Szerző',
  aboutTheAuthorLabel: 'A szerzőről',
  youAreHereLabel: 'Itt jársz',
  newerArticleLabel: 'Újabb',
  olderArticleLabel: 'Régebbi',
  moreArticlesNavigationLabel: 'További cikkek',
  keepReadingHeading: 'Olvass tovább',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `További cikkek: ${tag}`,
  interactionsHeading: 'Reakciók',
  reactionsGroupLabel: 'Reakciók',
  likeLabel: 'Tetszik',
  commentsHeading: 'Beszélgetés',
  interactionsNeedScriptNotice:
    'A reakciókhoz és a hozzászólásokhoz JavaScript szükséges.',
  showMoreCommentsLabel: 'További hozzászólások',
  shareLabel: 'Megosztás',
  copyLinkLabel: 'A cikk hivatkozásának másolása',
  saveForLaterLabel: 'Mentés későbbre',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Megosztás: ${network}`,
  shareByEmailLabel: 'Megosztás e-mailben',
  shareNativeLabel: 'A cikk megosztása',
  followLabel: 'Követés',
  followingLabel: 'Követed',
  unfollowLabel: 'Követés megszüntetése',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name} követése`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name} követésének megszüntetése`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Mostantól követed: ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Már nem követed: ${name}.`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `${count} követő`,
  followersTeamHint: 'Ezt csak a webhelyed csapata látja',
  followDisabledMessage: 'A követés jelenleg nem érhető el ezen az oldalon.',
  followAuthorMissingMessage: 'Ez a szerző jelenleg nem követhető.',
  audienceNetworkError: 'A Galascribe nem érhető el. Próbáld újra.',
  audienceRateLimited: 'Túl sok próbálkozás. Próbáld újra kicsit később.',
  audienceGenericError: 'Hiba történt. Próbáld újra.',
  audienceStorageBlocked:
    'A böngésző letiltotta a bejelentkezéshez szükséges tárolást.',
  audienceSignInUnsupported:
    'Ez a böngésző nem tud bejelentkezni ezen az oldalon.',
  audienceSignInFailed: 'A bejelentkezés nem fejeződött be. Próbáld újra.',
  audienceSignInInvalid:
    'A bejelentkezési hivatkozás érvénytelen. Próbáld újra.',
  honeypotLabel: 'Hagyd üresen ezt a mezőt',
  fieldRequiredMessage: 'Ez a mező kötelező.',
  fieldInvalidMessage: 'Ellenőrizd ezt a mezőt.',
  newsletterEmailLabel: 'E-mail-cím',
  newsletterCheckInbox: 'A megerősítéshez nézd meg a postaládádat',
  newsletterFullMessage: 'Ez a hírlevél jelenleg nem fogad új feliratkozókat.',
  newsletterEmailInvalid: 'Adj meg érvényes e-mail-címet.',
  contactLinkLabel: 'Kapcsolat',
  contactPageTitle: 'Kapcsolat',
  contactDefaultIntro:
    'Kérdésed van, vagy mondanál valamit? Küldj üzenetet, és a szerző e-mailben válaszol.',
  contactNameLabel: 'Név',
  contactEmailLabel: 'E-mail',
  contactMessageLabel: 'Üzenet',
  contactWebsiteLabel: 'Weboldal (nem kötelező)',
  contactPhoneLabel: 'Telefon (nem kötelező)',
  contactSubmitLabel: 'Üzenet küldése',
  contactNoscript:
    'Az űrlaphoz JavaScript szükséges. Kapcsold be az üzenet elküldéséhez.',
  contactSent: 'Köszönjük, az üzenet elküldve.',
  contactUnavailable: 'Ez az űrlap jelenleg nem fogad üzeneteket.',
  contactRateLimited: 'Túl sok üzenet érkezett innen. Próbáld újra később.',
  contactMessageLinks: 'Az üzenet legfeljebb két hivatkozást tartalmazhat.',
  tagListLabel: 'Címkék',
  tagKickerLabel: 'Címke',
  seriesKickerLabel: 'Sorozat',
  archiveKickerLabel: 'Archívum',
  authorKickerLabel: 'Szerző',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count === '1' ? '1 cikk' : `${count} cikk`}`,
  emptyListingLabel: 'Még nincs cikk.',
  editionsNavigationLabel: 'Változatok',
  editionOriginalLabel: 'Eredeti',
  editionQuickReadLabel: 'Gyors olvasat',
  editionStandardLabel: 'Normál',
  editionDeepDiveLabel: 'Mélyfúrás',
  editionNoticeLabel:
    'Generált változat, a szerző átnézte; a mérvadó az eredeti',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Rólunk',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Frissítve: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `„${tag}” címkéjű cikkek`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count === '1' ? '1 cikk' : `${count} cikk`}, címke: ${tag}, kiadvány: ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}: ${count === '1' ? '1 rész' : `${count} rész`} tartalmazó sorozat itt: ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Archívum: ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count === '1' ? '1 cikk' : `${count} cikk`} jelent meg ${year}-ban itt: ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${name} cikkei itt: ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Böngéssz a(z) ${publication} ${count} témája között.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Böngéssz a(z) ${publication} ${count} sorozata között.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `A(z) ${publication} összes cikke évek szerint, összesen ${count}.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `A(z) ${publication} összes cikke, a legújabbak elöl.`,
  exploreColumnLabel: 'Felfedezés',
  rssFeedLabel: 'RSS-hírcsatorna',
  languageKickerLabel: 'Nyelv',
  languageSwitcherLabel: 'Nyelvek',
  languageChipsLabel: 'Elérhető nyelvek',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? '1 cikk' : `${count} cikk`} ${language} nyelven itt: ${publication}.`,
  postRemovedHeading: 'Ez a bejegyzés el lett távolítva',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Eltávolítva: ${date}.`,
  postRemovedHomeLabel: 'Ugrás a kezdőlapra',
  versionPageHeading: 'Az oldal verziója',
  versionTemplateLabel: 'Sablon',
  versionThemeLabel: 'Téma',
  versionSchemasLabel: 'Sémák',
  versionToolchainLabel: 'Közzétételi eszközlánc',
  versionCommitLabel: 'Forrás-commit',
  versionBuiltAtLabel: 'Készült',
  listenNavLabel: 'Hallgatás',
  listenNavCurrentLabel: 'Cikk meghallgatása',
  listenInviteTitle: 'Foglalt a keze? Hallgassa meg inkább.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Ez a cikk ${minutes} perces beszélgetésként is elérhető. Jó vezetéshez, edzéshez vagy mosogatáshoz.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Ez a cikk ${minutes} perces felolvasásként is elérhető. Jó vezetéshez, edzéshez vagy mosogatáshoz.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Ez a cikk ${minutes} perces vitaként is elérhető. Jó vezetéshez, edzéshez vagy mosogatáshoz.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Ez a cikk ${minutes} perces jelenetként is elérhető. Jó vezetéshez, edzéshez vagy mosogatáshoz.`,
  listenInvitePlayLabel: 'Lejátszás',
  listenInviteDeclineLabel: 'Köszönöm, nem',
  listenInviteNote: 'MI-hangok, a cikk alapján átdolgozva.',
  listenInviteCloseLabel: 'Bezárás egyelőre',
  listenPlayerRegionLabel: 'Hanglejátszó',
  listenPlayerNowPlayingLabel: 'Most szól',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} / ${count}`,
  listenPlayerPlayLabel: 'Lejátszás',
  listenPlayerPauseLabel: 'Szünet',
  listenPlayerBackLabel: 'Vissza 15 másodpercet',
  listenPlayerPreviousLabel: 'Előző epizód',
  listenPlayerNextLabel: 'Következő epizód',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Lejátszási sebesség: ${rate}×`,
  listenPlayerSeekLabel: 'Pozíció',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} / ${total}`,
  listenPlayerCloseLabel: 'Leállítás és bezárás',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Most szól: ${title}`,
  listenListHeading: 'Hallgassa ezt a blogot',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count} epizód · ${duration}`,
  listenListPlayAllLabel: 'Összes lejátszása',
  listenListShuffleLabel: 'Keverés',
  listenListOrderLabel: 'Sorrend',
  listenListNewestLabel: 'Legújabb elöl',
  listenListOldestLabel: 'Legrégebbi elöl',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Mind megjelenítése (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `${title} lejátszása`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} perc`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) =>
    `${hours} óra ${minutes} perc`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('hu', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
