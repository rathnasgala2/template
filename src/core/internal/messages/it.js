/**
 * Chrome message catalog for the `it` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Vai al contenuto',
  homeLinkLabel: 'Home',
  primaryNavigationLabel: 'Principale',
  footerNavigationLabel: 'Piè di pagina',
  breadcrumbNavigationLabel: 'Percorso di navigazione',
  paginationNavigationLabel: 'Paginazione',
  previousPageLabel: 'Precedente',
  nextPageLabel: 'Successiva',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Pagina ${current} di ${total}`,
  authorsSectionLabel: 'Autori',
  tagsSectionLabel: 'Tag',
  seriesSectionLabel: 'Serie',
  archiveSectionLabel: 'Archivio',
  indexHeading: 'Tutti gli articoli',
  authorsIndexLabel: 'Autori',
  tagIndexLabelPrefix: 'Tag:',
  seriesIndexLabelPrefix: 'Serie:',
  archiveYearLabelPrefix: 'Archivio:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Informazioni su ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Di ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, si apre in una nuova scheda',
  footerLegalLabel: 'Note legali',
  termsLinkLabel: 'Termini',
  privacyLinkLabel: 'Privacy',
  consentRegionLabel: 'Scelte sulla privacy',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Questo sito vorrebbe usare ${providerName} per capire chi lo legge. Non viene caricato nulla finché non accetti, e puoi cambiare scelta in qualsiasi momento dal piè di pagina.`,
  consentAcceptLabel: 'Accetta le statistiche',
  consentDeclineLabel: 'Rifiuta',
  consentOpenLabel: 'Scelte sulla privacy',
  errorPageHeading: 'Pagina non trovata',
  errorPageBody:
    'La pagina che cercavi non è stata trovata. Potrebbe essere stata spostata, rinominata o rimossa.',
  errorPageReturnHomeLabel: 'Torna alla home',
  appearanceControlLabel: 'Aspetto',
  appearanceModeLightLabel: 'Chiaro',
  appearanceModeDarkLabel: 'Scuro',
  appearanceModeSystemLabel: 'Sistema',
  searchButtonLabel: 'Cerca',
  searchButtonAriaLabel: 'Cerca negli articoli',
  searchPlaceholderLabel: 'Cerca nella pubblicazione',
  searchEmptyLabel: 'Nessun articolo corrisponde alla ricerca.',
  searchUnavailableLabel: 'La ricerca non è disponibile al momento.',
  copyCodeLabel: 'Copia',
  copiedLabel: 'Copiato',
  linkCopiedLabel: 'Link copiato.',
  copyBlockedLabel: 'La copia è bloccata qui. Copia l’indirizzo dal browser.',
  codeSelectedLabel:
    'Codice selezionato. Premi Ctrl C o Command C per copiare.',
  savedLabel: 'Salvato per dopo.',
  unsavedLabel: 'Rimosso dagli articoli salvati.',
  menuSummaryLabel: 'Menu',
  featuredLabel: 'In evidenza',
  readEssayLabel: 'Leggi il saggio',
  latestHeading: 'Ultimi',
  moreArticlesHeading: 'Altri articoli',
  browseByTagLabel: 'Sfoglia per tag',
  seriesCardLabel: 'Serie',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count === '1' ? '1 parte' : `${count} parti`}`,
  startSeriesLabel: 'Inizia dalla parte 1',
  newsletterLabel: 'Newsletter',
  newsletterActionLabel: 'Iscriviti',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min di lettura`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Parte ${part} di ${total}`,
  onThisPageLabel: 'In questa pagina',
  writtenByLabel: 'Scritto da',
  aboutTheAuthorLabel: 'Informazioni sull’autore',
  youAreHereLabel: 'Sei qui',
  newerArticleLabel: 'Più recente',
  olderArticleLabel: 'Meno recente',
  moreArticlesNavigationLabel: 'Altri articoli',
  keepReadingHeading: 'Continua a leggere',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Altro in ${tag}`,
  interactionsHeading: 'Risposte',
  reactionsGroupLabel: 'Reazioni',
  likeLabel: 'Mi piace',
  commentsHeading: 'Conversazione',
  interactionsNeedScriptNotice: 'Reazioni e commenti richiedono JavaScript.',
  showMoreCommentsLabel: 'Mostra altri commenti',
  shareLabel: 'Condividi',
  copyLinkLabel: 'Copia il link a questo articolo',
  saveForLaterLabel: 'Salva per dopo',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Condividi su ${network}`,
  shareByEmailLabel: 'Condividi via e-mail',
  shareNativeLabel: 'Condividi questo articolo',
  followLabel: 'Segui',
  followingLabel: 'Seguito',
  unfollowLabel: 'Non seguire più',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Segui ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Non seguire più ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Ora segui ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Non segui più ${name}.`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `${count} follower`,
  followersTeamHint: 'Solo il team del tuo sito lo vede',
  followDisabledMessage: 'Al momento non è possibile seguire su questo sito.',
  followAuthorMissingMessage:
    'Al momento questo autore non può essere seguito.',
  audienceNetworkError: 'Impossibile raggiungere Galascribe. Riprova.',
  audienceRateLimited: 'Troppi tentativi. Riprova tra un attimo.',
  audienceGenericError: 'Qualcosa è andato storto. Riprova.',
  audienceStorageBlocked:
    'Il browser ha bloccato l’archiviazione necessaria a questo sito per farti accedere.',
  audienceSignInUnsupported:
    'Questo browser non può farti accedere in questa pagina.',
  audienceSignInFailed: 'Accesso non completato. Riprova.',
  audienceSignInInvalid: 'Quel link di accesso non era valido. Riprova.',
  honeypotLabel: 'Lascia vuoto questo campo',
  fieldRequiredMessage: 'Questo campo è obbligatorio.',
  fieldInvalidMessage: 'Controlla questo campo.',
  newsletterEmailLabel: 'Indirizzo e-mail',
  newsletterCheckInbox: 'Controlla la posta in arrivo per confermare',
  newsletterFullMessage:
    'Questa newsletter al momento non accetta nuovi iscritti.',
  newsletterEmailInvalid: 'Inserisci un indirizzo e-mail valido.',
  contactLinkLabel: 'Contatti',
  contactPageTitle: 'Contatti',
  contactDefaultIntro:
    'Hai una domanda o qualcosa da dire? Invia un messaggio e l’autore risponderà via e-mail.',
  contactNameLabel: 'Nome',
  contactEmailLabel: 'E-mail',
  contactMessageLabel: 'Messaggio',
  contactWebsiteLabel: 'Sito web (facoltativo)',
  contactPhoneLabel: 'Telefono (facoltativo)',
  contactSubmitLabel: 'Invia messaggio',
  contactNoscript:
    'Questo modulo richiede JavaScript. Attivalo per inviare un messaggio.',
  contactSent: 'Grazie, il tuo messaggio è stato inviato.',
  contactUnavailable: 'Questo modulo al momento non accetta messaggi.',
  contactRateLimited: 'Troppi messaggi da qui. Riprova più tardi.',
  contactMessageLinks: 'Il messaggio può contenere al massimo due link.',
  tagListLabel: 'Tag',
  tagKickerLabel: 'Tag',
  seriesKickerLabel: 'Serie',
  archiveKickerLabel: 'Archivio',
  authorKickerLabel: 'Autore',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) =>
    `${count === '1' ? '1 articolo' : `${count} articoli`}`,
  emptyListingLabel: 'Ancora nessun articolo.',
  editionsNavigationLabel: 'Edizioni',
  editionOriginalLabel: 'Originale',
  editionQuickReadLabel: 'Lettura rapida',
  editionStandardLabel: 'Standard',
  editionDeepDiveLabel: 'Approfondimento',
  editionNoticeLabel:
    'Edizione generata e rivista dall’autore; fa fede l’originale',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Chi sono',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Aggiornato il ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Articoli con il tag «${tag}»`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count === '1' ? '1 articolo' : `${count} articoli`} con il tag ${tag} su ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, una serie di ${count === '1' ? '1 parte' : `${count} parti`} su ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Archivio ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count === '1' ? '1 articolo' : `${count} articoli`} pubblicati nel ${year} su ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Articoli scritti da ${name} su ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Sfoglia ${count === '1' ? '1 argomento' : `${count} argomenti`} trattati su ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Sfoglia le ${count} serie pubblicate su ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Tutti gli articoli di ${publication}, ${count} in totale, per anno.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Tutti gli articoli di ${publication}, dal più recente.`,
  exploreColumnLabel: 'Esplora',
  rssFeedLabel: 'Feed RSS',
  languageKickerLabel: 'Lingua',
  languageSwitcherLabel: 'Lingue',
  languageChipsLabel: 'Lingue disponibili',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? '1 articolo' : `${count} articoli`} in ${language} su ${publication}.`,
  postRemovedHeading: 'Questo articolo è stato rimosso',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `È stato rimosso il ${date}.`,
  postRemovedHomeLabel: 'Vai alla home',
  versionPageHeading: 'Versione del sito',
  versionTemplateLabel: 'Modello',
  versionThemeLabel: 'Tema',
  versionSchemasLabel: 'Schemi',
  versionToolchainLabel: 'Strumenti di pubblicazione',
  versionCommitLabel: 'Commit sorgente',
  versionBuiltAtLabel: 'Generato il',
  listenNavLabel: 'Ascolta',
  listenNavCurrentLabel: 'Ascolta questo articolo',
  listenInviteTitle: 'Hai le mani occupate? Ascolta.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Questo articolo è anche una conversazione di ${minutes} min. Ideale per il viaggio in auto, l’allenamento o i piatti.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Questo articolo è anche una narrazione di ${minutes} min. Ideale per il viaggio in auto, l’allenamento o i piatti.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Questo articolo è anche un dibattito di ${minutes} min. Ideale per il viaggio in auto, l’allenamento o i piatti.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Questo articolo è anche uno sketch di ${minutes} min. Ideale per il viaggio in auto, l’allenamento o i piatti.`,
  listenInvitePlayLabel: 'Riproduci',
  listenInviteDeclineLabel: 'No, grazie',
  listenInviteNote: 'Voci IA, adattate da questo articolo.',
  listenInviteCloseLabel: 'Chiudi per ora',
  listenPlayerRegionLabel: 'Lettore audio',
  listenPlayerNowPlayingLabel: 'In riproduzione',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} di ${count}`,
  listenPlayerPlayLabel: 'Riproduci',
  listenPlayerPauseLabel: 'Pausa',
  listenPlayerBackLabel: 'Indietro di 15 secondi',
  listenPlayerPreviousLabel: 'Episodio precedente',
  listenPlayerNextLabel: 'Episodio successivo',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Velocità di riproduzione ${rate}×`,
  listenPlayerSeekLabel: 'Posizione',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} di ${total}`,
  listenPlayerCloseLabel: 'Interrompi e chiudi',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `In riproduzione: ${title}`,
  listenListHeading: 'Ascolta questo blog',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) =>
    count === '1'
      ? `1 episodio · ${duration}`
      : `${count} episodi · ${duration}`,
  listenListPlayAllLabel: 'Riproduci tutto',
  listenListShuffleLabel: 'Casuale',
  listenListOrderLabel: 'Ordine',
  listenListNewestLabel: 'Prima i più recenti',
  listenListOldestLabel: 'Prima i più vecchi',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Mostra tutti (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Riproduci ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} h ${minutes} min`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('it', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
