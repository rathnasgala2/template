/**
 * Chrome message catalog for the `de` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Zum Inhalt springen',
  homeLinkLabel: 'Startseite',
  primaryNavigationLabel: 'Hauptnavigation',
  footerNavigationLabel: 'Fußzeile',
  breadcrumbNavigationLabel: 'Brotkrumen-Navigation',
  paginationNavigationLabel: 'Seitennavigation',
  previousPageLabel: 'Zurück',
  nextPageLabel: 'Weiter',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Seite ${current} von ${total}`,
  authorsSectionLabel: 'Autoren',
  tagsSectionLabel: 'Tags',
  seriesSectionLabel: 'Serien',
  archiveSectionLabel: 'Archiv',
  indexHeading: 'Alle Artikel',
  authorsIndexLabel: 'Autoren',
  tagIndexLabelPrefix: 'Tag:',
  seriesIndexLabelPrefix: 'Serie:',
  archiveYearLabelPrefix: 'Archiv:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Über ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Von ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, öffnet in einem neuen Tab',
  footerLegalLabel: 'Rechtliches',
  termsLinkLabel: 'Nutzungsbedingungen',
  privacyLinkLabel: 'Datenschutz',
  consentRegionLabel: 'Datenschutzeinstellungen',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Diese Website möchte ${providerName} nutzen, um die Leserschaft besser zu verstehen. Bis zu Ihrer Zustimmung wird nichts geladen, und Sie können Ihre Wahl jederzeit in der Fußzeile ändern.`,
  consentAcceptLabel: 'Analyse akzeptieren',
  consentDeclineLabel: 'Ablehnen',
  consentOpenLabel: 'Datenschutzeinstellungen',
  errorPageHeading: 'Seite nicht gefunden',
  errorPageBody:
    'Die gesuchte Seite wurde nicht gefunden. Sie wurde möglicherweise verschoben, umbenannt oder entfernt.',
  errorPageReturnHomeLabel: 'Zurück zur Startseite',
  appearanceControlLabel: 'Darstellung',
  appearanceModeLightLabel: 'Hell',
  appearanceModeDarkLabel: 'Dunkel',
  appearanceModeSystemLabel: 'System',
  searchButtonLabel: 'Suchen',
  searchButtonAriaLabel: 'Artikel durchsuchen',
  searchPlaceholderLabel: 'Publikation durchsuchen',
  searchEmptyLabel: 'Keine Artikel entsprechen Ihrer Suche.',
  searchUnavailableLabel: 'Die Suche ist gerade nicht verfügbar.',
  copyCodeLabel: 'Kopieren',
  copiedLabel: 'Kopiert',
  linkCopiedLabel: 'Link kopiert.',
  copyBlockedLabel:
    'Kopieren ist hier blockiert. Kopieren Sie die Adresse aus Ihrem Browser.',
  codeSelectedLabel:
    'Code ausgewählt. Zum Kopieren Strg C oder Command C drücken.',
  savedLabel: 'Für später gespeichert.',
  unsavedLabel: 'Aus den gespeicherten Artikeln entfernt.',
  menuSummaryLabel: 'Menü',
  featuredLabel: 'Empfohlen',
  readEssayLabel: 'Essay lesen',
  latestHeading: 'Neueste',
  moreArticlesHeading: 'Weitere Artikel',
  browseByTagLabel: 'Nach Tag stöbern',
  seriesCardLabel: 'Serie',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count === '1' ? '1 Teil' : `${count} Teile`}`,
  startSeriesLabel: 'Mit Teil 1 beginnen',
  newsletterLabel: 'Newsletter',
  newsletterActionLabel: 'Abonnieren',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} Min. Lesezeit`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Teil ${part} von ${total}`,
  onThisPageLabel: 'Auf dieser Seite',
  writtenByLabel: 'Geschrieben von',
  aboutTheAuthorLabel: 'Über den Autor',
  youAreHereLabel: 'Sie sind hier',
  newerArticleLabel: 'Neuer',
  olderArticleLabel: 'Älter',
  moreArticlesNavigationLabel: 'Weitere Artikel',
  keepReadingHeading: 'Weiterlesen',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Mehr zu ${tag}`,
  interactionsHeading: 'Reaktionen',
  reactionsGroupLabel: 'Reaktionen',
  likeLabel: 'Gefällt mir',
  commentsHeading: 'Diskussion',
  interactionsNeedScriptNotice:
    'Reaktionen und Kommentare benötigen JavaScript.',
  showMoreCommentsLabel: 'Weitere Kommentare anzeigen',
  shareLabel: 'Teilen',
  copyLinkLabel: 'Link zu diesem Artikel kopieren',
  saveForLaterLabel: 'Für später speichern',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Auf ${network} teilen`,
  shareByEmailLabel: 'Per E-Mail teilen',
  shareNativeLabel: 'Diesen Artikel teilen',
  followLabel: 'Folgen',
  followingLabel: 'Folge ich',
  unfollowLabel: 'Nicht mehr folgen',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name} folgen`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name} nicht mehr folgen`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Sie folgen jetzt ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Sie folgen ${name} nicht mehr.`,
  followDisabledMessage:
    'Folgen ist auf dieser Website derzeit nicht verfügbar.',
  followAuthorMissingMessage: 'Diesem Autor kann derzeit nicht gefolgt werden.',
  audienceNetworkError:
    'Galascribe war nicht erreichbar. Bitte erneut versuchen.',
  audienceRateLimited: 'Zu viele Versuche. Bitte gleich noch einmal versuchen.',
  audienceGenericError: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
  audienceStorageBlocked:
    'Ihr Browser hat den Speicher blockiert, den diese Website für die Anmeldung braucht.',
  audienceSignInUnsupported:
    'Dieser Browser kann Sie auf dieser Seite nicht anmelden.',
  audienceSignInFailed:
    'Die Anmeldung wurde nicht abgeschlossen. Bitte erneut versuchen.',
  audienceSignInInvalid:
    'Dieser Anmeldelink war ungültig. Bitte erneut versuchen.',
  honeypotLabel: 'Dieses Feld leer lassen',
  fieldRequiredMessage: 'Dieses Feld ist erforderlich.',
  fieldInvalidMessage: 'Bitte dieses Feld prüfen.',
  newsletterEmailLabel: 'E-Mail-Adresse',
  newsletterCheckInbox: 'Bitte bestätigen Sie in Ihrem Posteingang',
  newsletterFullMessage:
    'Dieser Newsletter nimmt derzeit keine neuen Abonnenten auf.',
  newsletterEmailInvalid: 'Bitte eine gültige E-Mail-Adresse eingeben.',
  contactLinkLabel: 'Kontakt',
  contactPageTitle: 'Kontakt',
  contactDefaultIntro:
    'Haben Sie eine Frage oder etwas mitzuteilen? Senden Sie eine Nachricht, der Autor antwortet per E-Mail.',
  contactNameLabel: 'Name',
  contactEmailLabel: 'E-Mail',
  contactMessageLabel: 'Nachricht',
  contactWebsiteLabel: 'Website (optional)',
  contactPhoneLabel: 'Telefon (optional)',
  contactSubmitLabel: 'Nachricht senden',
  contactNoscript:
    'Dieses Formular benötigt JavaScript. Aktivieren Sie es, um eine Nachricht zu senden.',
  contactSent: 'Danke, Ihre Nachricht wurde gesendet.',
  contactUnavailable: 'Dieses Formular nimmt derzeit keine Nachrichten an.',
  contactRateLimited:
    'Zu viele Nachrichten von hier. Bitte später erneut versuchen.',
  contactMessageLinks: 'Ihre Nachricht darf höchstens zwei Links enthalten.',
  tagListLabel: 'Tags',
  tagKickerLabel: 'Tag',
  seriesKickerLabel: 'Serie',
  archiveKickerLabel: 'Archiv',
  authorKickerLabel: 'Autor',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) =>
    `${count === '1' ? '1 Artikel' : `${count} Artikel`}`,
  emptyListingLabel: 'Noch keine Artikel.',
  editionsNavigationLabel: 'Ausgaben',
  editionOriginalLabel: 'Original',
  editionQuickReadLabel: 'Kurzfassung',
  editionStandardLabel: 'Standard',
  editionDeepDiveLabel: 'Vertiefung',
  editionNoticeLabel:
    'Generierte Ausgabe, vom Autor geprüft; maßgeblich ist das Original',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Über',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Aktualisiert am ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Beiträge mit dem Tag „${tag}“`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count === '1' ? '1 Artikel' : `${count} Artikel`} mit dem Tag ${tag} auf ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, eine Serie aus ${count === '1' ? '1 Teil' : `${count} Teile`} auf ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Archiv ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count === '1' ? '1 Artikel' : `${count} Artikel`} veröffentlicht ${year} auf ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Artikel von ${name} auf ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Stöbern Sie in ${count === '1' ? '1 Thema' : `${count} Themen`} auf ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Stöbern Sie in den ${count} Serien auf ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Alle Artikel auf ${publication}, insgesamt ${count}, nach Jahr.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Alle Artikel auf ${publication}, die neuesten zuerst.`,
  exploreColumnLabel: 'Entdecken',
  rssFeedLabel: 'RSS-Feed',
  languageKickerLabel: 'Sprache',
  languageSwitcherLabel: 'Sprachen',
  languageChipsLabel: 'Verfügbare Sprachen',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? '1 Artikel' : `${count} Artikel`} auf ${language} auf ${publication}.`,
  postRemovedHeading: 'Dieser Beitrag wurde entfernt',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Er wurde am ${date} entfernt.`,
  postRemovedHomeLabel: 'Zur Startseite',
  versionPageHeading: 'Website-Version',
  versionTemplateLabel: 'Vorlage',
  versionThemeLabel: 'Theme',
  versionSchemasLabel: 'Schemas',
  versionToolchainLabel: 'Publishing-Toolchain',
  versionCommitLabel: 'Quell-Commit',
  versionBuiltAtLabel: 'Erstellt am',
  listenNavLabel: 'Anhören',
  listenNavCurrentLabel: 'Diesen Beitrag anhören',
  listenInviteTitle: 'Hände beschäftigt? Hören Sie lieber zu.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Diesen Beitrag gibt es auch als ${minutes}-Minuten-Gespräch. Ideal für die Autofahrt, das Training oder den Abwasch.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Diesen Beitrag gibt es auch als ${minutes}-Minuten-Lesung. Ideal für die Autofahrt, das Training oder den Abwasch.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Diesen Beitrag gibt es auch als ${minutes}-Minuten-Streitgespräch. Ideal für die Autofahrt, das Training oder den Abwasch.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Diesen Beitrag gibt es auch als ${minutes}-Minuten-Sketch. Ideal für die Autofahrt, das Training oder den Abwasch.`,
  listenInvitePlayLabel: 'Abspielen',
  listenInviteDeclineLabel: 'Nein, danke',
  listenInviteNote: 'KI-Stimmen, nach diesem Beitrag adaptiert.',
  listenInviteCloseLabel: 'Vorerst schließen',
  listenPlayerRegionLabel: 'Audioplayer',
  listenPlayerNowPlayingLabel: 'Läuft gerade',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} von ${count}`,
  listenPlayerPlayLabel: 'Abspielen',
  listenPlayerPauseLabel: 'Pause',
  listenPlayerBackLabel: '15 Sekunden zurück',
  listenPlayerPreviousLabel: 'Vorherige Folge',
  listenPlayerNextLabel: 'Nächste Folge',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Wiedergabegeschwindigkeit ${rate}-fach`,
  listenPlayerSeekLabel: 'Position',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} von ${total}`,
  listenPlayerCloseLabel: 'Stoppen und schließen',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Läuft: ${title}`,
  listenListHeading: 'Diesen Blog anhören',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) =>
    count === '1' ? `1 Folge · ${duration}` : `${count} Folgen · ${duration}`,
  listenListPlayAllLabel: 'Alle abspielen',
  listenListShuffleLabel: 'Zufällig',
  listenListOrderLabel: 'Reihenfolge',
  listenListNewestLabel: 'Neueste zuerst',
  listenListOldestLabel: 'Älteste zuerst',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Alle ${count} anzeigen`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `${title} abspielen`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} Min.`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) =>
    `${hours} Std. ${minutes} Min.`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('de', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
