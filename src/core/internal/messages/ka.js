/**
 * Chrome message catalog for the `ka` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'გადადით შინაარსზე',
  homeLinkLabel: 'მთავარი',
  primaryNavigationLabel: 'ძირითადი',
  footerNavigationLabel: 'ქვედა ნაწილი',
  breadcrumbNavigationLabel: 'ნავიგაციის გზა',
  paginationNavigationLabel: 'გვერდები',
  previousPageLabel: 'წინა',
  nextPageLabel: 'შემდეგი',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `გვერდი ${current} / ${total}`,
  authorsSectionLabel: 'ავტორები',
  tagsSectionLabel: 'თეგები',
  seriesSectionLabel: 'სერია',
  archiveSectionLabel: 'არქივი',
  indexHeading: 'ყველა სტატია',
  authorsIndexLabel: 'ავტორები',
  tagIndexLabelPrefix: 'თეგი:',
  seriesIndexLabelPrefix: 'სერია:',
  archiveYearLabelPrefix: 'არქივი:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName}-ის შესახებ`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `ავტორი: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, იხსნება ახალ ჩანართში',
  footerLegalLabel: 'სამართლებრივი',
  termsLinkLabel: 'პირობები',
  privacyLinkLabel: 'კონფიდენციალურობა',
  consentRegionLabel: 'კონფიდენციალურობის არჩევანი',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `ეს საიტი მკითხველის აუდიტორიის გასაგებად ${providerName}-ს გამოყენებას ითხოვს. თქვენს თანხმობამდე არაფერი იტვირთება, არჩევანის შეცვლა კი ნებისმიერ დროს შეგიძლიათ ქვედა ნაწილიდან.`,
  consentAcceptLabel: 'ანალიტიკის დაშვება',
  consentDeclineLabel: 'უარყოფა',
  consentOpenLabel: 'კონფიდენციალურობის არჩევანი',
  errorPageHeading: 'გვერდი ვერ მოიძებნა',
  errorPageBody:
    'გვერდი, რომელსაც ეძებდით, ვერ მოიძებნა. შესაძლოა, ის გადატანილია, გადარქმეულია ან წაშლილია.',
  errorPageReturnHomeLabel: 'მთავარ გვერდზე დაბრუნება',
  appearanceControlLabel: 'იერსახე',
  appearanceModeLightLabel: 'ღია',
  appearanceModeDarkLabel: 'მუქი',
  appearanceModeSystemLabel: 'სისტემური',
  searchButtonLabel: 'ძებნა',
  searchButtonAriaLabel: 'სტატიების ძებნა',
  searchPlaceholderLabel: 'ძებნა პუბლიკაციაში',
  searchEmptyLabel: 'თქვენს ძიებას სტატია არ ემთხვევა.',
  searchUnavailableLabel: 'ძიება ახლა მიუწვდომელია.',
  copyCodeLabel: 'კოპირება',
  copiedLabel: 'დაკოპირდა',
  linkCopiedLabel: 'ბმული დაკოპირდა.',
  copyBlockedLabel: 'აქ კოპირება დაბლოკილია. მისამართი დააკოპირეთ ბრაუზერიდან.',
  codeSelectedLabel:
    'კოდი მონიშნულია. დასაკოპირებლად დააჭირეთ Ctrl C ან Command C.',
  savedLabel: 'შენახულია მოგვიანებით წასაკითხად.',
  unsavedLabel: 'ამოღებულია შენახული სტატიებიდან.',
  menuSummaryLabel: 'მენიუ',
  featuredLabel: 'რჩეული',
  readEssayLabel: 'ესეს წაკითხვა',
  latestHeading: 'უახლესი',
  moreArticlesHeading: 'მეტი სტატია',
  browseByTagLabel: 'თეგების მიხედვით',
  seriesCardLabel: 'სერია',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} ნაწილი`,
  startSeriesLabel: 'დაიწყეთ პირველი ნაწილიდან',
  newsletterLabel: 'ბიულეტენი',
  newsletterActionLabel: 'გამოწერა',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} წთ საკითხავი`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `ნაწილი ${part} / ${total}`,
  onThisPageLabel: 'ამ გვერდზე',
  writtenByLabel: 'ავტორი',
  aboutTheAuthorLabel: 'ავტორის შესახებ',
  youAreHereLabel: 'თქვენ აქ ხართ',
  newerArticleLabel: 'უფრო ახალი',
  olderArticleLabel: 'უფრო ძველი',
  moreArticlesNavigationLabel: 'მეტი სტატია',
  keepReadingHeading: 'განაგრძეთ კითხვა',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `მეტი თემაზე: ${tag}`,
  interactionsHeading: 'გამოხმაურებები',
  reactionsGroupLabel: 'რეაქციები',
  likeLabel: 'მოწონება',
  commentsHeading: 'განხილვა',
  interactionsNeedScriptNotice:
    'რეაქციებისა და კომენტარებისთვის საჭიროა JavaScript.',
  showMoreCommentsLabel: 'მეტი კომენტარის ჩვენება',
  shareLabel: 'გაზიარება',
  copyLinkLabel: 'ამ სტატიის ბმულის კოპირება',
  saveForLaterLabel: 'მოგვიანებით წასაკითხად შენახვა',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `გაზიარება: ${network}`,
  shareByEmailLabel: 'გაზიარება ელფოსტით',
  shareNativeLabel: 'ამ სტატიის გაზიარება',
  followLabel: 'გამოწერა',
  followingLabel: 'გამოწერილია',
  unfollowLabel: 'გამოწერის გაუქმება',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name}-ის გამოწერა`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name}-ის გამოწერის გაუქმება`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `ახლა თვალს ადევნებთ: ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `აღარ ადევნებთ თვალს: ${name}.`,
  followDisabledMessage: 'ამ საიტზე გამოწერა ახლა მიუწვდომელია.',
  followAuthorMissingMessage: 'ამ ავტორის გამოწერა ახლა შეუძლებელია.',
  audienceNetworkError:
    'Galascribe-თან დაკავშირება ვერ მოხერხდა. სცადეთ ხელახლა.',
  audienceRateLimited: 'ძალიან ბევრი მცდელობაა. სცადეთ ცოტა ხანში.',
  audienceGenericError: 'რაღაც არ გამოვიდა. სცადეთ ხელახლა.',
  audienceStorageBlocked:
    'თქვენმა ბრაუზერმა დაბლოკა საიტისთვის შესასვლელად საჭირო მეხსიერება.',
  audienceSignInUnsupported: 'ეს ბრაუზერი ამ გვერდზე ვერ შეგიყვანთ.',
  audienceSignInFailed: 'შესვლა არ დასრულდა. სცადეთ ხელახლა.',
  audienceSignInInvalid: 'შესვლის ბმული არასწორი იყო. სცადეთ ხელახლა.',
  honeypotLabel: 'დატოვეთ ეს ველი ცარიელი',
  fieldRequiredMessage: 'ეს ველი სავალდებულოა.',
  fieldInvalidMessage: 'შეამოწმეთ ეს ველი.',
  newsletterEmailLabel: 'ელფოსტის მისამართი',
  newsletterCheckInbox: 'დასადასტურებლად შეამოწმეთ შემოსული წერილები',
  newsletterFullMessage: 'ეს ბიულეტენი ახლა ახალ გამომწერებს არ იღებს.',
  newsletterEmailInvalid: 'შეიყვანეთ სწორი ელფოსტის მისამართი.',
  contactLinkLabel: 'კონტაქტი',
  contactPageTitle: 'კონტაქტი',
  contactDefaultIntro:
    'გაქვთ შეკითხვა ან სათქმელი? გამოგვიგზავნეთ შეტყობინება და ავტორი ელფოსტით გიპასუხებთ.',
  contactNameLabel: 'სახელი',
  contactEmailLabel: 'ელფოსტა',
  contactMessageLabel: 'შეტყობინება',
  contactWebsiteLabel: 'ვებსაიტი (არასავალდებულო)',
  contactPhoneLabel: 'ტელეფონი (არასავალდებულო)',
  contactSubmitLabel: 'შეტყობინების გაგზავნა',
  contactNoscript:
    'ამ ფორმას JavaScript სჭირდება. შეტყობინების გასაგზავნად ჩართეთ.',
  contactSent: 'გმადლობთ, თქვენი შეტყობინება გაიგზავნა.',
  contactUnavailable: 'ეს ფორმა ახლა შეტყობინებებს არ იღებს.',
  contactRateLimited:
    'აქედან ძალიან ბევრი შეტყობინება გაიგზავნა. სცადეთ მოგვიანებით.',
  contactMessageLinks: 'თქვენს შეტყობინებაში მაქსიმუმ ორი ბმული შეიძლება იყოს.',
  tagListLabel: 'თეგები',
  tagKickerLabel: 'თეგი',
  seriesKickerLabel: 'სერია',
  archiveKickerLabel: 'არქივი',
  authorKickerLabel: 'ავტორი',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} სტატია`,
  emptyListingLabel: 'სტატიები ჯერ არ არის.',
  editionsNavigationLabel: 'ვერსიები',
  editionOriginalLabel: 'ორიგინალი',
  editionQuickReadLabel: 'სწრაფი კითხვა',
  editionStandardLabel: 'სტანდარტული',
  editionDeepDiveLabel: 'სიღრმისეული',
  editionNoticeLabel:
    'გენერირებული ვერსია, გადამოწმებულია ავტორის მიერ; ორიგინალია საფუძველი',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'შესახებ',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `განახლდა: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `სტატიები თეგით „${tag}“`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count} სტატია თეგით ${tag} საიტზე ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, ${count}-ნაწილიანი სერია საიტზე ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `არქივი ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count} სტატია, გამოქვეყნებული ${year} წელს საიტზე ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${name}-ის დაწერილი სტატიები საიტზე ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `იხილეთ ${count} თემა, რომელსაც ეხება ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `იხილეთ ${count} სერია, გამოქვეყნებული საიტზე ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication}-ის ყველა სტატია, სულ ${count}, წლების მიხედვით.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `${publication}-ის ყველა სტატია, ახლები პირველი.`,
  exploreColumnLabel: 'დათვალიერება',
  rssFeedLabel: 'RSS არხი',
  languageKickerLabel: 'ენა',
  languageSwitcherLabel: 'ენები',
  languageChipsLabel: 'ხელმისაწვდომი ენები',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count} სტატია ენაზე ${language} საიტზე ${publication}.`,
  postRemovedHeading: 'ეს პოსტი წაშლილია',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `ის წაიშალა ${date}.`,
  postRemovedHomeLabel: 'მთავარ გვერდზე გადასვლა',
  versionPageHeading: 'საიტის ვერსია',
  versionTemplateLabel: 'შაბლონი',
  versionThemeLabel: 'თემა',
  versionSchemasLabel: 'სქემები',
  versionToolchainLabel: 'გამოქვეყნების ინსტრუმენტები',
  versionCommitLabel: 'საწყისი commit',
  versionBuiltAtLabel: 'აგების დრო',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('ka', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
