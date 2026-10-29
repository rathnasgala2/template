/**
 * Chrome message catalog for the `is` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Fara í efni',
  homeLinkLabel: 'Forsíða',
  primaryNavigationLabel: 'Aðalvalmynd',
  footerNavigationLabel: 'Síðufótur',
  breadcrumbNavigationLabel: 'Brauðmolar',
  paginationNavigationLabel: 'Síðuskipting',
  previousPageLabel: 'Fyrri',
  nextPageLabel: 'Næsta',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Síða ${current} af ${total}`,
  authorsSectionLabel: 'Höfundar',
  tagsSectionLabel: 'Merki',
  seriesSectionLabel: 'Greinaröð',
  archiveSectionLabel: 'Safn',
  indexHeading: 'Allar greinar',
  authorsIndexLabel: 'Höfundar',
  tagIndexLabelPrefix: 'Merki:',
  seriesIndexLabelPrefix: 'Greinaröð:',
  archiveYearLabelPrefix: 'Safn:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Um ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Eftir ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, opnast í nýjum flipa',
  footerLegalLabel: 'Lagalegt',
  termsLinkLabel: 'Skilmálar',
  privacyLinkLabel: 'Persónuvernd',
  consentRegionLabel: 'Val um persónuvernd',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Þessi vefur vill nota ${providerName} til að skilja lesendahópinn. Ekkert hleðst inn fyrr en þú samþykkir og þú getur breytt valinu hvenær sem er í síðufætinum.`,
  consentAcceptLabel: 'Samþykkja greiningu',
  consentDeclineLabel: 'Hafna',
  consentOpenLabel: 'Val um persónuvernd',
  errorPageHeading: 'Síða fannst ekki',
  errorPageBody:
    'Síðan sem þú leitaðir að fannst ekki. Hún gæti hafa verið flutt, endurnefnd eða fjarlægð.',
  errorPageReturnHomeLabel: 'Aftur á forsíðu',
  appearanceControlLabel: 'Útlit',
  appearanceModeLightLabel: 'Ljóst',
  appearanceModeDarkLabel: 'Dökkt',
  appearanceModeSystemLabel: 'Kerfið',
  searchButtonLabel: 'Leita',
  searchButtonAriaLabel: 'Leita í greinum',
  searchPlaceholderLabel: 'Leita í útgáfunni',
  searchEmptyLabel: 'Engar greinar passa við leitina.',
  searchUnavailableLabel: 'Leit er ekki í boði núna.',
  copyCodeLabel: 'Afrita',
  copiedLabel: 'Afritað',
  linkCopiedLabel: 'Hlekkur afritaður.',
  copyBlockedLabel: 'Afritun er læst hér. Afritaðu vistfangið úr vafranum.',
  codeSelectedLabel: 'Kóði valinn. Ýttu á Ctrl C eða Command C til að afrita.',
  savedLabel: 'Vistað til síðari tíma.',
  unsavedLabel: 'Fjarlægt úr vistuðum greinum.',
  menuSummaryLabel: 'Valmynd',
  featuredLabel: 'Úrval',
  readEssayLabel: 'Lesa ritgerðina',
  latestHeading: 'Nýjast',
  moreArticlesHeading: 'Fleiri greinar',
  browseByTagLabel: 'Skoða eftir merkjum',
  seriesCardLabel: 'Greinaröð',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} hlutar`,
  startSeriesLabel: 'Byrja á 1. hluta',
  newsletterLabel: 'Fréttabréf',
  newsletterActionLabel: 'Skrá mig',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} mín. lestur`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Hluti ${part} af ${total}`,
  onThisPageLabel: 'Á þessari síðu',
  writtenByLabel: 'Höfundur',
  aboutTheAuthorLabel: 'Um höfundinn',
  youAreHereLabel: 'Þú ert hér',
  newerArticleLabel: 'Nýrri',
  olderArticleLabel: 'Eldri',
  moreArticlesNavigationLabel: 'Fleiri greinar',
  keepReadingHeading: 'Haltu áfram að lesa',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Meira í ${tag}`,
  interactionsHeading: 'Viðbrögð',
  reactionsGroupLabel: 'Viðbrögð',
  likeLabel: 'Líka við',
  commentsHeading: 'Umræða',
  interactionsNeedScriptNotice: 'Viðbrögð og athugasemdir krefjast JavaScript.',
  showMoreCommentsLabel: 'Sýna fleiri athugasemdir',
  shareLabel: 'Deila',
  copyLinkLabel: 'Afrita hlekk á þessa grein',
  saveForLaterLabel: 'Vista til síðari tíma',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Deila á ${network}`,
  shareByEmailLabel: 'Deila í tölvupósti',
  shareNativeLabel: 'Deila þessari grein',
  followLabel: 'Fylgja',
  followingLabel: 'Fylgist með',
  unfollowLabel: 'Hætta að fylgja',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Fylgja ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Hætta að fylgja ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Þú fylgist nú með ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Þú fylgist ekki lengur með ${name}.`,
  followDisabledMessage: 'Ekki er hægt að fylgja á þessum vef núna.',
  followAuthorMissingMessage: 'Ekki er hægt að fylgja þessum höfundi núna.',
  audienceNetworkError: 'Náði ekki sambandi við Galascribe. Reyndu aftur.',
  audienceRateLimited: 'Of margar tilraunir. Reyndu aftur eftir augnablik.',
  audienceGenericError: 'Eitthvað fór úrskeiðis. Reyndu aftur.',
  audienceStorageBlocked:
    'Vafrinn þinn lokaði á geymslu sem vefurinn þarf til að skrá þig inn.',
  audienceSignInUnsupported:
    'Þessi vafri getur ekki skráð þig inn á þessari síðu.',
  audienceSignInFailed: 'Innskráningu lauk ekki. Reyndu aftur.',
  audienceSignInInvalid: 'Innskráningarhlekkurinn var ógildur. Reyndu aftur.',
  honeypotLabel: 'Hafðu þennan reit auðan',
  fieldRequiredMessage: 'Þessi reitur er nauðsynlegur.',
  fieldInvalidMessage: 'Athugaðu þennan reit.',
  newsletterEmailLabel: 'Netfang',
  newsletterCheckInbox: 'Athugaðu pósthólfið til að staðfesta',
  newsletterFullMessage:
    'Þetta fréttabréf tekur ekki við nýjum áskrifendum núna.',
  newsletterEmailInvalid: 'Sláðu inn gilt netfang.',
  contactLinkLabel: 'Hafa samband',
  contactPageTitle: 'Hafa samband',
  contactDefaultIntro:
    'Ertu með spurningu eða eitthvað að segja? Sendu skilaboð og höfundurinn svarar í tölvupósti.',
  contactNameLabel: 'Nafn',
  contactEmailLabel: 'Netfang',
  contactMessageLabel: 'Skilaboð',
  contactWebsiteLabel: 'Vefsvæði (valfrjálst)',
  contactPhoneLabel: 'Sími (valfrjálst)',
  contactSubmitLabel: 'Senda skilaboð',
  contactNoscript:
    'Þetta eyðublað krefst JavaScript. Kveiktu á því til að senda skilaboð.',
  contactSent: 'Takk, skilaboðin þín voru send.',
  contactUnavailable: 'Þetta eyðublað tekur ekki við skilaboðum núna.',
  contactRateLimited: 'Of mörg skilaboð héðan. Reyndu aftur síðar.',
  contactMessageLinks: 'Skilaboðin mega hafa í mesta lagi tvo hlekki.',
  tagListLabel: 'Merki',
  tagKickerLabel: 'Merki',
  seriesKickerLabel: 'Greinaröð',
  archiveKickerLabel: 'Safn',
  authorKickerLabel: 'Höfundur',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} greinar`,
  emptyListingLabel: 'Engar greinar ennþá.',
  editionsNavigationLabel: 'Útgáfur',
  editionOriginalLabel: 'Upprunaleg',
  editionQuickReadLabel: 'Stutt útgáfa',
  editionStandardLabel: 'Venjuleg',
  editionDeepDiveLabel: 'Ítarleg',
  editionNoticeLabel:
    'Útgáfa búin til með hugbúnaði, yfirfarin af höfundi; frumtextinn gildir',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Um okkur',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Uppfært ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Greinar með merkinu „${tag}“`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count} greinar með merkinu ${tag} á ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, greinaröð í ${count} hlutum á ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Safn ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count} greinar birtar árið ${year} á ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Greinar eftir ${name} á ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Skoðaðu ${count} efni sem fjallað er um á ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Skoðaðu ${count} greinaraðir sem birtar eru á ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Allar greinar á ${publication}, ${count} alls, eftir árum.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Allar greinar á ${publication}, nýjustu fyrst.`,
  exploreColumnLabel: 'Skoða',
  rssFeedLabel: 'RSS-straumur',
  languageKickerLabel: 'Tungumál',
  languageSwitcherLabel: 'Tungumál',
  languageChipsLabel: 'Tungumál í boði',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count} greinar á ${language} á ${publication}.`,
  postRemovedHeading: 'Þessi færsla var fjarlægð',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Hún var fjarlægð ${date}.`,
  postRemovedHomeLabel: 'Fara á forsíðu',
  versionPageHeading: 'Útgáfa vefsins',
  versionTemplateLabel: 'Sniðmát',
  versionThemeLabel: 'Þema',
  versionSchemasLabel: 'Skemu',
  versionToolchainLabel: 'Útgáfutól',
  versionCommitLabel: 'Upprunaleg commit',
  versionBuiltAtLabel: 'Smíðað',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('is', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
