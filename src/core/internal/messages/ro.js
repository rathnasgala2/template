/**
 * Chrome message catalog for the `ro` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Salt la conținut',
  homeLinkLabel: 'Acasă',
  primaryNavigationLabel: 'Principală',
  footerNavigationLabel: 'Subsol',
  breadcrumbNavigationLabel: 'Traseu',
  paginationNavigationLabel: 'Paginare',
  previousPageLabel: 'Înapoi',
  nextPageLabel: 'Înainte',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Pagina ${current} din ${total}`,
  authorsSectionLabel: 'Autori',
  tagsSectionLabel: 'Etichete',
  seriesSectionLabel: 'Serii',
  archiveSectionLabel: 'Arhivă',
  indexHeading: 'Toate articolele',
  authorsIndexLabel: 'Autori',
  tagIndexLabelPrefix: 'Etichetă:',
  seriesIndexLabelPrefix: 'Serie:',
  archiveYearLabelPrefix: 'Arhivă:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Despre ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `De ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, se deschide într-o filă nouă',
  footerLegalLabel: 'Aspecte juridice',
  termsLinkLabel: 'Termeni',
  privacyLinkLabel: 'Confidențialitate',
  consentRegionLabel: 'Opțiuni de confidențialitate',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Acest site ar dori să folosească ${providerName} pentru a înțelege cât de citit este. Nu se încarcă nimic până nu accepți, iar alegerea poate fi schimbată oricând din subsol.`,
  consentAcceptLabel: 'Acceptă statisticile',
  consentDeclineLabel: 'Refuz',
  consentOpenLabel: 'Opțiuni de confidențialitate',
  errorPageHeading: 'Pagina nu a fost găsită',
  errorPageBody:
    'Pagina căutată nu a fost găsită. Poate a fost mutată, redenumită sau ștearsă.',
  errorPageReturnHomeLabel: 'Înapoi la pagina principală',
  appearanceControlLabel: 'Aspect',
  appearanceModeLightLabel: 'Luminos',
  appearanceModeDarkLabel: 'Întunecat',
  appearanceModeSystemLabel: 'Sistem',
  searchButtonLabel: 'Caută',
  searchButtonAriaLabel: 'Caută în articole',
  searchPlaceholderLabel: 'Caută în publicație',
  searchEmptyLabel: 'Niciun articol nu se potrivește căutării.',
  searchUnavailableLabel: 'Căutarea nu este disponibilă acum.',
  copyCodeLabel: 'Copiază',
  copiedLabel: 'Copiat',
  linkCopiedLabel: 'Linkul a fost copiat.',
  copyBlockedLabel: 'Copierea este blocată aici. Copiază adresa din browser.',
  codeSelectedLabel: 'Cod selectat. Apasă Ctrl C sau Command C pentru a copia.',
  savedLabel: 'Salvat pentru mai târziu.',
  unsavedLabel: 'Eliminat din articolele salvate.',
  menuSummaryLabel: 'Meniu',
  featuredLabel: 'În lumină',
  readEssayLabel: 'Citește eseul',
  latestHeading: 'Cele mai noi',
  moreArticlesHeading: 'Mai multe articole',
  browseByTagLabel: 'Răsfoiește după etichetă',
  seriesCardLabel: 'Serie',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`Părți: ${count}`}`,
  startSeriesLabel: 'Începe cu partea 1',
  newsletterLabel: 'Newsletter',
  newsletterActionLabel: 'Abonează-te',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min de citit`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Partea ${part} din ${total}`,
  onThisPageLabel: 'Pe această pagină',
  writtenByLabel: 'Scris de',
  aboutTheAuthorLabel: 'Despre autor',
  youAreHereLabel: 'Ești aici',
  newerArticleLabel: 'Mai nou',
  olderArticleLabel: 'Mai vechi',
  moreArticlesNavigationLabel: 'Mai multe articole',
  keepReadingHeading: 'Continuă lectura',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Mai multe în ${tag}`,
  interactionsHeading: 'Reacții',
  reactionsGroupLabel: 'Reacții',
  likeLabel: 'Apreciază',
  commentsHeading: 'Discuție',
  interactionsNeedScriptNotice:
    'Reacțiile și comentariile necesită JavaScript.',
  showMoreCommentsLabel: 'Mai multe comentarii',
  shareLabel: 'Distribuie',
  copyLinkLabel: 'Copiază linkul articolului',
  saveForLaterLabel: 'Salvează pentru mai târziu',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Distribuie pe ${network}`,
  shareByEmailLabel: 'Distribuie prin e-mail',
  shareNativeLabel: 'Distribuie acest articol',
  followLabel: 'Urmărește',
  followingLabel: 'Urmărit',
  unfollowLabel: 'Nu mai urmări',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Urmărește ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Nu mai urmări ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Acum îl urmărești pe ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Nu mai urmărești ${name}.`,
  followDisabledMessage: 'Urmărirea nu este disponibilă pe acest site acum.',
  followAuthorMissingMessage: 'Acest autor nu poate fi urmărit acum.',
  audienceNetworkError: 'Nu s-a putut contacta Galascribe. Încearcă din nou.',
  audienceRateLimited:
    'Prea multe încercări. Încearcă din nou peste puțin timp.',
  audienceGenericError: 'Ceva nu a mers bine. Încearcă din nou.',
  audienceStorageBlocked:
    'Browserul a blocat stocarea de care acest site are nevoie pentru autentificare.',
  audienceSignInUnsupported:
    'Acest browser nu te poate autentifica pe această pagină.',
  audienceSignInFailed: 'Autentificarea nu s-a finalizat. Încearcă din nou.',
  audienceSignInInvalid:
    'Linkul de autentificare nu era valid. Încearcă din nou.',
  honeypotLabel: 'Lasă acest câmp gol',
  fieldRequiredMessage: 'Acest câmp este obligatoriu.',
  fieldInvalidMessage: 'Verifică acest câmp.',
  newsletterEmailLabel: 'Adresă de e-mail',
  newsletterCheckInbox: 'Verifică-ți inboxul pentru confirmare',
  newsletterFullMessage: 'Acest newsletter nu primește abonați noi acum.',
  newsletterEmailInvalid: 'Introdu o adresă de e-mail validă.',
  contactLinkLabel: 'Contact',
  contactPageTitle: 'Contact',
  contactDefaultIntro:
    'Ai o întrebare sau ceva de spus? Trimite un mesaj și autorul îți va răspunde prin e-mail.',
  contactNameLabel: 'Nume',
  contactEmailLabel: 'E-mail',
  contactMessageLabel: 'Mesaj',
  contactWebsiteLabel: 'Site web (opțional)',
  contactPhoneLabel: 'Telefon (opțional)',
  contactSubmitLabel: 'Trimite mesajul',
  contactNoscript:
    'Acest formular necesită JavaScript. Activează-l pentru a trimite un mesaj.',
  contactSent: 'Mulțumim, mesajul a fost trimis.',
  contactUnavailable: 'Acest formular nu primește mesaje acum.',
  contactRateLimited: 'Prea multe mesaje de aici. Încearcă mai târziu.',
  contactMessageLinks: 'Mesajul poate conține cel mult două linkuri.',
  tagListLabel: 'Etichete',
  tagKickerLabel: 'Etichetă',
  seriesKickerLabel: 'Serie',
  archiveKickerLabel: 'Arhivă',
  authorKickerLabel: 'Autor',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`Articole: ${count}`}`,
  emptyListingLabel: 'Încă nu există articole.',
  editionsNavigationLabel: 'Ediții',
  editionOriginalLabel: 'Original',
  editionQuickReadLabel: 'Lectură rapidă',
  editionStandardLabel: 'Standard',
  editionDeepDiveLabel: 'Analiză aprofundată',
  editionNoticeLabel:
    'Ediție generată, verificată de autor; originalul este referința',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Despre',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Actualizat ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Articole cu eticheta „${tag}”`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `Eticheta ${tag} pe ${publication}. ${`Articole: ${count}`}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, serie pe ${publication}. ${`Părți: ${count}`}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arhivă ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `Publicate în ${year} pe ${publication}. ${`Articole: ${count}`}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Articole scrise de ${name} pe ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Răsfoiește subiectele abordate pe ${publication}. Total: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Răsfoiește seriile publicate pe ${publication}. Total: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Toate articolele de pe ${publication}, pe ani. Total: ${count}.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Toate articolele de pe ${publication}, cele mai noi primele.`,
  exploreColumnLabel: 'Explorează',
  rssFeedLabel: 'Flux RSS',
  languageKickerLabel: 'Limbă',
  languageSwitcherLabel: 'Limbi',
  languageChipsLabel: 'Limbi disponibile',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `Articole în ${language} pe ${publication}. ${`Articole: ${count}`}.`,
  postRemovedHeading: 'Această postare a fost eliminată',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `A fost eliminată pe ${date}.`,
  postRemovedHomeLabel: 'Mergi la pagina principală',
  versionPageHeading: 'Versiunea site-ului',
  versionTemplateLabel: 'Șablon',
  versionThemeLabel: 'Temă',
  versionSchemasLabel: 'Scheme',
  versionToolchainLabel: 'Instrumente de publicare',
  versionCommitLabel: 'Commit sursă',
  versionBuiltAtLabel: 'Construit la',
  listenNavLabel: 'Ascultă',
  listenNavCurrentLabel: 'Ascultă această postare',
  listenInviteTitle: 'Ai mâinile ocupate? Ascultă, în loc să citești.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Această postare există și ca o conversație de ${minutes} min. Bună pentru drum, antrenament sau spălat vasele.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Această postare există și ca o naraţiune de ${minutes} min. Bună pentru drum, antrenament sau spălat vasele.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Această postare există și ca o dezbatere de ${minutes} min. Bună pentru drum, antrenament sau spălat vasele.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Această postare există și ca o schiță de ${minutes} min. Bună pentru drum, antrenament sau spălat vasele.`,
  listenInvitePlayLabel: 'Redă',
  listenInviteDeclineLabel: 'Nu, mulțumesc',
  listenInviteNote: 'Voci AI, adaptate după această postare.',
  listenInviteCloseLabel: 'Închide deocamdată',
  listenPlayerRegionLabel: 'Player audio',
  listenPlayerNowPlayingLabel: 'Se redă acum',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} din ${count}`,
  listenPlayerPlayLabel: 'Redă',
  listenPlayerPauseLabel: 'Pauză',
  listenPlayerBackLabel: 'Înapoi 15 secunde',
  listenPlayerPreviousLabel: 'Episodul anterior',
  listenPlayerNextLabel: 'Episodul următor',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Viteza de redare ${rate}×`,
  listenPlayerSeekLabel: 'Poziție',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} din ${total}`,
  listenPlayerCloseLabel: 'Oprește și închide',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Se redă: ${title}`,
  listenListHeading: 'Ascultă acest blog',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `Episoade: ${count} · ${duration}`,
  listenListPlayAllLabel: 'Redă tot',
  listenListShuffleLabel: 'Aleatoriu',
  listenListOrderLabel: 'Ordine',
  listenListNewestLabel: 'Cele mai noi întâi',
  listenListOldestLabel: 'Cele mai vechi întâi',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Arată toate (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Redă: ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} h ${minutes} min`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('ro', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
