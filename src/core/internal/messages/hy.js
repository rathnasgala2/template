/**
 * Chrome message catalog for the `hy` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Անցնել բովանդակությանը',
  homeLinkLabel: 'Գլխավոր',
  primaryNavigationLabel: 'Հիմնական',
  footerNavigationLabel: 'Էջատակ',
  breadcrumbNavigationLabel: 'Ուղու նշում',
  paginationNavigationLabel: 'Էջեր',
  previousPageLabel: 'Նախորդ',
  nextPageLabel: 'Հաջորդ',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Էջ ${current} / ${total}`,
  authorsSectionLabel: 'Հեղինակներ',
  tagsSectionLabel: 'Պիտակներ',
  seriesSectionLabel: 'Շարք',
  archiveSectionLabel: 'Արխիվ',
  indexHeading: 'Բոլոր հոդվածները',
  authorsIndexLabel: 'Հեղինակներ',
  tagIndexLabelPrefix: 'Պիտակ՝',
  seriesIndexLabelPrefix: 'Շարք՝',
  archiveYearLabelPrefix: 'Արխիվ՝',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName}-ի մասին`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Հեղինակ՝ ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, բացվում է նոր ներդիրում',
  footerLegalLabel: 'Իրավական',
  termsLinkLabel: 'Պայմաններ',
  privacyLinkLabel: 'Գաղտնիություն',
  consentRegionLabel: 'Գաղտնիության ընտրություն',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Այս կայքը ցանկանում է օգտագործել ${providerName}՝ ընթերցողներին հասկանալու համար։ Մինչև չհամաձայնեք, ոչինչ չի բեռնվի, իսկ ընտրությունը կարող եք փոխել ցանկացած պահի էջատակից։`,
  consentAcceptLabel: 'Ընդունել վերլուծությունը',
  consentDeclineLabel: 'Մերժել',
  consentOpenLabel: 'Գաղտնիության ընտրություն',
  errorPageHeading: 'Էջը չի գտնվել',
  errorPageBody:
    'Ձեր փնտրած էջը չգտնվեց։ Հնարավոր է՝ այն տեղափոխվել է, վերանվանվել կամ հեռացվել։',
  errorPageReturnHomeLabel: 'Վերադառնալ գլխավոր էջ',
  appearanceControlLabel: 'Տեսք',
  appearanceModeLightLabel: 'Բաց',
  appearanceModeDarkLabel: 'Մութ',
  appearanceModeSystemLabel: 'Համակարգային',
  searchButtonLabel: 'Որոնել',
  searchButtonAriaLabel: 'Որոնել հոդվածներ',
  searchPlaceholderLabel: 'Որոնել հրապարակումում',
  searchEmptyLabel: 'Ձեր որոնմանը համապատասխանող հոդված չկա։',
  searchUnavailableLabel: 'Որոնումն այս պահին հասանելի չէ։',
  copyCodeLabel: 'Պատճենել',
  copiedLabel: 'Պատճենվեց',
  linkCopiedLabel: 'Հղումը պատճենվեց։',
  copyBlockedLabel:
    'Այստեղ պատճենումն արգելափակված է։ Պատճենեք հասցեն դիտարկիչից։',
  codeSelectedLabel:
    'Կոդը ընտրված է։ Պատճենելու համար սեղմեք Ctrl C կամ Command C։',
  savedLabel: 'Պահվեց հետագայի համար։',
  unsavedLabel: 'Հեռացվեց պահված հոդվածներից։',
  menuSummaryLabel: 'Ընտրացանկ',
  featuredLabel: 'Ընտրյալ',
  readEssayLabel: 'Կարդալ էսսեն',
  latestHeading: 'Վերջինները',
  moreArticlesHeading: 'Ավելի շատ հոդվածներ',
  browseByTagLabel: 'Դիտել ըստ պիտակների',
  seriesCardLabel: 'Շարք',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} մաս`,
  startSeriesLabel: 'Սկսել 1-ին մասից',
  newsletterLabel: 'Տեղեկագիր',
  newsletterActionLabel: 'Բաժանորդագրվել',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} րոպե ընթերցում`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Մաս ${part} / ${total}`,
  onThisPageLabel: 'Այս էջում',
  writtenByLabel: 'Հեղինակ',
  aboutTheAuthorLabel: 'Հեղինակի մասին',
  youAreHereLabel: 'Դուք այստեղ եք',
  newerArticleLabel: 'Ավելի նոր',
  olderArticleLabel: 'Ավելի հին',
  moreArticlesNavigationLabel: 'Ավելի շատ հոդվածներ',
  keepReadingHeading: 'Շարունակեք կարդալ',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Ավելին՝ ${tag}`,
  interactionsHeading: 'Արձագանքներ',
  reactionsGroupLabel: 'Ռեակցիաներ',
  likeLabel: 'Հավանել',
  commentsHeading: 'Քննարկում',
  interactionsNeedScriptNotice:
    'Ռեակցիաների և մեկնաբանությունների համար պետք է JavaScript։',
  showMoreCommentsLabel: 'Ցույց տալ ավելի շատ մեկնաբանություններ',
  shareLabel: 'Կիսվել',
  copyLinkLabel: 'Պատճենել այս հոդվածի հղումը',
  saveForLaterLabel: 'Պահել հետագայի համար',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Կիսվել ${network}-ում`,
  shareByEmailLabel: 'Կիսվել էլ. փոստով',
  shareNativeLabel: 'Կիսվել այս հոդվածով',
  followLabel: 'Հետևել',
  followingLabel: 'Հետևում եք',
  unfollowLabel: 'Չհետևել',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Հետևել ${name}-ին`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Չհետևել ${name}-ին`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Այժմ հետևում եք ${name}-ին։`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Այլևս չեք հետևում ${name}-ին։`,
  followDisabledMessage: 'Հետևելը այս կայքում այս պահին հասանելի չէ։',
  followAuthorMissingMessage: 'Այս հեղինակին այս պահին հնարավոր չէ հետևել։',
  audienceNetworkError: 'Galascribe-ին չհաջողվեց կապվել։ Կրկին փորձեք։',
  audienceRateLimited: 'Չափազանց շատ փորձեր։ Մի փոքր հետո կրկին փորձեք։',
  audienceGenericError: 'Ինչ-որ բան սխալ ընթացավ։ Կրկին փորձեք։',
  audienceStorageBlocked:
    'Ձեր դիտարկիչը արգելափակել է մուտքի համար կայքին անհրաժեշտ պահոցը։',
  audienceSignInUnsupported:
    'Այս դիտարկիչը չի կարող Ձեզ մուտք գործեցնել այս էջում։',
  audienceSignInFailed: 'Մուտքը չավարտվեց։ Կրկին փորձեք։',
  audienceSignInInvalid: 'Մուտքի հղումը վավեր չէր։ Կրկին փորձեք։',
  honeypotLabel: 'Թողեք այս դաշտը դատարկ',
  fieldRequiredMessage: 'Այս դաշտը պարտադիր է։',
  fieldInvalidMessage: 'Ստուգեք այս դաշտը։',
  newsletterEmailLabel: 'Էլ. փոստի հասցե',
  newsletterCheckInbox: 'Հաստատելու համար ստուգեք Ձեր փոստարկղը',
  newsletterFullMessage:
    'Այս տեղեկագիրն այս պահին նոր բաժանորդներ չի ընդունում։',
  newsletterEmailInvalid: 'Մուտքագրեք վավեր էլ. փոստի հասցե։',
  contactLinkLabel: 'Կապ',
  contactPageTitle: 'Կապ',
  contactDefaultIntro:
    'Հարց ունե՞ք կամ ասելիք։ Ուղարկեք հաղորդագրություն, հեղինակը կպատասխանի էլ. փոստով։',
  contactNameLabel: 'Անուն',
  contactEmailLabel: 'Էլ. փոստ',
  contactMessageLabel: 'Հաղորդագրություն',
  contactWebsiteLabel: 'Կայք (ըստ ցանկության)',
  contactPhoneLabel: 'Հեռախոս (ըստ ցանկության)',
  contactSubmitLabel: 'Ուղարկել հաղորդագրությունը',
  contactNoscript:
    'Այս ձևը JavaScript է պահանջում։ Հաղորդագրություն ուղարկելու համար միացրեք այն։',
  contactSent: 'Շնորհակալություն, Ձեր հաղորդագրությունն ուղարկվեց։',
  contactUnavailable: 'Այս ձևն այս պահին հաղորդագրություններ չի ընդունում։',
  contactRateLimited:
    'Այստեղից չափազանց շատ հաղորդագրություններ են եկել։ Փորձեք ավելի ուշ։',
  contactMessageLinks:
    'Ձեր հաղորդագրության մեջ կարող է լինել առավելագույնը երկու հղում։',
  tagListLabel: 'Պիտակներ',
  tagKickerLabel: 'Պիտակ',
  seriesKickerLabel: 'Շարք',
  archiveKickerLabel: 'Արխիվ',
  authorKickerLabel: 'Հեղինակ',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} հոդված`,
  emptyListingLabel: 'Հոդվածներ դեռ չկան։',
  editionsNavigationLabel: 'Տարբերակներ',
  editionOriginalLabel: 'Բնօրինակ',
  editionQuickReadLabel: 'Արագ ընթերցում',
  editionStandardLabel: 'Սովորական',
  editionDeepDiveLabel: 'Խորացված ընթերցում',
  editionNoticeLabel:
    'Ստեղծված տարբերակ, ստուգված հեղինակի կողմից; բնօրինակը հիմնականն է',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Մեր մասին',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Թարմացվել է՝ ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `«${tag}» պիտակով գրառումներ`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication}-ում ${tag} պիտակով ${count} հոդված։`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}՝ ${count} մասից բաղկացած շարք ${publication}-ում։`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Արխիվ ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication}-ում ${year} թվականին հրապարակված ${count} հոդված։`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${name}-ի գրած հոդվածները ${publication}-ում։`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Դիտեք ${publication}-ում լուսաբանվող ${count} թեմա։`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Դիտեք ${publication}-ում հրապարակված ${count} շարք։`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication}-ի բոլոր հոդվածները, ընդհանուր ${count}, ըստ տարիների։`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `${publication}-ի բոլոր հոդվածները, նորերը՝ սկզբում։`,
  exploreColumnLabel: 'Բացահայտել',
  rssFeedLabel: 'RSS հոսք',
  languageKickerLabel: 'Լեզու',
  languageSwitcherLabel: 'Լեզուներ',
  languageChipsLabel: 'Հասանելի լեզուներ',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication}-ում ${language} լեզվով ${count} հոդված։`,
  postRemovedHeading: 'Այս գրառումը հեռացվել է',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Այն հեռացվել է ${date}-ին։`,
  postRemovedHomeLabel: 'Անցնել գլխավոր էջ',
  versionPageHeading: 'Կայքի տարբերակ',
  versionTemplateLabel: 'Ձևանմուշ',
  versionThemeLabel: 'Թեմա',
  versionSchemasLabel: 'Սխեմաներ',
  versionToolchainLabel: 'Հրապարակման գործիքներ',
  versionCommitLabel: 'Սկզբնական commit',
  versionBuiltAtLabel: 'Կառուցման ժամանակ',
  listenNavLabel: 'Լսել',
  listenNavCurrentLabel: 'Լսել այս հոդվածը',
  listenInviteTitle: 'Ձեռքերդ զբաղվա՞ծ են։ Լսիր։',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Այս հոդվածը հասանելի է նաև ${minutes} րոպեանոց զրույցի տեսքով։ Հարմար է ճանապարհին, մարզվելիս կամ ամանեղեն լվանալիս։`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Այս հոդվածը հասանելի է նաև ${minutes} րոպեանոց պատումի տեսքով։ Հարմար է ճանապարհին, մարզվելիս կամ ամանեղեն լվանալիս։`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Այս հոդվածը հասանելի է նաև ${minutes} րոպեանոց բանավեճի տեսքով։ Հարմար է ճանապարհին, մարզվելիս կամ ամանեղեն լվանալիս։`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Այս հոդվածը հասանելի է նաև ${minutes} րոպեանոց սքեչի տեսքով։ Հարմար է ճանապարհին, մարզվելիս կամ ամանեղեն լվանալիս։`,
  listenInvitePlayLabel: 'Միացնել',
  listenInviteDeclineLabel: 'Ոչ, շնորհակալություն',
  listenInviteNote:
    'Արհեստական բանականության ձայներ, հարմարեցված այս հոդվածից։',
  listenInviteCloseLabel: 'Փակել առայժմ',
  listenPlayerRegionLabel: 'Աուդիոնվագարկիչ',
  listenPlayerNowPlayingLabel: 'Հիմա նվագում է',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} / ${count}`,
  listenPlayerPlayLabel: 'Նվագարկել',
  listenPlayerPauseLabel: 'Դադար',
  listenPlayerBackLabel: '15 վայրկյան հետ',
  listenPlayerPreviousLabel: 'Նախորդ դրվագը',
  listenPlayerNextLabel: 'Հաջորդ դրվագը',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Նվագարկման արագություն ${rate}×`,
  listenPlayerSeekLabel: 'Դիրք',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} / ${total}`,
  listenPlayerCloseLabel: 'Կանգնեցնել և փակել',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Նվագում է՝ ${title}`,
  listenListHeading: 'Լսել այս բլոգը',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count} դրվագ · ${duration}`,
  listenListPlayAllLabel: 'Նվագարկել բոլորը',
  listenListShuffleLabel: 'Խառնել',
  listenListOrderLabel: 'Դասավորություն',
  listenListNewestLabel: 'Նախ՝ նորերը',
  listenListOldestLabel: 'Նախ՝ հները',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Ցույց տալ բոլորը (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Նվագարկել՝ ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} րոպե`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} ժ ${minutes} րոպե`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('hy', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
