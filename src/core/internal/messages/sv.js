/**
 * Chrome message catalog for the `sv` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Hoppa till innehåll',
  homeLinkLabel: 'Hem',
  primaryNavigationLabel: 'Huvudmeny',
  footerNavigationLabel: 'Sidfot',
  breadcrumbNavigationLabel: 'Sökväg',
  paginationNavigationLabel: 'Sidnavigering',
  previousPageLabel: 'Föregående',
  nextPageLabel: 'Nästa',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Sida ${current} av ${total}`,
  authorsSectionLabel: 'Författare',
  tagsSectionLabel: 'Taggar',
  seriesSectionLabel: 'Serier',
  archiveSectionLabel: 'Arkiv',
  indexHeading: 'Alla artiklar',
  authorsIndexLabel: 'Författare',
  tagIndexLabelPrefix: 'Tagg:',
  seriesIndexLabelPrefix: 'Serie:',
  archiveYearLabelPrefix: 'Arkiv:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Om ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Av ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, öppnas i en ny flik',
  footerLegalLabel: 'Juridiskt',
  termsLinkLabel: 'Villkor',
  privacyLinkLabel: 'Integritet',
  consentRegionLabel: 'Integritetsval',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Den här webbplatsen vill använda ${providerName} för att förstå hur den läses. Ingenting läses in förrän du godkänner, och du kan ändra ditt val när som helst i sidfoten.`,
  consentAcceptLabel: 'Godkänn statistik',
  consentDeclineLabel: 'Avvisa',
  consentOpenLabel: 'Integritetsval',
  errorPageHeading: 'Sidan hittades inte',
  errorPageBody:
    'Sidan du letade efter kunde inte hittas. Den kan ha flyttats, bytt namn eller tagits bort.',
  errorPageReturnHomeLabel: 'Tillbaka till startsidan',
  appearanceControlLabel: 'Utseende',
  appearanceModeLightLabel: 'Ljust',
  appearanceModeDarkLabel: 'Mörkt',
  appearanceModeSystemLabel: 'System',
  searchButtonLabel: 'Sök',
  searchButtonAriaLabel: 'Sök bland artiklar',
  searchPlaceholderLabel: 'Sök i publikationen',
  searchEmptyLabel: 'Inga artiklar matchar din sökning.',
  searchUnavailableLabel: 'Sökningen är inte tillgänglig just nu.',
  copyCodeLabel: 'Kopiera',
  copiedLabel: 'Kopierat',
  linkCopiedLabel: 'Länken har kopierats.',
  copyBlockedLabel:
    'Kopiering är blockerad här. Kopiera adressen från webbläsaren.',
  codeSelectedLabel:
    'Koden är markerad. Tryck Ctrl C eller Command C för att kopiera.',
  savedLabel: 'Sparad till senare.',
  unsavedLabel: 'Borttagen från sparade artiklar.',
  menuSummaryLabel: 'Meny',
  featuredLabel: 'Utvald',
  readEssayLabel: 'Läs essän',
  latestHeading: 'Senaste',
  moreArticlesHeading: 'Fler artiklar',
  browseByTagLabel: 'Bläddra efter tagg',
  seriesCardLabel: 'Serie',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count === '1' ? '1 del' : `${count} delar`}`,
  startSeriesLabel: 'Börja med del 1',
  newsletterLabel: 'Nyhetsbrev',
  newsletterActionLabel: 'Prenumerera',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min läsning`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Del ${part} av ${total}`,
  onThisPageLabel: 'På den här sidan',
  writtenByLabel: 'Skriven av',
  aboutTheAuthorLabel: 'Om författaren',
  youAreHereLabel: 'Du är här',
  newerArticleLabel: 'Nyare',
  olderArticleLabel: 'Äldre',
  moreArticlesNavigationLabel: 'Fler artiklar',
  keepReadingHeading: 'Fortsätt läsa',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Mer i ${tag}`,
  interactionsHeading: 'Reaktioner',
  reactionsGroupLabel: 'Reaktioner',
  likeLabel: 'Gilla',
  commentsHeading: 'Samtal',
  interactionsNeedScriptNotice: 'Reaktioner och kommentarer kräver JavaScript.',
  showMoreCommentsLabel: 'Visa fler kommentarer',
  shareLabel: 'Dela',
  copyLinkLabel: 'Kopiera länk till artikeln',
  saveForLaterLabel: 'Spara till senare',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Dela på ${network}`,
  shareByEmailLabel: 'Dela via e-post',
  shareNativeLabel: 'Dela artikeln',
  followLabel: 'Följ',
  followingLabel: 'Följer',
  unfollowLabel: 'Sluta följa',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Följ ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Sluta följa ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Du följer nu ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Du följer inte längre ${name}.`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `${count} följare`,
  followersTeamHint: 'Bara din webbplats team ser detta',
  followDisabledMessage:
    'Det går inte att följa på den här webbplatsen just nu.',
  followAuthorMissingMessage: 'Den här författaren går inte att följa just nu.',
  audienceNetworkError: 'Det gick inte att nå Galascribe. Försök igen.',
  audienceRateLimited: 'För många försök. Försök igen om en stund.',
  audienceGenericError: 'Något gick fel. Försök igen.',
  audienceStorageBlocked:
    'Din webbläsare blockerade lagring som webbplatsen behöver för att logga in dig.',
  audienceSignInUnsupported:
    'Den här webbläsaren kan inte logga in dig på den här sidan.',
  audienceSignInFailed: 'Inloggningen slutfördes inte. Försök igen.',
  audienceSignInInvalid: 'Inloggningslänken var ogiltig. Försök igen.',
  honeypotLabel: 'Lämna det här fältet tomt',
  fieldRequiredMessage: 'Det här fältet är obligatoriskt.',
  fieldInvalidMessage: 'Kontrollera det här fältet.',
  newsletterEmailLabel: 'E-postadress',
  newsletterCheckInbox: 'Kolla din inkorg för att bekräfta',
  newsletterFullMessage:
    'Det här nyhetsbrevet tar inte emot nya prenumeranter just nu.',
  newsletterEmailInvalid: 'Ange en giltig e-postadress.',
  contactLinkLabel: 'Kontakt',
  contactPageTitle: 'Kontakt',
  contactDefaultIntro:
    'Har du en fråga eller något att säga? Skicka ett meddelande så svarar författaren via e-post.',
  contactNameLabel: 'Namn',
  contactEmailLabel: 'E-post',
  contactMessageLabel: 'Meddelande',
  contactWebsiteLabel: 'Webbplats (valfritt)',
  contactPhoneLabel: 'Telefon (valfritt)',
  contactSubmitLabel: 'Skicka meddelande',
  contactNoscript:
    'Formuläret kräver JavaScript. Slå på det för att skicka ett meddelande.',
  contactSent: 'Tack, ditt meddelande har skickats.',
  contactUnavailable: 'Det här formuläret tar inte emot meddelanden just nu.',
  contactRateLimited: 'För många meddelanden härifrån. Försök igen senare.',
  contactMessageLinks: 'Ditt meddelande får innehålla högst två länkar.',
  tagListLabel: 'Taggar',
  tagKickerLabel: 'Tagg',
  seriesKickerLabel: 'Serie',
  archiveKickerLabel: 'Arkiv',
  authorKickerLabel: 'Författare',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) =>
    `${count === '1' ? '1 artikel' : `${count} artiklar`}`,
  emptyListingLabel: 'Inga artiklar ännu.',
  editionsNavigationLabel: 'Utgåvor',
  editionOriginalLabel: 'Original',
  editionQuickReadLabel: 'Snabbläsning',
  editionStandardLabel: 'Standard',
  editionDeepDiveLabel: 'Fördjupning',
  editionNoticeLabel:
    'Genererad utgåva, granskad av författaren; originalet är måttstock',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Om',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Uppdaterad ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Inlägg taggade ”${tag}”`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count === '1' ? '1 artikel' : `${count} artiklar`} taggade ${tag} på ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, en serie i ${count === '1' ? '1 del' : `${count} delar`} på ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arkiv ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count === '1' ? '1 artikel' : `${count} artiklar`} publicerade ${year} på ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Artiklar skrivna av ${name} på ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Bläddra bland de ${count} ämnen som tas upp på ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Bläddra bland de ${count} serier som publicerats på ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Alla artiklar på ${publication}, ${count} totalt, per år.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Alla artiklar på ${publication}, nyast först.`,
  exploreColumnLabel: 'Utforska',
  rssFeedLabel: 'RSS-flöde',
  languageKickerLabel: 'Språk',
  languageSwitcherLabel: 'Språk',
  languageChipsLabel: 'Tillgängliga språk',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? '1 artikel' : `${count} artiklar`} på ${language} på ${publication}.`,
  postRemovedHeading: 'Det här inlägget har tagits bort',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Det togs bort den ${date}.`,
  postRemovedHomeLabel: 'Gå till startsidan',
  versionPageHeading: 'Webbplatsversion',
  versionTemplateLabel: 'Mall',
  versionThemeLabel: 'Tema',
  versionSchemasLabel: 'Scheman',
  versionToolchainLabel: 'Publiceringsverktyg',
  versionCommitLabel: 'Källcommit',
  versionBuiltAtLabel: 'Byggd',
  listenNavLabel: 'Lyssna',
  listenNavCurrentLabel: 'Lyssna på det här inlägget',
  listenInviteTitle: 'Händerna upptagna? Lyssna istället.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Det här inlägget finns också som ett samtal på ${minutes} min. Perfekt för bilturen, träningen eller disken.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Det här inlägget finns också som en uppläsning på ${minutes} min. Perfekt för bilturen, träningen eller disken.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Det här inlägget finns också som en debatt på ${minutes} min. Perfekt för bilturen, träningen eller disken.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Det här inlägget finns också som en sketch på ${minutes} min. Perfekt för bilturen, träningen eller disken.`,
  listenInvitePlayLabel: 'Spela upp',
  listenInviteDeclineLabel: 'Nej tack',
  listenInviteNote: 'AI-röster, anpassade från det här inlägget.',
  listenInviteCloseLabel: 'Stäng för nu',
  listenPlayerRegionLabel: 'Ljudspelare',
  listenPlayerNowPlayingLabel: 'Spelas nu',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} av ${count}`,
  listenPlayerPlayLabel: 'Spela upp',
  listenPlayerPauseLabel: 'Pausa',
  listenPlayerBackLabel: 'Tillbaka 15 sekunder',
  listenPlayerPreviousLabel: 'Föregående avsnitt',
  listenPlayerNextLabel: 'Nästa avsnitt',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Uppspelningshastighet ${rate}×`,
  listenPlayerSeekLabel: 'Position',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} av ${total}`,
  listenPlayerCloseLabel: 'Stoppa och stäng',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Spelas nu: ${title}`,
  listenListHeading: 'Lyssna på den här bloggen',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count} avsnitt · ${duration}`,
  listenListPlayAllLabel: 'Spela upp alla',
  listenListShuffleLabel: 'Blanda',
  listenListOrderLabel: 'Ordning',
  listenListNewestLabel: 'Nyaste först',
  listenListOldestLabel: 'Äldsta först',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Visa alla ${count}`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Spela upp ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} tim ${minutes} min`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('sv', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
