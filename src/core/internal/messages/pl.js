/**
 * Chrome message catalog for the `pl` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Przejdź do treści',
  homeLinkLabel: 'Strona główna',
  primaryNavigationLabel: 'Główna',
  footerNavigationLabel: 'Stopka',
  breadcrumbNavigationLabel: 'Ścieżka nawigacji',
  paginationNavigationLabel: 'Numeracja stron',
  previousPageLabel: 'Poprzednia',
  nextPageLabel: 'Następna',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Strona ${current} z ${total}`,
  authorsSectionLabel: 'Autorzy',
  tagsSectionLabel: 'Tagi',
  seriesSectionLabel: 'Serie',
  archiveSectionLabel: 'Archiwum',
  indexHeading: 'Wszystkie artykuły',
  authorsIndexLabel: 'Autorzy',
  tagIndexLabelPrefix: 'Tag:',
  seriesIndexLabelPrefix: 'Seria:',
  archiveYearLabelPrefix: 'Archiwum:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `O autorze: ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Autor: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, otwiera się w nowej karcie',
  footerLegalLabel: 'Informacje prawne',
  termsLinkLabel: 'Regulamin',
  privacyLinkLabel: 'Prywatność',
  consentRegionLabel: 'Ustawienia prywatności',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Ta witryna chciałaby używać ${providerName}, aby lepiej poznać swoich czytelników. Nic nie jest ładowane, dopóki nie wyrazisz zgody, a wybór możesz zmienić w dowolnej chwili w stopce.`,
  consentAcceptLabel: 'Zezwól na analitykę',
  consentDeclineLabel: 'Odrzuć',
  consentOpenLabel: 'Ustawienia prywatności',
  errorPageHeading: 'Nie znaleziono strony',
  errorPageBody:
    'Nie znaleziono strony, której szukasz. Mogła zostać przeniesiona, przemianowana lub usunięta.',
  errorPageReturnHomeLabel: 'Wróć na stronę główną',
  appearanceControlLabel: 'Wygląd',
  appearanceModeLightLabel: 'Jasny',
  appearanceModeDarkLabel: 'Ciemny',
  appearanceModeSystemLabel: 'Systemowy',
  searchButtonLabel: 'Szukaj',
  searchButtonAriaLabel: 'Szukaj artykułów',
  searchPlaceholderLabel: 'Szukaj w publikacji',
  searchEmptyLabel: 'Żaden artykuł nie pasuje do wyszukiwania.',
  searchUnavailableLabel: 'Wyszukiwanie jest teraz niedostępne.',
  copyCodeLabel: 'Kopiuj',
  copiedLabel: 'Skopiowano',
  linkCopiedLabel: 'Skopiowano link.',
  copyBlockedLabel:
    'Kopiowanie jest tu zablokowane. Skopiuj adres z przeglądarki.',
  codeSelectedLabel:
    'Zaznaczono kod. Naciśnij Ctrl C lub Command C, aby skopiować.',
  savedLabel: 'Zapisano na później.',
  unsavedLabel: 'Usunięto z zapisanych artykułów.',
  menuSummaryLabel: 'Menu',
  featuredLabel: 'Polecane',
  readEssayLabel: 'Przeczytaj esej',
  latestHeading: 'Najnowsze',
  moreArticlesHeading: 'Więcej artykułów',
  browseByTagLabel: 'Przeglądaj według tagów',
  seriesCardLabel: 'Seria',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`Części: ${count}`}`,
  startSeriesLabel: 'Zacznij od części 1',
  newsletterLabel: 'Newsletter',
  newsletterActionLabel: 'Subskrybuj',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min czytania`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Część ${part} z ${total}`,
  onThisPageLabel: 'Na tej stronie',
  writtenByLabel: 'Autor',
  aboutTheAuthorLabel: 'O autorze',
  youAreHereLabel: 'Jesteś tutaj',
  newerArticleLabel: 'Nowszy',
  olderArticleLabel: 'Starszy',
  moreArticlesNavigationLabel: 'Więcej artykułów',
  keepReadingHeading: 'Czytaj dalej',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Więcej w ${tag}`,
  interactionsHeading: 'Odpowiedzi',
  reactionsGroupLabel: 'Reakcje',
  likeLabel: 'Lubię to',
  commentsHeading: 'Dyskusja',
  interactionsNeedScriptNotice: 'Reakcje i komentarze wymagają JavaScriptu.',
  showMoreCommentsLabel: 'Pokaż więcej komentarzy',
  shareLabel: 'Udostępnij',
  copyLinkLabel: 'Kopiuj link do artykułu',
  saveForLaterLabel: 'Zapisz na później',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Udostępnij w ${network}`,
  shareByEmailLabel: 'Udostępnij e-mailem',
  shareNativeLabel: 'Udostępnij ten artykuł',
  followLabel: 'Obserwuj',
  followingLabel: 'Obserwujesz',
  unfollowLabel: 'Przestań obserwować',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Obserwuj ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Przestań obserwować ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Teraz obserwujesz ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Już nie obserwujesz ${name}.`,
  followDisabledMessage: 'Obserwowanie jest teraz niedostępne w tej witrynie.',
  followAuthorMissingMessage: 'Tego autora nie można teraz obserwować.',
  audienceNetworkError:
    'Nie udało się połączyć z Galascribe. Spróbuj ponownie.',
  audienceRateLimited: 'Zbyt wiele prób. Spróbuj za chwilę.',
  audienceGenericError: 'Coś poszło nie tak. Spróbuj ponownie.',
  audienceStorageBlocked:
    'Przeglądarka zablokowała pamięć potrzebną tej witrynie do zalogowania.',
  audienceSignInUnsupported:
    'Ta przeglądarka nie może zalogować Cię na tej stronie.',
  audienceSignInFailed: 'Logowanie nie zostało ukończone. Spróbuj ponownie.',
  audienceSignInInvalid:
    'Ten link do logowania był nieprawidłowy. Spróbuj ponownie.',
  honeypotLabel: 'Zostaw to pole puste',
  fieldRequiredMessage: 'To pole jest wymagane.',
  fieldInvalidMessage: 'Sprawdź to pole.',
  newsletterEmailLabel: 'Adres e-mail',
  newsletterCheckInbox: 'Sprawdź skrzynkę, aby potwierdzić',
  newsletterFullMessage:
    'Ten newsletter nie przyjmuje teraz nowych subskrybentów.',
  newsletterEmailInvalid: 'Wpisz prawidłowy adres e-mail.',
  contactLinkLabel: 'Kontakt',
  contactPageTitle: 'Kontakt',
  contactDefaultIntro:
    'Masz pytanie lub coś do powiedzenia? Wyślij wiadomość, a autor odpowie e-mailem.',
  contactNameLabel: 'Imię i nazwisko',
  contactEmailLabel: 'E-mail',
  contactMessageLabel: 'Wiadomość',
  contactWebsiteLabel: 'Strona internetowa (opcjonalnie)',
  contactPhoneLabel: 'Telefon (opcjonalnie)',
  contactSubmitLabel: 'Wyślij wiadomość',
  contactNoscript:
    'Ten formularz wymaga JavaScriptu. Włącz go, aby wysłać wiadomość.',
  contactSent: 'Dziękujemy, wiadomość została wysłana.',
  contactUnavailable: 'Ten formularz nie przyjmuje teraz wiadomości.',
  contactRateLimited: 'Zbyt wiele wiadomości stąd. Spróbuj później.',
  contactMessageLinks: 'Wiadomość może zawierać najwyżej dwa linki.',
  tagListLabel: 'Tagi',
  tagKickerLabel: 'Tag',
  seriesKickerLabel: 'Seria',
  archiveKickerLabel: 'Archiwum',
  authorKickerLabel: 'Autor',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`Artykułów: ${count}`}`,
  emptyListingLabel: 'Brak artykułów.',
  editionsNavigationLabel: 'Wersje',
  editionOriginalLabel: 'Oryginał',
  editionQuickReadLabel: 'Szybka lektura',
  editionStandardLabel: 'Standardowa',
  editionDeepDiveLabel: 'Pogłębiona',
  editionNoticeLabel:
    'Wersja wygenerowana, sprawdzona przez autora; punktem odniesienia jest oryginał',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'O nas',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Zaktualizowano: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Wpisy z tagiem „${tag}”`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `Artykuły z tagiem ${tag} w ${publication}. ${`Artykułów: ${count}`}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}: seria w ${publication}. ${`Części: ${count}`}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Archiwum ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `Artykuły z roku ${year} w ${publication}. ${`Artykułów: ${count}`}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Artykuły autora ${name} w ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Tematy poruszane w ${publication}. ${`Tematów: ${count}`}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Serie opublikowane w ${publication}. Razem: ${count}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Wszystkie artykuły w ${publication} według lat. Razem: ${count}.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Wszystkie artykuły w ${publication}, od najnowszych.`,
  exploreColumnLabel: 'Odkrywaj',
  rssFeedLabel: 'Kanał RSS',
  languageKickerLabel: 'Język',
  languageSwitcherLabel: 'Języki',
  languageChipsLabel: 'Dostępne języki',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `Artykuły w języku „${language}” w ${publication}. ${`Artykułów: ${count}`}.`,
  postRemovedHeading: 'Ten wpis został usunięty',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Usunięto go: ${date}.`,
  postRemovedHomeLabel: 'Przejdź na stronę główną',
  versionPageHeading: 'Wersja witryny',
  versionTemplateLabel: 'Szablon',
  versionThemeLabel: 'Motyw',
  versionSchemasLabel: 'Schematy',
  versionToolchainLabel: 'Narzędzia publikacji',
  versionCommitLabel: 'Commit źródłowy',
  versionBuiltAtLabel: 'Zbudowano',
  listenNavLabel: 'Posłuchaj',
  listenNavCurrentLabel: 'Posłuchaj tego wpisu',
  listenInviteTitle: 'Zajęte ręce? Posłuchaj zamiast czytać.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Ten wpis jest też dostępny jako rozmowa na ${minutes} min. Dobre na drogę, trening albo zmywanie.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Ten wpis jest też dostępny jako narracja na ${minutes} min. Dobre na drogę, trening albo zmywanie.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Ten wpis jest też dostępny jako debata na ${minutes} min. Dobre na drogę, trening albo zmywanie.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Ten wpis jest też dostępny jako skecz na ${minutes} min. Dobre na drogę, trening albo zmywanie.`,
  listenInvitePlayLabel: 'Odtwórz',
  listenInviteDeclineLabel: 'Nie, dziękuję',
  listenInviteNote: 'Głosy AI, adaptacja tego wpisu.',
  listenInviteCloseLabel: 'Zamknij na razie',
  listenPlayerRegionLabel: 'Odtwarzacz audio',
  listenPlayerNowPlayingLabel: 'Teraz odtwarzane',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} z ${count}`,
  listenPlayerPlayLabel: 'Odtwórz',
  listenPlayerPauseLabel: 'Pauza',
  listenPlayerBackLabel: 'Cofnij o 15 sekund',
  listenPlayerPreviousLabel: 'Poprzedni odcinek',
  listenPlayerNextLabel: 'Następny odcinek',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Prędkość odtwarzania ${rate}×`,
  listenPlayerSeekLabel: 'Pozycja',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} z ${total}`,
  listenPlayerCloseLabel: 'Zatrzymaj i zamknij',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Odtwarzanie: ${title}`,
  listenListHeading: 'Posłuchaj tego bloga',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `Odcinków: ${count} · ${duration}`,
  listenListPlayAllLabel: 'Odtwórz wszystkie',
  listenListShuffleLabel: 'Losowo',
  listenListOrderLabel: 'Kolejność',
  listenListNewestLabel: 'Najnowsze najpierw',
  listenListOldestLabel: 'Najstarsze najpierw',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Pokaż wszystkie (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Odtwórz: ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) =>
    `${hours} godz. ${minutes} min`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('pl', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
