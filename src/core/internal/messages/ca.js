/**
 * Chrome message catalog for the `ca` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Salta al contingut',
  homeLinkLabel: 'Inici',
  primaryNavigationLabel: 'Principal',
  footerNavigationLabel: 'Peu de pàgina',
  breadcrumbNavigationLabel: 'Ruta de navegació',
  paginationNavigationLabel: 'Paginació',
  previousPageLabel: 'Anterior',
  nextPageLabel: 'Següent',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Pàgina ${current} de ${total}`,
  authorsSectionLabel: 'Autors',
  tagsSectionLabel: 'Etiquetes',
  seriesSectionLabel: 'Sèries',
  archiveSectionLabel: 'Arxiu',
  indexHeading: 'Tots els articles',
  authorsIndexLabel: 'Autors',
  tagIndexLabelPrefix: 'Etiqueta:',
  seriesIndexLabelPrefix: 'Sèrie:',
  archiveYearLabelPrefix: 'Arxiu:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Sobre ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Per ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: "Galascribe, s'obre en una pestanya nova",
  footerLegalLabel: 'Legal',
  termsLinkLabel: 'Condicions',
  privacyLinkLabel: 'Privadesa',
  consentRegionLabel: 'Opcions de privadesa',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Aquest lloc voldria utilitzar ${providerName} per entendre com es llegeix. No es carrega res fins que ho accepteu, i podeu canviar l'elecció en qualsevol moment des del peu de pàgina.`,
  consentAcceptLabel: "Accepta l'analítica",
  consentDeclineLabel: 'Rebutja',
  consentOpenLabel: 'Opcions de privadesa',
  errorPageHeading: "No s'ha trobat la pàgina",
  errorPageBody:
    "No s'ha trobat la pàgina que cerqueu. Potser s'ha mogut, s'ha canviat de nom o s'ha eliminat.",
  errorPageReturnHomeLabel: "Torna a la pàgina d'inici",
  appearanceControlLabel: 'Aparença',
  appearanceModeLightLabel: 'Clar',
  appearanceModeDarkLabel: 'Fosc',
  appearanceModeSystemLabel: 'Sistema',
  searchButtonLabel: 'Cerca',
  searchButtonAriaLabel: 'Cerca articles',
  searchPlaceholderLabel: 'Cerca a la publicació',
  searchEmptyLabel: 'Cap article coincideix amb la cerca.',
  searchUnavailableLabel: 'La cerca no està disponible ara mateix.',
  copyCodeLabel: 'Copia',
  copiedLabel: 'Copiat',
  linkCopiedLabel: 'Enllaç copiat.',
  copyBlockedLabel:
    "Aquí la còpia està bloquejada. Copieu l'adreça des del navegador.",
  codeSelectedLabel:
    'Codi seleccionat. Premeu Ctrl C o Command C per copiar-lo.',
  savedLabel: 'Desat per més tard.',
  unsavedLabel: 'Eliminat dels articles desats.',
  menuSummaryLabel: 'Menú',
  featuredLabel: 'Destacat',
  readEssayLabel: "Llegeix l'assaig",
  latestHeading: 'Més recents',
  moreArticlesHeading: 'Més articles',
  browseByTagLabel: 'Explora per etiqueta',
  seriesCardLabel: 'Sèrie',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count === '1' ? '1 part' : `${count} parts`}`,
  startSeriesLabel: 'Comença per la part 1',
  newsletterLabel: 'Butlletí',
  newsletterActionLabel: "Subscriu-m'hi",
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min de lectura`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Part ${part} de ${total}`,
  onThisPageLabel: 'En aquesta pàgina',
  writtenByLabel: 'Escrit per',
  aboutTheAuthorLabel: "Sobre l'autor",
  youAreHereLabel: 'Sou aquí',
  newerArticleLabel: 'Més nou',
  olderArticleLabel: 'Més antic',
  moreArticlesNavigationLabel: 'Més articles',
  keepReadingHeading: 'Continua llegint',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Més a ${tag}`,
  interactionsHeading: 'Respostes',
  reactionsGroupLabel: 'Reaccions',
  likeLabel: "M'agrada",
  commentsHeading: 'Conversa',
  interactionsNeedScriptNotice:
    'Les reaccions i els comentaris necessiten JavaScript.',
  showMoreCommentsLabel: 'Mostra més comentaris',
  shareLabel: 'Comparteix',
  copyLinkLabel: "Copia l'enllaç d'aquest article",
  saveForLaterLabel: 'Desa per més tard',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Comparteix a ${network}`,
  shareByEmailLabel: 'Comparteix per correu',
  shareNativeLabel: 'Comparteix aquest article',
  followLabel: 'Segueix',
  followingLabel: 'Seguint',
  unfollowLabel: 'Deixa de seguir',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Segueix ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Deixa de seguir ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Ara segueixes ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Ja no segueixes ${name}.`,
  followDisabledMessage: 'Ara mateix no es pot seguir en aquest lloc.',
  followAuthorMissingMessage: 'Ara mateix no es pot seguir aquest autor.',
  audienceNetworkError:
    "No s'ha pogut contactar amb Galascribe. Torneu-ho a provar.",
  audienceRateLimited: "Massa intents. Torneu-ho a provar d'aquí a una estona.",
  audienceGenericError: 'Alguna cosa ha fallat. Torneu-ho a provar.',
  audienceStorageBlocked:
    "El navegador ha bloquejat l'emmagatzematge que aquest lloc necessita per iniciar la sessió.",
  audienceSignInUnsupported:
    'Aquest navegador no us pot iniciar la sessió en aquesta pàgina.',
  audienceSignInFailed:
    "L'inici de sessió no s'ha completat. Torneu-ho a provar.",
  audienceSignInInvalid:
    "L'enllaç d'inici de sessió no era vàlid. Torneu-ho a provar.",
  honeypotLabel: 'Deixeu aquest camp buit',
  fieldRequiredMessage: 'Aquest camp és obligatori.',
  fieldInvalidMessage: 'Reviseu aquest camp.',
  newsletterEmailLabel: 'Adreça electrònica',
  newsletterCheckInbox: "Reviseu la safata d'entrada per confirmar",
  newsletterFullMessage:
    'Aquest butlletí no accepta nous subscriptors ara mateix.',
  newsletterEmailInvalid: 'Introduïu una adreça electrònica vàlida.',
  contactLinkLabel: 'Contacte',
  contactPageTitle: 'Contacte',
  contactDefaultIntro:
    "Tens una pregunta o alguna cosa a dir? Envia un missatge i l'autor et respondrà per correu electrònic.",
  contactNameLabel: 'Nom',
  contactEmailLabel: 'Correu electrònic',
  contactMessageLabel: 'Missatge',
  contactWebsiteLabel: 'Lloc web (opcional)',
  contactPhoneLabel: 'Telèfon (opcional)',
  contactSubmitLabel: 'Envia el missatge',
  contactNoscript:
    'Aquest formulari necessita JavaScript. Activeu-lo per enviar un missatge.',
  contactSent: "Gràcies, el missatge s'ha enviat.",
  contactUnavailable: 'Aquest formulari no accepta missatges ara mateix.',
  contactRateLimited:
    "Massa missatges des d'aquí. Torneu-ho a provar més tard.",
  contactMessageLinks: 'El missatge pot tenir com a màxim dos enllaços.',
  tagListLabel: 'Etiquetes',
  tagKickerLabel: 'Etiqueta',
  seriesKickerLabel: 'Sèrie',
  archiveKickerLabel: 'Arxiu',
  authorKickerLabel: 'Autor',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) =>
    `${count === '1' ? '1 article' : `${count} articles`}`,
  emptyListingLabel: 'Encara no hi ha articles.',
  editionsNavigationLabel: 'Edicions',
  editionOriginalLabel: 'Original',
  editionQuickReadLabel: 'Lectura ràpida',
  editionStandardLabel: 'Estàndard',
  editionDeepDiveLabel: 'A fons',
  editionNoticeLabel:
    "Edició generada, revisada per l'autor; l'original és la referència",
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Sobre',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Actualitzat el ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Publicacions amb l'etiqueta «${tag}»`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count === '1' ? '1 article' : `${count} articles`} amb l'etiqueta ${tag} a ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, una sèrie de ${count === '1' ? '1 part' : `${count} parts`} a ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arxiu ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count === '1' ? '1 article' : `${count} articles`} publicats el ${year} a ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Articles escrits per ${name} a ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Explora els ${count} temes de ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Explora les ${count} sèries publicades a ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Tots els articles de ${publication}, ${count} en total, per any.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Tots els articles de ${publication}, els més recents primer.`,
  exploreColumnLabel: 'Explora',
  rssFeedLabel: 'Canal RSS',
  languageKickerLabel: 'Idioma',
  languageSwitcherLabel: 'Idiomes',
  languageChipsLabel: 'Idiomes disponibles',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? '1 article' : `${count} articles`} en ${language} a ${publication}.`,
  postRemovedHeading: "Aquesta publicació s'ha eliminat",
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Es va eliminar el ${date}.`,
  postRemovedHomeLabel: "Ves a la pàgina d'inici",
  versionPageHeading: 'Versió del lloc',
  versionTemplateLabel: 'Plantilla',
  versionThemeLabel: 'Tema',
  versionSchemasLabel: 'Esquemes',
  versionToolchainLabel: 'Eines de publicació',
  versionCommitLabel: "Commit d'origen",
  versionBuiltAtLabel: 'Compilat el',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('ca', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
