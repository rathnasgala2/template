/**
 * Chrome message catalog for the `sl` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Preskoči na vsebino',
  homeLinkLabel: 'Domov',
  primaryNavigationLabel: 'Glavni meni',
  footerNavigationLabel: 'Noga',
  breadcrumbNavigationLabel: 'Pot',
  paginationNavigationLabel: 'Številčenje strani',
  previousPageLabel: 'Prejšnje',
  nextPageLabel: 'Naslednje',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Stran ${current} od ${total}`,
  authorsSectionLabel: 'Avtorji',
  tagsSectionLabel: 'Oznake',
  seriesSectionLabel: 'Serije',
  archiveSectionLabel: 'Arhiv',
  indexHeading: 'Vsi članki',
  authorsIndexLabel: 'Avtorji',
  tagIndexLabelPrefix: 'Oznaka:',
  seriesIndexLabelPrefix: 'Serija:',
  archiveYearLabelPrefix: 'Arhiv:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `O avtorju: ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Avtor: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, odpre se v novem zavihku',
  footerLegalLabel: 'Pravne informacije',
  termsLinkLabel: 'Pogoji',
  privacyLinkLabel: 'Zasebnost',
  consentRegionLabel: 'Izbire glede zasebnosti',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `To spletno mesto bi rado uporabljalo ${providerName} za razumevanje branosti. Nič se ne naloži, dokler ne sprejmete, svojo izbiro pa lahko kadar koli spremenite v nogi strani.`,
  consentAcceptLabel: 'Sprejmi analitiko',
  consentDeclineLabel: 'Zavrni',
  consentOpenLabel: 'Izbire glede zasebnosti',
  errorPageHeading: 'Strani ni mogoče najti',
  errorPageBody:
    'Strani, ki jo iščete, ni bilo mogoče najti. Morda je bila premaknjena, preimenovana ali odstranjena.',
  errorPageReturnHomeLabel: 'Nazaj na domačo stran',
  appearanceControlLabel: 'Videz',
  appearanceModeLightLabel: 'Svetel',
  appearanceModeDarkLabel: 'Temen',
  appearanceModeSystemLabel: 'Sistemski',
  searchButtonLabel: 'Iskanje',
  searchButtonAriaLabel: 'Išči po člankih',
  searchPlaceholderLabel: 'Išči po publikaciji',
  searchEmptyLabel: 'Noben članek ne ustreza iskanju.',
  searchUnavailableLabel: 'Iskanje trenutno ni na voljo.',
  copyCodeLabel: 'Kopiraj',
  copiedLabel: 'Kopirano',
  linkCopiedLabel: 'Povezava je kopirana.',
  copyBlockedLabel:
    'Kopiranje je tu blokirano. Kopirajte naslov iz brskalnika.',
  codeSelectedLabel:
    'Koda je izbrana. Pritisnite Ctrl C ali Command C za kopiranje.',
  savedLabel: 'Shranjeno za pozneje.',
  unsavedLabel: 'Odstranjeno iz shranjenih člankov.',
  menuSummaryLabel: 'Meni',
  featuredLabel: 'Izpostavljeno',
  readEssayLabel: 'Preberi esej',
  latestHeading: 'Najnovejše',
  moreArticlesHeading: 'Več člankov',
  browseByTagLabel: 'Brskaj po oznakah',
  seriesCardLabel: 'Serija',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`Deli: ${count}`}`,
  startSeriesLabel: 'Začni s 1. delom',
  newsletterLabel: 'Novičnik',
  newsletterActionLabel: 'Naroči se',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min branja`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Del ${part} od ${total}`,
  onThisPageLabel: 'Na tej strani',
  writtenByLabel: 'Napisal(a)',
  aboutTheAuthorLabel: 'O avtorju',
  youAreHereLabel: 'Tukaj ste',
  newerArticleLabel: 'Novejše',
  olderArticleLabel: 'Starejše',
  moreArticlesNavigationLabel: 'Več člankov',
  keepReadingHeading: 'Berite naprej',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Več v: ${tag}`,
  interactionsHeading: 'Odzivi',
  reactionsGroupLabel: 'Odzivi',
  likeLabel: 'Všeč mi je',
  commentsHeading: 'Pogovor',
  interactionsNeedScriptNotice: 'Odzivi in komentarji potrebujejo JavaScript.',
  showMoreCommentsLabel: 'Pokaži več komentarjev',
  shareLabel: 'Deli',
  copyLinkLabel: 'Kopiraj povezavo do članka',
  saveForLaterLabel: 'Shrani za pozneje',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Deli na ${network}`,
  shareByEmailLabel: 'Deli po e-pošti',
  shareNativeLabel: 'Deli ta članek',
  followLabel: 'Sledi',
  followingLabel: 'Sledite',
  unfollowLabel: 'Prenehaj slediti',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Sledi: ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Prenehaj slediti: ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Zdaj sledite: ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Ne sledite več: ${name}.`,
  followDisabledMessage: 'Sledenje na tem spletnem mestu trenutno ni na voljo.',
  followAuthorMissingMessage: 'Temu avtorju trenutno ni mogoče slediti.',
  audienceNetworkError:
    'S storitvijo Galascribe ni bilo mogoče vzpostaviti povezave. Poskusite znova.',
  audienceRateLimited: 'Preveč poskusov. Poskusite znova čez trenutek.',
  audienceGenericError: 'Nekaj je šlo narobe. Poskusite znova.',
  audienceStorageBlocked:
    'Brskalnik je blokiral shrambo, ki jo spletno mesto potrebuje za prijavo.',
  audienceSignInUnsupported:
    'Ta brskalnik vas na tej strani ne more prijaviti.',
  audienceSignInFailed: 'Prijava ni bila dokončana. Poskusite znova.',
  audienceSignInInvalid: 'Povezava za prijavo ni veljavna. Poskusite znova.',
  honeypotLabel: 'To polje pustite prazno',
  fieldRequiredMessage: 'To polje je obvezno.',
  fieldInvalidMessage: 'Preverite to polje.',
  newsletterEmailLabel: 'E-poštni naslov',
  newsletterCheckInbox: 'Potrdite v svojem nabiralniku',
  newsletterFullMessage: 'Ta novičnik trenutno ne sprejema novih naročnikov.',
  newsletterEmailInvalid: 'Vnesite veljaven e-poštni naslov.',
  contactLinkLabel: 'Kontakt',
  contactPageTitle: 'Kontakt',
  contactDefaultIntro:
    'Imate vprašanje ali kaj za povedati? Pošljite sporočilo, avtor pa vam bo odgovoril po e-pošti.',
  contactNameLabel: 'Ime',
  contactEmailLabel: 'E-pošta',
  contactMessageLabel: 'Sporočilo',
  contactWebsiteLabel: 'Spletno mesto (neobvezno)',
  contactPhoneLabel: 'Telefon (neobvezno)',
  contactSubmitLabel: 'Pošlji sporočilo',
  contactNoscript:
    'Ta obrazec potrebuje JavaScript. Vklopite ga, če želite poslati sporočilo.',
  contactSent: 'Hvala, vaše sporočilo je poslano.',
  contactUnavailable: 'Ta obrazec trenutno ne sprejema sporočil.',
  contactRateLimited: 'Preveč sporočil od tod. Poskusite pozneje.',
  contactMessageLinks: 'Sporočilo lahko vsebuje največ dve povezavi.',
  tagListLabel: 'Oznake',
  tagKickerLabel: 'Oznaka',
  seriesKickerLabel: 'Serija',
  archiveKickerLabel: 'Arhiv',
  authorKickerLabel: 'Avtor',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`Članki: ${count}`}`,
  emptyListingLabel: 'Še ni člankov.',
  editionsNavigationLabel: 'Izdaje',
  editionOriginalLabel: 'Izvirnik',
  editionQuickReadLabel: 'Hitro branje',
  editionStandardLabel: 'Standardno',
  editionDeepDiveLabel: 'Poglobljeno',
  editionNoticeLabel:
    'Ustvarjena izdaja, ki jo je pregledal avtor; merodajen je izvirnik',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'O nas',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Posodobljeno ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Prispevki z oznako „${tag}“`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `Oznaka ${tag} na ${publication}. ${`Članki: ${count}`}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, serija na ${publication}. ${`Deli: ${count}`}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arhiv ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `Objavljeno leta ${year} na ${publication}. ${`Članki: ${count}`}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Članki avtorja ${name} na ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Brskajte po temah na ${publication}. Skupaj: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Brskajte po serijah na ${publication}. Skupaj: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Vsi članki na ${publication} po letih. Skupaj: ${count}.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Vsi članki na ${publication}, najnovejši prvi.`,
  exploreColumnLabel: 'Razišči',
  rssFeedLabel: 'Vir RSS',
  languageKickerLabel: 'Jezik',
  languageSwitcherLabel: 'Jeziki',
  languageChipsLabel: 'Razpoložljivi jeziki',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `Jezik: ${language}, ${publication}. ${`Članki: ${count}`}.`,
  postRemovedHeading: 'Ta prispevek je bil odstranjen',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Odstranjen je bil ${date}.`,
  postRemovedHomeLabel: 'Pojdi na domačo stran',
  versionPageHeading: 'Različica spletnega mesta',
  versionTemplateLabel: 'Predloga',
  versionThemeLabel: 'Tema',
  versionSchemasLabel: 'Sheme',
  versionToolchainLabel: 'Orodja za objavo',
  versionCommitLabel: 'Izvorni commit',
  versionBuiltAtLabel: 'Zgrajeno',
  listenNavLabel: 'Poslušaj',
  listenNavCurrentLabel: 'Poslušaj ta članek',
  listenInviteTitle: 'Zasedene roke? Raje poslušaj.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Ta članek je na voljo tudi kot pogovor v trajanju ${minutes} min. Primerno za vožnjo, trening ali pomivanje posode.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Ta članek je na voljo tudi kot pripoved v trajanju ${minutes} min. Primerno za vožnjo, trening ali pomivanje posode.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Ta članek je na voljo tudi kot razprava v trajanju ${minutes} min. Primerno za vožnjo, trening ali pomivanje posode.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Ta članek je na voljo tudi kot skeč v trajanju ${minutes} min. Primerno za vožnjo, trening ali pomivanje posode.`,
  listenInvitePlayLabel: 'Predvajaj',
  listenInviteDeclineLabel: 'Ne, hvala',
  listenInviteNote: 'Glasovi umetne inteligence, priredba tega članka.',
  listenInviteCloseLabel: 'Zapri za zdaj',
  listenPlayerRegionLabel: 'Predvajalnik zvoka',
  listenPlayerNowPlayingLabel: 'Zdaj predvaja',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} od ${count}`,
  listenPlayerPlayLabel: 'Predvajaj',
  listenPlayerPauseLabel: 'Premor',
  listenPlayerBackLabel: '15 sekund nazaj',
  listenPlayerPreviousLabel: 'Prejšnja epizoda',
  listenPlayerNextLabel: 'Naslednja epizoda',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Hitrost predvajanja ${rate}×`,
  listenPlayerSeekLabel: 'Položaj',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} od ${total}`,
  listenPlayerCloseLabel: 'Ustavi in zapri',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Zdaj predvaja: ${title}`,
  listenListHeading: 'Poslušaj ta blog',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `Epizod: ${count} · ${duration}`,
  listenListPlayAllLabel: 'Predvajaj vse',
  listenListShuffleLabel: 'Naključno',
  listenListOrderLabel: 'Vrstni red',
  listenListNewestLabel: 'Najprej najnovejše',
  listenListOldestLabel: 'Najprej najstarejše',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Pokaži vse (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Predvajaj: ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} h ${minutes} min`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('sl', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
