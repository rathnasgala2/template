/**
 * Chrome message catalog for the `es` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Saltar al contenido',
  homeLinkLabel: 'Inicio',
  primaryNavigationLabel: 'Principal',
  footerNavigationLabel: 'Pie de página',
  breadcrumbNavigationLabel: 'Ruta de navegación',
  paginationNavigationLabel: 'Paginación',
  previousPageLabel: 'Anterior',
  nextPageLabel: 'Siguiente',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Página ${current} de ${total}`,
  authorsSectionLabel: 'Autores',
  tagsSectionLabel: 'Etiquetas',
  seriesSectionLabel: 'Series',
  archiveSectionLabel: 'Archivo',
  indexHeading: 'Todos los artículos',
  authorsIndexLabel: 'Autores',
  tagIndexLabelPrefix: 'Etiqueta:',
  seriesIndexLabelPrefix: 'Serie:',
  archiveYearLabelPrefix: 'Archivo:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Sobre ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Por ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, se abre en una pestaña nueva',
  footerLegalLabel: 'Legal',
  termsLinkLabel: 'Términos',
  privacyLinkLabel: 'Privacidad',
  consentRegionLabel: 'Opciones de privacidad',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Este sitio quiere usar ${providerName} para entender a sus lectores. No se carga nada hasta que aceptes, y puedes cambiar tu elección en cualquier momento desde el pie de página.`,
  consentAcceptLabel: 'Aceptar analíticas',
  consentDeclineLabel: 'Rechazar',
  consentOpenLabel: 'Opciones de privacidad',
  errorPageHeading: 'Página no encontrada',
  errorPageBody:
    'No se encontró la página que buscabas. Puede que se haya movido, renombrado o eliminado.',
  errorPageReturnHomeLabel: 'Volver al inicio',
  appearanceControlLabel: 'Apariencia',
  appearanceModeLightLabel: 'Claro',
  appearanceModeDarkLabel: 'Oscuro',
  appearanceModeSystemLabel: 'Sistema',
  searchButtonLabel: 'Buscar',
  searchButtonAriaLabel: 'Buscar artículos',
  searchPlaceholderLabel: 'Buscar en la publicación',
  searchEmptyLabel: 'Ningún artículo coincide con tu búsqueda.',
  searchUnavailableLabel: 'La búsqueda no está disponible ahora.',
  copyCodeLabel: 'Copiar',
  copiedLabel: 'Copiado',
  linkCopiedLabel: 'Enlace copiado.',
  copyBlockedLabel:
    'Aquí no se puede copiar. Copia la dirección desde tu navegador.',
  codeSelectedLabel:
    'Código seleccionado. Pulsa Ctrl C o Command C para copiar.',
  savedLabel: 'Guardado para después.',
  unsavedLabel: 'Quitado de los artículos guardados.',
  menuSummaryLabel: 'Menú',
  featuredLabel: 'Destacado',
  readEssayLabel: 'Leer el ensayo',
  latestHeading: 'Lo último',
  moreArticlesHeading: 'Más artículos',
  browseByTagLabel: 'Explorar por etiqueta',
  seriesCardLabel: 'Serie',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) =>
    `${count === '1' ? '1 parte' : `${count} partes`}`,
  startSeriesLabel: 'Empezar por la parte 1',
  newsletterLabel: 'Boletín',
  newsletterActionLabel: 'Suscribirse',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min de lectura`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Parte ${part} de ${total}`,
  onThisPageLabel: 'En esta página',
  writtenByLabel: 'Escrito por',
  aboutTheAuthorLabel: 'Sobre el autor',
  youAreHereLabel: 'Estás aquí',
  newerArticleLabel: 'Más reciente',
  olderArticleLabel: 'Más antiguo',
  moreArticlesNavigationLabel: 'Más artículos',
  keepReadingHeading: 'Sigue leyendo',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Más en ${tag}`,
  interactionsHeading: 'Respuestas',
  reactionsGroupLabel: 'Reacciones',
  likeLabel: 'Me gusta',
  commentsHeading: 'Conversación',
  interactionsNeedScriptNotice:
    'Las reacciones y los comentarios requieren JavaScript.',
  showMoreCommentsLabel: 'Mostrar más comentarios',
  shareLabel: 'Compartir',
  copyLinkLabel: 'Copiar enlace a este artículo',
  saveForLaterLabel: 'Guardar para después',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Compartir en ${network}`,
  shareByEmailLabel: 'Compartir por correo',
  shareNativeLabel: 'Compartir este artículo',
  followLabel: 'Seguir',
  followingLabel: 'Siguiendo',
  unfollowLabel: 'Dejar de seguir',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Seguir a ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Dejar de seguir a ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Ahora sigues a ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Ya no sigues a ${name}.`,
  followDisabledMessage: 'Ahora mismo no se puede seguir en este sitio.',
  followAuthorMissingMessage: 'Ahora mismo no se puede seguir a este autor.',
  audienceNetworkError:
    'No se pudo conectar con Galascribe. Inténtalo de nuevo.',
  audienceRateLimited: 'Demasiados intentos. Inténtalo de nuevo en un momento.',
  audienceGenericError: 'Algo salió mal. Inténtalo de nuevo.',
  audienceStorageBlocked:
    'Tu navegador bloqueó el almacenamiento que este sitio necesita para iniciar tu sesión.',
  audienceSignInUnsupported:
    'Este navegador no puede iniciar tu sesión en esta página.',
  audienceSignInFailed:
    'No se completó el inicio de sesión. Inténtalo de nuevo.',
  audienceSignInInvalid:
    'Ese enlace de inicio de sesión no era válido. Inténtalo de nuevo.',
  honeypotLabel: 'Deja este campo vacío',
  fieldRequiredMessage: 'Este campo es obligatorio.',
  fieldInvalidMessage: 'Revisa este campo.',
  newsletterEmailLabel: 'Correo electrónico',
  newsletterCheckInbox: 'Revisa tu bandeja de entrada para confirmar',
  newsletterFullMessage:
    'Este boletín no admite nuevos suscriptores por ahora.',
  newsletterEmailInvalid: 'Introduce un correo electrónico válido.',
  contactLinkLabel: 'Contacto',
  contactPageTitle: 'Contacto',
  contactDefaultIntro:
    '¿Tienes una pregunta o algo que decir? Envía un mensaje y el autor responderá por correo.',
  contactNameLabel: 'Nombre',
  contactEmailLabel: 'Correo',
  contactMessageLabel: 'Mensaje',
  contactWebsiteLabel: 'Sitio web (opcional)',
  contactPhoneLabel: 'Teléfono (opcional)',
  contactSubmitLabel: 'Enviar mensaje',
  contactNoscript:
    'Este formulario necesita JavaScript. Actívalo para enviar un mensaje.',
  contactSent: 'Gracias, tu mensaje fue enviado.',
  contactUnavailable: 'Este formulario no acepta mensajes por ahora.',
  contactRateLimited: 'Demasiados mensajes desde aquí. Inténtalo más tarde.',
  contactMessageLinks: 'Tu mensaje puede tener como máximo dos enlaces.',
  tagListLabel: 'Etiquetas',
  tagKickerLabel: 'Etiqueta',
  seriesKickerLabel: 'Serie',
  archiveKickerLabel: 'Archivo',
  authorKickerLabel: 'Autor',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) =>
    `${count === '1' ? '1 artículo' : `${count} artículos`}`,
  emptyListingLabel: 'Aún no hay artículos.',
  editionsNavigationLabel: 'Ediciones',
  editionOriginalLabel: 'Original',
  editionQuickReadLabel: 'Lectura rápida',
  editionStandardLabel: 'Estándar',
  editionDeepDiveLabel: 'En profundidad',
  editionNoticeLabel:
    'Edición generada y revisada por el autor; el original es la referencia',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Acerca de',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Actualizado el ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Artículos con la etiqueta «${tag}»`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count === '1' ? '1 artículo' : `${count} artículos`} con la etiqueta ${tag} en ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, una serie de ${count === '1' ? '1 parte' : `${count} partes`} en ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Archivo ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count === '1' ? '1 artículo' : `${count} artículos`} publicados en ${year} en ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Artículos escritos por ${name} en ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Explora ${count === '1' ? '1 tema' : `${count} temas`} que se tratan en ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Explora las ${count} series publicadas en ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Todos los artículos de ${publication}, ${count} en total, por año.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Todos los artículos de ${publication}, los más recientes primero.`,
  exploreColumnLabel: 'Explorar',
  rssFeedLabel: 'Feed RSS',
  languageKickerLabel: 'Idioma',
  languageSwitcherLabel: 'Idiomas',
  languageChipsLabel: 'Idiomas disponibles',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? '1 artículo' : `${count} artículos`} en ${language} en ${publication}.`,
  postRemovedHeading: 'Esta publicación fue eliminada',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Se eliminó el ${date}.`,
  postRemovedHomeLabel: 'Ir al inicio',
  versionPageHeading: 'Versión del sitio',
  versionTemplateLabel: 'Plantilla',
  versionThemeLabel: 'Tema',
  versionSchemasLabel: 'Esquemas',
  versionToolchainLabel: 'Herramientas de publicación',
  versionCommitLabel: 'Commit de origen',
  versionBuiltAtLabel: 'Compilado el',
  listenNavLabel: 'Escuchar',
  listenNavCurrentLabel: 'Escuchar este artículo',
  listenInviteTitle: '¿Tienes las manos ocupadas? Escúchalo.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Este artículo también es una conversación de ${minutes} min. Ideal para el coche, el gimnasio o los platos.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Este artículo también es una narración de ${minutes} min. Ideal para el coche, el gimnasio o los platos.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Este artículo también es un debate de ${minutes} min. Ideal para el coche, el gimnasio o los platos.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Este artículo también es un sketch de ${minutes} min. Ideal para el coche, el gimnasio o los platos.`,
  listenInvitePlayLabel: 'Reproducir',
  listenInviteDeclineLabel: 'No, gracias',
  listenInviteNote: 'Voces de IA, adaptadas de este artículo.',
  listenInviteCloseLabel: 'Cerrar por ahora',
  listenPlayerRegionLabel: 'Reproductor de audio',
  listenPlayerNowPlayingLabel: 'Reproduciendo',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} de ${count}`,
  listenPlayerPlayLabel: 'Reproducir',
  listenPlayerPauseLabel: 'Pausa',
  listenPlayerBackLabel: 'Retroceder 15 segundos',
  listenPlayerPreviousLabel: 'Episodio anterior',
  listenPlayerNextLabel: 'Episodio siguiente',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Velocidad de reproducción ${rate}×`,
  listenPlayerSeekLabel: 'Posición',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} de ${total}`,
  listenPlayerCloseLabel: 'Detener y cerrar',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Reproduciendo: ${title}`,
  listenListHeading: 'Escucha este blog',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) =>
    count === '1'
      ? `1 episodio · ${duration}`
      : `${count} episodios · ${duration}`,
  listenListPlayAllLabel: 'Reproducir todo',
  listenListShuffleLabel: 'Aleatorio',
  listenListOrderLabel: 'Orden',
  listenListNewestLabel: 'Más recientes primero',
  listenListOldestLabel: 'Más antiguos primero',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Mostrar los ${count}`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Reproducir ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} h ${minutes} min`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('es', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
